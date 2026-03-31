// Supabase Edge Function for Stripe Webhook handling
// Deploy: supabase functions deploy stripe-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
    try {
        if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
            console.log("Stripe webhook not configured");
            return new Response(JSON.stringify({ received: true, mock: true }), { status: 200 });
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

        const signature = req.headers.get("stripe-signature");
        const body = await req.text();

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature!, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error("Webhook signature verification failed:", err.message);
            return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
        }

        console.log("Received Stripe event:", event.type);

        // Handle different event types
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const bookingId = session.metadata?.booking_id || session.client_reference_id;

                if (bookingId) {
                    // Update booking status
                    await supabase
                        .from("bookings")
                        .update({
                            payment_status: "completed",
                            payment_id: session.payment_intent as string,
                            status: "confirmed",
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", bookingId);

                    // Get booking details for notification
                    const { data: booking } = await supabase
                        .from("bookings")
                        .select("therapist_id, client_id, scheduled_at")
                        .eq("id", bookingId)
                        .single();

                    if (booking) {
                        // Notify therapist
                        const { data: therapist } = await supabase
                            .from("therapists")
                            .select("user_id")
                            .eq("id", booking.therapist_id)
                            .single();

                        if (therapist?.user_id) {
                            await supabase.from("notifications").insert({
                                user_id: therapist.user_id,
                                type: "booking_confirmed",
                                title: "New Booking Confirmed",
                                message: "Payment received for a new booking",
                                data: { booking_id: bookingId },
                            });
                        }

                        // Notify client
                        await supabase.from("notifications").insert({
                            user_id: booking.client_id,
                            type: "payment_successful",
                            title: "Payment Successful",
                            message: "Your booking has been confirmed",
                            data: { booking_id: bookingId },
                        });
                    }
                }
                break;
            }

            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const bookingId = paymentIntent.metadata?.booking_id;

                if (bookingId) {
                    await supabase
                        .from("bookings")
                        .update({
                            payment_status: "failed",
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", bookingId);
                }
                break;
            }

            case "charge.refunded": {
                const charge = event.data.object as Stripe.Charge;
                const paymentIntentId = charge.payment_intent;

                if (paymentIntentId) {
                    const { data: booking } = await supabase
                        .from("bookings")
                        .select("id, client_id")
                        .eq("payment_id", paymentIntentId)
                        .single();

                    if (booking) {
                        const refundAmount = charge.amount_refunded / 100;
                        const isFullRefund = charge.amount_refunded === charge.amount;

                        await supabase
                            .from("bookings")
                            .update({
                                payment_status: isFullRefund ? "refunded" : "partially_refunded",
                                updated_at: new Date().toISOString(),
                            })
                            .eq("id", booking.id);

                        // Notify client
                        await supabase.from("notifications").insert({
                            user_id: booking.client_id,
                            type: "refund_processed",
                            title: "Refund Processed",
                            message: `₹${refundAmount} has been refunded to your account`,
                            data: { booking_id: booking.id },
                        });
                    }
                }
                break;
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
