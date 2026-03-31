/**
 * Edge Functions Client
 * Provides easy access to all Supabase Edge Functions from the frontend
 */

import { supabase } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface EdgeFunctionResponse<T> {
    data: T | null;
    error: Error | null;
}

/**
 * Generic Edge Function caller
 */
async function callEdgeFunction<T>(
    functionName: string,
    payload: Record<string, unknown>
): Promise<EdgeFunctionResponse<T>> {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const data = await response.json();
        return { data, error: null };
    } catch (error) {
        console.error(`Edge function ${functionName} error:`, error);
        return { data: null, error: error as Error };
    }
}

// ==========================================
// Booking Email Functions
// ==========================================

export interface BookingEmailPayload {
    type: 'confirmation' | 'reminder' | 'cancellation';
    booking_id: string;
    patient_email: string;
    patient_name: string;
    therapist_name: string;
    scheduled_at: string;
    duration_minutes: number;
    meeting_link?: string;
    service_type: string;
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
    payload: Omit<BookingEmailPayload, 'type'>
): Promise<EdgeFunctionResponse<{ success: boolean; message: string }>> {
    return callEdgeFunction('booking-email', { ...payload, type: 'confirmation' });
}

/**
 * Send booking reminder email
 */
export async function sendBookingReminderEmail(
    payload: Omit<BookingEmailPayload, 'type'>
): Promise<EdgeFunctionResponse<{ success: boolean; message: string }>> {
    return callEdgeFunction('booking-email', { ...payload, type: 'reminder' });
}

/**
 * Send booking cancellation email
 */
export async function sendBookingCancellationEmail(
    payload: Omit<BookingEmailPayload, 'type'>
): Promise<EdgeFunctionResponse<{ success: boolean; message: string }>> {
    return callEdgeFunction('booking-email', { ...payload, type: 'cancellation' });
}

// ==========================================
// Therapist Matching Functions
// ==========================================

export interface TherapistMatchRequest {
    patient_id: string;
    specialty?: string;
    preferred_gender?: string;
    preferred_language?: string;
    session_type?: string;
    preferred_times?: ('morning' | 'afternoon' | 'evening')[];
}

export interface TherapistMatch {
    therapist_id: string;
    therapist_name: string;
    score: number;
    reasons: string[];
    availability_match: number;
    specialty_match: number;
    rating: number;
}

export interface TherapistMatchResponse {
    success: boolean;
    matches: TherapistMatch[];
    total_therapists: number;
}

/**
 * Get AI-powered therapist recommendations
 */
export async function getTherapistRecommendations(
    request: TherapistMatchRequest
): Promise<EdgeFunctionResponse<TherapistMatchResponse>> {
    return callEdgeFunction('therapist-match', request);
}

// ==========================================
// Push Notifications
// ==========================================

/**
 * Request push notification permission
 */
export async function requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

/**
 * Show a browser push notification
 */
export function showPushNotification(
    title: string,
    options?: NotificationOptions & { onClick?: () => void }
): void {
    if (Notification.permission !== 'granted') {
        console.log('Notifications not permitted');
        return;
    }

    const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        ...options,
    });

    if (options?.onClick) {
        notification.onclick = () => {
            options.onClick!();
            notification.close();
        };
    }

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
}

/**
 * Check if push notifications are supported and enabled
 */
export function isPushEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
}

// ==========================================
// Service Worker Registration (for background notifications)
// ==========================================

/**
 * Register service worker for background push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    }
    return null;
}

export default {
    sendBookingConfirmationEmail,
    sendBookingReminderEmail,
    sendBookingCancellationEmail,
    getTherapistRecommendations,
    requestPushPermission,
    showPushNotification,
    isPushEnabled,
    registerServiceWorker,
};
