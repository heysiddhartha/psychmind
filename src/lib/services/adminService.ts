// Admin Service - Centralized admin operations
import { supabase } from '@/lib/supabase';

export interface AuditLog {
    id: string;
    user_id: string;
    action_type: string;
    target_type: string;
    target_id: string;
    description: string;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    created_at: string;
    user?: { full_name: string; email: string };
}

export interface SystemSetting {
    id: string;
    category: string;
    key: string;
    value: unknown;
    description: string;
    is_public: boolean;
    updated_at: string;
}

export interface AdminStats {
    totalUsers: number;
    totalTherapists: number;
    pendingVerifications: number;
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    newUsersThisMonth: number;
    activeTherapists: number;
}

// Fetch admin dashboard stats
export async function getAdminStats(): Promise<AdminStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [users, therapists, bookings] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('therapists').select('*'),
        supabase.from('bookings').select('*'),
    ]);

    const usersThisMonth = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

    const therapistData = therapists.data || [];
    const bookingData = bookings.data || [];

    return {
        totalUsers: users.count || 0,
        totalTherapists: therapistData.length,
        pendingVerifications: therapistData.filter(t => !t.is_verified).length,
        totalBookings: bookingData.length,
        completedBookings: bookingData.filter(b => b.status === 'completed').length,
        totalRevenue: bookingData.reduce((sum, b) => sum + (b.amount || 0), 0),
        newUsersThisMonth: usersThisMonth.count || 0,
        activeTherapists: therapistData.filter(t => t.is_active && t.is_verified).length,
    };
}

// Verify a therapist
export async function verifyTherapist(
    therapistId: string,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('therapists')
            .update({
                is_verified: true,
                is_active: true,
                is_approved: true,
                verified_at: new Date().toISOString(),
                verified_by: user?.id,
                verification_notes: notes || 'Approved by admin',
            })
            .eq('id', therapistId);

        if (error) throw error;

        // Log audit event
        await logAuditEvent('therapist_verified', 'therapist', therapistId,
            `Therapist verified${notes ? `: ${notes}` : ''}`);

        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: errorMessage };
    }
}

// Reject a therapist
export async function rejectTherapist(
    therapistId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('therapists')
            .update({
                is_verified: false,
                is_active: false,
                is_approved: false,
                rejection_reason: reason,
            })
            .eq('id', therapistId);

        if (error) throw error;

        await logAuditEvent('therapist_rejected', 'therapist', therapistId,
            `Therapist rejected: ${reason}`);

        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: errorMessage };
    }
}

// Update user role
export async function updateUserRole(
    userId: string,
    newRole: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: oldUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        const { error } = await supabase
            .from('users')
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;

        await logAuditEvent('user_role_changed', 'user', userId,
            `Role changed from ${oldUser?.role} to ${newRole}`,
            { role: oldUser?.role },
            { role: newRole }
        );

        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: errorMessage };
    }
}

// Get audit logs
export async function getAuditLogs(
    limit = 50,
    offset = 0
): Promise<{ data: AuditLog[]; count: number }> {
    const { data, count, error } = await supabase
        .from('audit_logs')
        .select('*, user:users(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching audit logs:', error);
        return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
}

// Get system settings
export async function getSystemSettings(
    category?: string
): Promise<SystemSetting[]> {
    let query = supabase.from('system_settings').select('*');

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query.order('category').order('key');

    if (error) {
        console.error('Error fetching settings:', error);
        return [];
    }

    return data || [];
}

// Update system setting
export async function updateSystemSetting(
    category: string,
    key: string,
    value: unknown
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('system_settings')
            .update({
                value: JSON.stringify(value),
                updated_at: new Date().toISOString(),
                updated_by: user?.id,
            })
            .eq('category', category)
            .eq('key', key);

        if (error) throw error;

        await logAuditEvent('settings_updated', 'settings', `${category}.${key}`,
            `Setting ${category}.${key} updated`);

        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: errorMessage };
    }
}

// Log audit event
async function logAuditEvent(
    actionType: string,
    targetType: string,
    targetId: string,
    description: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>
) {
    try {
        await supabase.from('audit_logs').insert({
            action_type: actionType,
            target_type: targetType,
            target_id: targetId,
            description,
            old_values: oldValues || null,
            new_values: newValues || null,
        });
    } catch (error) {
        console.error('Failed to log audit event:', error);
    }
}

export default {
    getAdminStats,
    verifyTherapist,
    rejectTherapist,
    updateUserRole,
    getAuditLogs,
    getSystemSettings,
    updateSystemSetting,
};
