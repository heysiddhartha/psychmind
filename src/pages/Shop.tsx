/**
 * Shop Page - Physical & Digital Wellness Products
 * Fetches products from Supabase database (managed via /shop-admin)
 */

import { Helmet } from 'react-helmet-async';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShoppingCart, Star, Filter, Grid3X3, List, Tag, Truck, Shield, Loader2, Image as ImageIcon, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { getMotionPreference } from '@/lib/gsap/presets';
import { getProducts, getProductCategories, type Product, type ProductCategory } from '@/lib/services/shopService';

gsap.registerPlugin(ScrollTrigger);

const categoryFilters = ['All', 'Physical', 'Digital'];

// ==========================================
// Component
// ==========================================

export default function Shop() {
    const pageRef = useRef<HTMLDivElement>(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [cart, setCart] = useState<string[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Load products from database
    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                getProducts({ published: true }),
                getProductCategories(),
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            setLoading(false);
        }
        loadProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        selectedCategory === 'All' ||
        p.product_type === selectedCategory.toLowerCase()
    );

    const addToCart = (productId: string) => {
        setCart(prev => [...prev, productId]);
    };

    const featuredProducts = products.filter(p => p.is_featured);
    const inStock = (p: Product) => !p.track_inventory || p.stock_quantity > 0 || p.allow_backorders;
    const getImage = (p: Product) => p.thumbnail_url || (p.images && p.images.length > 0 ? p.images[0] : '');

    useEffect(() => {
        if (getMotionPreference()) return;

        const ctx = gsap.context(() => {
            // Header animation
            gsap.fromTo(
                '.shop-header',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );

            // Products animation
            ScrollTrigger.batch('.product-card', {
                start: 'top 85%',
                onEnter: (elements) => {
                    gsap.fromTo(elements,
                        { opacity: 0, y: 30, scale: 0.98 },
                        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
                    );
                }
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    return (
        <Layout>
            <Helmet>
                <title>Wellness Shop | 3-3.com</title>
                <meta name="description" content="Shop our curated collection of wellness products, journals, meditation supplies, and digital resources for mental health and self-care." />
            </Helmet>

            <div ref={pageRef} className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 pb-16 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <div className="shop-header text-center max-w-2xl mx-auto">
                            <h1 className="font-serif text-4xl md:text-5xl mb-4">
                                Wellness Shop
                            </h1>
                            <p className="text-lg text-gray-300 mb-8">
                                Curated products to support your mental health journey.
                                From journals to meditation tools, find what nurtures your well-being.
                            </p>

                            {/* Trust Badges */}
                                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    Free shipping over ₹2,000
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Secure checkout
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    30-day returns
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Shop Content */}
                <section className="py-12 px-4">
                    <div className="container mx-auto max-w-6xl">
                        {/* Filters Bar */}
                        <div className="bg-white rounded-xl p-4 mb-8 shadow-sm flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <div className="flex gap-2">
                                    {categoryFilters.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                                ${selectedCategory === category
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                    {filteredProducts.length} products
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                                    >
                                        <Grid3X3 className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                                    >
                                        <List className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Loading state */}
                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                            </div>
                        )}

                        {/* Featured Products */}
                        {!loading && selectedCategory === 'All' && featuredProducts.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-serif text-gray-900 mb-6">Featured Products</h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {featuredProducts.map(product => (
                                        <div key={product.id} className="product-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                                            <div className="relative aspect-square overflow-hidden">
                                                {getImage(product) ? (
                                                    <img
                                                        src={getImage(product)}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                        <ImageIcon className="w-12 h-12 text-gray-200" />
                                                    </div>
                                                )}
                                                {product.badge && (
                                                    <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                                                        {product.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <span className="text-xs text-primary font-medium uppercase tracking-wide">
                                                    {product.category?.name || product.product_type}
                                                </span>
                                                <h3 className="font-medium text-gray-900 mt-1 mb-2">{product.name}</h3>
                                                {product.average_rating > 0 && (
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="flex items-center">
                                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                            <span className="text-sm font-medium ml-1">{product.average_rating}</span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">({product.review_count})</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-lg font-semibold text-gray-900">
                                                            ₹{product.price.toLocaleString('en-IN')}
                                                        </span>
                                                        {product.original_price && (
                                                            <span className="text-sm text-gray-400 line-through ml-2">
                                                                ₹{product.original_price.toLocaleString('en-IN')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => addToCart(product.id)}
                                                        className="btn-icy"
                                                        disabled={!inStock(product)}
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Products */}
                        {!loading && (
                        <>
                        <h2 className="text-2xl font-serif text-gray-900 mb-6">
                            {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Products`}
                        </h2>

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500">No products available in this category yet.</p>
                            </div>
                        ) : (
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className={`product-card bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow
                                        ${viewMode === 'list' ? 'flex' : ''}`}
                                >
                                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-40 flex-shrink-0' : 'aspect-square'}`}>
                                        {getImage(product) ? (
                                            <img
                                                src={getImage(product)}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <ImageIcon className="w-10 h-10 text-gray-200" />
                                            </div>
                                        )}
                                        {!inStock(product) && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <span className="px-3 py-1 bg-gray-800 text-white text-sm rounded">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                        {product.badge && inStock(product) && (
                                            <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded">
                                                {product.badge}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col' : ''}`}>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                                            {product.category?.name || product.product_type}
                                        </span>
                                        <h3 className="font-medium text-gray-900 mt-1">{product.name}</h3>
                                        {viewMode === 'list' && (
                                            <p className="text-sm text-gray-500 mt-2">{product.short_description || product.description}</p>
                                        )}
                                        {product.average_rating > 0 && (
                                            <div className="flex items-center gap-1 mt-2">
                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                <span className="text-xs font-medium">{product.average_rating}</span>
                                                <span className="text-xs text-gray-400">({product.review_count})</span>
                                            </div>
                                        )}
                                        <div className={`flex items-center justify-between mt-3 ${viewMode === 'list' ? 'mt-auto' : ''}`}>
                                            <div>
                                                <span className="font-semibold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                                                {product.original_price && (
                                                    <span className="text-xs text-gray-400 line-through ml-1">
                                                        ₹{product.original_price.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => addToCart(product.id)}
                                                disabled={!inStock(product)}
                                            >
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}
                        </>
                        )}
                    </div>
                </section>
            </div>
        </Layout>
    );
}
