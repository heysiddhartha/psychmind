// Notification Service - Real-time notifications for the platform
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ==========================================
// Types
// ==========================================

export type NotificationType =
    | 'booking_confirmed'
    | 'booking_cancelled'
    | 'booking_reminder'
    | 'new_message'
    | 'call_incoming'
    | 'session_note'
    | 'payment_received'
    | 'system';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, unknown>;
    is_read: boolean;
    created_at: string;
}

export interface CreateNotificationData {
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, unknown>;
}

// ==========================================
// Notification CRUD
// ==========================================

export async function createNotification(
    data: CreateNotificationData
): Promise<{ data: Notification | null; error: Error | null }> {
    try {
        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                user_id: data.user_id,
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link,
                metadata: data.metadata || {},
                is_read: false,
            })
            .select()
            .single();

        if (error) {
            return { data: null, error: new Error(error.message) };
        }

        return { data: notification, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

export async function getUserNotifications(
    userId: string,
    options?: { limit?: number; unreadOnly?: boolean }
): Promise<{ data: Notification[]; error: Error | null; unreadCount: number }> {
    try {
        let query = supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (options?.unreadOnly) {
            query = query.eq('is_read', false);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error, count } = await query;

        if (error) {
            return { data: [], error: new Error(error.message), unreadCount: 0 };
        }

        // Get unread count separately if we're not filtering
        let unreadCount = 0;
        if (!options?.unreadOnly) {
            const { count: unread } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false);
            unreadCount = unread || 0;
        } else {
            unreadCount = count || 0;
        }

        return { data: data || [], error: null, unreadCount };
    } catch (error) {
        return { data: [], error: error as Error, unreadCount: 0 };
    }
}

export async function markAsRead(
    notificationId: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

export async function markAllAsRead(
    userId: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

export async function deleteNotification(
    notificationId: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

export async function clearAllNotifications(
    userId: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', userId);

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

// ==========================================
// Real-time Subscriptions
// ==========================================

export function subscribeToNotifications(
    userId: string,
    onNewNotification: (notification: Notification) => void
): RealtimeChannel {
    const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                onNewNotification(payload.new as Notification);
            }
        )
        .subscribe();

    return channel;
}

export function unsubscribeFromNotifications(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
}

// ==========================================
// Notification Helpers
// ==========================================

export function getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
        booking_confirmed: '📅',
        booking_cancelled: '❌',
        booking_reminder: '⏰',
        new_message: '💬',
        call_incoming: '📞',
        session_note: '📝',
        payment_received: '💳',
        system: '🔔',
    };
    return icons[type] || '🔔';
}

export function getNotificationColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
        booking_confirmed: 'bg-green-100 text-green-600',
        booking_cancelled: 'bg-red-100 text-red-600',
        booking_reminder: 'bg-amber-100 text-amber-600',
        new_message: 'bg-blue-100 text-blue-600',
        call_incoming: 'bg-purple-100 text-purple-600',
        session_note: 'bg-cyan-100 text-cyan-600',
        payment_received: 'bg-emerald-100 text-emerald-600',
        system: 'bg-gray-100 text-gray-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
}

export function formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ==========================================
// Notification Triggers (call these from other services)
// ==========================================

export async function notifyBookingConfirmed(
    userId: string,
    therapistName: string,
    dateTime: string
): Promise<void> {
    await createNotification({
        user_id: userId,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: `Your session with ${therapistName} on ${dateTime} has been confirmed.`,
        link: '/dashboard',
    });
}

export async function notifyNewMessage(
    userId: string,
    senderName: string,
    preview: string
): Promise<void> {
    await createNotification({
        user_id: userId,
        type: 'new_message',
        title: `New message from ${senderName}`,
        message: preview.substring(0, 100) + (preview.length > 100 ? '...' : ''),
        link: '/messages',
    });
}

export async function notifyIncomingCall(
    userId: string,
    callerName: string,
    roomId: string
): Promise<void> {
    await createNotification({
        user_id: userId,
        type: 'call_incoming',
        title: 'Incoming Call',
        message: `${callerName} is calling you...`,
        link: `/call/${roomId}`,
        metadata: { roomId },
    });
}

export async function notifyBookingReminder(
    userId: string,
    therapistName: string,
    minutesUntil: number
): Promise<void> {
    const timeText = minutesUntil >= 60
        ? `${Math.floor(minutesUntil / 60)} hour${minutesUntil >= 120 ? 's' : ''}`
        : `${minutesUntil} minutes`;

    await createNotification({
        user_id: userId,
        type: 'booking_reminder',
        title: 'Upcoming Session',
        message: `Your session with ${therapistName} starts in ${timeText}.`,
        link: '/dashboard',
    });
}

export async function notifyPaymentReceived(
    userId: string,
    amount: number,
    currency: string = 'INR'
): Promise<void> {
    await createNotification({
        user_id: userId,
        type: 'payment_received',
        title: 'Payment Received',
        message: `Your payment of ${currency} ${amount.toFixed(2)} has been received.`,
        link: '/dashboard',
    });
}
