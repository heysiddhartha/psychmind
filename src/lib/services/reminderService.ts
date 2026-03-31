// Booking Reminder Automation Service
// Handles automated reminders for upcoming sessions

import { supabase } from '@/lib/supabase';
import { sendBookingReminderEmail } from '@/lib/services/emailService';

interface UpcomingBooking {
    id: string;
    scheduled_at: string;
    client_email: string;
    client_name: string;
    therapist_name: string;
    status: string;
}

// Fetch bookings that need reminders (24h and 1h before)
export async function getBookingsNeedingReminders(): Promise<{
    twentyFourHour: UpcomingBooking[];
    oneHour: UpcomingBooking[];
}> {
    const now = new Date();

    // 24 hours from now (+/- 30 min window)
    const twentyFourHourStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const twentyFourHourEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

    // 1 hour from now (+/- 10 min window)
    const oneHourStart = new Date(now.getTime() + 50 * 60 * 1000);
    const oneHourEnd = new Date(now.getTime() + 70 * 60 * 1000);

    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            id, scheduled_at, status,
            client:users!bookings_patient_id_fkey(email, full_name),
            therapist:therapists!bookings_therapist_id_fkey(
                user:users(full_name)
            )
        `)
        .eq('status', 'confirmed')
        .gte('scheduled_at', twentyFourHourStart.toISOString())
        .lte('scheduled_at', twentyFourHourEnd.toISOString());

    const { data: soonBookings } = await supabase
        .from('bookings')
        .select(`
            id, scheduled_at, status,
            client:users!bookings_patient_id_fkey(email, full_name),
            therapist:therapists!bookings_therapist_id_fkey(
                user:users(full_name)
            )
        `)
        .eq('status', 'confirmed')
        .gte('scheduled_at', oneHourStart.toISOString())
        .lte('scheduled_at', oneHourEnd.toISOString());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapBooking = (b: any): UpcomingBooking => ({
        id: b.id,
        scheduled_at: b.scheduled_at,
        client_email: b.client?.email || '',
        client_name: b.client?.full_name || 'Client',
        therapist_name: b.therapist?.user?.full_name || 'Therapist',
        status: b.status,
    });

    return {
        twentyFourHour: (bookings || []).map(mapBooking),
        oneHour: (soonBookings || []).map(mapBooking),
    };
}

// Send reminder for a booking
export async function sendBookingReminder(booking: UpcomingBooking, type: '24h' | '1h'): Promise<boolean> {
    try {
        const dateTime = new Date(booking.scheduled_at).toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const result = await sendBookingReminderEmail(
            booking.client_email,
            booking.client_name,
            booking.therapist_name,
            dateTime
        );

        if (result.success) {
            // Log the reminder was sent
            await supabase.from('notifications').insert({
                user_id: null, // System notification
                type: `booking_reminder_${type}`,
                title: `Reminder sent for booking ${booking.id}`,
                message: `${type} reminder sent to ${booking.client_email}`,
                data: { booking_id: booking.id, reminder_type: type }
            });
        }

        return result.success;
    } catch (error) {
        console.error('Failed to send reminder:', error);
        return false;
    }
}

// Process all pending reminders (call this from a cron job or edge function)
export async function processReminders(): Promise<{ sent: number; failed: number }> {
    const { twentyFourHour, oneHour } = await getBookingsNeedingReminders();

    let sent = 0;
    let failed = 0;

    // Send 24h reminders
    for (const booking of twentyFourHour) {
        const success = await sendBookingReminder(booking, '24h');
        if (success) sent++; else failed++;
    }

    // Send 1h reminders
    for (const booking of oneHour) {
        const success = await sendBookingReminder(booking, '1h');
        if (success) sent++; else failed++;
    }

    console.log(`Reminders processed: ${sent} sent, ${failed} failed`);
    return { sent, failed };
}

// Check if a booking already received a reminder
async function hasReceivedReminder(bookingId: string, reminderType: string): Promise<boolean> {
    const { data } = await supabase
        .from('notifications')
        .select('id')
        .eq('type', `booking_reminder_${reminderType}`)
        .contains('data', { booking_id: bookingId })
        .limit(1);

    return (data?.length || 0) > 0;
}

export default {
    getBookingsNeedingReminders,
    sendBookingReminder,
    processReminders,
};
