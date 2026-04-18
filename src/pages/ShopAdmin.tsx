/**
 * ShopAdmin - Product Management Dashboard
 * Full CRUD for products, categories, inventory, images, and orders.
 */

import { Helmet } from 'react-helmet-async';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Package,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Star,
    Upload,
    X,
    Save,
    ArrowLeft,
    MoreHorizontal,
    Copy,
    Filter,
    BarChart3,
    ShoppingCart,
    AlertTriangle,
    PackageCheck,
    IndianRupee,
    Loader2,
    Image as ImageIcon,
    Tag,
    ChevronDown,
    Check,
    Grid3X3,
    List,
    FolderOpen,
} from 'lucide-react';
import {
    getProducts,
    getProductCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductPublish,
    toggleProductFeatured,
    duplicateProduct,
    bulkDeleteProducts,
    bulkUpdateProducts,
    uploadProductImage,
    deleteProductImage,
    getShopStats,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    type Product,
    type ProductCategory,
    type ProductFormData,
} from '@/lib/services/shopService';

// ==========================================
// Sub-components
// ==========================================

type AdminView = 'dashboard' | 'products' | 'product-form' | 'categories' | 'orders';

// Stats Card
function StatCard({ label, value, icon: Icon, color, sub }: {
    label: string; value: string | number; icon: React.ElementType; color: string; sub?: string;
}) {
    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

// Image Upload Component
function ImageUploader({ images, onImagesChange, productId }: {
    images: string[];
    onImagesChange: (imgs: string[]) => void;
    productId?: string;
}) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        const newImages = [...images];

        for (const file of files) {
            const { url, error } = await uploadProductImage(file, productId);
            if (url && !error) {
                newImages.push(url);
            }
        }

        onImagesChange(newImages);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = async (index: number) => {
        const url = images[index];
        await deleteProductImage(url);
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    return (
        <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Product Images</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        {i === 0 && (
                            <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                                Thumbnail
                            </span>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-cyan-400 hover:text-cyan-500 transition-colors"
                >
                    {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            <Upload className="w-6 h-6 mb-1" />
                            <span className="text-xs">Add Image</span>
                        </>
                    )}
                </button>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />
            <p className="text-xs text-gray-400 mt-2">First image will be used as thumbnail. Max 5MB per image. JPG, PNG, or WebP.</p>
        </div>
    );
}

// ==========================================
// Product Form Component
// ==========================================

function ProductForm({ product, categories, onSave, onCancel, saving }: {
    product?: Product | null;
    categories: ProductCategory[];
    onSave: (data: ProductFormData) => void;
    onCancel: () => void;
    saving: boolean;
}) {
    const [form, setForm] = useState<ProductFormData>({
        name: product?.name || '',
        description: product?.description || '',
        short_description: product?.short_description || '',
        price: product?.price || 0,
        original_price: product?.original_price || null,
        cost_price: product?.cost_price || null,
        sku: product?.sku || '',
        category_id: product?.category_id || null,
        product_type: product?.product_type || 'physical',
        tags: product?.tags || [],
        images: product?.images || [],
        thumbnail_url: product?.thumbnail_url || '',
        stock_quantity: product?.stock_quantity || 0,
        low_stock_threshold: product?.low_stock_threshold || 5,
        track_inventory: product?.track_inventory ?? true,
        allow_backorders: product?.allow_backorders || false,
        weight_grams: product?.weight_grams || null,
        digital_file_url: product?.digital_file_url || '',
        is_published: product?.is_published || false,
        is_featured: product?.is_featured || false,
        badge: product?.badge || '',
        requires_shipping: product?.requires_shipping ?? true,
        free_shipping: product?.free_shipping || false,
    });

    const [tagInput, setTagInput] = useState('');

    const updateField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const addTag = () => {
        if (tagInput.trim() && !form.tags?.includes(tagInput.trim())) {
            updateField('tags', [...(form.tags || []), tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        updateField('tags', (form.tags || []).filter(t => t !== tag));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...form,
            thumbnail_url: form.images && form.images.length > 0 ? form.images[0] : form.thumbnail_url,
        };
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {product ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {product ? 'Update product details' : 'Fill in the product information'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={saving || !form.name || form.price <= 0} className="btn-icy">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {product ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
                        <h3 className="font-semibold text-gray-900">Basic Information</h3>

                        <div>
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={e => updateField('name', e.target.value)}
                                placeholder="e.g. Mindfulness Journal - 90 Day"
                                required
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="short_desc">Short Description</Label>
                            <Input
                                id="short_desc"
                                value={form.short_description || ''}
                                onChange={e => updateField('short_description', e.target.value)}
                                placeholder="Brief description shown in product cards"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Full Description</Label>
                            <textarea
                                id="description"
                                value={form.description || ''}
                                onChange={e => updateField('description', e.target.value)}
                                placeholder="Detailed product description..."
                                rows={5}
                                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-y"
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4">Images</h3>
                        <ImageUploader
                            images={form.images || []}
                            onImagesChange={(imgs) => updateField('images', imgs)}
                            productId={product?.id}
                        />
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
                        <h3 className="font-semibold text-gray-900">Pricing</h3>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="price">Selling Price (₹) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.price}
                                    onChange={e => updateField('price', parseFloat(e.target.value) || 0)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="original_price">Compare-at Price (₹)</Label>
                                <Input
                                    id="original_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.original_price || ''}
                                    onChange={e => updateField('original_price', parseFloat(e.target.value) || null)}
                                    placeholder="Optional"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="cost_price">Cost Price (₹)</Label>
                                <Input
                                    id="cost_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.cost_price || ''}
                                    onChange={e => updateField('cost_price', parseFloat(e.target.value) || null)}
                                    placeholder="For profit tracking"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        {form.original_price && form.original_price > form.price && (
                            <p className="text-sm text-green-600">
                                Discount: {Math.round(((form.original_price - form.price) / form.original_price) * 100)}% off
                            </p>
                        )}
                    </div>

                    {/* Inventory */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
                        <h3 className="font-semibold text-gray-900">Inventory</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={form.sku || ''}
                                    onChange={e => updateField('sku', e.target.value)}
                                    placeholder="e.g. JOURNAL-001"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="stock">Stock Quantity</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    value={form.stock_quantity || 0}
                                    onChange={e => updateField('stock_quantity', parseInt(e.target.value) || 0)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="low_stock">Low Stock Alert Threshold</Label>
                                <Input
                                    id="low_stock"
                                    type="number"
                                    min="0"
                                    value={form.low_stock_threshold || 5}
                                    onChange={e => updateField('low_stock_threshold', parseInt(e.target.value) || 5)}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex flex-col justify-end gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.track_inventory}
                                        onChange={e => updateField('track_inventory', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">Track inventory</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.allow_backorders}
                                        onChange={e => updateField('allow_backorders', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">Allow backorders</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Shipping (physical only) */}
                    {form.product_type === 'physical' && (
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
                            <h3 className="font-semibold text-gray-900">Shipping</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="weight">Weight (grams)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        min="0"
                                        value={form.weight_grams || ''}
                                        onChange={e => updateField('weight_grams', parseFloat(e.target.value) || null)}
                                        placeholder="e.g. 500"
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex flex-col justify-end gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.requires_shipping}
                                            onChange={e => updateField('requires_shipping', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700">Requires shipping</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.free_shipping}
                                            onChange={e => updateField('free_shipping', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700">Free shipping</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Digital file (digital only) */}
                    {form.product_type === 'digital' && (
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
                            <h3 className="font-semibold text-gray-900">Digital Product</h3>
                            <div>
                                <Label htmlFor="digital_url">Download File URL</Label>
                                <Input
                                    id="digital_url"
                                    value={form.digital_file_url || ''}
                                    onChange={e => updateField('digital_file_url', e.target.value)}
                                    placeholder="https://..."
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-900">Status</h3>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-10 h-6 rounded-full flex items-center ${form.is_published ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'} p-0.5 transition-colors`}
                                onClick={() => updateField('is_published', !form.is_published)}
                            >
                                <div className="w-5 h-5 bg-white rounded-full shadow" />
                            </div>
                            <span className="text-sm text-gray-700">{form.is_published ? 'Published' : 'Draft'}</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-10 h-6 rounded-full flex items-center ${form.is_featured ? 'bg-amber-500 justify-end' : 'bg-gray-300 justify-start'} p-0.5 transition-colors`}
                                onClick={() => updateField('is_featured', !form.is_featured)}
                            >
                                <div className="w-5 h-5 bg-white rounded-full shadow" />
                            </div>
                            <span className="text-sm text-gray-700">{form.is_featured ? 'Featured' : 'Not Featured'}</span>
                        </label>
                    </div>

                    {/* Product Type */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-900">Product Type</h3>
                        <div className="flex gap-2">
                            {(['physical', 'digital'] as const).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => {
                                        updateField('product_type', type);
                                        if (type === 'digital') {
                                            updateField('requires_shipping', false);
                                        } else {
                                            updateField('requires_shipping', true);
                                        }
                                    }}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors
                                        ${form.product_type === type ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-900">Category</h3>
                        <select
                            value={form.category_id || ''}
                            onChange={e => updateField('category_id', e.target.value || null)}
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">No category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Badge */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-900">Badge</h3>
                        <Input
                            value={form.badge || ''}
                            onChange={e => updateField('badge', e.target.value)}
                            placeholder="e.g. Best Seller, New, Sale"
                        />
                        <div className="flex flex-wrap gap-1.5">
                            {['Best Seller', 'New', 'Sale', 'Limited', 'Popular', 'Instant Download'].map(b => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => updateField('badge', b)}
                                    className={`text-xs px-2 py-1 rounded-full border transition-colors
                                        ${form.badge === b ? 'bg-cyan-50 border-cyan-300 text-cyan-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-900">Tags</h3>
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="Add tag..."
                                className="flex-1"
                            />
                            <Button type="button" variant="outline" size="sm" onClick={addTag}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {(form.tags || []).length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {form.tags!.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}

// ==========================================
// Category Manager Component
// ==========================================

function CategoryManager({ categories, onCategoriesChange }: {
    categories: ProductCategory[];
    onCategoriesChange: () => void;
}) {
    const { toast } = useToast();
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        const { error } = await createProductCategory({ name: newName.trim(), description: newDesc.trim() || undefined });
        setSaving(false);
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Category created' });
            setNewName('');
            setNewDesc('');
            onCategoriesChange();
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return;
        const { error } = await updateProductCategory(id, { name: editName.trim() });
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Category updated' });
            setEditingId(null);
            onCategoriesChange();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category? Products in it will become uncategorized.')) return;
        const { error } = await deleteProductCategory(id);
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Category deleted' });
            onCategoriesChange();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Product Categories</h2>
            </div>

            {/* Add new category */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-800">Add New Category</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Name *</Label>
                        <Input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="e.g. Wellness"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Input
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                            placeholder="Optional description"
                            className="mt-1"
                        />
                    </div>
                </div>
                <Button onClick={handleCreate} disabled={saving || !newName.trim()} className="btn-icy">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Add Category
                </Button>
            </div>

            {/* Category list */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {categories.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No categories yet</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map(cat => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        {editingId === cat.id ? (
                                            <Input
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                                                className="h-8"
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="font-medium text-gray-900">{cat.name}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{cat.slug}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {cat.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {editingId === cat.id ? (
                                            <div className="flex gap-1 justify-end">
                                                <Button size="sm" variant="outline" onClick={() => handleUpdate(cat.id)}>
                                                    <Check className="w-3 h-3" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-1 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleDelete(cat.id)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// ==========================================
// Main ShopAdmin Component
// ==========================================

export default function ShopAdmin() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [view, setView] = useState<AdminView>('dashboard');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
    const [filterType, setFilterType] = useState<'all' | 'physical' | 'digital'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Stats
    const [stats, setStats] = useState({
        totalProducts: 0,
        publishedProducts: 0,
        outOfStock: 0,
        lowStock: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
    });

    // Auth guard — wait for auth *and* user profile to load before deciding
    const [guardChecked, setGuardChecked] = useState(false);

    useEffect(() => {
        // Don't evaluate until auth loading is done
        if (authLoading) return;

        // Give a short grace period for the profile to arrive after auth
        const timer = setTimeout(() => {
            if (!user || !['admin', 'super_admin'].includes(user.role)) {
                navigate('/login');
                toast({ title: 'Access Denied', description: 'Admin access required', variant: 'destructive' });
            }
            setGuardChecked(true);
        }, 1500); // 1.5 s grace window

        // If user already exists and has correct role, clear timer immediately
        if (user && ['admin', 'super_admin'].includes(user.role)) {
            clearTimeout(timer);
            setGuardChecked(true);
        }

        return () => clearTimeout(timer);
    }, [user, authLoading, navigate, toast]);

    // Load data
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes, statsRes] = await Promise.all([
                getProducts({
                    search: searchQuery || undefined,
                    category_id: filterCategory || undefined,
                    published: filterStatus === 'all' ? undefined : filterStatus === 'published',
                    product_type: filterType === 'all' ? undefined : filterType as 'physical' | 'digital',
                }),
                getProductCategories(),
                getShopStats(),
            ]);

            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            setStats(statsRes);
        } catch (err) {
            console.error('Error loading shop data:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filterCategory, filterStatus, filterType]);

    useEffect(() => {
        if (user && ['admin', 'super_admin'].includes(user.role)) {
            loadData();
        }
    }, [loadData, user]);

    // ==========================================
    // Actions
    // ==========================================

    const handleSaveProduct = async (data: ProductFormData) => {
        setSaving(true);
        try {
            if (editingProduct) {
                const { error } = await updateProduct(editingProduct.id, data);
                if (error) throw error;
                toast({ title: 'Product updated successfully!' });
            } else {
                const { error } = await createProduct(data);
                if (error) throw error;
                toast({ title: 'Product created successfully!' });
            }
            setEditingProduct(null);
            setView('products');
            loadData();
        } catch (err: unknown) {
            toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Delete this product permanently?')) return;
        const { error } = await deleteProduct(id);
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Product deleted' });
            loadData();
        }
    };

    const handleTogglePublish = async (id: string, published: boolean) => {
        const { error } = await toggleProductPublish(id, !published);
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: published ? 'Product unpublished' : 'Product published' });
            loadData();
        }
    };

    const handleToggleFeatured = async (id: string, featured: boolean) => {
        const { error } = await toggleProductFeatured(id, !featured);
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: featured ? 'Removed from featured' : 'Added to featured' });
            loadData();
        }
    };

    const handleDuplicate = async (id: string) => {
        const { error } = await duplicateProduct(id);
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Product duplicated' });
            loadData();
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} product(s)?`)) return;

        const { error } = await bulkDeleteProducts(selectedIds);
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: `${selectedIds.length} product(s) deleted` });
            setSelectedIds([]);
            loadData();
        }
    };

    const handleBulkPublish = async (publish: boolean) => {
        if (selectedIds.length === 0) return;
        const { error } = await bulkUpdateProducts(selectedIds, { is_published: publish });
        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: `${selectedIds.length} product(s) ${publish ? 'published' : 'unpublished'}` });
            setSelectedIds([]);
            loadData();
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    if (authLoading || !user || !guardChecked) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Helmet>
                <title>Shop Admin | psychmind</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Product Form View */}
                    {view === 'product-form' ? (
                        <ProductForm
                            product={editingProduct}
                            categories={categories}
                            onSave={handleSaveProduct}
                            onCancel={() => { setView('products'); setEditingProduct(null); }}
                            saving={saving}
                        />
                    ) : view === 'categories' ? (
                        <>
                            {/* Nav Tabs */}
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900">Shop Admin</h1>
                            </div>
                            <NavTabs view={view} setView={setView} />
                            <CategoryManager categories={categories} onCategoriesChange={loadData} />
                        </>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Package className="w-7 h-7 text-cyan-500" />
                                        Shop Admin
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-1">Manage your products, inventory, and orders</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => navigate('/shop')}>
                                        <Eye className="w-4 h-4 mr-2" /> View Store
                                    </Button>
                                    <Button
                                        className="btn-icy"
                                        onClick={() => { setEditingProduct(null); setView('product-form'); }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Product
                                    </Button>
                                </div>
                            </div>

                            {/* Nav Tabs */}
                            <NavTabs view={view} setView={setView} />

                            {/* Dashboard View */}
                            {view === 'dashboard' && (
                                <div className="space-y-8">
                                    {/* Stats Grid */}
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatCard label="Total Products" value={stats.totalProducts} icon={Package} color="bg-blue-500" sub={`${stats.publishedProducts} published`} />
                                        <StatCard label="Out of Stock" value={stats.outOfStock} icon={AlertTriangle} color={stats.outOfStock > 0 ? "bg-red-500" : "bg-gray-400"} sub={`${stats.lowStock} low stock`} />
                                        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="bg-purple-500" sub={`${stats.pendingOrders} pending`} />
                                        <StatCard label="Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} color="bg-green-500" />
                                    </div>

                                    {/* Quick actions */}
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <button
                                            onClick={() => { setEditingProduct(null); setView('product-form'); }}
                                            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left group"
                                        >
                                            <Plus className="w-8 h-8 text-cyan-500 mb-3 group-hover:scale-110 transition-transform" />
                                            <h3 className="font-semibold text-gray-900">Add Product</h3>
                                            <p className="text-sm text-gray-500 mt-1">Create a new product listing</p>
                                        </button>
                                        <button
                                            onClick={() => setView('products')}
                                            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left group"
                                        >
                                            <PackageCheck className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                                            <h3 className="font-semibold text-gray-900">Manage Products</h3>
                                            <p className="text-sm text-gray-500 mt-1">Edit, publish, or update stock</p>
                                        </button>
                                        <button
                                            onClick={() => setView('categories')}
                                            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left group"
                                        >
                                            <FolderOpen className="w-8 h-8 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                                            <h3 className="font-semibold text-gray-900">Categories</h3>
                                            <p className="text-sm text-gray-500 mt-1">Organize your product catalog</p>
                                        </button>
                                    </div>

                                    {/* Recent products */}
                                    {products.length > 0 && (
                                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                                <h3 className="font-semibold text-gray-900">Recent Products</h3>
                                                <Button variant="ghost" size="sm" onClick={() => setView('products')}>
                                                    View All →
                                                </Button>
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {products.slice(0, 5).map(product => (
                                                    <div key={product.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                            {product.thumbnail_url || (product.images && product.images.length > 0) ? (
                                                                <img
                                                                    src={product.thumbnail_url || product.images[0]}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <ImageIcon className="w-4 h-4 text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                                            <p className="text-xs text-gray-400">
                                                                ₹{product.price.toLocaleString('en-IN')} · {product.stock_quantity} in stock
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${product.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {product.is_published ? 'Published' : 'Draft'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Products List View */}
                            {view === 'products' && (
                                <div className="space-y-4">
                                    {/* Search & Filters */}
                                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="relative flex-1 min-w-[200px]">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                    placeholder="Search products..."
                                                    className="pl-9"
                                                />
                                            </div>

                                            <select
                                                value={filterStatus}
                                                onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                                                className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            >
                                                <option value="all">All Status</option>
                                                <option value="published">Published</option>
                                                <option value="draft">Draft</option>
                                            </select>

                                            <select
                                                value={filterType}
                                                onChange={e => setFilterType(e.target.value as typeof filterType)}
                                                className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            >
                                                <option value="all">All Types</option>
                                                <option value="physical">Physical</option>
                                                <option value="digital">Digital</option>
                                            </select>

                                            <select
                                                value={filterCategory}
                                                onChange={e => setFilterCategory(e.target.value)}
                                                className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>

                                            <div className="flex gap-1 border border-gray-200 rounded-lg p-0.5">
                                                <button
                                                    onClick={() => setViewMode('table')}
                                                    className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-gray-100' : ''}`}
                                                >
                                                    <List className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => setViewMode('grid')}
                                                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                                                >
                                                    <Grid3X3 className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Bulk actions */}
                                        {selectedIds.length > 0 && (
                                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                                                <span className="text-sm text-gray-600">
                                                    {selectedIds.length} selected
                                                </span>
                                                <Button size="sm" variant="outline" onClick={() => handleBulkPublish(true)}>
                                                    <Eye className="w-3 h-3 mr-1" /> Publish
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleBulkPublish(false)}>
                                                    <EyeOff className="w-3 h-3 mr-1" /> Unpublish
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={handleBulkDelete}>
                                                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                                                    Clear
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {loading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                                        </div>
                                    ) : products.length === 0 ? (
                                        <div className="bg-white rounded-xl p-12 border border-gray-100 shadow-sm text-center">
                                            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                                            <p className="text-gray-500 mb-6">Start adding products to your shop</p>
                                            <Button className="btn-icy" onClick={() => { setEditingProduct(null); setView('product-form'); }}>
                                                <Plus className="w-4 h-4 mr-2" /> Add Your First Product
                                            </Button>
                                        </div>
                                    ) : viewMode === 'table' ? (
                                        /* Table View */
                                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50 text-left">
                                                        <tr>
                                                            <th className="px-4 py-3 w-10">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedIds.length === products.length}
                                                                    onChange={toggleSelectAll}
                                                                    className="rounded border-gray-300"
                                                                />
                                                            </th>
                                                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                                                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                                                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                                                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                                                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {products.map(product => (
                                                            <tr key={product.id} className={`hover:bg-gray-50 ${selectedIds.includes(product.id) ? 'bg-cyan-50/50' : ''}`}>
                                                                <td className="px-4 py-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedIds.includes(product.id)}
                                                                        onChange={() => toggleSelect(product.id)}
                                                                        className="rounded border-gray-300"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                                            {product.thumbnail_url || (product.images && product.images.length > 0) ? (
                                                                                <img
                                                                                    src={product.thumbnail_url || product.images[0]}
                                                                                    alt={product.name}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center">
                                                                                    <ImageIcon className="w-4 h-4 text-gray-300" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                                                                            <p className="text-xs text-gray-400">
                                                                                {product.product_type === 'digital' ? '📥 Digital' : '📦 Physical'}
                                                                                {product.sku && ` · ${product.sku}`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {product.category?.name || '—'}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div>
                                                                        <span className="font-medium text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                                                                        {product.original_price && (
                                                                            <span className="text-xs text-gray-400 line-through ml-1">
                                                                                ₹{product.original_price.toLocaleString('en-IN')}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {product.track_inventory ? (
                                                                        <span className={`text-sm font-medium ${
                                                                            product.stock_quantity === 0 ? 'text-red-600' :
                                                                            product.stock_quantity <= product.low_stock_threshold ? 'text-amber-600' :
                                                                            'text-green-600'
                                                                        }`}>
                                                                            {product.stock_quantity === 0 ? 'Out of stock' :
                                                                             product.stock_quantity <= product.low_stock_threshold ? `Low (${product.stock_quantity})` :
                                                                             product.stock_quantity}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-gray-400">Not tracked</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${product.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                            {product.is_published ? 'Published' : 'Draft'}
                                                                        </span>
                                                                        {product.is_featured && (
                                                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                                        )}
                                                                        {product.badge && (
                                                                            <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700">{product.badge}</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            title="Edit"
                                                                            onClick={() => { setEditingProduct(product); setView('product-form'); }}
                                                                        >
                                                                            <Edit className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            title={product.is_published ? 'Unpublish' : 'Publish'}
                                                                            onClick={() => handleTogglePublish(product.id, product.is_published)}
                                                                        >
                                                                            {product.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            title={product.is_featured ? 'Unfeature' : 'Feature'}
                                                                            onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                                                                        >
                                                                            <Star className={`w-3.5 h-3.5 ${product.is_featured ? 'text-amber-400 fill-amber-400' : ''}`} />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            title="Duplicate"
                                                                            onClick={() => handleDuplicate(product.id)}
                                                                        >
                                                                            <Copy className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="text-red-500 hover:text-red-700"
                                                                            title="Delete"
                                                                            onClick={() => handleDeleteProduct(product.id)}
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Grid View */
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {products.map(product => (
                                                <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
                                                    <div className="relative aspect-square bg-gray-100">
                                                        {product.thumbnail_url || (product.images && product.images.length > 0) ? (
                                                            <img
                                                                src={product.thumbnail_url || product.images[0]}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ImageIcon className="w-12 h-12 text-gray-200" />
                                                            </div>
                                                        )}
                                                        {/* Overlay actions */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                onClick={() => { setEditingProduct(product); setView('product-form'); }}
                                                            >
                                                                <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                className="text-red-600"
                                                                onClick={() => handleDeleteProduct(product.id)}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                        {/* Badges */}
                                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                            {!product.is_published && (
                                                                <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-white">Draft</span>
                                                            )}
                                                            {product.badge && (
                                                                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500 text-white">{product.badge}</span>
                                                            )}
                                                        </div>
                                                        {product.is_featured && (
                                                            <Star className="absolute top-2 right-2 w-4 h-4 text-amber-400 fill-amber-400" />
                                                        )}
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(product.id)}
                                                            onChange={() => toggleSelect(product.id)}
                                                            className="absolute bottom-2 left-2 rounded border-gray-300"
                                                        />
                                                    </div>
                                                    <div className="p-4">
                                                        <p className="text-xs text-gray-400">{product.category?.name || product.product_type}</p>
                                                        <h3 className="font-medium text-gray-900 text-sm mt-0.5 truncate">{product.name}</h3>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="font-semibold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                                                            <span className={`text-xs ${
                                                                product.stock_quantity === 0 ? 'text-red-500' :
                                                                product.stock_quantity <= product.low_stock_threshold ? 'text-amber-500' :
                                                                'text-green-500'
                                                            }`}>
                                                                {product.stock_quantity === 0 ? 'Out of stock' : `${product.stock_quantity} in stock`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}

// ==========================================
// Nav Tabs sub-component
// ==========================================
function NavTabs({ view, setView }: { view: AdminView; setView: (v: AdminView) => void }) {
    const tabs: { key: AdminView; label: string; icon: React.ElementType }[] = [
        { key: 'dashboard', label: 'Overview', icon: BarChart3 },
        { key: 'products', label: 'Products', icon: Package },
        { key: 'categories', label: 'Categories', icon: FolderOpen },
    ];

    return (
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-gray-100 shadow-sm w-fit">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => setView(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${view === tab.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
