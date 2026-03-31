// Supabase Edge Function for sending scheduled booking reminders
// Deploy: supabase functions deploy send-reminders
// Call via cron job: every 30 minutes

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const now = new Date();
        let sent = 0;
        let failed = 0;

        // Find bookings needing 24h reminder (23.5h - 24.5h from now)
        const twentyFourStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
        const twentyFourEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

        const { data: upcoming24h } = await supabase
            .from("bookings")
            .select(`
                id, scheduled_at,
                client:users!bookings_client_id_fkey(email, full_name),
                therapist:therapists!bookings_therapist_id_fkey(user:users(full_name))
            `)
            .eq("status", "confirmed")
            .gte("scheduled_at", twentyFourStart.toISOString())
            .lt("scheduled_at", twentyFourEnd.toISOString());

        // Find bookings needing 1h reminder (50min - 70min from now)
        const oneHourStart = new Date(now.getTime() + 50 * 60 * 1000);
        const oneHourEnd = new Date(now.getTime() + 70 * 60 * 1000);

        const { data: upcoming1h } = await supabase
            .from("bookings")
            .select(`
                id, scheduled_at,
                client:users!bookings_client_id_fkey(email, full_name),
                therapist:therapists!bookings_therapist_id_fkey(user:users(full_name))
            `)
            .eq("status", "confirmed")
            .gte("scheduled_at", oneHourStart.toISOString())
            .lt("scheduled_at", oneHourEnd.toISOString());

        // Check which bookings haven't received reminders yet
        async function needsReminder(bookingId: string, type: string): Promise<boolean> {
            const { data } = await supabase
                .from("notifications")
                .select("id")
                .eq("type", `reminder_${type}`)
                .contains("data", { booking_id: bookingId })
                .limit(1);
            return !data || data.length === 0;
        }

        // Send reminder email
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async function sendReminder(booking: any, type: "24h" | "1h"): Promise<boolean> {
            const client = Array.isArray(booking.client) ? booking.client[0] : booking.client;
            const therapist = Array.isArray(booking.therapist) ? booking.therapist[0] : booking.therapist;

            if (!client?.email) return false;

            const dateTime = new Date(booking.scheduled_at).toLocaleString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });

            const subject = type === "24h"
                ? "Reminder: Your therapy session is tomorrow"
                : "Starting Soon: Your therapy session begins in 1 hour";

            const message = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1E293B;">Session Reminder</h2>
                    <p>Hi ${client.full_name || "there"},</p>
                    <p>This is a reminder that your therapy session is ${type === "24h" ? "tomorrow" : "starting in about 1 hour"}.</p>
                    <div style="background: #F0F9FF; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <p><strong>Date & Time:</strong> ${dateTime}</p>
                        <p><strong>Therapist:</strong> ${therapist?.user?.full_name || "Your Therapist"}</p>
                    </div>
                    <p>Please ensure you're in a quiet, private space with a stable internet connection.</p>
                    <p style="color: #64748B; font-size: 12px; margin-top: 30px;">
                        The 3 Tree | Mental Wellness<br>
                        <a href="https://the3tree.com" style="color: #0EA5E9;">the3tree.com</a>
                    </p>
                </div>
            `;

            // Send email if API key is configured
            if (RESEND_API_KEY) {
                try {
                    const res = await fetch("https://api.resend.com/emails", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${RESEND_API_KEY}`,
                        },
                        body: JSON.stringify({
                            from: "The 3 Tree <noreply@the3tree.com>",
                            to: [client.email],
                            subject,
                            html: message,
                        }),
                    });

                    if (!res.ok) {
                        console.error("Email send failed:", await res.text());
                        return false;
                    }
                } catch (err) {
                    console.error("Email error:", err);
                    return false;
                }
            } else {
                console.log(`[DEV] Would send ${type} reminder to ${client.email}`);
            }

            // Log notification
            await supabase.from("notifications").insert({
                user_id: client.id || null,
                type: `reminder_${type}`,
                title: subject,
                message: `Session reminder sent for ${dateTime}`,
                data: { booking_id: booking.id, reminder_type: type },
                email_sent: !!RESEND_API_KEY,
                email_sent_at: new Date().toISOString(),
            });

            return true;
        }

        // Process 24h reminders
        for (const booking of upcoming24h || []) {
            if (await needsReminder(booking.id, "24h")) {
                const success = await sendReminder(booking, "24h");
                if (success) sent++; else failed++;
            }
        }

        // Process 1h reminders
        for (const booking of upcoming1h || []) {
            if (await needsReminder(booking.id, "1h")) {
                const success = await sendReminder(booking, "1h");
                if (success) sent++; else failed++;
            }
        }

        console.log(`Reminders processed: ${sent} sent, ${failed} failed`);

        return new Response(
            JSON.stringify({
                success: true,
                reminders_sent: sent,
                reminders_failed: failed,
                checked_24h: upcoming24h?.length || 0,
                checked_1h: upcoming1h?.length || 0,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: unknown) {
        console.error("Reminder function error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
