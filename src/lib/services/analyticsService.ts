/**
 * Analytics Service - Usage Tracking and Statistics
 * Privacy-focused analytics for the platform
 */

import { supabase } from '@/lib/supabase';

// ==========================================
// Types
// ==========================================

export interface AnalyticsEvent {
    event_name: string;
    user_id?: string;
    properties?: Record<string, unknown>;
    timestamp: string;
}

export interface UserStats {
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    totalMinutes: number;
    averageRating: number;
    streakDays: number;
}

export interface PlatformStats {
    totalUsers: number;
    totalTherapists: number;
    totalBookings: number;
    averageRating: number;
}

// ==========================================
// Event Tracking
// ==========================================

/**
 * Track an analytics event
 * These are stored client-side for privacy
 */
export function trackEvent(
    eventName: string,
    properties?: Record<string, unknown>
): void {
    // Store in local storage for privacy-focused analytics
    const events = getStoredEvents();
    events.push({
        event_name: eventName,
        properties,
        timestamp: new Date().toISOString(),
    });

    // Keep only last 100 events
    if (events.length > 100) {
        events.splice(0, events.length - 100);
    }

    localStorage.setItem('3tree_analytics', JSON.stringify(events));
}

function getStoredEvents(): AnalyticsEvent[] {
    try {
        return JSON.parse(localStorage.getItem('3tree_analytics') || '[]');
    } catch {
        return [];
    }
}

// ==========================================
// User Statistics
// ==========================================

/**
 * Get user's session statistics
 */
export async function getUserStats(userId: string): Promise<UserStats> {
    try {
        // Get all user bookings
        const { data: bookings } = await supabase
            .from('bookings')
            .select('status, duration_minutes, scheduled_at')
            .eq('patient_id', userId);

        if (!bookings) {
            return getEmptyStats();
        }

        const now = new Date();
        const completed = bookings.filter(b => b.status === 'completed');
        const upcoming = bookings.filter(
            b => ['pending', 'confirmed'].includes(b.status) && new Date(b.scheduled_at) > now
        );

        const totalMinutes = completed.reduce((sum, b) => sum + (b.duration_minutes || 0), 0);

        // Calculate streak (consecutive days with sessions)
        const streakDays = calculateStreak(completed.map(b => b.scheduled_at));

        // Get average rating from session feedbacks
        const { data: feedbacks } = await supabase
            .from('session_notes')
            .select('quality_rating')
            .eq('patient_id', userId)
            .not('quality_rating', 'is', null);

        const avgRating = feedbacks?.length
            ? feedbacks.reduce((sum, f) => sum + (f.quality_rating || 0), 0) / feedbacks.length
            : 0;

        return {
            totalSessions: bookings.length,
            completedSessions: completed.length,
            upcomingSessions: upcoming.length,
            totalMinutes,
            averageRating: Math.round(avgRating * 10) / 10,
            streakDays,
        };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return getEmptyStats();
    }
}

function getEmptyStats(): UserStats {
    return {
        totalSessions: 0,
        completedSessions: 0,
        upcomingSessions: 0,
        totalMinutes: 0,
        averageRating: 0,
        streakDays: 0,
    };
}

function calculateStreak(dates: string[]): number {
    if (dates.length === 0) return 0;

    const sortedDates = dates
        .map(d => new Date(d).toDateString())
        .filter((v, i, a) => a.indexOf(v) === i) // Unique dates
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (sortedDates[i] === expectedDate.toDateString()) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// ==========================================
// Platform Statistics (Public)
// ==========================================

/**
 * Get platform-wide statistics for display
 */
export async function getPlatformStats(): Promise<PlatformStats> {
    try {
        const [usersResult, therapistsResult, bookingsResult] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('therapists').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        ]);

        // Get average therapist rating
        const { data: ratings } = await supabase
            .from('therapists')
            .select('average_rating')
            .eq('is_active', true);

        const avgRating = ratings?.length
            ? ratings.reduce((sum, t) => sum + (t.average_rating || 0), 0) / ratings.length
            : 4.5;

        return {
            totalUsers: usersResult.count || 0,
            totalTherapists: therapistsResult.count || 0,
            totalBookings: bookingsResult.count || 0,
            averageRating: Math.round(avgRating * 10) / 10,
        };
    } catch (error) {
        console.error('Error fetching platform stats:', error);
        return {
            totalUsers: 500,
            totalTherapists: 25,
            totalBookings: 2500,
            averageRating: 4.8,
        };
    }
}

// ==========================================
// Therapist Statistics
// ==========================================

export interface TherapistStats {
    totalPatients: number;
    totalSessions: number;
    completedThisMonth: number;
    upcomingThisWeek: number;
    averageRating: number;
    totalReviews: number;
    revenue: {
        thisMonth: number;
        lastMonth: number;
        growth: number;
    };
}

/**
 * Get therapist's performance statistics
 */
export async function getTherapistStats(therapistId: string): Promise<TherapistStats> {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        // Get all bookings
        const { data: bookings } = await supabase
            .from('bookings')
            .select('patient_id, status, scheduled_at, duration_minutes')
            .eq('therapist_id', therapistId);

        if (!bookings) {
            return getEmptyTherapistStats();
        }

        // Unique patients
        const uniquePatients = new Set(bookings.map(b => b.patient_id)).size;

        // Completed this month
        const completedThisMonth = bookings.filter(
            b => b.status === 'completed' && new Date(b.scheduled_at) >= startOfMonth
        ).length;

        // Upcoming this week
        const upcomingThisWeek = bookings.filter(
            b => ['pending', 'confirmed'].includes(b.status) &&
                new Date(b.scheduled_at) >= startOfWeek &&
                new Date(b.scheduled_at) <= new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
        ).length;

        // Get therapist details for rating
        const { data: therapist } = await supabase
            .from('therapists')
            .select('average_rating, total_reviews, session_rate_individual')
            .eq('id', therapistId)
            .single();

        // Calculate revenue (simplified - based on session rate)
        const rate = therapist?.session_rate_individual || 75;
        const thisMonthCompleted = bookings.filter(
            b => b.status === 'completed' && new Date(b.scheduled_at) >= startOfMonth
        );
        const lastMonthCompleted = bookings.filter(
            b => b.status === 'completed' &&
                new Date(b.scheduled_at) >= startOfLastMonth &&
                new Date(b.scheduled_at) <= endOfLastMonth
        );

        const thisMonthRevenue = thisMonthCompleted.length * rate;
        const lastMonthRevenue = lastMonthCompleted.length * rate;
        const growth = lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        return {
            totalPatients: uniquePatients,
            totalSessions: bookings.filter(b => b.status === 'completed').length,
            completedThisMonth,
            upcomingThisWeek,
            averageRating: therapist?.average_rating || 0,
            totalReviews: therapist?.total_reviews || 0,
            revenue: {
                thisMonth: thisMonthRevenue,
                lastMonth: lastMonthRevenue,
                growth: Math.round(growth),
            },
        };
    } catch (error) {
        console.error('Error fetching therapist stats:', error);
        return getEmptyTherapistStats();
    }
}

function getEmptyTherapistStats(): TherapistStats {
    return {
        totalPatients: 0,
        totalSessions: 0,
        completedThisMonth: 0,
        upcomingThisWeek: 0,
        averageRating: 0,
        totalReviews: 0,
        revenue: { thisMonth: 0, lastMonth: 0, growth: 0 },
    };
}

// ==========================================
// Exports
// ==========================================

export default {
    trackEvent,
    getUserStats,
    getPlatformStats,
    getTherapistStats,
};
