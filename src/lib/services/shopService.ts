// Shop Product Service - CRUD operations for shop products
import { supabase } from '@/lib/supabase';

// ==========================================
// Types
// ==========================================

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    short_description?: string;
    price: number;
    original_price?: number;
    cost_price?: number;
    currency: string;
    sku?: string;
    barcode?: string;
    category_id?: string;
    product_type: 'physical' | 'digital';
    tags: string[];
    images: string[];
    thumbnail_url?: string;
    stock_quantity: number;
    low_stock_threshold: number;
    track_inventory: boolean;
    allow_backorders: boolean;
    weight_grams?: number;
    dimensions_cm?: { length?: number; width?: number; height?: number };
    digital_file_url?: string;
    download_limit?: number;
    meta_title?: string;
    meta_description?: string;
    is_published: boolean;
    is_featured: boolean;
    badge?: string;
    average_rating: number;
    review_count: number;
    requires_shipping: boolean;
    free_shipping: boolean;
    shipping_weight_grams?: number;
    published_at?: string;
    created_at: string;
    updated_at: string;
    // Joined
    category?: ProductCategory;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    name: string;
    sku?: string;
    price?: number;
    stock_quantity: number;
    image_url?: string;
    options: Record<string, string>;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface ProductFormData {
    name: string;
    description?: string;
    short_description?: string;
    price: number;
    original_price?: number | null;
    cost_price?: number | null;
    sku?: string;
    category_id?: string | null;
    product_type: 'physical' | 'digital';
    tags?: string[];
    images?: string[];
    thumbnail_url?: string;
    stock_quantity?: number;
    low_stock_threshold?: number;
    track_inventory?: boolean;
    allow_backorders?: boolean;
    weight_grams?: number | null;
    digital_file_url?: string;
    is_published?: boolean;
    is_featured?: boolean;
    badge?: string;
    requires_shipping?: boolean;
    free_shipping?: boolean;
}

// ==========================================
// Helper: Generate slug
// ==========================================
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now().toString(36);
}

// ==========================================
// Categories
// ==========================================

export async function getProductCategories(): Promise<{ data: ProductCategory[]; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('product_categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (err) {
        console.error('Error fetching categories:', err);
        return { data: [], error: err as Error };
    }
}

export async function createProductCategory(
    category: { name: string; description?: string; image_url?: string }
): Promise<{ data: ProductCategory | null; error: Error | null }> {
    try {
        const slug = generateSlug(category.name);
        const { data, error } = await supabase
            .from('product_categories')
            .insert({ ...category, slug })
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (err) {
        console.error('Error creating category:', err);
        return { data: null, error: err as Error };
    }
}

export async function updateProductCategory(
    id: string,
    updates: Partial<ProductCategory>
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('product_categories')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (err) {
        return { error: err as Error };
    }
}

export async function deleteProductCategory(id: string): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('product_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (err) {
        return { error: err as Error };
    }
}

// ==========================================
// Products
// ==========================================

export async function getProducts(options?: {
    published?: boolean;
    featured?: boolean;
    category_id?: string;
    product_type?: 'physical' | 'digital';
    search?: string;
    limit?: number;
    offset?: number;
    orderBy?: string;
    ascending?: boolean;
}): Promise<{ data: Product[]; error: Error | null; count: number }> {
    try {
        let query = supabase
            .from('products')
            .select('*, category:product_categories(*)', { count: 'exact' });

        if (options?.published !== undefined) {
            query = query.eq('is_published', options.published);
        }

        if (options?.featured !== undefined) {
            query = query.eq('is_featured', options.featured);
        }

        if (options?.category_id) {
            query = query.eq('category_id', options.category_id);
        }

        if (options?.product_type) {
            query = query.eq('product_type', options.product_type);
        }

        if (options?.search) {
            query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%,sku.ilike.%${options.search}%`);
        }

        const orderBy = options?.orderBy || 'created_at';
        const ascending = options?.ascending ?? false;
        query = query.order(orderBy, { ascending });

        if (options?.limit) {
            const offset = options.offset || 0;
            query = query.range(offset, offset + options.limit - 1);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { data: (data as Product[]) || [], error: null, count: count || 0 };
    } catch (err) {
        console.error('Error fetching products:', err);
        return { data: [], error: err as Error, count: 0 };
    }
}

export async function getProductById(id: string): Promise<{ data: Product | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, category:product_categories(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { data: data as Product, error: null };
    } catch (err) {
        return { data: null, error: err as Error };
    }
}

export async function createProduct(product: ProductFormData): Promise<{ data: Product | null; error: Error | null }> {
    try {
        const slug = generateSlug(product.name);
        const insertData = {
            ...product,
            slug,
            published_at: product.is_published ? new Date().toISOString() : null,
        };

        const { data, error } = await supabase
            .from('products')
            .insert(insertData)
            .select('*, category:product_categories(*)')
            .single();

        if (error) throw error;
        return { data: data as Product, error: null };
    } catch (err) {
        console.error('Error creating product:', err);
        return { data: null, error: err as Error };
    }
}

export async function updateProduct(
    id: string,
    updates: Partial<ProductFormData>
): Promise<{ data: Product | null; error: Error | null }> {
    try {
        const updateData: Record<string, unknown> = { ...updates };

        // Set published_at when publishing for the first time
        if (updates.is_published) {
            const { data: existing } = await supabase
                .from('products')
                .select('published_at')
                .eq('id', id)
                .single();

            if (!existing?.published_at) {
                updateData.published_at = new Date().toISOString();
            }
        }

        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select('*, category:product_categories(*)')
            .single();

        if (error) throw error;
        return { data: data as Product, error: null };
    } catch (err) {
        console.error('Error updating product:', err);
        return { data: null, error: err as Error };
    }
}

export async function deleteProduct(id: string): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (err) {
        return { error: err as Error };
    }
}

export async function toggleProductPublish(id: string, publish: boolean): Promise<{ error: Error | null }> {
    try {
        const updates: Record<string, unknown> = { is_published: publish };
        if (publish) {
            updates.published_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (err) {
        return { error: err as Error };
    }
}

export async function toggleProductFeatured(id: string, featured: boolean): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('products')
            .update({ is_featured: featured })
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (err) {
        return { error: err as Error };
    }
}

export async function duplicateProduct(id: string): Promise<{ data: Product | null; error: Error | null }> {
    try {
        const { data: original } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (!original) throw new Error('Product not found');

        const { id: _id, slug: _slug, created_at: _ca, updated_at: _ua, ...rest } = original;
        const newProduct = {
            ...rest,
            name: `${original.name} (Copy)`,
            slug: generateSlug(`${original.name} copy`),
            is_published: false,
            published_at: null,
        };

        const { data, error } = await supabase
            .from('products')
            .insert(newProduct)
            .select('*, category:product_categories(*)')
            .single();

        if (error) throw error;
        return { data: data as Product, error: null };
    } catch (err) {
        return { data: null, error: err as Error };
    }
}

// ==========================================
// Bulk Operations
// ==========================================

export async function bulkUpdateProducts(
    ids: string[],
    updates: Partial<ProductFormData>
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('products')
            .update(updates)
            .in('id', ids);

        if (error) throw error;
        return { error: null };
    } catch (err) {
        return { error: err as Error };
    }
}

export async function bulkDeleteProducts(ids: string[]): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .in('id', ids);

        if (error) throw error;
        return { error: null };
    } catch (err) {
        return { error: err as Error };
    }
}

// ==========================================
// Image Upload (via ImageKit — 20 GB free)
// ==========================================

import { uploadToImageKit } from './imagekitService';

export async function uploadProductImage(
    file: File,
    productId?: string
): Promise<{ url: string | null; error: Error | null }> {
    try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${productId || 'temp'}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const { data, error } = await uploadToImageKit(file, fileName, '/shop/products');

        if (error || !data) {
            throw error || new Error('ImageKit upload returned no data');
        }

        return { url: data.url, error: null };
    } catch (err) {
        console.error('Error uploading product image to ImageKit:', err);
        return { url: null, error: err as Error };
    }
}

export async function deleteProductImage(_url: string): Promise<{ error: Error | null }> {
    // ImageKit free plan doesn't support server-side delete via REST without
    // a backend proxy. We simply remove the reference from the product — the
    // file stays on ImageKit until manually purged from the dashboard.
    // This is acceptable for the free-tier workflow.
    return { error: null };
}

// ==========================================
// Dashboard Stats
// ==========================================

export async function getShopStats(): Promise<{
    totalProducts: number;
    publishedProducts: number;
    outOfStock: number;
    lowStock: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
}> {
    try {
        // Fetch products stats
        const { count: totalProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        const { count: publishedProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true);

        const { count: outOfStock } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('stock_quantity', 0)
            .eq('track_inventory', true);

        const { data: lowStockProducts } = await supabase
            .from('products')
            .select('id, stock_quantity, low_stock_threshold')
            .eq('track_inventory', true)
            .gt('stock_quantity', 0);

        const lowStock = lowStockProducts?.filter(
            p => p.stock_quantity <= p.low_stock_threshold
        ).length || 0;

        // Fetch orders stats
        const { count: totalOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        const { count: pendingOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .in('status', ['pending', 'confirmed', 'processing']);

        const { data: revenueData } = await supabase
            .from('orders')
            .select('total')
            .eq('payment_status', 'paid');

        const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

        return {
            totalProducts: totalProducts || 0,
            publishedProducts: publishedProducts || 0,
            outOfStock: outOfStock || 0,
            lowStock,
            totalOrders: totalOrders || 0,
            pendingOrders: pendingOrders || 0,
            totalRevenue,
        };
    } catch (err) {
        console.error('Error fetching shop stats:', err);
        return {
            totalProducts: 0,
            publishedProducts: 0,
            outOfStock: 0,
            lowStock: 0,
            totalOrders: 0,
            pendingOrders: 0,
            totalRevenue: 0,
        };
    }
}
