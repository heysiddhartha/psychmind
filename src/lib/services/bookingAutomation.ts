/**
 * Booking Automation Service
 * Handles automated notifications, reminders, and post-booking communication
 */

import { supabase } from '@/lib/supabase';

/**
 * Helper: Create notification in database
 */
async function sendNotification(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, unknown>;
}): Promise<void> {
    await supabase.from('notifications').insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        metadata: params.metadata || {},
        is_read: false,
    });
}

export interface BookingAutomationData {
    bookingId: string;
    clientId: string;
    therapistId: string;
    scheduledAt: string;
    clientEmail: string;
    clientPhone?: string;
    clientName: string;
    therapistName: string;
    therapistPhone?: string;
    serviceType: string;
    sessionMode: 'video' | 'audio' | 'chat' | 'in_person';
    meetingUrl?: string;
}

/**
 * Send booking confirmation emails and SMS
 */
export async function sendBookingConfirmation(data: BookingAutomationData): Promise<void> {
    try {
        console.log('📧 Sending booking confirmation for:', data.bookingId);

        // Create notification for client
        await sendNotification({
            userId: data.clientId,
            type: 'booking_confirmed',
            title: 'Booking Confirmed',
            message: `Your session with ${data.therapistName} is confirmed for ${new Date(data.scheduledAt).toLocaleString()}`,
            link: `/dashboard`,
            metadata: {
                booking_id: data.bookingId,
                therapist_name: data.therapistName,
                scheduled_at: data.scheduledAt,
            },
        });

        // Create notification for therapist
        const { data: therapistData } = await supabase
            .from('therapists')
            .select('user_id')
            .eq('id', data.therapistId)
            .single();

        if (therapistData?.user_id) {
            await sendNotification({
                userId: therapistData.user_id,
                type: 'booking_confirmed',
                title: 'New Booking Received',
                message: `${data.clientName} has booked a session for ${new Date(data.scheduledAt).toLocaleString()}`,
                link: `/dashboard/therapist`,
                metadata: {
                    booking_id: data.bookingId,
                    client_name: data.clientName,
                    scheduled_at: data.scheduledAt,
                },
            });
        }

        // Send confirmation email (via Supabase Edge Function if configured)
        await sendBookingEmail({
            to: data.clientEmail,
            subject: 'Booking Confirmation - The 3 Tree',
            template: 'booking_confirmation',
            data: {
                clientName: data.clientName,
                therapistName: data.therapistName,
                scheduledAt: new Date(data.scheduledAt).toLocaleString(),
                serviceType: data.serviceType,
                sessionMode: data.sessionMode,
                meetingUrl: data.meetingUrl || '',
                bookingId: data.bookingId,
            },
        });

        // Send SMS if phone number available and SMS service configured
        if (data.clientPhone) {
            await sendBookingSMS({
                to: data.clientPhone,
                message: `Booking Confirmed! Your session with ${data.therapistName} on ${new Date(data.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}. Meeting link will be sent before the session.`,
            });
        }

        console.log('✅ Booking confirmation sent successfully');
    } catch (error) {
        console.error('❌ Error sending booking confirmation:', error);
        // Don't throw - log error but don't fail the booking
    }
}

/**
 * Schedule automated reminders for a booking
 */
export async function scheduleBookingReminders(data: BookingAutomationData): Promise<void> {
    try {
        console.log('⏰ Scheduling reminders for booking:', data.bookingId);

        const scheduledTime = new Date(data.scheduledAt).getTime();
        const now = Date.now();

        // Schedule 24-hour reminder
        const reminder24h = scheduledTime - (24 * 60 * 60 * 1000);
        if (reminder24h > now) {
            await scheduleReminder({
                bookingId: data.bookingId,
                sendAt: new Date(reminder24h).toISOString(),
                type: '24h',
                clientId: data.clientId,
                therapistId: data.therapistId,
                message: `Reminder: Your therapy session with ${data.therapistName} is tomorrow at ${new Date(data.scheduledAt).toLocaleTimeString()}`,
            });
        }

        // Schedule 1-hour reminder with meeting link
        const reminder1h = scheduledTime - (60 * 60 * 1000);
        if (reminder1h > now) {
            await scheduleReminder({
                bookingId: data.bookingId,
                sendAt: new Date(reminder1h).toISOString(),
                type: '1h',
                clientId: data.clientId,
                therapistId: data.therapistId,
                message: `Your session starts in 1 hour. ${data.meetingUrl ? `Join here: ${data.meetingUrl}` : 'Meeting link will be sent shortly.'}`,
                includeMeetingLink: true,
            });
        }

        console.log('✅ Reminders scheduled successfully');
    } catch (error) {
        console.error('❌ Error scheduling reminders:', error);
    }
}

/**
 * Generate meeting URL for video sessions
 * Creates a unique room ID and stores it in the booking for Jitsi Meet integration
 */
export async function generateMeetingUrl(bookingId: string): Promise<string> {
    // Generate a unique room ID based on booking ID and timestamp
    const roomId = `session-${bookingId.substring(0, 8)}-${Date.now().toString(36)}`;

    // Update booking with video_room_id (used by VideoCallRoom to fetch booking info)
    const { error } = await supabase
        .from('bookings')
        .update({
            video_room_id: roomId,
            room_id: roomId, // Keep for backward compatibility
            meeting_url: `${window.location.origin}/video-call/${roomId}`
        })
        .eq('id', bookingId);

    if (error) {
        console.error('Failed to update booking with meeting URL:', error);
    }

    return `${window.location.origin}/video-call/${roomId}`;
}


/**
 * Generate click-to-call link for phone sessions
 */
export function generateCallLink(phoneNumber: string): string {
    // Remove all non-numeric characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `tel:${cleanPhone}`;
}

/**
 * Send meeting link before session
 */
export async function sendMeetingLink(data: BookingAutomationData, meetingUrl: string): Promise<void> {
    try {
        console.log('📱 Sending meeting link for booking:', data.bookingId);

        // Send notification
        await sendNotification({
            userId: data.clientId,
            type: 'session_link',
            title: 'Your Session Link is Ready',
            message: `Click to join your session with ${data.therapistName}`,
            link: meetingUrl,
            metadata: {
                booking_id: data.bookingId,
                meeting_url: meetingUrl,
            },
        });

        // Send email
        await sendBookingEmail({
            to: data.clientEmail,
            subject: 'Your Session Link - The 3 Tree',
            template: 'meeting_link',
            data: {
                clientName: data.clientName,
                therapistName: data.therapistName,
                scheduledAt: new Date(data.scheduledAt).toLocaleString(),
                meetingUrl: meetingUrl,
            },
        });

        // Send SMS with link
        if (data.clientPhone) {
            await sendBookingSMS({
                to: data.clientPhone,
                message: `Your session with ${data.therapistName} starts soon! Join here: ${meetingUrl}`,
            });
        }

        console.log('✅ Meeting link sent successfully');
    } catch (error) {
        console.error('❌ Error sending meeting link:', error);
    }
}

/**
 * Handle booking cancellation
 */
export async function handleBookingCancellation(
    bookingId: string,
    cancelledBy: 'client' | 'therapist',
    reason?: string
): Promise<void> {
    try {
        console.log('❌ Processing cancellation for booking:', bookingId);

        // Get booking details
        const { data: booking } = await supabase
            .from('bookings')
            .select(`
        *,
        client:client_id (id, email, full_name, phone),
        therapist:therapist_id (id, user_id)
      `)
            .eq('id', bookingId)
            .single();

        if (!booking) {
            throw new Error('Booking not found');
        }

        // Update booking status
        await supabase
            .from('bookings')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

        // Notify both parties
        const cancellingParty = cancelledBy === 'client' ? 'You' : booking.client.full_name;
        const otherParty = cancelledBy === 'client' ? booking.therapist : booking.client;

        if (cancelledBy === 'client') {
            // Notify therapist
            await sendNotification({
                userId: booking.therapist.user_id,
                type: 'booking_cancelled',
                title: 'Booking Cancelled',
                message: `${booking.client.full_name} has cancelled the session scheduled for ${new Date(booking.scheduled_at).toLocaleString()}`,
                link: '/dashboard/therapist',
                metadata: {
                    booking_id: bookingId,
                    reason: reason || 'No reason provided',
                },
            });
        } else {
            // Notify client
            await sendNotification({
                userId: booking.client.id,
                type: 'booking_cancelled',
                title: 'Booking Cancelled',
                message: `Your therapist has cancelled the session scheduled for ${new Date(booking.scheduled_at).toLocaleString()}`,
                link: '/dashboard',
                metadata: {
                    booking_id: bookingId,
                    reason: reason || 'No reason provided',
                },
            });

            // Send cancellation email
            await sendBookingEmail({
                to: booking.client.email,
                subject: 'Session Cancelled - The 3 Tree',
                template: 'booking_cancelled',
                data: {
                    clientName: booking.client.full_name,
                    scheduledAt: new Date(booking.scheduled_at).toLocaleString(),
                    reason: reason || 'No specific reason provided',
                },
            });
        }

        console.log('✅ Cancellation processed successfully');
    } catch (error) {
        console.error('❌ Error processing cancellation:', error);
        throw error;
    }
}

/**
 * Helper: Send booking email (placeholder for actual email service)
 */
async function sendBookingEmail(params: {
    to: string;
    subject: string;
    template: string;
    data: Record<string, unknown>;
}): Promise<void> {
    // TODO: Implement with actual email service (SendGrid, Resend, etc.)
    // For now, log the email
    console.log('📧 Email:', {
        to: params.to,
        subject: params.subject,
        template: params.template,
        data: params.data,
    });

    // If Supabase Edge Function is configured, call it
    try {
        await supabase.functions.invoke('send-email', {
            body: params,
        });
    } catch (error) {
        console.warn('⚠️ Email service not configured:', error);
    }
}

/**
 * Helper: Send booking SMS (placeholder for actual SMS service)
 * Supports Twilio, MSG91, or other SMS gateways
 */
async function sendBookingSMS(params: {
    to: string;
    message: string;
    templateId?: string;
}): Promise<{ success: boolean; error?: string }> {
    // Format phone number (ensure it starts with country code)
    const formattedPhone = formatPhoneNumber(params.to);

    console.log('📱 SMS to', formattedPhone, ':', params.message);

    // If SMS Edge Function is configured, call it
    try {
        const { data, error } = await supabase.functions.invoke('send-sms', {
            body: {
                to: formattedPhone,
                message: params.message,
                templateId: params.templateId,
            },
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.warn('⚠️ SMS service not configured:', error);
        return { success: false, error: 'SMS service not available' };
    }
}

/**
 * Format phone number with country code
 */
function formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Add India country code if not present and starts with valid Indian prefix
    if (cleaned.length === 10 && (cleaned.startsWith('6') || cleaned.startsWith('7') || cleaned.startsWith('8') || cleaned.startsWith('9'))) {
        cleaned = '91' + cleaned;
    }

    // Ensure + prefix
    if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }

    return cleaned;
}

/**
 * Generate click-to-call link
 */
export function generateClickToCallLink(phoneNumber: string): string {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    return `tel:${formattedPhone}`;
}

/**
 * Generate WhatsApp link with pre-filled message
 */
export function generateWhatsAppLink(phoneNumber: string, message?: string): string {
    const formattedPhone = formatPhoneNumber(phoneNumber).replace('+', '');
    const encodedMessage = message ? encodeURIComponent(message) : '';
    return `https://wa.me/${formattedPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

/**
 * Send session reminder SMS with meeting link
 */
export async function sendSessionReminderSMS(data: {
    clientPhone: string;
    clientName: string;
    therapistName: string;
    scheduledAt: string;
    meetingUrl: string;
    minutesBefore: number;
}): Promise<void> {
    const scheduledTime = new Date(data.scheduledAt);
    const timeStr = scheduledTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    let message: string;

    if (data.minutesBefore >= 60 * 24) {
        // 24 hour reminder
        message = `Hi ${data.clientName}, this is a reminder for your session with ${data.therapistName} tomorrow at ${timeStr}. We look forward to seeing you! - The 3 Tree`;
    } else if (data.minutesBefore >= 60) {
        // 1 hour reminder with link
        message = `Hi ${data.clientName}, your session with ${data.therapistName} starts in 1 hour at ${timeStr}. Join here: ${data.meetingUrl} - The 3 Tree`;
    } else {
        // 15 min reminder
        message = `Hi ${data.clientName}, your session starts in ${data.minutesBefore} minutes. Join now: ${data.meetingUrl} - The 3 Tree`;
    }

    await sendBookingSMS({
        to: data.clientPhone,
        message: message,
    });
}

/**
 * Helper: Schedule a reminder
 */
async function scheduleReminder(params: {
    bookingId: string;
    sendAt: string;
    type: string;
    clientId: string;
    therapistId: string;
    message: string;
    includeMeetingLink?: boolean;
}): Promise<void> {
    // Store reminder in database for cron job or edge function to process
    console.log('⏰ Scheduling reminder:', params);

    try {
        await supabase.from('scheduled_reminders').insert({
            booking_id: params.bookingId,
            send_at: params.sendAt,
            reminder_type: params.type,
            client_id: params.clientId,
            therapist_id: params.therapistId,
            message: params.message,
            include_meeting_link: params.includeMeetingLink || false,
            status: 'pending',
        });
    } catch (error) {
        console.warn('Scheduled reminders table may not exist:', error);
    }
}

/**
 * Send feedback request after session
 */
export async function sendFeedbackRequest(bookingId: string): Promise<void> {
    try {
        const { data: booking } = await supabase
            .from('bookings')
            .select(`
        *,
        client:client_id (id, email, full_name),
        therapist:therapist_id (user_id)
      `)
            .eq('id', bookingId)
            .single();

        if (!booking) return;

        // Send notification to client
        await sendNotification({
            userId: booking.client.id,
            type: 'feedback_request',
            title: 'How was your session?',
            message: 'We\'d love to hear your feedback about your recent therapy session',
            link: `/booking/${bookingId}/feedback`,
            metadata: {
                booking_id: bookingId,
            },
        });

        console.log('✅ Feedback request sent');
    } catch (error) {
        console.error('❌ Error sending feedback request:', error);
    }
}
