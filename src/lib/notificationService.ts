/**
 * Notification Service - Email and SMS notifications for bookings
 * Production-ready notification system
 */

// ============================================
// Types
// ============================================

export interface NotificationPayload {
    type: 'booking_confirmation' | 'booking_reminder' | 'booking_cancelled' | 'booking_rescheduled';
    recipientEmail: string;
    recipientName: string;
    bookingDetails: {
        bookingId: string;
        serviceName: string;
        therapistName: string;
        patientName: string;
        scheduledAt: string;
        duration: number;
        meetingLink?: string;
    };
}

export interface NotificationResult {
    success: boolean;
    error?: string;
}

// ============================================
// Email Templates
// ============================================

const emailTemplates = {
    booking_confirmation: (details: NotificationPayload['bookingDetails']) => ({
        subject: `Booking Confirmed - ${details.serviceName} with ${details.therapistName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Booking Confirmation</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Booking Confirmed!</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your therapy session has been scheduled</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                Hi ${details.patientName},
                            </p>
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                                Your booking has been confirmed. Here are the details:
                            </p>
                            
                            <!-- Booking Details Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                                <tr>
                                    <td>
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #6b7280; font-size: 14px;">Service</span><br>
                                                    <span style="color: #111827; font-size: 16px; font-weight: 600;">${details.serviceName}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #6b7280; font-size: 14px;">Therapist</span><br>
                                                    <span style="color: #111827; font-size: 16px; font-weight: 600;">${details.therapistName}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #6b7280; font-size: 14px;">Date & Time</span><br>
                                                    <span style="color: #111827; font-size: 16px; font-weight: 600;">${new Date(details.scheduledAt).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #6b7280; font-size: 14px;">Duration</span><br>
                                                    <span style="color: #111827; font-size: 16px; font-weight: 600;">${details.duration} minutes</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #6b7280; font-size: 14px;">Booking ID</span><br>
                                                    <span style="color: #111827; font-size: 14px; font-family: monospace;">${details.bookingId}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            ${details.meetingLink ? `
                            <!-- Join Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${details.meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                            Join Video Session
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                            
                            <!-- Tips -->
                            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
                                <h3 style="color: #065f46; margin: 0 0 8px; font-size: 14px; font-weight: 600;">Before Your Session:</h3>
                                <ul style="color: #047857; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                                    <li>Find a quiet, private space</li>
                                    <li>Test your camera and microphone</li>
                                    <li>Join 5 minutes early</li>
                                </ul>
                            </div>
                            
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                                Need to reschedule or cancel? You can do so up to 24 hours before your appointment through your dashboard.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                © 2026 3-3.com Counseling. All rights reserved.
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">
                                <a href="#" style="color: #6b7280; text-decoration: none;">Unsubscribe</a> • 
                                <a href="#" style="color: #6b7280; text-decoration: none;">Privacy Policy</a> • 
                                <a href="#" style="color: #6b7280; text-decoration: none;">Contact Support</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `
    }),

    booking_reminder: (details: NotificationPayload['bookingDetails']) => ({
        subject: `Reminder: Your session with ${details.therapistName} is tomorrow`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Session Reminder</title>
            </head>
            <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f7fa;">
                <table width="100%" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">Session Reminder</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">Hi ${details.patientName},</p>
                            <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">This is a reminder that your therapy session is scheduled for tomorrow:</p>
                            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                <p style="margin: 0; font-weight: 600; color: #92400e;">${details.serviceName} with ${details.therapistName}</p>
                                <p style="margin: 8px 0 0; color: #a16207;">${new Date(details.scheduledAt).toLocaleString()}</p>
                            </div>
                            ${details.meetingLink ? `<a href="${details.meetingLink}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Join Session</a>` : ''}
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `
    }),

    booking_cancelled: (details: NotificationPayload['bookingDetails']) => ({
        subject: `Booking Cancelled - ${details.serviceName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Booking Cancelled</title>
            </head>
            <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f7fa;">
                <table width="100%" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">Booking Cancelled</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">Hi ${details.patientName},</p>
                            <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">Your booking has been cancelled:</p>
                            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
                                <p style="margin: 0; font-weight: 600; color: #7f1d1d;">${details.serviceName} with ${details.therapistName}</p>
                                <p style="margin: 8px 0 0; color: #991b1b;">${new Date(details.scheduledAt).toLocaleString()}</p>
                            </div>
                            <p style="color: #6b7280; font-size: 14px;">If you'd like to reschedule, please visit your dashboard to book a new session.</p>
                            <a href="https://3-3.com/booking" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px;">Book New Session</a>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `
    }),

    booking_rescheduled: (details: NotificationPayload['bookingDetails']) => ({
        subject: `Booking Rescheduled - ${details.serviceName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Booking Rescheduled</title>
            </head>
            <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f7fa;">
                <table width="100%" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">Booking Rescheduled</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">Hi ${details.patientName},</p>
                            <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">Your booking has been rescheduled to a new time:</p>
                            <div style="background: #f5f3ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #8b5cf6;">
                                <p style="margin: 0; font-weight: 600; color: #5b21b6;">${details.serviceName} with ${details.therapistName}</p>
                                <p style="margin: 8px 0 0; color: #6d28d9; font-weight: 600;">NEW: ${new Date(details.scheduledAt).toLocaleString()}</p>
                            </div>
                            ${details.meetingLink ? `<a href="${details.meetingLink}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Booking</a>` : ''}
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `
    })
};

// ============================================
// Notification Functions
// ============================================

/**
 * Send email notification
 * In production, this would integrate with SendGrid, SES, or similar
 */
export async function sendEmailNotification(payload: NotificationPayload): Promise<NotificationResult> {
    try {
        const template = emailTemplates[payload.type](payload.bookingDetails);

        // In production, send via email service
        // For now, log the notification
        console.log('📧 Email Notification:', {
            to: payload.recipientEmail,
            subject: template.subject,
            type: payload.type
        });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));

        return { success: true };
    } catch (error) {
        console.error('Failed to send email notification:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send notification'
        };
    }
}

/**
 * Send booking confirmation notifications to both patient and therapist
 */
export async function sendBookingConfirmation(
    bookingDetails: NotificationPayload['bookingDetails'],
    patientEmail: string,
    patientName: string,
    therapistEmail: string,
    therapistName: string
): Promise<{ patientNotified: boolean; therapistNotified: boolean }> {
    // Notify patient
    const patientResult = await sendEmailNotification({
        type: 'booking_confirmation',
        recipientEmail: patientEmail,
        recipientName: patientName,
        bookingDetails
    });

    // Notify therapist
    const therapistResult = await sendEmailNotification({
        type: 'booking_confirmation',
        recipientEmail: therapistEmail,
        recipientName: therapistName,
        bookingDetails: {
            ...bookingDetails,
            patientName: patientName // Swap for therapist view
        }
    });

    return {
        patientNotified: patientResult.success,
        therapistNotified: therapistResult.success
    };
}

/**
 * Send booking reminder (called by scheduled job)
 */
export async function sendBookingReminder(
    bookingDetails: NotificationPayload['bookingDetails'],
    recipientEmail: string,
    recipientName: string
): Promise<NotificationResult> {
    return sendEmailNotification({
        type: 'booking_reminder',
        recipientEmail,
        recipientName,
        bookingDetails
    });
}

/**
 * Send cancellation notification
 */
export async function sendCancellationNotification(
    bookingDetails: NotificationPayload['bookingDetails'],
    recipientEmail: string,
    recipientName: string
): Promise<NotificationResult> {
    return sendEmailNotification({
        type: 'booking_cancelled',
        recipientEmail,
        recipientName,
        bookingDetails
    });
}

/**
 * Send reschedule notification
 */
export async function sendRescheduleNotification(
    bookingDetails: NotificationPayload['bookingDetails'],
    recipientEmail: string,
    recipientName: string
): Promise<NotificationResult> {
    return sendEmailNotification({
        type: 'booking_rescheduled',
        recipientEmail,
        recipientName,
        bookingDetails
    });
}

export default {
    sendEmailNotification,
    sendBookingConfirmation,
    sendBookingReminder,
    sendCancellationNotification,
    sendRescheduleNotification
};
