// Supabase Edge Function for creating Stripe Checkout Sessions
// Deploy: supabase functions deploy create-checkout

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        if (!STRIPE_SECRET_KEY) {
            console.log("Stripe not configured, returning mock response");
            return new Response(
                JSON.stringify({
                    id: "mock_session_" + Date.now(),
                    url: null,
                    mock: true,
                    message: "Stripe not configured. Set STRIPE_SECRET_KEY in environment."
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        const {
            booking_id,
            amount,
            currency = "inr",
            description,
            customer_email,
            customer_name,
            therapist_name,
            session_date,
            success_url,
            cancel_url,
        } = await req.json();

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: description || "Therapy Session",
                            description: `Session with ${therapist_name || "Therapist"} on ${session_date || "TBD"}`,
                        },
                        unit_amount: Math.round(amount * 100), // Convert to smallest currency unit
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: success_url,
            cancel_url: cancel_url,
            customer_email: customer_email,
            client_reference_id: booking_id,
            metadata: {
                booking_id: booking_id,
                customer_name: customer_name,
                therapist_name: therapist_name,
                session_date: session_date,
            },
            payment_intent_data: {
                metadata: {
                    booking_id: booking_id,
                },
            },
        });

        return new Response(
            JSON.stringify({ id: session.id, url: session.url }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Checkout error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
