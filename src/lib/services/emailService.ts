// Email Service - Production email sending with Resend
import { supabase } from '@/lib/supabase';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Send email via Edge Function (which uses Resend)
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload,
    });

    if (error) throw error;
    return { success: true, messageId: data?.id };
  } catch (error: unknown) {
    console.error('Email send failed:', error);
    // Fallback: log email for development
    console.log('📧 EMAIL:', { to: payload.to, subject: payload.subject });
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
    return { success: false, error: errorMessage };
  }
}

// Email Templates
export const emailTemplates = {
  therapistVerified: (name: string) => ({
    subject: '🎉 Your The 3 Tree Application is Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #3b82f6); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to The 3 Tree!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear ${name},</p>
          <p>Great news! Your therapist application has been <strong style="color: #10b981;">approved</strong>.</p>
          <p>You can now:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Set your availability</li>
            <li>Start accepting clients</li>
          </ul>
          <a href="https://the3tree.com/dashboard/therapist" 
             style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Go to Dashboard
          </a>
        </div>
      </div>
    `,
  }),

  therapistRejected: (name: string, reason: string) => ({
    subject: 'Update on Your The 3 Tree Application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #374151; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Application Update</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear ${name},</p>
          <p>Thank you for your interest in joining The 3 Tree.</p>
          <p>After careful review, we're unable to approve your application at this time.</p>
          <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <strong>Reason:</strong> ${reason}
          </div>
          <p>You may reapply after addressing the above concerns.</p>
          <a href="https://the3tree.com/join-team" 
             style="display: inline-block; background: #6b7280; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Learn More
          </a>
        </div>
      </div>
    `,
  }),

  bookingConfirmation: (patientName: string, therapistName: string, dateTime: string, meetingUrl?: string) => ({
    subject: `Booking Confirmed with ${therapistName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${patientName},</p>
          <p>Your therapy session has been confirmed.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Therapist:</strong> ${therapistName}</p>
            <p><strong>Date & Time:</strong> ${dateTime}</p>
          </div>
          ${meetingUrl ? `
            <a href="${meetingUrl}" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px;">
              Join Session
            </a>
          ` : ''}
        </div>
      </div>
    `,
  }),

  bookingReminder: (patientName: string, therapistName: string, dateTime: string) => ({
    subject: `Reminder: Session with ${therapistName} Tomorrow`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Session Reminder</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${patientName},</p>
          <p>This is a reminder about your upcoming therapy session.</p>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Therapist:</strong> ${therapistName}</p>
            <p><strong>Date & Time:</strong> ${dateTime}</p>
          </div>
          <p>Please ensure you're in a quiet, private space before the session.</p>
        </div>
      </div>
    `,
  }),

  passwordReset: (name: string, resetLink: string) => ({
    subject: 'Reset Your Password - The 3 Tree',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #374151; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${name},</p>
          <p>We received a request to reset your password.</p>
          <a href="${resetLink}" 
             style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `,
  }),
};

// Send therapist verification email
export async function sendVerificationEmail(
  email: string,
  name: string,
  approved: boolean,
  reason?: string
): Promise<EmailResult> {
  const template = approved
    ? emailTemplates.therapistVerified(name)
    : emailTemplates.therapistRejected(name, reason || 'Not specified');

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

// Send booking confirmation
export async function sendBookingConfirmationEmail(
  email: string,
  patientName: string,
  therapistName: string,
  dateTime: string,
  meetingUrl?: string
): Promise<EmailResult> {
  const template = emailTemplates.bookingConfirmation(patientName, therapistName, dateTime, meetingUrl);
  return sendEmail({ to: email, ...template });
}

// Send booking reminder
export async function sendBookingReminderEmail(
  email: string,
  patientName: string,
  therapistName: string,
  dateTime: string
): Promise<EmailResult> {
  const template = emailTemplates.bookingReminder(patientName, therapistName, dateTime);
  return sendEmail({ to: email, ...template });
}

export default {
  sendEmail,
  sendVerificationEmail,
  sendBookingConfirmationEmail,
  sendBookingReminderEmail,
  emailTemplates,
};
