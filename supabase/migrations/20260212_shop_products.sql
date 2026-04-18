SET search_path = public, extensions;
-- ============================================================
-- SHOP PRODUCTS - DATABASE MIGRATION
-- ============================================================
-- Run this in Supabase SQL Editor:
--   1. Go to https://supabase.com/dashboard
--   2. Select your project → SQL Editor
--   3. Paste & Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PRODUCT CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON public.product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON public.product_categories(is_active);

-- ============================================================
-- 2. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    original_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'INR',
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    
    -- Categorization
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    product_type VARCHAR(20) DEFAULT 'physical' CHECK (product_type IN ('physical', 'digital')),
    tags TEXT[] DEFAULT '{}',
    
    -- Images (array of URLs)
    images TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    
    -- Inventory
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    track_inventory BOOLEAN DEFAULT true,
    allow_backorders BOOLEAN DEFAULT false,
    
    -- Product details
    weight_grams DECIMAL(10,2),
    dimensions_cm JSONB, -- { length, width, height }
    
    -- Digital product
    digital_file_url TEXT,
    download_limit INT,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Status
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    badge VARCHAR(50),
    
    -- Ratings (cached)
    average_rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    
    -- Shipping
    requires_shipping BOOLEAN DEFAULT true,
    free_shipping BOOLEAN DEFAULT false,
    shipping_weight_grams DECIMAL(10,2),
    
    -- Timestamps
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- ============================================================
-- 3. PRODUCT VARIANTS TABLE (sizes, colors, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g. "Large / Blue"
    sku VARCHAR(100),
    price DECIMAL(10,2),  -- override product price if set
    stock_quantity INT DEFAULT 0,
    image_url TEXT,
    options JSONB DEFAULT '{}', -- { "size": "Large", "color": "Blue" }
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);

-- ============================================================
-- 4. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Customer info (stored at time of order)
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    
    -- Shipping address
    shipping_address JSONB, -- { line1, line2, city, state, pincode, country }
    billing_address JSONB,
    
    -- Financials
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Status
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'
    )),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'paid', 'failed', 'refunded', 'partial_refund'
    )),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    
    -- Shipping
    tracking_number VARCHAR(100),
    shipping_provider VARCHAR(100),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Notes
    customer_notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- ============================================================
-- 5. ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    
    -- Snapshot at time of order
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    product_image TEXT,
    
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- Product Categories: public read, admin write
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.product_categories;
CREATE POLICY "Anyone can view active categories" ON public.product_categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage categories" ON public.product_categories;
CREATE POLICY "Admins manage categories" ON public.product_categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Products: public read published, admin write
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
CREATE POLICY "Anyone can view published products" ON public.products
    FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Product Variants: public read, admin write
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active variants" ON public.product_variants;
CREATE POLICY "Anyone can view active variants" ON public.product_variants
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage variants" ON public.product_variants;
CREATE POLICY "Admins manage variants" ON public.product_variants
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Orders: users see own, admins see all
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders
    FOR SELECT USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
CREATE POLICY "Users create own orders" ON public.orders
    FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
CREATE POLICY "Admins manage orders" ON public.orders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Order Items: follow order access
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
CREATE POLICY "Users view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins manage order items" ON public.order_items;
CREATE POLICY "Admins manage order items" ON public.order_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_categories_updated_at ON public.product_categories;
CREATE TRIGGER update_product_categories_updated_at
    BEFORE UPDATE ON public.product_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 8. STORAGE BUCKET FOR PRODUCT IMAGES
-- ============================================================
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images'
        AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images'
        AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images'
        AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- ============================================================
-- 9. SEED DEFAULT CATEGORIES
-- ============================================================
INSERT INTO public.product_categories (name, slug, description, sort_order, is_active) VALUES
    ('Journals', 'journals', 'Guided journals for mindfulness and self-reflection', 1, true),
    ('Wellness', 'wellness', 'Physical wellness products for self-care', 2, true),
    ('Workbooks', 'workbooks', 'Therapeutic workbooks and exercises', 3, true),
    ('Meditation', 'meditation', 'Meditation tools and accessories', 4, true),
    ('Audio & Digital', 'audio-digital', 'Digital downloads, audio courses, and e-resources', 5, true),
    ('Sleep & Relaxation', 'sleep-relaxation', 'Products for better sleep and relaxation', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 10. GRANTS
-- ============================================================
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.product_categories TO authenticated;
GRANT ALL ON public.product_variants TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_categories TO anon;
GRANT SELECT ON public.product_variants TO anon;

-- ============================================================
-- 11. ENABLE REALTIME
-- ============================================================
DO $$
BEGIN
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.products; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.orders; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- ============================================================
-- DONE! ✅
-- ============================================================

