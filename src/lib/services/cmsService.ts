// CMS Service - Content Management for SuperAdmin
import { supabase } from '@/lib/supabase';

// ==========================================
// Types
// ==========================================

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    cover_image?: string;
    author_id?: string;
    category?: string;
    tags?: string[];
    read_time_minutes?: number;
    is_published: boolean;
    published_at?: string;
    meta_title?: string;
    meta_description?: string;
    created_at: string;
    updated_at: string;
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
}

export interface SiteSetting {
    key: string;
    value: string;
    description?: string;
    updated_at: string;
}

// ==========================================
// Blog Posts
// ==========================================

export async function getBlogPosts(options?: {
    published?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
}): Promise<{ data: BlogPost[]; error: Error | null; count: number }> {
    try {
        let query = supabase
            .from('blogs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (options?.published !== undefined) {
            query = query.eq('is_published', options.published);
        }

        if (options?.category) {
            query = query.eq('category', options.category);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error, count } = await query;

        if (error) {
            return { data: [], error: new Error(error.message), count: 0 };
        }

        return { data: data || [], error: null, count: count || 0 };
    } catch (error) {
        return { data: [], error: error as Error, count: 0 };
    }
}

export async function getBlogPost(idOrSlug: string): Promise<{ data: BlogPost | null; error: Error | null }> {
    try {
        // Try by slug first, then by id
        let query = supabase.from('blogs').select('*');

        if (idOrSlug.includes('-')) {
            query = query.eq('slug', idOrSlug);
        } else {
            query = query.eq('id', idOrSlug);
        }

        const { data, error } = await query.single();

        if (error) {
            return { data: null, error: new Error(error.message) };
        }

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

export async function createBlogPost(post: Partial<BlogPost>): Promise<{ data: BlogPost | null; error: Error | null }> {
    try {
        const slug = post.slug || generateSlug(post.title || 'untitled');

        const { data, error } = await supabase
            .from('blogs')
            .insert({
                title: post.title || 'Untitled',
                slug,
                excerpt: post.excerpt,
                content: post.content,
                cover_image: post.cover_image,
                category: post.category,
                tags: post.tags || [],
                read_time_minutes: post.read_time_minutes || estimateReadTime(post.content || ''),
                is_published: post.is_published || false,
                published_at: post.is_published ? new Date().toISOString() : null,
                meta_title: post.meta_title,
                meta_description: post.meta_description,
            })
            .select()
            .single();

        if (error) {
            return { data: null, error: new Error(error.message) };
        }

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<{ error: Error | null }> {
    try {
        const updateData: Record<string, unknown> = {
            ...updates,
            updated_at: new Date().toISOString(),
        };

        // If publishing for first time, set published_at
        if (updates.is_published && !updates.published_at) {
            updateData.published_at = new Date().toISOString();
        }

        // Recalculate read time if content changed
        if (updates.content) {
            updateData.read_time_minutes = estimateReadTime(updates.content);
        }

        const { error } = await supabase
            .from('blogs')
            .update(updateData)
            .eq('id', id);

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

export async function deleteBlogPost(id: string): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', id);

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

// ==========================================
// Blog Categories
// ==========================================

export async function getBlogCategories(): Promise<{ data: BlogCategory[]; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('blog_categories')
            .select('*')
            .order('sort_order');

        if (error) {
            return { data: [], error: new Error(error.message) };
        }

        return { data: data || [], error: null };
    } catch (error) {
        return { data: [], error: error as Error };
    }
}

// ==========================================
// Site Settings
// ==========================================

export async function getSiteSettings(): Promise<{ data: Record<string, string>; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('key, value');

        if (error) {
            return { data: {}, error: new Error(error.message) };
        }

        // Convert to key-value object
        const settings: Record<string, string> = {};
        for (const item of data || []) {
            settings[item.key] = typeof item.value === 'string'
                ? item.value.replace(/^"|"$/g, '') // Remove surrounding quotes from JSON
                : item.value;
        }

        return { data: settings, error: null };
    } catch (error) {
        return { data: {}, error: error as Error };
    }
}

export async function getSiteSetting(key: string): Promise<{ data: string | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error) {
            return { data: null, error: new Error(error.message) };
        }

        const value = typeof data.value === 'string'
            ? data.value.replace(/^"|"$/g, '')
            : String(data.value);

        return { data: value, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

export async function updateSiteSetting(
    key: string,
    value: string,
    userId: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('site_settings')
            .upsert({
                key,
                value: JSON.stringify(value),
                updated_at: new Date().toISOString(),
                updated_by: userId,
            });

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

export async function updateSiteSettings(
    settings: Record<string, string>,
    userId: string
): Promise<{ error: Error | null }> {
    try {
        const updates = Object.entries(settings).map(([key, value]) => ({
            key,
            value: JSON.stringify(value),
            updated_at: new Date().toISOString(),
            updated_by: userId,
        }));

        const { error } = await supabase
            .from('site_settings')
            .upsert(updates);

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

// ==========================================
// Utility Functions
// ==========================================

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100);
}

function estimateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// ==========================================
// Image Upload
// ==========================================

export async function uploadBlogImage(file: File): Promise<{ url: string | null; error: Error | null }> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `blog/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('content')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            return { url: null, error: new Error(error.message) };
        }

        const { data: publicUrl } = supabase.storage
            .from('content')
            .getPublicUrl(data.path);

        return { url: publicUrl.publicUrl, error: null };
    } catch (error) {
        return { url: null, error: error as Error };
    }
}
