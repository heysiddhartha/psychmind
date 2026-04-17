// Supabase Edge Function for sending emails via Resend API
// Deploy: supabase functions deploy send-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface EmailRequest {
    to: string;
    subject: string;
    html?: string;
    from?: string;
    template?: string;
    data?: Record<string, unknown>;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderTemplate(template: string, data: Record<string, unknown> = {}): string | null {
    const clientName = escapeHtml(data.clientName ?? "there");
    const therapistName = escapeHtml(data.therapistName ?? "your therapist");
    const scheduledAt = escapeHtml(data.scheduledAt ?? "your scheduled time");
    const meetingUrl = escapeHtml(data.meetingUrl ?? "");
    const reason = escapeHtml(data.reason ?? "No additional reason was provided.");
    const serviceType = escapeHtml(data.serviceType ?? "therapy session");
    const sessionMode = escapeHtml(data.sessionMode ?? "online");
    const bookingId = escapeHtml(data.bookingId ?? "");

    switch (template) {
        case "booking_confirmation":
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1E293B;">Booking Confirmed</h2>
                    <p>Hi ${clientName},</p>
                    <p>Your ${serviceType} booking has been confirmed.</p>
                    <div style="background: #F8FAFC; padding: 16px; border-radius: 12px; margin: 20px 0;">
                        <p><strong>Therapist:</strong> ${therapistName}</p>
                        <p><strong>When:</strong> ${scheduledAt}</p>
                        <p><strong>Mode:</strong> ${sessionMode}</p>
                        ${bookingId ? `<p><strong>Booking ID:</strong> ${bookingId}</p>` : ""}
                    </div>
                    ${meetingUrl ? `<p><a href="${meetingUrl}">Open your session link</a></p>` : ""}
                </div>
            `;
        case "meeting_link":
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1E293B;">Your Session Link</h2>
                    <p>Hi ${clientName},</p>
                    <p>Your session with ${therapistName} is scheduled for ${scheduledAt}.</p>
                    ${meetingUrl
                        ? `<p><a href="${meetingUrl}" style="display:inline-block;background:#0EA5E9;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">Join Session</a></p>`
                        : "<p>Your meeting link will be shared shortly.</p>"}
                </div>
            `;
        case "booking_cancelled":
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #991B1B;">Session Cancelled</h2>
                    <p>Hi ${clientName},</p>
                    <p>Your session scheduled for ${scheduledAt} has been cancelled.</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                </div>
            `;
        default:
            return null;
    }
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { to, subject, html, from, template, data } = (await req.json()) as EmailRequest;
        const renderedHtml = html ?? (template ? renderTemplate(template, data) : null);

        if (!to || !subject || !renderedHtml) {
            return new Response(
                JSON.stringify({ error: "Missing required fields: to, subject, and html or a supported template payload" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // If no API key, log and return success (development mode)
        if (!RESEND_API_KEY) {
            console.log("📧 Email (dev mode):", { to, subject });
            return new Response(
                JSON.stringify({ success: true, mode: "development", message: "Email logged (no API key)" }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Send email via Resend
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: from || "The 3 Tree <noreply@the3tree.com>",
                to: [to],
                subject,
                html: renderedHtml,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Resend API error:", data);
            return new Response(
                JSON.stringify({ error: data.message || "Failed to send email" }),
                { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, id: data.id }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: unknown) {
        console.error("Email function error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
