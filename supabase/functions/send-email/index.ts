// Supabase Edge Function for sending emails via Resend API
// Deploy: supabase functions deploy send-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface EmailRequest {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { to, subject, html, from } = (await req.json()) as EmailRequest;

        if (!to || !subject || !html) {
            return new Response(
                JSON.stringify({ error: "Missing required fields: to, subject, html" }),
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
                html,
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
    } catch (error) {
        console.error("Email function error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
