// Supabase Edge Function for creating Stripe Payment Intents
// Deploy: supabase functions deploy create-payment-intent

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const {
            booking_id,
            amount,
            currency = "inr",
            description = "Therapy Session Payment",
        } = await req.json();

        if (!booking_id || !amount || Number(amount) <= 0) {
            return new Response(
                JSON.stringify({ error: "booking_id and a positive amount are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (!STRIPE_SECRET_KEY) {
            return new Response(
                JSON.stringify({
                    id: `mock_pi_${Date.now()}`,
                    client_secret: `mock_secret_${Date.now()}`,
                    amount: Number(amount),
                    currency,
                    status: "requires_payment_method",
                    mock: true,
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(amount),
            currency,
            description,
            metadata: {
                booking_id: String(booking_id),
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return new Response(
            JSON.stringify({
                id: paymentIntent.id,
                client_secret: paymentIntent.client_secret,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: unknown) {
        console.error("Payment intent error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
