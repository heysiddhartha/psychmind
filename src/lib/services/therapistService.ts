/**
 * Therapist Service - Complete therapist management
 * Handles profiles, availability, and therapist operations
 */

import { supabase } from '../supabase';

// ==========================================
// Types
// ==========================================

export interface TherapistProfile {
    id: string;
    profile_id: string;
    title: string;
    credentials: string[];
    bio: string;
    short_bio: string;
    specialties: string[];
    languages: string[];
    years_experience: number;
    session_rate_individual: number;
    session_rate_couple: number;
    session_rate_family: number;
    accepts_new_clients: boolean;
    is_verified: boolean;
    is_active: boolean;
    photo_url: string;
    created_at: string;
    profile?: {
        id: string;
        email: string;
        full_name: string;
        phone: string;
        avatar_url: string;
        timezone: string;
    };
}

export interface TherapistAvailability {
    id: string;
    therapist_id: string;
    day_of_week: number; // 0 = Sunday, 6 = Saturday
    start_time: string;
    end_time: string;
    is_available: boolean;
}

export interface BlockedTime {
    id: string;
    therapist_id: string;
    start_datetime: string;
    end_datetime: string;
    reason?: string;
}

export interface AvailableSlot {
    date: Date;
    time: string;
    datetime: Date;
    isAvailable: boolean;
}

// ==========================================
// Mock Data for Development
// ==========================================

const mockTherapists: TherapistProfile[] = [
    {
        id: 't1',
        profile_id: 'p1',
        title: 'Licensed Clinical Psychologist',
        credentials: ['Ph.D.', 'Licensed Psychologist', 'CBT Certified'],
        bio: 'With over 15 years of experience in clinical psychology, I specialize in helping individuals navigate anxiety, depression, and life transitions. My approach integrates cognitive-behavioral therapy with mindfulness practices, creating a safe space for healing and personal growth.',
        short_bio: 'Specialist in anxiety, depression, and life transitions with 15+ years experience.',
        specialties: ['Anxiety', 'Depression', 'Life Transitions', 'Stress Management', 'Mindfulness'],
        languages: ['English', 'Spanish'],
        years_experience: 15,
        session_rate_individual: 150,
        session_rate_couple: 200,
        session_rate_family: 250,
        accepts_new_clients: true,
        is_verified: true,
        is_active: true,
        photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
        created_at: '2023-01-15',
        profile: {
            id: 'p1',
            email: 'dr.sarah.chen@3-3.com',
            full_name: 'Dr. Sarah Chen',
            phone: '+1 (555) 123-4567',
            avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
            timezone: 'America/New_York'
        }
    },
    {
        id: 't2',
        profile_id: 'p2',
        title: 'Licensed Marriage and Family Therapist',
        credentials: ['LMFT', 'Gottman Certified', 'EFT Trained'],
        bio: 'I believe every relationship has the potential for growth and deeper connection. As a Gottman-certified therapist, I help couples and families develop healthier communication patterns and rebuild trust.',
        short_bio: 'Gottman-certified couples therapist focused on communication and trust.',
        specialties: ['Couples Therapy', 'Family Counseling', 'Communication', 'Relationship Issues', 'Infidelity Recovery'],
        languages: ['English'],
        years_experience: 12,
        session_rate_individual: 130,
        session_rate_couple: 180,
        session_rate_family: 220,
        accepts_new_clients: true,
        is_verified: true,
        is_active: true,
        photo_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
        created_at: '2023-02-20',
        profile: {
            id: 'p2',
            email: 'dr.michael.brooks@3-3.com',
            full_name: 'Dr. Michael Brooks',
            phone: '+1 (555) 234-5678',
            avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
            timezone: 'America/Chicago'
        }
    },
    {
        id: 't3',
        profile_id: 'p3',
        title: 'Licensed Clinical Social Worker',
        credentials: ['LCSW', 'Trauma-Informed Care', 'EMDR Trained'],
        bio: 'I specialize in trauma recovery and helping survivors reclaim their sense of safety and empowerment. Using EMDR and other evidence-based approaches, I guide clients through their healing journey.',
        short_bio: 'Trauma specialist using EMDR and evidence-based approaches.',
        specialties: ['PTSD', 'Trauma', 'Grief', 'Sexual Abuse Recovery', 'EMDR'],
        languages: ['English', 'French'],
        years_experience: 10,
        session_rate_individual: 140,
        session_rate_couple: 190,
        session_rate_family: 240,
        accepts_new_clients: true,
        is_verified: true,
        is_active: true,
        photo_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
        created_at: '2023-03-10',
        profile: {
            id: 'p3',
            email: 'maya.roberts@3-3.com',
            full_name: 'Maya Roberts, LCSW',
            phone: '+1 (555) 345-6789',
            avatar_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
            timezone: 'America/Los_Angeles'
        }
    },
    {
        id: 't4',
        profile_id: 'p4',
        title: 'Child and Adolescent Psychologist',
        credentials: ['Psy.D.', 'Play Therapy Certified', 'ADHD Specialist'],
        bio: 'I work with children, teens, and their families to address behavioral challenges, anxiety, ADHD, and learning differences. My approach is warm, playful, and developmentally appropriate.',
        short_bio: 'Child specialist in anxiety, ADHD, and behavioral challenges.',
        specialties: ['Child Therapy', 'Adolescent Issues', 'ADHD', 'Behavioral Problems', 'School Anxiety'],
        languages: ['English'],
        years_experience: 8,
        session_rate_individual: 135,
        session_rate_couple: 0,
        session_rate_family: 200,
        accepts_new_clients: true,
        is_verified: true,
        is_active: true,
        photo_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
        created_at: '2023-04-05',
        profile: {
            id: 'p4',
            email: 'dr.james.park@3-3.com',
            full_name: 'Dr. James Park',
            phone: '+1 (555) 456-7890',
            avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
            timezone: 'America/New_York'
        }
    },
    {
        id: 't5',
        profile_id: 'p5',
        title: 'Addiction Counselor',
        credentials: ['LCADC', 'CASAC', 'Certified Recovery Coach'],
        bio: 'Having walked the path of recovery myself, I bring both professional expertise and personal understanding to addiction counseling. I help clients build sustainable sobriety and meaningful lives.',
        short_bio: 'Addiction specialist with personal recovery experience.',
        specialties: ['Addiction', 'Substance Abuse', 'Recovery Coaching', 'Relapse Prevention', 'Dual Diagnosis'],
        languages: ['English', 'Portuguese'],
        years_experience: 14,
        session_rate_individual: 125,
        session_rate_couple: 170,
        session_rate_family: 210,
        accepts_new_clients: true,
        is_verified: true,
        is_active: true,
        photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
        created_at: '2023-05-12',
        profile: {
            id: 'p5',
            email: 'elena.martinez@3-3.com',
            full_name: 'Elena Martinez, LCADC',
            phone: '+1 (555) 567-8901',
            avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
            timezone: 'America/Denver'
        }
    },
    {
        id: 't6',
        profile_id: 'p6',
        title: 'Mindfulness-Based Therapist',
        credentials: ['LPC', 'MBSR Certified', 'Yoga Therapist'],
        bio: 'I integrate mindfulness meditation, yoga therapy, and traditional counseling to help clients manage stress, anxiety, and find inner peace in our chaotic world.',
        short_bio: 'Mindfulness and yoga-based approach to stress and anxiety.',
        specialties: ['Mindfulness', 'Stress', 'Anxiety', 'Work-Life Balance', 'Burnout'],
        languages: ['English', 'Hindi'],
        years_experience: 9,
        session_rate_individual: 120,
        session_rate_couple: 160,
        session_rate_family: 200,
        accepts_new_clients: true,
        is_verified: true,
        is_active: true,
        photo_url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=400&fit=crop&crop=face',
        created_at: '2023-06-01',
        profile: {
            id: 'p6',
            email: 'priya.sharma@3-3.com',
            full_name: 'Priya Sharma, LPC',
            phone: '+1 (555) 678-9012',
            avatar_url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=400&fit=crop&crop=face',
            timezone: 'America/Los_Angeles'
        }
    }
];

const mockAvailability: Record<string, TherapistAvailability[]> = {
    't1': [
        { id: 'a1', therapist_id: 't1', day_of_week: 1, start_time: '09:00', end_time: '17:00', is_available: true },
        { id: 'a2', therapist_id: 't1', day_of_week: 2, start_time: '09:00', end_time: '17:00', is_available: true },
        { id: 'a3', therapist_id: 't1', day_of_week: 3, start_time: '09:00', end_time: '17:00', is_available: true },
        { id: 'a4', therapist_id: 't1', day_of_week: 4, start_time: '09:00', end_time: '17:00', is_available: true },
        { id: 'a5', therapist_id: 't1', day_of_week: 5, start_time: '09:00', end_time: '13:00', is_available: true },
    ],
    't2': [
        { id: 'a6', therapist_id: 't2', day_of_week: 1, start_time: '10:00', end_time: '18:00', is_available: true },
        { id: 'a7', therapist_id: 't2', day_of_week: 2, start_time: '10:00', end_time: '18:00', is_available: true },
        { id: 'a8', therapist_id: 't2', day_of_week: 3, start_time: '14:00', end_time: '20:00', is_available: true },
        { id: 'a9', therapist_id: 't2', day_of_week: 4, start_time: '10:00', end_time: '18:00', is_available: true },
    ],
    't3': [
        { id: 'a10', therapist_id: 't3', day_of_week: 1, start_time: '08:00', end_time: '16:00', is_available: true },
        { id: 'a11', therapist_id: 't3', day_of_week: 2, start_time: '08:00', end_time: '16:00', is_available: true },
        { id: 'a12', therapist_id: 't3', day_of_week: 4, start_time: '08:00', end_time: '16:00', is_available: true },
        { id: 'a13', therapist_id: 't3', day_of_week: 5, start_time: '08:00', end_time: '14:00', is_available: true },
    ],
    't4': [
        { id: 'a14', therapist_id: 't4', day_of_week: 1, start_time: '14:00', end_time: '19:00', is_available: true },
        { id: 'a15', therapist_id: 't4', day_of_week: 2, start_time: '14:00', end_time: '19:00', is_available: true },
        { id: 'a16', therapist_id: 't4', day_of_week: 3, start_time: '14:00', end_time: '19:00', is_available: true },
        { id: 'a17', therapist_id: 't4', day_of_week: 4, start_time: '14:00', end_time: '19:00', is_available: true },
        { id: 'a18', therapist_id: 't4', day_of_week: 6, start_time: '09:00', end_time: '13:00', is_available: true },
    ],
    't5': [
        { id: 'a19', therapist_id: 't5', day_of_week: 1, start_time: '09:00', end_time: '17:00', is_available: true },
        { id: 'a20', therapist_id: 't5', day_of_week: 3, start_time: '09:00', end_time: '17:00', is_available: true },
        { id: 'a21', therapist_id: 't5', day_of_week: 5, start_time: '09:00', end_time: '17:00', is_available: true },
    ],
    't6': [
        { id: 'a22', therapist_id: 't6', day_of_week: 2, start_time: '07:00', end_time: '15:00', is_available: true },
        { id: 'a23', therapist_id: 't6', day_of_week: 3, start_time: '07:00', end_time: '15:00', is_available: true },
        { id: 'a24', therapist_id: 't6', day_of_week: 4, start_time: '07:00', end_time: '15:00', is_available: true },
        { id: 'a25', therapist_id: 't6', day_of_week: 5, start_time: '07:00', end_time: '12:00', is_available: true },
    ],
};

// ==========================================
// Therapist Service Functions
// ==========================================

/**
 * Fetch all active, verified therapists
 */
export async function fetchTherapists(filters?: {
    specialty?: string;
    language?: string;
    acceptingNew?: boolean;
}): Promise<TherapistProfile[]> {
    try {
        let query = supabase
            .from('therapists')
            .select(`
                *,
                profile:profiles(*)
            `)
            .eq('is_active', true)
            .eq('is_verified', true);

        if (filters?.acceptingNew) {
            query = query.eq('accepts_new_clients', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        let therapists = data as TherapistProfile[];

        // Apply filters
        if (filters?.specialty) {
            therapists = therapists.filter(t =>
                t.specialties.some(s =>
                    s.toLowerCase().includes(filters.specialty!.toLowerCase())
                )
            );
        }

        if (filters?.language) {
            therapists = therapists.filter(t =>
                t.languages.some(l =>
                    l.toLowerCase().includes(filters.language!.toLowerCase())
                )
            );
        }

        if (therapists.length > 0) {
            return therapists;
        }
    } catch (error) {
        console.log('Using mock therapist data');
    }

    // Return filtered mock data
    let result = mockTherapists;

    if (filters?.specialty) {
        result = result.filter(t =>
            t.specialties.some(s =>
                s.toLowerCase().includes(filters.specialty!.toLowerCase())
            )
        );
    }

    if (filters?.language) {
        result = result.filter(t =>
            t.languages.some(l =>
                l.toLowerCase().includes(filters.language!.toLowerCase())
            )
        );
    }

    if (filters?.acceptingNew) {
        result = result.filter(t => t.accepts_new_clients);
    }

    return result;
}

/**
 * Fetch single therapist by ID
 */
export async function fetchTherapistById(therapistId: string): Promise<TherapistProfile | null> {
    try {
        const { data, error } = await supabase
            .from('therapists')
            .select(`
                *,
                profile:profiles(*)
            `)
            .eq('id', therapistId)
            .single();

        if (error) throw error;
        return data as TherapistProfile;
    } catch (error) {
        console.log('Using mock therapist data');
    }

    return mockTherapists.find(t => t.id === therapistId) || null;
}

/**
 * Fetch therapist by profile ID
 */
export async function fetchTherapistByProfileId(profileId: string): Promise<TherapistProfile | null> {
    try {
        const { data, error } = await supabase
            .from('therapists')
            .select(`
                *,
                profile:profiles(*)
            `)
            .eq('profile_id', profileId)
            .single();

        if (error) throw error;
        return data as TherapistProfile;
    } catch (error) {
        console.log('Using mock therapist data');
    }

    return mockTherapists.find(t => t.profile_id === profileId) || null;
}

/**
 * Get therapist availability schedule
 */
export async function getTherapistAvailability(therapistId: string): Promise<TherapistAvailability[]> {
    try {
        const { data, error } = await supabase
            .from('therapist_availability')
            .select('*')
            .eq('therapist_id', therapistId)
            .eq('is_available', true)
            .order('day_of_week');

        if (error) throw error;
        if (data && data.length > 0) {
            return data as TherapistAvailability[];
        }
    } catch (error) {
        console.log('Using mock availability data');
    }

    return mockAvailability[therapistId] || [];
}

/**
 * Get blocked times for a therapist
 */
export async function getBlockedTimes(
    therapistId: string,
    startDate: Date,
    endDate: Date
): Promise<BlockedTime[]> {
    try {
        const { data, error } = await supabase
            .from('therapist_blocked_times')
            .select('*')
            .eq('therapist_id', therapistId)
            .gte('start_datetime', startDate.toISOString())
            .lte('end_datetime', endDate.toISOString());

        if (error) throw error;
        return data as BlockedTime[];
    } catch (error) {
        console.log('Using empty blocked times');
    }

    return [];
}

/**
 * Calculate available time slots for a specific date
 */
export async function getAvailableTimeSlots(
    therapistId: string,
    date: Date,
    sessionDuration: number = 50
): Promise<AvailableSlot[]> {
    const dayOfWeek = date.getDay();

    // Get therapist's schedule for this day
    const availability = await getTherapistAvailability(therapistId);
    const daySchedule = availability.filter(a => a.day_of_week === dayOfWeek);

    if (daySchedule.length === 0) {
        return [];
    }

    // Get blocked times
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const blockedTimes = await getBlockedTimes(therapistId, dayStart, dayEnd);

    // Get existing bookings
    const existingBookings = await getExistingBookings(therapistId, date);

    // Generate slots
    const slots: AvailableSlot[] = [];

    for (const schedule of daySchedule) {
        const [startHour, startMin] = schedule.start_time.split(':').map(Number);
        const [endHour, endMin] = schedule.end_time.split(':').map(Number);

        let currentTime = new Date(date);
        currentTime.setHours(startHour, startMin, 0, 0);

        const scheduleEnd = new Date(date);
        scheduleEnd.setHours(endHour, endMin, 0, 0);

        while (currentTime < scheduleEnd) {
            const slotEnd = new Date(currentTime.getTime() + sessionDuration * 60 * 1000);

            // Check if slot fits within schedule
            if (slotEnd > scheduleEnd) break;

            // Check if slot is in the past (for today)
            const now = new Date();
            const isInFuture = currentTime > now;

            // Check if slot is blocked
            const isBlocked = blockedTimes.some(bt => {
                const blockStart = new Date(bt.start_datetime);
                const blockEnd = new Date(bt.end_datetime);
                return currentTime < blockEnd && slotEnd > blockStart;
            });

            // Check if slot overlaps with existing booking
            const isBooked = existingBookings.some(booking => {
                const bookingStart = new Date(booking.scheduled_at);
                const bookingEnd = new Date(bookingStart.getTime() + booking.duration_minutes * 60 * 1000);
                return currentTime < bookingEnd && slotEnd > bookingStart;
            });

            slots.push({
                date: new Date(date),
                time: formatTime(currentTime),
                datetime: new Date(currentTime),
                isAvailable: isInFuture && !isBlocked && !isBooked
            });

            // Move to next slot
            currentTime = new Date(currentTime.getTime() + sessionDuration * 60 * 1000);
        }
    }

    return slots;
}

/**
 * Get existing bookings for a therapist on a date
 */
async function getExistingBookings(therapistId: string, date: Date) {
    const dateStr = date.toISOString().split('T')[0];

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('scheduled_at, duration_minutes')
            .eq('therapist_id', therapistId)
            .gte('scheduled_at', `${dateStr}T00:00:00`)
            .lt('scheduled_at', `${dateStr}T23:59:59`)
            .neq('status', 'cancelled');

        if (error) throw error;
        return data || [];
    } catch (error) {
        return [];
    }
}

/**
 * Get available dates for a therapist (next 60 days)
 */
export async function getAvailableDates(therapistId: string): Promise<Date[]> {
    const availability = await getTherapistAvailability(therapistId);
    const availableDays = new Set(availability.map(a => a.day_of_week));

    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        if (availableDays.has(date.getDay())) {
            dates.push(date);
        }
    }

    return dates;
}

/**
 * Update therapist availability
 */
export async function updateAvailability(
    therapistId: string,
    availability: Omit<TherapistAvailability, 'id' | 'therapist_id'>[]
): Promise<{ success: boolean; error?: string }> {
    try {
        // Delete existing availability
        await supabase
            .from('therapist_availability')
            .delete()
            .eq('therapist_id', therapistId);

        // Insert new availability
        const { error } = await supabase
            .from('therapist_availability')
            .insert(
                availability.map(a => ({
                    ...a,
                    therapist_id: therapistId
                }))
            );

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update availability' };
    }
}

/**
 * Block time for a therapist
 */
export async function blockTime(
    therapistId: string,
    startDatetime: Date,
    endDatetime: Date,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('therapist_blocked_times')
            .insert({
                therapist_id: therapistId,
                start_datetime: startDatetime.toISOString(),
                end_datetime: endDatetime.toISOString(),
                reason
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to block time' };
    }
}

/**
 * Get all unique specialties
 */
export async function getAllSpecialties(): Promise<string[]> {
    try {
        const { data, error } = await supabase
            .from('therapists')
            .select('specialties')
            .eq('is_active', true)
            .eq('is_verified', true);

        if (error) throw error;

        const allSpecialties = data?.flatMap(t => t.specialties) || [];
        return [...new Set(allSpecialties)].sort();
    } catch (error) {
        console.log('Using mock specialties');
    }

    const allSpecialties = mockTherapists.flatMap(t => t.specialties);
    return [...new Set(allSpecialties)].sort();
}

/**
 * Get all languages offered
 */
export async function getAllLanguages(): Promise<string[]> {
    try {
        const { data, error } = await supabase
            .from('therapists')
            .select('languages')
            .eq('is_active', true)
            .eq('is_verified', true);

        if (error) throw error;

        const allLanguages = data?.flatMap(t => t.languages) || [];
        return [...new Set(allLanguages)].sort();
    } catch (error) {
        console.log('Using mock languages');
    }

    const allLanguages = mockTherapists.flatMap(t => t.languages);
    return [...new Set(allLanguages)].sort();
}

// ==========================================
// Helper Functions
// ==========================================

function formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export default {
    fetchTherapists,
    fetchTherapistById,
    fetchTherapistByProfileId,
    getTherapistAvailability,
    getBlockedTimes,
    getAvailableTimeSlots,
    getAvailableDates,
    updateAvailability,
    blockTime,
    getAllSpecialties,
    getAllLanguages
};
