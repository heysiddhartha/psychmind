/**
 * Booking Service - Complete booking management for 3-3.com Counseling
 * Handles all booking operations with Supabase integration
 * Enhanced with timezone support, validation, and robust error handling
 */

import { supabase, Booking, Therapist, User } from './supabase';

// ============================================
// Types
// ============================================

export interface ServiceType {
    id: string;
    name: string;
    description: string;
    duration: number; // minutes
    price: number;
    icon: string;
    category: 'therapy' | 'consultation' | 'group';
}

export interface SessionPackage {
    id: string;
    name: string;
    sessionCount: number;
    discountPercent: number;
    description: string;
    validDays: number;
}

export interface TimeSlot {
    time: string;
    displayTime: string;
    available: boolean;
    period: 'morning' | 'afternoon' | 'evening';
    iso?: string;
}

// Extended therapist type for booking service (includes mock data fields)
export interface TherapistWithDetails {
    id: string;
    user_id: string;
    specialties: string[];
    credentials: string | string[];
    bio?: string | null;
    hourly_rate?: number;
    availability?: Record<string, string[]>;
    is_approved?: boolean;
    is_verified?: boolean;
    is_active?: boolean;
    rating?: number;
    average_rating?: number;
    total_sessions?: number;
    total_reviews?: number;
    session_rate_individual?: number;
    session_rate_couple?: number;
    session_rate_family?: number;
    languages?: string[];
    years_experience?: number;
    accepts_video?: boolean;
    accepts_audio?: boolean;
    accepts_chat?: boolean;
    accepts_in_person?: boolean;
    location?: string;
    user: User;
}

export interface BookingDetails {
    id: string;
    client_id?: string; // Deprecated, use patient_id
    patient_id: string;
    therapist_id: string;
    service_category_id?: string | null;
    package_id?: string | null;
    service_type?: string; // DB uses service_type
    session_mode: 'video' | 'audio' | 'chat' | 'in_person'; // Mapped from service_type or passed directly
    scheduled_at: string;
    duration_minutes: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
    meeting_link?: string | null; // DB uses meeting_link
    meeting_url?: string | null; // Frontend uses meeting_url
    room_id?: string | null;
    notes?: string | null; // DB uses notes
    notes_client?: string | null;
    notes_therapist?: string | null;
    client_timezone?: string | null;
    therapist_timezone?: string | null;
    cancellation_reason?: string | null;
    cancelled_by?: string | null;
    cancelled_at?: string | null;
    rescheduled_from?: string | null;
    reminder_sent?: boolean;
    intake_form_completed?: boolean;
    amount?: number;
    currency?: string;
    payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
    created_at: string;
    updated_at?: string;
    therapist?: TherapistWithDetails;
    client?: User; // Deprecated, use patient
    patient?: User;
}

export interface CreateBookingData {
    client_id: string;
    therapist_id: string;
    service_category_id?: string | null;
    package_id?: string | null;
    session_mode?: 'video' | 'audio' | 'chat' | 'in_person';
    scheduled_at: string;
    duration_minutes: number;
    notes_client?: string | null;
    client_timezone?: string | null;
    amount?: number;
    currency?: string;
}

export interface RescheduleData {
    booking_id: string;
    new_scheduled_at: string;
    reason?: string;
}

export interface CancellationData {
    booking_id: string;
    reason: string;
    cancelled_by: 'client' | 'therapist' | 'admin';
}

// ============================================
// Service Types Configuration
// ============================================

export const serviceTypes: ServiceType[] = [
    {
        id: 'individual',
        name: 'Individual Therapy',
        description: 'One-on-one sessions focused on your personal growth and mental well-being',
        duration: 50,
        price: 0,
        icon: 'User',
        category: 'therapy'
    },
    {
        id: 'couple',
        name: 'Couples Therapy',
        description: 'Strengthen your relationship with guided therapeutic conversations',
        duration: 60,
        price: 0,
        icon: 'Heart',
        category: 'therapy'
    },
    {
        id: 'child_adolescent',
        name: 'Child & Adolescent Online Services',
        description: 'Online mental health & wellness services for children and adolescents (under 18) with parental consent',
        duration: 50,
        price: 0,
        icon: 'Baby',
        category: 'therapy'
    },
    {
        id: 'group',
        name: 'Group Session',
        description: 'Connect with others facing similar challenges in a supportive environment',
        duration: 90,
        price: 0,
        icon: 'Users',
        category: 'group'
    },
    {
        id: 'consultation',
        name: 'Initial Consultation',
        description: 'Free introductory session to discuss your needs and find the right approach',
        duration: 15,
        price: 0,
        icon: 'MessageCircle',
        category: 'consultation'
    },
    {
        id: 'crisis',
        name: 'Crisis Support',
        description: 'Immediate support session for urgent mental health concerns',
        duration: 30,
        price: 0,
        icon: 'AlertCircle',
        category: 'therapy'
    },
    {
        id: 'yoga',
        name: 'Yoga Therapy',
        description: 'Holistic yoga sessions combining movement, breath work, and mindfulness for healing',
        duration: 60,
        price: 0,
        icon: 'Flower2',
        category: 'therapy'
    },
    {
        id: 'nutrition',
        name: 'Nutrition Counseling',
        description: 'Personalized nutrition guidance to support your mental and physical well-being',
        duration: 45,
        price: 0,
        icon: 'Apple',
        category: 'consultation'
    }
];

// Session Packages with discounts
export const sessionPackages: SessionPackage[] = [
    {
        id: 'single',
        name: 'Single Session',
        sessionCount: 1,
        discountPercent: 0,
        description: 'Pay per session',
        validDays: 30
    },
    {
        id: 'package-4',
        name: '4 Session Package',
        sessionCount: 4,
        discountPercent: 10,
        description: 'Save 10% with monthly package',
        validDays: 60
    },
    {
        id: 'package-8',
        name: '8 Session Package',
        sessionCount: 8,
        discountPercent: 15,
        description: 'Save 15% with bi-monthly package',
        validDays: 90
    },
    {
        id: 'package-12',
        name: '12 Session Package',
        sessionCount: 12,
        discountPercent: 20,
        description: 'Save 20% with quarterly package',
        validDays: 120
    }
];

// ============================================
// Demo Therapist Fallback
// Used only when the database has no approved therapists yet,
// so the booking flow still works for demos and presentations.
// ============================================

const DEMO_THERAPISTS: TherapistWithDetails[] = [
    {
        id: 'demo-therapist-1',
        user_id: 'demo-user-1',
        specialties: ['Anxiety', 'Stress Management', 'Self-Esteem'],
        credentials: ['M.A. Clinical Psychology', 'RCI Registered'],
        bio: 'A warm, practical therapist who helps clients work through anxiety, burnout, and major life transitions.',
        hourly_rate: 0,
        availability: {
            Monday: ['10:00', '11:00', '14:00', '16:00'],
            Tuesday: ['09:00', '12:00', '15:00'],
            Wednesday: ['10:00', '13:00', '17:00'],
            Thursday: ['11:00', '14:00', '16:00'],
            Friday: ['09:00', '12:00', '15:00']
        },
        is_approved: true,
        is_verified: true,
        is_active: true,
        rating: 4.9,
        average_rating: 4.9,
        total_sessions: 180,
        total_reviews: 64,
        session_rate_individual: 0,
        session_rate_couple: 0,
        session_rate_family: 0,
        languages: ['English', 'Hindi', 'Bengali'],
        years_experience: 7,
        accepts_video: true,
        accepts_audio: true,
        accepts_chat: true,
        accepts_in_person: false,
        location: 'Kolkata, India',
        user: {
            id: 'demo-user-1',
            email: 'ananya.mehta@psychmind.demo',
            full_name: 'Dr. Ananya Mehta',
            role: 'therapist',
            is_active: true,
            is_profile_complete: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
    },
    {
        id: 'demo-therapist-2',
        user_id: 'demo-user-2',
        specialties: ['Relationships', 'Couples Therapy', 'Family Conflict'],
        credentials: ['M.Sc. Counseling Psychology', 'Certified Family Therapist'],
        bio: 'Supports couples and families with communication, conflict repair, and healthier emotional connection.',
        hourly_rate: 0,
        availability: {
            Monday: ['09:00', '13:00', '18:00'],
            Wednesday: ['10:00', '12:00', '16:00'],
            Friday: ['11:00', '14:00', '17:00'],
            Saturday: ['10:00', '12:00']
        },
        is_approved: true,
        is_verified: true,
        is_active: true,
        rating: 4.8,
        average_rating: 4.8,
        total_sessions: 220,
        total_reviews: 89,
        session_rate_individual: 0,
        session_rate_couple: 0,
        session_rate_family: 0,
        languages: ['English', 'Hindi'],
        years_experience: 9,
        accepts_video: true,
        accepts_audio: true,
        accepts_chat: false,
        accepts_in_person: true,
        location: 'Bengaluru, India',
        user: {
            id: 'demo-user-2',
            email: 'rahul.sen@psychmind.demo',
            full_name: 'Dr. Rahul Sen',
            role: 'therapist',
            is_active: true,
            is_profile_complete: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
    },
    {
        id: 'demo-therapist-3',
        user_id: 'demo-user-3',
        specialties: ['Teen Mental Health', 'Academic Stress', 'Depression'],
        credentials: ['Psy.D.', 'Trauma-Informed Therapist'],
        bio: 'Works with teens and young adults navigating academic pressure, low mood, identity questions, and emotional overwhelm.',
        hourly_rate: 0,
        availability: {
            Tuesday: ['10:00', '11:00', '15:00'],
            Thursday: ['09:00', '13:00', '17:00'],
            Saturday: ['09:00', '11:00', '14:00']
        },
        is_approved: true,
        is_verified: true,
        is_active: true,
        rating: 4.7,
        average_rating: 4.7,
        total_sessions: 140,
        total_reviews: 51,
        session_rate_individual: 0,
        session_rate_couple: 0,
        session_rate_family: 0,
        languages: ['English', 'Hindi'],
        years_experience: 6,
        accepts_video: true,
        accepts_audio: true,
        accepts_chat: true,
        accepts_in_person: false,
        location: 'Delhi, India',
        user: {
            id: 'demo-user-3',
            email: 'isha.roy@psychmind.demo',
            full_name: 'Dr. Isha Roy',
            role: 'therapist',
            is_active: true,
            is_profile_complete: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
    }
];

// Mock bookings storage (will be removed once database is fully integrated)
const mockBookings: BookingDetails[] = [];

function getMockBookingsForClient(userId: string): BookingDetails[] {
    return mockBookings
        .filter((booking) => booking.client_id === userId || booking.patient_id === userId)
        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
}

// ============================================
// Timezone Helpers
// ============================================

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert time to user's timezone
 */
export function convertToUserTimezone(utcDate: string | Date, timezone?: string): Date {
    const tz = timezone || getUserTimezone();
    const date = new Date(utcDate);
    return new Date(date.toLocaleString('en-US', { timeZone: tz }));
}

/**
 * Format date for display in user's timezone
 */
export function formatDateInTimezone(date: Date | string, timezone?: string, options?: Intl.DateTimeFormatOptions): string {
    const tz = timezone || getUserTimezone();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', { timeZone: tz, ...options });
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get day name from date
 */
function getDayName(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

/**
 * Format time to 12-hour format
 */
function formatTime(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get time period (morning/afternoon/evening)
 */
function getTimePeriod(time: string): 'morning' | 'afternoon' | 'evening' {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

/**
 * Check if date is in the past
 */
function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

/**
 * Check if date is today
 */
function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

/**
 * Generate unique ID
 */
function generateId(): string {
    return `bk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Booking Service Functions
// ============================================

/**
 * Fetch all approved therapists from database
 * Falls back to demo therapists when no approved therapists exist yet.
 * IMPORTANT: Only fetches users with role='therapist' to prevent clients from appearing
 */
export async function fetchTherapists(): Promise<TherapistWithDetails[]> {
    try {
        console.log('Fetching therapists from database...');

        const { data, error } = await supabase
            .from('therapists')
            .select(`
                *,
                user:users!inner(*)
            `)
            .eq('is_approved', true)
            .eq('is_active', true)
            .eq('user.role', 'therapist');

        if (error) {
            console.error('Error fetching therapists:', error);
            throw error;
        }

        if (data && data.length > 0) {
            const therapistsOnly = data.filter((t: any) => t.user?.role === 'therapist');
            console.log(`Found ${therapistsOnly.length} verified therapists in database`);
            return therapistsOnly as TherapistWithDetails[];
        }

        console.warn('No therapists found in database, using demo fallback');
        return DEMO_THERAPISTS;
    } catch (error) {
        console.error('Failed to fetch therapists from database:', error);
        return DEMO_THERAPISTS;
    }
}


/**
 * Fetch single therapist by ID
 * Falls back to demo therapists if no database record is available.
 */
export async function fetchTherapistById(therapistId: string): Promise<TherapistWithDetails | null> {
    try {
        console.log(`Fetching therapist ${therapistId} from database...`);

        const { data, error } = await supabase
            .from('therapists')
            .select(`
                *,
                user:users!inner(*)
            `)
            .eq('id', therapistId)
            .eq('is_active', true)
            .eq('user.role', 'therapist')
            .single();

        if (error) {
            console.error('Error fetching therapist:', error);
            throw error;
        }

        if (data && data.user?.role === 'therapist') {
            console.log(`Found therapist: ${data.user?.full_name}`);
            return data as TherapistWithDetails;
        }

        const demoTherapist = DEMO_THERAPISTS.find((therapist) => therapist.id === therapistId) || null;
        if (demoTherapist) {
            console.log(`Using demo therapist: ${demoTherapist.user.full_name}`);
            return demoTherapist;
        }

        console.warn(`Therapist ${therapistId} not found or invalid role`);
        return null;
    } catch (error) {
        console.error('Failed to fetch therapist from database:', error);
        return DEMO_THERAPISTS.find((therapist) => therapist.id === therapistId) || null;
    }
}


/**
 * Generate default time slots for a therapist (9 AM - 6 PM, hourly)
 * Used when therapist hasn't configured specific availability
 */
function generateDefaultTimeSlots(): string[] {
    const slots: string[] = [];
    // Business hours: 9 AM to 6 PM, hourly slots
    for (let hour = 9; hour < 18; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
}

/**
 * Day of week to day name mapping (0 = Sunday)
 */
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Get available time slots for a therapist on a specific date
 * Enhanced with better timezone handling and conflict detection
 * Falls back to default business hours when no availability is configured
 */
export async function getAvailableSlots(
    therapistId: string,
    date: Date,
    serviceDuration: number = 50
): Promise<TimeSlot[]> {
    // Get therapist availability
    const therapist = await fetchTherapistById(therapistId);
    if (!therapist) return [];

    const dayName = getDayName(date);
    const dayOfWeek = date.getDay();
    let availableTimes: string[] = [];

    // First, check the JSONB availability field on therapist record
    if (therapist.availability && typeof therapist.availability === 'object') {
        const jsonAvailability = therapist.availability[dayName];
        if (Array.isArray(jsonAvailability) && jsonAvailability.length > 0) {
            availableTimes = jsonAvailability;
            console.log(`Using JSONB availability for ${dayName}:`, availableTimes.length, 'slots');
        }
    }

    // If no JSONB availability, try to fetch from therapist_availability table
    if (availableTimes.length === 0) {
        try {
            const { data: tableAvailability, error } = await supabase
                .from('therapist_availability')
                .select('start_time, end_time')
                .eq('therapist_id', therapistId)
                .eq('day_of_week', dayOfWeek)
                .eq('is_available', true);

            if (!error && tableAvailability && tableAvailability.length > 0) {
                // Generate time slots from start_time to end_time ranges
                for (const range of tableAvailability) {
                    const [startHour] = range.start_time.split(':').map(Number);
                    const [endHour] = range.end_time.split(':').map(Number);
                    for (let hour = startHour; hour < endHour; hour++) {
                        availableTimes.push(`${hour.toString().padStart(2, '0')}:00`);
                    }
                }
                console.log(`Using therapist_availability table for ${dayName}:`, availableTimes.length, 'slots');
            }
        } catch (error) {
            console.warn('Failed to fetch from therapist_availability table:', error);
        }
    }

    // If still no availability, use default business hours for weekdays
    if (availableTimes.length === 0) {
        // Only provide default slots for weekdays (Monday-Friday)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            availableTimes = generateDefaultTimeSlots();
            console.log(`Using default business hours for ${dayName}:`, availableTimes.length, 'slots');
        } else {
            console.log(`No availability for weekend day ${dayName}`);
            return [];
        }
    }

    // Get existing bookings for this date
    const dateStr = date.toISOString().split('T')[0];
    let bookedSlots: { start: Date; end: Date }[] = [];

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('scheduled_at, duration_minutes')
            .eq('therapist_id', therapistId)
            .gte('scheduled_at', `${dateStr}T00:00:00`)
            .lt('scheduled_at', `${dateStr}T23:59:59`)
            .not('status', 'in', '("cancelled","no_show")');

        if (!error && data) {
            bookedSlots = data.map(b => {
                const start = new Date(b.scheduled_at);
                const end = new Date(start.getTime() + (b.duration_minutes || 50) * 60 * 1000);
                return { start, end };
            });
        }
    } catch (error) {
        console.error('Error fetching booked slots:', error);
    }

    // If today, filter out past times
    const now = new Date();
    const isDateToday = isToday(date);
    const minBookingBuffer = 60 * 60 * 1000; // 1 hour buffer for same-day bookings

    // Generate time slots with conflict checking
    const slots: TimeSlot[] = [];

    for (const time of availableTimes) {
        const [hours, minutes] = time.split(':').map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(hours, minutes, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60 * 1000);

        // Skip if slot is in the past (with buffer for today)
        if (isDateToday && slotStart.getTime() <= now.getTime() + minBookingBuffer) {
            continue;
        }

        // Check for conflicts with existing bookings
        const hasConflict = bookedSlots.some(booked => {
            return (slotStart < booked.end && slotEnd > booked.start);
        });

        slots.push({
            time: formatTime(time),
            displayTime: formatTime(time),
            available: !hasConflict,
            period: getTimePeriod(time),
            iso: slotStart.toISOString()
        });
    }

    return slots.sort((a, b) => {
        const timeA = a.iso ? new Date(a.iso).getTime() : 0;
        const timeB = b.iso ? new Date(b.iso).getTime() : 0;
        return timeA - timeB;
    });
}

/**
 * Get available dates for a therapist (next 60 days)
 * Checks both therapist availability and existing bookings
 * Falls back to weekdays when no availability is configured
 */
export async function getAvailableDates(therapistId: string): Promise<Date[]> {
    const therapist = await fetchTherapistById(therapistId);
    if (!therapist) return [];

    // Determine which days are available
    let availableDayNumbers: Set<number> = new Set();

    // First, check JSONB availability field
    if (therapist.availability && typeof therapist.availability === 'object') {
        const dayNames = Object.keys(therapist.availability);
        for (const dayName of dayNames) {
            const slots = therapist.availability[dayName];
            if (Array.isArray(slots) && slots.length > 0) {
                const dayIndex = DAY_NAMES.indexOf(dayName);
                if (dayIndex !== -1) {
                    availableDayNumbers.add(dayIndex);
                }
            }
        }
    }

    // If no JSONB availability, try to fetch from therapist_availability table
    if (availableDayNumbers.size === 0) {
        try {
            const { data: tableAvailability, error } = await supabase
                .from('therapist_availability')
                .select('day_of_week')
                .eq('therapist_id', therapistId)
                .eq('is_available', true);

            if (!error && tableAvailability && tableAvailability.length > 0) {
                for (const record of tableAvailability) {
                    availableDayNumbers.add(record.day_of_week);
                }
                console.log('Using therapist_availability table for available days:', availableDayNumbers);
            }
        } catch (error) {
            console.warn('Failed to fetch from therapist_availability table:', error);
        }
    }

    // If still no availability, default to weekdays (Monday-Friday)
    if (availableDayNumbers.size === 0) {
        console.log('No availability configured, defaulting to weekdays');
        availableDayNumbers = new Set([1, 2, 3, 4, 5]); // Monday through Friday
    }

    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for blocked dates
    const blockedDates: Set<string> = new Set();
    try {
        const { data } = await supabase
            .from('therapist_blocked_times')
            .select('start_datetime, end_datetime')
            .eq('therapist_id', therapistId)
            .gte('end_datetime', today.toISOString());

        if (data) {
            data.forEach(blocked => {
                const start = new Date(blocked.start_datetime);
                const end = new Date(blocked.end_datetime);
                // Add all dates in the blocked range
                const current = new Date(start);
                while (current <= end) {
                    blockedDates.add(current.toISOString().split('T')[0]);
                    current.setDate(current.getDate() + 1);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching blocked times:', error);
    }

    for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();

        // Skip blocked dates
        if (blockedDates.has(dateStr)) continue;

        // Check if this day of week is available
        if (availableDayNumbers.has(dayOfWeek)) {
            dates.push(new Date(date));
        }
    }

    return dates;
}

/**
 * Create a new booking with comprehensive validation
 */
export async function createBooking(data: CreateBookingData): Promise<{ booking: BookingDetails | null; error: string | null }> {
    // Validate required fields
    if (!data.client_id) {
        return { booking: null, error: 'Please log in to book an appointment' };
    }
    if (!data.therapist_id) {
        return { booking: null, error: 'Please select a therapist' };
    }
    if (!data.scheduled_at) {
        return { booking: null, error: 'Please select a date and time' };
    }

    // Validate scheduled time is in the future (with buffer)
    const scheduledDate = new Date(data.scheduled_at);
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 min buffer

    if (scheduledDate <= minBookingTime) {
        return { booking: null, error: 'Please select a time at least 30 minutes from now' };
    }

    // Check if slot is still available (with double-check to prevent race conditions)
    const slots = await getAvailableSlots(data.therapist_id, scheduledDate, data.duration_minutes);
    const timeStr = formatTime(
        `${scheduledDate.getHours().toString().padStart(2, '0')}:${scheduledDate.getMinutes().toString().padStart(2, '0')}`
    );

    const slot = slots.find(s => s.time === timeStr);
    if (slot && !slot.available) {
        return { booking: null, error: 'This time slot was just booked. Please select another time.' };
    }

    // Generate unique room ID for video calls
    const roomId = `session-${data.therapist_id.substring(0, 8)}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const meetingUrl = `${baseUrl}/call/${roomId}`;

    // Calculate amount based on service
    const service = serviceTypes.find(s => s.id === data.service_category_id);
    const amount = data.amount ?? service?.price ?? 0;

    // Demo fallback: allow bookings against frontend-only therapists so the
    // presentation flow works even before real therapist rows exist in Supabase.
    if (data.therapist_id.startsWith('demo-therapist-')) {
        const demoTherapist = DEMO_THERAPISTS.find((therapist) => therapist.id === data.therapist_id);

        if (!demoTherapist) {
            return { booking: null, error: 'Selected demo therapist was not found.' };
        }

        const demoBooking: BookingDetails = {
            id: generateId(),
            client_id: data.client_id,
            patient_id: data.client_id,
            therapist_id: data.therapist_id,
            service_category_id: data.service_category_id || null,
            package_id: data.package_id || null,
            service_type: service?.id || 'individual',
            session_mode: data.session_mode || 'video',
            scheduled_at: data.scheduled_at,
            duration_minutes: data.duration_minutes || 60,
            status: 'confirmed',
            meeting_link: meetingUrl,
            meeting_url: meetingUrl,
            room_id: roomId,
            notes_client: data.notes_client || null,
            client_timezone: data.client_timezone || null,
            amount,
            currency: data.currency || 'INR',
            payment_status: 'paid',
            created_at: new Date().toISOString(),
            therapist: demoTherapist,
        };

        mockBookings.push(demoBooking);
        return { booking: demoBooking, error: null };
    }

    try {
        // Insert booking with columns that match the base schema actually deployed.
        const bookingData = {
            client_id: data.client_id,
            therapist_id: data.therapist_id,
            service_category_id: data.service_category_id || null,
            package_id: data.package_id || null,
            session_mode: data.session_mode || 'video',
            scheduled_at: data.scheduled_at,
            duration_minutes: data.duration_minutes || 60,
            status: 'confirmed',
            meeting_url: meetingUrl,
            room_id: roomId,
            client_timezone: data.client_timezone || null,
            notes_client: data.notes_client || null,
        };

        console.log('📝 Creating booking with data:', bookingData);

        // Insert the booking
        const { data: insertedBooking, error: insertError } = await supabase
            .from('bookings')
            .insert(bookingData)
            .select('*')
            .single();

        if (insertError) {
            console.error('❌ Booking insert error:', insertError);
            console.error('❌ Error code:', insertError.code);
            console.error('❌ Error details:', insertError.details);
            console.error('❌ Error hint:', insertError.hint);

            // Check if this is RLS policy error
            if (insertError.code === '42501' || insertError.message?.includes('policy')) {
                throw new Error('Permission denied. Please ensure you are logged in.');
            }

            // Check for FK constraint errors
            if (insertError.code === '23503') {
                throw new Error('Invalid reference. Please refresh and try again.');
            }

            throw insertError;
        }

        console.log('✅ Booking created:', insertedBooking?.id);

        // Map the DB response to our expected format
        const booking = {
            ...insertedBooking,
            patient_id: insertedBooking.client_id,
            amount,
            currency: data.currency || 'INR',
            payment_status: 'paid' as const,
            meeting_link: insertedBooking.meeting_url || meetingUrl,
            meeting_url: insertedBooking.meeting_url || meetingUrl,
            room_id: insertedBooking.room_id || roomId,
        };

        // ============================================
        // AUTOMATION: Send Confirmations & Reminders
        // ============================================
        try {
            // We have the full booking object with relations from the select() above
            const bookingDetails = booking as BookingDetails;

            // Prepare automation data
            const automationData = {
                bookingId: booking.id,
                clientId: data.client_id,
                therapistId: data.therapist_id,
                scheduledAt: data.scheduled_at,
                clientEmail: bookingDetails.client?.email || '',
                clientPhone: bookingDetails.client?.phone || undefined,
                clientName: bookingDetails.client?.full_name || 'Client',
                therapistName: bookingDetails.therapist?.user?.full_name || 'Therapist',
                therapistPhone: bookingDetails.therapist?.user?.phone || undefined,
                serviceType: service?.name || 'Therapy Session',
                sessionMode: data.session_mode || 'video',
                meetingUrl: meetingUrl,
            };

            // Run automation in background (don't block return)
            // Note: In a robust backend, this would be a queued job.
            // Here we fire-and-forget but log errors.
            import('./services/bookingAutomation').then(async (automation) => {
                try {
                    console.log('🔄 Triggering booking automation...');
                    await automation.sendBookingConfirmation(automationData);
                    await automation.scheduleBookingReminders(automationData);
                    console.log('✅ Booking automation triggered successfully');
                } catch (autoError) {
                    console.error('⚠️ Booking automation failed:', autoError);
                }
            });

        } catch (setupError) {
            console.warn('⚠️ Failed to setup automation data:', setupError);
        }



        // Create video call session entry for video/audio sessions
        if (data.session_mode === 'video' || data.session_mode === 'audio' || !data.session_mode) {
            try {
                // Get therapist's user_id for the session
                const { data: therapistData } = await supabase
                    .from('therapists')
                    .select('user_id')
                    .eq('id', data.therapist_id)
                    .single();

                await supabase
                    .from('video_call_sessions')
                    .insert({
                        room_id: roomId,
                        booking_id: booking.id,
                        initiator_id: data.client_id,
                        receiver_id: therapistData?.user_id || data.therapist_id,
                        status: 'waiting',
                        session_mode: data.session_mode || 'video',
                    });
            } catch (sessionError) {
                console.warn('Failed to create video session (non-critical):', sessionError);
            }
        }

        // Create or get conversation for messaging
        try {
            const { data: therapistData } = await supabase
                .from('therapists')
                .select('user_id')
                .eq('id', data.therapist_id)
                .single();

            const therapistUserId = therapistData?.user_id || data.therapist_id;
            const [p1, p2] = [data.client_id, therapistUserId].sort();

            const { data: existingConv } = await supabase
                .from('conversations')
                .select('id')
                .eq('participant_1_id', p1)
                .eq('participant_2_id', p2)
                .single();

            if (!existingConv) {
                await supabase
                    .from('conversations')
                    .insert({
                        booking_id: booking.id,
                        participant_1_id: p1,
                        participant_2_id: p2,
                        is_active: true,
                    });
            } else {
                await supabase
                    .from('conversations')
                    .update({ booking_id: booking.id })
                    .eq('id', existingConv.id);
            }
        } catch (convError) {
            console.warn('Failed to create conversation (non-critical):', convError);
        }

        return { booking: booking as BookingDetails, error: null };
    } catch (error: unknown) {
        console.error('Error creating booking:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create booking. Please try again.';
        return { booking: null, error: errorMessage };
    }
}

/**
 * Get user's bookings
 */
export async function getUserBookings(userId: string): Promise<BookingDetails[]> {
    const demoBookings = getMockBookingsForClient(userId);

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                therapist:therapists!bookings_therapist_id_fkey(
                    *,
                    user:users!therapists_user_id_fkey(*)
                ),
                client:users!bookings_client_id_fkey(*)
            `)
            .eq('client_id', userId)
            .order('scheduled_at', { ascending: false });

        if (error) throw error;
        if (data) {
            return [...(data as BookingDetails[]), ...demoBookings]
                .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
        }
    } catch (error) {
        console.error('Error fetching user bookings:', error);
    }

    return demoBookings;
}

/**
 * Get therapist's bookings
 */
export async function getTherapistBookings(therapistId: string): Promise<BookingDetails[]> {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                patient:users!patient_id(*)
            `)
            .eq('therapist_id', therapistId)
            .order('scheduled_at', { ascending: true });

        if (error) throw error;
        if (data) return data as BookingDetails[];
    } catch (error) {
        console.error('Error fetching therapist bookings:', error);
    }

    return [];
}

/**
 * Get upcoming bookings for a user
 */
export async function getUpcomingBookings(userId: string): Promise<BookingDetails[]> {
    const now = new Date().toISOString();
    const demoBookings = getMockBookingsForClient(userId)
        .filter((booking) =>
            ['pending', 'confirmed'].includes(booking.status) &&
            new Date(booking.scheduled_at).toISOString() >= now
        );

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                therapist:therapists!bookings_therapist_id_fkey(
                    *,
                    user:users!therapists_user_id_fkey(*)
                ),
                client:users!bookings_client_id_fkey(*)
            `)
            .eq('client_id', userId)
            .gte('scheduled_at', now)
            .in('status', ['pending', 'confirmed'])
            .order('scheduled_at', { ascending: true })
            .limit(5);

        if (error) throw error;
        if (data) {
            return [...(data as BookingDetails[]), ...demoBookings]
                .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                .slice(0, 5);
        }
    } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
    }

    return demoBookings
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 5);
}

/**
 * Cancel a booking with reason tracking
 */
export async function cancelBooking(
    bookingId: string,
    reason?: string,
    cancelledBy: 'client' | 'therapist' | 'admin' = 'client'
): Promise<{ success: boolean; error: string | null; refundEligible?: boolean }> {
    try {
        // Get booking to check cancellation policy
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('scheduled_at, status, amount, payment_status')
            .eq('id', bookingId)
            .single();

        if (fetchError) {
            console.error('Error fetching booking for cancellation:', fetchError);
            return { success: false, error: 'Booking not found' };
        }

        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }

        if (booking.status === 'cancelled') {
            return { success: false, error: 'Booking is already cancelled' };
        }

        if (booking.status === 'completed') {
            return { success: false, error: 'Cannot cancel a completed session' };
        }

        // Check cancellation policy (24 hours notice for full refund)
        const scheduledTime = new Date(booking.scheduled_at).getTime();
        const now = Date.now();
        const hoursUntilSession = (scheduledTime - now) / (1000 * 60 * 60);
        const refundEligible = hoursUntilSession >= 24;

        // Try full update first, fallback to minimal update if columns don't exist
        let updateError: unknown = null;

        // First try with all columns
        const { error: fullUpdateError } = await supabase
            .from('bookings')
            .update({
                status: 'cancelled',
                cancellation_reason: reason || null,
                cancelled_by: cancelledBy,
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

        if (fullUpdateError) {
            console.warn('Full cancel update failed, trying minimal update:', fullUpdateError);

            // Fallback: just update status
            const { error: minimalError } = await supabase
                .from('bookings')
                .update({
                    status: 'cancelled',
                    updated_at: new Date().toISOString()
                })
                .eq('id', bookingId);

            updateError = minimalError;
        }

        if (updateError) {
            throw updateError;
        }

        // Update video session if exists (non-critical)
        try {
            await supabase
                .from('video_call_sessions')
                .update({ status: 'ended' })
                .eq('booking_id', bookingId);
        } catch (videoError) {
            console.warn('Failed to update video session (non-critical):', videoError);
        }

        return { success: true, error: null, refundEligible };
    } catch (error: unknown) {
        console.error('Error cancelling booking:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
        return { success: false, error: errorMessage };
    }
}

/**
 * Reschedule a booking to a new time
 */
export async function rescheduleBooking(
    bookingId: string,
    newScheduledAt: string,
    reason?: string
): Promise<{ success: boolean; error: string | null; booking?: BookingDetails }> {
    try {
        // Get existing booking
        const { data: existingBooking } = await supabase
            .from('bookings')
            .select('*, therapist_id, duration_minutes, status')
            .eq('id', bookingId)
            .single();

        if (!existingBooking) {
            return { success: false, error: 'Booking not found' };
        }

        if (existingBooking.status === 'cancelled' || existingBooking.status === 'completed') {
            return { success: false, error: 'Cannot reschedule this booking' };
        }

        // Validate new time
        const newDate = new Date(newScheduledAt);
        const now = new Date();
        if (newDate <= now) {
            return { success: false, error: 'Please select a future date and time' };
        }

        // Check if new slot is available
        const slots = await getAvailableSlots(existingBooking.therapist_id, newDate, existingBooking.duration_minutes);
        const timeStr = formatTime(
            `${newDate.getHours().toString().padStart(2, '0')}:${newDate.getMinutes().toString().padStart(2, '0')}`
        );
        const slot = slots.find(s => s.time === timeStr);

        if (slot && !slot.available) {
            return { success: false, error: 'This time slot is not available' };
        }

        // Update booking
        const { data: updatedBooking, error } = await supabase
            .from('bookings')
            .update({
                scheduled_at: newScheduledAt,
                status: 'confirmed',
                rescheduled_from: existingBooking.scheduled_at,
                notes_client: reason ? `Rescheduled: ${reason}` : existingBooking.notes_client,
                reminder_sent: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)
            .select(`
                *,
                therapist:therapists(*, user:users(*)),
                client:users!client_id(*)
            `)
            .single();

        if (error) throw error;

        return { success: true, error: null, booking: updatedBooking as BookingDetails };
    } catch (error: unknown) {
        console.error('Error rescheduling booking:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to reschedule booking';
        return { success: false, error: errorMessage };
    }
}

/**
 * Mark a booking as completed
 */
export async function completeBooking(bookingId: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabase
            .from('bookings')
            .update({
                status: 'completed',
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

        if (error) throw error;

        // Update video session
        await supabase
            .from('video_call_sessions')
            .update({
                status: 'ended',
                ended_at: new Date().toISOString()
            })
            .eq('booking_id', bookingId);

        return { success: true, error: null };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to complete booking';
        return { success: false, error: errorMessage };
    }
}

/**
 * Get booking by ID with full details
 */
export async function getBookingById(bookingId: string): Promise<BookingDetails | null> {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                therapist:therapists(*, user:users(*)),
                client:users!client_id(*)
            `)
            .eq('id', bookingId)
            .single();

        if (error) throw error;
        return data as BookingDetails;
    } catch (error) {
        console.error('Error fetching booking:', error);
        return null;
    }
}

/**
 * Get booking statistics
 */
export async function getBookingStats(userId?: string): Promise<{
    total: number;
    completed: number;
    upcoming: number;
    cancelled: number;
}> {
    const now = new Date().toISOString();
    const demoBookings = userId ? getMockBookingsForClient(userId) : [];

    try {
        let query = supabase.from('bookings').select('status, scheduled_at', { count: 'exact' });

        if (userId) {
            query = query.eq('client_id', userId);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        if (data) {
            const combined = [...data, ...demoBookings];
            return {
                total: combined.length,
                completed: combined.filter(b => b.status === 'completed').length,
                upcoming: combined.filter(b =>
                    ['pending', 'confirmed'].includes(b.status) &&
                    new Date(b.scheduled_at) >= new Date()
                ).length,
                cancelled: combined.filter(b => b.status === 'cancelled').length
            };
        }
    } catch (error) {
        console.error('Error fetching booking stats:', error);
    }

    return {
        total: demoBookings.length,
        completed: demoBookings.filter(b => b.status === 'completed').length,
        upcoming: demoBookings.filter(b =>
            ['pending', 'confirmed'].includes(b.status) &&
            new Date(b.scheduled_at) >= new Date()
        ).length,
        cancelled: demoBookings.filter(b => b.status === 'cancelled').length
    };
}

/**
 * Get therapist booking statistics
 */
export async function getTherapistBookingStats(therapistId: string): Promise<{
    total: number;
    completed: number;
    upcoming: number;
    cancelled: number;
    todaySessions: number;
    weekSessions: number;
    revenue: number;
}> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    try {
        const { data, error, count } = await supabase
            .from('bookings')
            .select('status, scheduled_at, amount', { count: 'exact' })
            .eq('therapist_id', therapistId);

        if (error) throw error;

        if (data) {
            const completed = data.filter(b => b.status === 'completed');
            const todaySessions = data.filter(b =>
                b.scheduled_at >= todayStart && b.scheduled_at < todayEnd &&
                ['pending', 'confirmed'].includes(b.status)
            );
            const weekSessions = data.filter(b =>
                b.scheduled_at >= weekStart &&
                ['pending', 'confirmed', 'completed'].includes(b.status)
            );

            return {
                total: count || 0,
                completed: completed.length,
                upcoming: data.filter(b =>
                    ['pending', 'confirmed'].includes(b.status) &&
                    new Date(b.scheduled_at) >= now
                ).length,
                cancelled: data.filter(b => b.status === 'cancelled').length,
                todaySessions: todaySessions.length,
                weekSessions: weekSessions.length,
                revenue: completed.reduce((sum, b) => sum + (b.amount || 0), 0)
            };
        }
    } catch (error) {
        console.error('Error fetching therapist booking stats:', error);
    }

    return {
        total: 0,
        completed: 0,
        upcoming: 0,
        cancelled: 0,
        todaySessions: 0,
        weekSessions: 0,
        revenue: 0
    };
}

// Default export with all functions
export default {
    // Types
    serviceTypes,
    sessionPackages,

    // Fetch functions
    fetchTherapists,
    fetchTherapistById,

    // Availability
    getAvailableSlots,
    getAvailableDates,

    // Booking CRUD
    createBooking,
    getBookingById,
    getUserBookings,
    getTherapistBookings,
    getUpcomingBookings,
    cancelBooking,
    rescheduleBooking,
    completeBooking,

    // Statistics
    getBookingStats,
    getTherapistBookingStats,

    // Timezone helpers
    getUserTimezone,
    convertToUserTimezone,
    formatDateInTimezone,
};
