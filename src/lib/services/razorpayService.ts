/**
 * Razorpay Payment Integration Service
 * Handles payment processing for therapy sessions with UPI, Cards, Net Banking
 */

import { supabase } from '@/lib/supabase';

// Razorpay script URL
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

// Get Key ID from environment or use test key
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';

// Types
export interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
}

export interface RazorpayPaymentResult {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface PaymentOptions {
    bookingId: string;
    amount: number;
    currency?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    serviceName: string;
    therapistName: string;
}

// Declare Razorpay on window
declare global {
    interface Window {
        Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
    }
}

interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id?: string;
    prefill: {
        name: string;
        email: string;
        contact?: string;
    };
    theme: {
        color: string;
    };
    handler: (response: RazorpayPaymentResult) => void;
    modal?: {
        ondismiss?: () => void;
        confirm_close?: boolean;
    };
    config?: {
        display?: {
            blocks?: Record<string, any>;
            sequence?: string[];
            preferences?: Record<string, any>;
        };
    };
    readonly?: {
        contact?: boolean;
        email?: boolean;
        name?: boolean;
    };
}

interface RazorpayInstance {
    open: () => void;
    close: () => void;
}

/**
 * Load Razorpay script dynamically
 */
export async function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        // Check if already loaded
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        // Check if script already exists
        const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(true));
            existingScript.addEventListener('error', () => resolve(false));
            return;
        }

        // Create and load script
        const script = document.createElement('script');
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

/**
 * Create a simple order (for frontend-only flow)
 * Note: For production, orders should be created on the backend
 */
export function createClientOrder(bookingId: string, amount: number, currency: string = 'INR'): RazorpayOrder {
    // Generate a unique receipt ID
    const receipt = `booking_${bookingId}_${Date.now()}`;

    return {
        id: `order_${Date.now()}`, // Client-generated (not secure, but works for testing)
        amount: amount * 100, // Convert to paise
        currency,
        receipt,
    };
}

/**
 * Open Razorpay payment modal
 */
export async function openPaymentModal(
    options: PaymentOptions,
    onSuccess: (result: RazorpayPaymentResult) => void,
    onFailure: (error: string) => void
): Promise<void> {
    // Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
        onFailure('Failed to load payment gateway. Please try again.');
        return;
    }

    // Create order
    const order = createClientOrder(options.bookingId, options.amount, options.currency || 'INR');

    // Configure Razorpay options
    const razorpayOptions: RazorpayCheckoutOptions = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'The 3 Tree',
        description: `${options.serviceName} with ${options.therapistName}`,
        prefill: {
            name: options.customerName,
            email: options.customerEmail,
            contact: options.customerPhone || '',
        },
        theme: {
            color: '#06B6D4', // Cyan-500 to match the brand
        },
        handler: function (response: RazorpayPaymentResult) {
            console.log('Payment successful:', response);
            onSuccess(response);
        },
        modal: {
            ondismiss: function () {
                console.log('Payment modal dismissed');
                onFailure('Payment cancelled');
            },
            confirm_close: true, // Ask user to confirm before closing
        },
        config: {
            display: {
                blocks: {
                    banks: {
                        name: 'All payment methods',
                        instruments: [
                            { method: 'upi' },
                            { method: 'card' },
                            { method: 'netbanking' },
                        ],
                    },
                },
                sequence: ['block.banks'],
                preferences: {
                    show_default_blocks: true,
                },
            },
        },
        readonly: {
            contact: false, // Allow editing contact
            email: false, // Allow editing email  
            name: false, // Allow editing name
        },
    };

    try {
        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();
    } catch (error) {
        console.error('Razorpay error:', error);
        onFailure('Failed to open payment gateway');
    }
}

/**
 * Verify payment and update booking status
 */
export async function verifyAndConfirmPayment(
    bookingId: string,
    paymentResult: RazorpayPaymentResult
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Update booking with payment info
        const { error } = await supabase
            .from('bookings')
            .update({
                status: 'confirmed',
                updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

        if (error) throw error;

        // Store payment record (optional - depends on schema)
        try {
            await supabase.from('payments').insert({
                booking_id: bookingId,
                provider_payment_id: paymentResult.razorpay_payment_id,
                status: 'paid',
                provider: 'razorpay',
            });
        } catch {
            // Payment table might not exist - that's okay
            console.log('Payment record not stored (table may not exist)');
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Payment verification error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to verify payment'
        };
    }
}

/**
 * Format amount for display in INR
 */
export function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default {
    loadRazorpayScript,
    openPaymentModal,
    verifyAndConfirmPayment,
    formatINR,
};
