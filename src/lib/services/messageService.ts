// Message Service - Real-time chat with Supabase
import { supabase, Message, Conversation, User } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ConversationWithParticipant extends Conversation {
    otherParticipant?: User;
    unreadCount?: number;
}

export interface MessageWithSender extends Message {
    sender?: User;
}

// ==========================================
// Conversation Management
// ==========================================

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(
    userId1: string,
    userId2: string
): Promise<{ data: Conversation | null; error: Error | null }> {
    try {
        // Normalize the order to ensure consistent unique constraint
        const [participant1, participant2] = [userId1, userId2].sort();

        // Try to find existing conversation
        const { data: existing, error: findError } = await supabase
            .from('conversations')
            .select('*')
            .or(`and(participant_1_id.eq.${participant1},participant_2_id.eq.${participant2}),and(participant_1_id.eq.${participant2},participant_2_id.eq.${participant1})`)
            .single();

        if (existing) {
            return { data: existing, error: null };
        }

        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({
                participant_1_id: participant1,
                participant_2_id: participant2,
                is_active: true,
            })
            .select()
            .single();

        if (createError) {
            return { data: null, error: new Error(createError.message) };
        }

        return { data: newConversation, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(
    userId: string
): Promise<{ data: ConversationWithParticipant[]; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                participant_1:users!conversations_participant_1_id_fkey(id, full_name, avatar_url, role, last_seen_at),
                participant_2:users!conversations_participant_2_id_fkey(id, full_name, avatar_url, role, last_seen_at)
            `)
            .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
            .eq('is_active', true)
            .order('last_message_at', { ascending: false, nullsFirst: false });

        if (error) {
            return { data: [], error: new Error(error.message) };
        }

        // Transform to include otherParticipant
        const conversations: ConversationWithParticipant[] = (data || []).map(conv => {
            const isParticipant1 = conv.participant_1_id === userId;
            return {
                ...conv,
                otherParticipant: isParticipant1 ? conv.participant_2 : conv.participant_1,
            };
        });

        // Get unread counts for each conversation
        for (const conv of conversations) {
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .neq('sender_id', userId)
                .eq('is_read', false);

            conv.unreadCount = count || 0;
        }

        return { data: conversations, error: null };
    } catch (error) {
        return { data: [], error: error as Error };
    }
}

// ==========================================
// Message Management
// ==========================================

/**
 * Send a message in a conversation
 */
export async function sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    receiverId: string,
    fileUrl?: string,
    fileType?: string,
    fileName?: string
): Promise<{ data: Message | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                receiver_id: receiverId,
                content: content.trim(),
                file_url: fileUrl || null,
                file_type: fileType || null,
                file_name: fileName || null,
                is_read: false,
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

/**
 * Get messages for a conversation with pagination
 */
export async function getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
): Promise<{ data: MessageWithSender[]; error: Error | null; hasMore: boolean }> {
    try {
        const { data, error, count } = await supabase
            .from('messages')
            .select(`
                *,
                sender:users!messages_sender_id_fkey(id, full_name, avatar_url)
            `, { count: 'exact' })
            .eq('conversation_id', conversationId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return { data: [], error: new Error(error.message), hasMore: false };
        }

        // Reverse to get chronological order
        const messages = (data || []).reverse();
        const hasMore = (count || 0) > offset + limit;

        return { data: messages, error: null, hasMore };
    } catch (error) {
        return { data: [], error: error as Error, hasMore: false };
    }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
    conversationId: string,
    userId: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('messages')
            .update({
                is_read: true,
                read_at: new Date().toISOString(),
            })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId)
            .eq('is_read', false);

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(
    messageId: string,
    userId: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('messages')
            .update({ is_deleted: true })
            .eq('id', messageId)
            .eq('sender_id', userId); // Only allow sender to delete

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

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToConversation(
    conversationId: string,
    callbacks: {
        onNewMessage?: (message: Message) => void;
        onMessageUpdate?: (message: Message) => void;
        onTyping?: (userId: string) => void;
    }
): RealtimeChannel {
    const channel = supabase.channel(`conversation:${conversationId}`);

    // Listen for new messages
    channel.on(
        'postgres_changes',
        {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
            callbacks.onNewMessage?.(payload.new as Message);
        }
    );

    // Listen for message updates (read receipts, deletions)
    channel.on(
        'postgres_changes',
        {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
            callbacks.onMessageUpdate?.(payload.new as Message);
        }
    );

    // Broadcast channel for typing indicators
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
        callbacks.onTyping?.(payload.userId);
    });

    return channel.subscribe();
}

/**
 * Broadcast typing indicator
 */
export function sendTypingIndicator(
    channel: RealtimeChannel,
    userId: string
): void {
    channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId },
    });
}

/**
 * Subscribe to all user conversations for updates
 */
export function subscribeToUserConversations(
    userId: string,
    onUpdate: (conversation: Conversation) => void
): RealtimeChannel {
    return supabase
        .channel(`user-conversations:${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'conversations',
                filter: `participant_1_id=eq.${userId}`,
            },
            (payload) => onUpdate(payload.new as Conversation)
        )
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'conversations',
                filter: `participant_2_id=eq.${userId}`,
            },
            (payload) => onUpdate(payload.new as Conversation)
        )
        .subscribe();
}

// ==========================================
// File Uploads
// ==========================================

/**
 * Upload a file attachment
 */
export async function uploadMessageAttachment(
    file: File,
    conversationId: string
): Promise<{ url: string | null; error: Error | null }> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${conversationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('message-attachments')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            return { url: null, error: new Error(error.message) };
        }

        const { data: publicUrl } = supabase.storage
            .from('message-attachments')
            .getPublicUrl(data.path);

        return { url: publicUrl.publicUrl, error: null };
    } catch (error) {
        return { url: null, error: error as Error };
    }
}

// ==========================================
// Utility Functions
// ==========================================

/**
 * Format relative time for message display
 */
export function formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

    // Same week
    if (diffInSeconds < 604800) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    // Same year
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Check if user is online (seen in last 5 minutes)
 */
export function isUserOnline(lastSeenAt: string | null | undefined): boolean {
    if (!lastSeenAt) return false;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return new Date(lastSeenAt).getTime() > fiveMinutesAgo;
}
