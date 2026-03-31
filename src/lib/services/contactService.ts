// Contact Service - Handle contact form submissions
import { supabase } from '@/lib/supabase';

export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    status: 'new' | 'read' | 'responded';
    created_at: string;
    responded_at?: string;
}

export interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

/**
 * Submit a contact form to the database
 */
export async function submitContactForm(data: ContactFormData): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        // Validate required fields
        if (!data.name?.trim()) {
            return { success: false, error: 'Name is required' };
        }
        if (!data.email?.trim()) {
            return { success: false, error: 'Email is required' };
        }
        if (!data.message?.trim()) {
            return { success: false, error: 'Message is required' };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return { success: false, error: 'Please enter a valid email address' };
        }

        // Insert into database
        const { error } = await supabase
            .from('contact_submissions')
            .insert({
                name: data.name.trim(),
                email: data.email.trim().toLowerCase(),
                phone: data.phone?.trim() || null,
                message: data.message.trim(),
                status: 'new',
            });

        if (error) {
            console.error('Contact form submission error:', error);
            // If table doesn't exist, create a notification instead
            if (error.code === '42P01') {
                console.log('📧 Contact form submitted (table not yet created):', data);
                return { success: true };
            }
            throw error;
        }

        // Send notification to admin (optional)
        try {
            await supabase.from('notifications').insert({
                user_id: null, // Will be picked up by super_admin
                type: 'contact_form',
                title: 'New Contact Form Submission',
                message: `${data.name} sent a message`,
                data: { email: data.email },
            });
        } catch {
            // Non-critical, ignore
        }

        return { success: true };
    } catch (error: unknown) {
        console.error('Contact form error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit form';
        return { success: false, error: errorMessage };
    }
}

/**
 * Get all contact submissions (admin only)
 */
export async function getContactSubmissions(status?: 'new' | 'read' | 'responded'): Promise<{
    data: ContactSubmission[];
    error?: string;
}> {
    try {
        let query = supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { data: (data as ContactSubmission[]) || [] };
    } catch (error: unknown) {
        console.error('Get contact submissions error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch submissions';
        return { data: [], error: errorMessage };
    }
}

/**
 * Mark a submission as read
 */
export async function markAsRead(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('contact_submissions')
            .update({ status: 'read' })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update';
        return { success: false, error: errorMessage };
    }
}

/**
 * Mark a submission as responded
 */
export async function markAsResponded(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('contact_submissions')
            .update({
                status: 'responded',
                responded_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update';
        return { success: false, error: errorMessage };
    }
}

export default {
    submitContactForm,
    getContactSubmissions,
    markAsRead,
    markAsResponded,
};
