// Supabase Edge Function for processing Stripe refunds
// Deploy: supabase functions deploy process-refund

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { booking_id, amount, reason = "requested_by_customer" } = await req.json();

        if (!booking_id) {
            return new Response(
                JSON.stringify({ error: "booking_id is required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            return new Response(
                JSON.stringify({ error: "Supabase service credentials are not configured" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .select("id, payment_id, amount")
            .eq("id", booking_id)
            .single();

        if (bookingError || !booking) {
            return new Response(
                JSON.stringify({ error: "Booking not found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (!booking.payment_id) {
            return new Response(
                JSON.stringify({ error: "No payment is associated with this booking" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (!STRIPE_SECRET_KEY) {
            return new Response(
                JSON.stringify({
                    refund_id: `mock_refund_${Date.now()}`,
                    status: "succeeded",
                    amount: amount ?? Math.round(Number(booking.amount ?? 0) * 100),
                    mock: true,
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        const refund = await stripe.refunds.create({
            payment_intent: String(booking.payment_id),
            amount: amount ? Number(amount) : undefined,
            reason,
            metadata: {
                booking_id: String(booking_id),
            },
        });

        return new Response(
            JSON.stringify({
                refund_id: refund.id,
                status: refund.status,
                amount: refund.amount,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: unknown) {
        console.error("Refund error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
