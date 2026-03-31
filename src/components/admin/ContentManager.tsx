import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Save,
    X,
    Upload,
    FileText,
    Settings,
    Loader2,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    getBlogPosts,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getBlogCategories,
    getSiteSettings,
    updateSiteSettings,
    uploadBlogImage,
    BlogPost,
    BlogCategory,
} from "@/lib/services/cmsService";

interface ContentManagerProps {
    onClose?: () => void;
}

export default function ContentManager({ onClose }: ContentManagerProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [activeSubTab, setActiveSubTab] = useState<"blogs" | "settings">("blogs");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Blog state
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Settings state
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);

        const [postsResult, categoriesResult, settingsResult] = await Promise.all([
            getBlogPosts(),
            getBlogCategories(),
            getSiteSettings(),
        ]);

        if (!postsResult.error) setPosts(postsResult.data);
        if (!categoriesResult.error) setCategories(categoriesResult.data);
        if (!settingsResult.error) {
            setSettings(settingsResult.data);
            setEditedSettings(settingsResult.data);
        }

        setLoading(false);
    };

    // Blog handlers
    const handleCreatePost = async () => {
        if (!editingPost?.title) {
            toast({ title: "Error", description: "Title is required", variant: "destructive" });
            return;
        }

        setSaving(true);
        const { data, error } = await createBlogPost(editingPost);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Blog post created" });
            setEditingPost(null);
            loadData();
        }
        setSaving(false);
    };

    const handleUpdatePost = async () => {
        if (!editingPost?.id) return;

        setSaving(true);
        const { error } = await updateBlogPost(editingPost.id, editingPost);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Blog post updated" });
            setEditingPost(null);
            loadData();
        }
        setSaving(false);
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        const { error } = await deleteBlogPost(id);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Blog post deleted" });
            loadData();
        }
    };

    const handleTogglePublish = async (post: BlogPost) => {
        const { error } = await updateBlogPost(post.id, { is_published: !post.is_published });

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: post.is_published ? "Post unpublished" : "Post published" });
            loadData();
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        const { url, error } = await uploadBlogImage(file);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else if (url) {
            setEditingPost(prev => ({ ...prev, cover_image: url }));
        }
        setSaving(false);
    };

    // Settings handlers
    const handleSaveSettings = async () => {
        if (!user) return;

        setSaving(true);
        const { error } = await updateSiteSettings(editedSettings, user.id);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Settings saved" });
            setSettings(editedSettings);
        }
        setSaving(false);
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const settingsConfig = [
        { key: "hero_tagline", label: "Hero Tagline", placeholder: "We Help You Feel" },
        { key: "hero_subtitle", label: "Hero Subtitle", placeholder: "A welcoming space..." },
        { key: "hero_quote", label: "Hero Quote", placeholder: "Self Care isn't selfish" },
        { key: "hero_badge", label: "Hero Badge", placeholder: "Now accepting new clients" },
        { key: "contact_email", label: "Contact Email", placeholder: "hello@example.com" },
        { key: "contact_phone", label: "Contact Phone", placeholder: "+91 98765 43210" },
        { key: "social_instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
        { key: "social_facebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
        { key: "social_linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/..." },
        { key: "footer_tagline", label: "Footer Tagline", placeholder: "Your journey starts here" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setActiveSubTab("blogs")}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeSubTab === "blogs" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Blog Posts
                </button>
                <button
                    onClick={() => setActiveSubTab("settings")}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeSubTab === "settings" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    Site Settings
                </button>
            </div>

            {/* Blog Posts Tab */}
            {activeSubTab === "blogs" && !editingPost && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <Button onClick={() => setEditingPost({ title: "", content: "", is_published: false })}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Post
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Title</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPosts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">
                                            No blog posts yet. Create your first post!
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPosts.map((post) => (
                                        <tr key={post.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-900">{post.title}</p>
                                                <p className="text-sm text-gray-500 truncate max-w-xs">{post.excerpt}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                                    {post.category || "Uncategorized"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${post.is_published
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-amber-100 text-amber-700"
                                                    }`}>
                                                    {post.is_published ? "Published" : "Draft"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleTogglePublish(post)}
                                                        title={post.is_published ? "Unpublish" : "Publish"}
                                                    >
                                                        {post.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingPost(post)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeletePost(post.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Blog Editor */}
            {activeSubTab === "blogs" && editingPost && (
                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                            {editingPost.id ? "Edit Post" : "New Post"}
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setEditingPost(null)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label>Title *</Label>
                                <Input
                                    value={editingPost.title || ""}
                                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                    placeholder="Enter post title"
                                />
                            </div>

                            <div>
                                <Label>Excerpt</Label>
                                <Input
                                    value={editingPost.excerpt || ""}
                                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                    placeholder="Brief description for previews"
                                />
                            </div>

                            <div>
                                <Label>Category</Label>
                                <select
                                    value={editingPost.category || ""}
                                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>Cover Image</Label>
                                <div className="flex items-center gap-4">
                                    {editingPost.cover_image && (
                                        <img
                                            src={editingPost.cover_image}
                                            alt="Cover"
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                    )}
                                    <label className="cursor-pointer">
                                        <div className="px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm">Upload Image</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>Content</Label>
                            <textarea
                                value={editingPost.content || ""}
                                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                placeholder="Write your blog content here... (Markdown supported)"
                                className="w-full h-64 px-3 py-2 border border-gray-200 rounded-lg resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editingPost.is_published || false}
                                onChange={(e) => setEditingPost({ ...editingPost, is_published: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-600">Publish immediately</span>
                        </label>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setEditingPost(null)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={editingPost.id ? handleUpdatePost : handleCreatePost}
                                disabled={saving}
                            >
                                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                <Save className="w-4 h-4 mr-2" />
                                {editingPost.id ? "Update" : "Create"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Site Settings Tab */}
            {activeSubTab === "settings" && (
                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Site Settings</h3>
                            <p className="text-sm text-gray-500">Configure dynamic content across your website</p>
                        </div>
                        <Button onClick={handleSaveSettings} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {settingsConfig.map((setting) => (
                            <div key={setting.key}>
                                <Label>{setting.label}</Label>
                                <Input
                                    value={editedSettings[setting.key] || ""}
                                    onChange={(e) => setEditedSettings({
                                        ...editedSettings,
                                        [setting.key]: e.target.value
                                    })}
                                    placeholder={setting.placeholder}
                                    className="mt-1"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
