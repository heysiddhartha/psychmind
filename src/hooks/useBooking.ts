/**
 * useBooking - Custom hook for booking management
 * Provides centralized booking state and operations
 */

import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    serviceTypes,
    fetchTherapists,
    fetchTherapistById,
    getAvailableSlots,
    getAvailableDates,
    createBooking,
    cancelBooking,
    rescheduleBooking,
    getUserBookings,
    getUpcomingBookings,
    getBookingStats,
    type ServiceType,
    type TherapistWithDetails,
    type TimeSlot,
    type BookingDetails,
    type CreateBookingData
} from '@/lib/bookingService';
import {
    validateBookingCreate,
    validateBookingCancel,
    validateBookingReschedule,
    formatValidationErrors
} from '@/lib/bookingValidation';

// ============================================
// Types
// ============================================

export interface BookingState {
    // Selected values
    selectedService: string | null;
    selectedTherapist: string | null;
    selectedDate: Date | null;
    selectedTime: string | null;

    // Data
    therapists: TherapistWithDetails[];
    availableDates: Date[];
    timeSlots: TimeSlot[];
    userBookings: BookingDetails[];
    upcomingBookings: BookingDetails[];
    stats: { total: number; completed: number; upcoming: number; cancelled: number };

    // Loading states
    loadingTherapists: boolean;
    loadingDates: boolean;
    loadingSlots: boolean;
    loadingBookings: boolean;
    submitting: boolean;

    // Result
    bookingComplete: boolean;
    lastBooking: BookingDetails | null;

    // Filters
    searchQuery: string;
    specialtyFilter: string | null;
}

export interface BookingActions {
    // Selection
    selectService: (serviceId: string | null) => void;
    selectTherapist: (therapistId: string | null) => void;
    selectDate: (date: Date | null) => void;
    selectTime: (time: string | null) => void;

    // Data loading
    loadTherapists: () => Promise<void>;
    loadAvailableDates: (therapistId: string) => Promise<void>;
    loadTimeSlots: (therapistId: string, date: Date) => Promise<void>;
    loadUserBookings: (userId: string) => Promise<void>;
    loadUpcomingBookings: (userId: string) => Promise<void>;
    loadStats: (userId?: string) => Promise<void>;

    // Booking operations
    createNewBooking: (userId: string) => Promise<{ success: boolean; booking?: BookingDetails; error?: string }>;
    cancelExistingBooking: (bookingId: string, scheduledAt: string) => Promise<{ success: boolean; error?: string }>;
    rescheduleExistingBooking: (bookingId: string, currentScheduledAt: string, newScheduledAt: string) => Promise<{ success: boolean; error?: string }>;

    // Filters
    setSearchQuery: (query: string) => void;
    setSpecialtyFilter: (specialty: string | null) => void;
    clearFilters: () => void;

    // Reset
    reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState: BookingState = {
    selectedService: null,
    selectedTherapist: null,
    selectedDate: null,
    selectedTime: null,
    therapists: [],
    availableDates: [],
    timeSlots: [],
    userBookings: [],
    upcomingBookings: [],
    stats: { total: 0, completed: 0, upcoming: 0, cancelled: 0 },
    loadingTherapists: false,
    loadingDates: false,
    loadingSlots: false,
    loadingBookings: false,
    submitting: false,
    bookingComplete: false,
    lastBooking: null,
    searchQuery: '',
    specialtyFilter: null
};

// ============================================
// Hook
// ============================================

export function useBooking(): [BookingState, BookingActions] {
    const { toast } = useToast();
    const [state, setState] = useState<BookingState>(initialState);

    // Helper to update state
    const updateState = useCallback((updates: Partial<BookingState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    // ============================================
    // Selection Actions
    // ============================================

    const selectService = useCallback((serviceId: string | null) => {
        updateState({ selectedService: serviceId });
    }, [updateState]);

    const selectTherapist = useCallback((therapistId: string | null) => {
        updateState({
            selectedTherapist: therapistId,
            selectedDate: null,
            selectedTime: null,
            availableDates: [],
            timeSlots: []
        });
    }, [updateState]);

    const selectDate = useCallback((date: Date | null) => {
        updateState({
            selectedDate: date,
            selectedTime: null,
            timeSlots: []
        });
    }, [updateState]);

    const selectTime = useCallback((time: string | null) => {
        updateState({ selectedTime: time });
    }, [updateState]);

    // ============================================
    // Data Loading Actions
    // ============================================

    const loadTherapists = useCallback(async () => {
        updateState({ loadingTherapists: true });
        try {
            const therapists = await fetchTherapists();
            updateState({ therapists, loadingTherapists: false });
        } catch (error) {
            console.error('Failed to load therapists:', error);
            toast({
                title: 'Error',
                description: 'Failed to load therapists. Please try again.',
                variant: 'destructive'
            });
            updateState({ loadingTherapists: false });
        }
    }, [toast, updateState]);

    const loadAvailableDates = useCallback(async (therapistId: string) => {
        updateState({ loadingDates: true });
        try {
            const dates = await getAvailableDates(therapistId);
            updateState({ availableDates: dates, loadingDates: false });
        } catch (error) {
            console.error('Failed to load available dates:', error);
            updateState({ loadingDates: false });
        }
    }, [updateState]);

    const loadTimeSlots = useCallback(async (therapistId: string, date: Date) => {
        updateState({ loadingSlots: true });
        try {
            const slots = await getAvailableSlots(therapistId, date);
            updateState({ timeSlots: slots, loadingSlots: false });
        } catch (error) {
            console.error('Failed to load time slots:', error);
            updateState({ loadingSlots: false });
        }
    }, [updateState]);

    const loadUserBookings = useCallback(async (userId: string) => {
        updateState({ loadingBookings: true });
        try {
            const bookings = await getUserBookings(userId);
            updateState({ userBookings: bookings, loadingBookings: false });
        } catch (error) {
            console.error('Failed to load bookings:', error);
            updateState({ loadingBookings: false });
        }
    }, [updateState]);

    const loadUpcomingBookings = useCallback(async (userId: string) => {
        updateState({ loadingBookings: true });
        try {
            const bookings = await getUpcomingBookings(userId);
            updateState({ upcomingBookings: bookings, loadingBookings: false });
        } catch (error) {
            console.error('Failed to load upcoming bookings:', error);
            updateState({ loadingBookings: false });
        }
    }, [updateState]);

    const loadStats = useCallback(async (userId?: string) => {
        try {
            const stats = await getBookingStats(userId);
            updateState({ stats });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }, [updateState]);

    // ============================================
    // Booking Operations
    // ============================================

    const createNewBooking = useCallback(async (userId: string) => {
        const { selectedService, selectedTherapist, selectedDate, selectedTime } = state;

        if (!selectedService || !selectedTherapist || !selectedDate || !selectedTime) {
            return { success: false, error: 'Please complete all booking steps' };
        }

        // Parse time and create scheduled_at
        const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeMatch) {
            return { success: false, error: 'Invalid time format' };
        }

        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        const scheduledAt = new Date(selectedDate);
        scheduledAt.setHours(hours, minutes, 0, 0);

        const service = serviceTypes.find(s => s.id === selectedService);
        if (!service) {
            return { success: false, error: 'Invalid service type' };
        }

        const bookingData: CreateBookingData = {
            client_id: userId,
            therapist_id: selectedTherapist,
            service_category_id: selectedService,
            session_mode: 'video',
            scheduled_at: scheduledAt.toISOString(),
            duration_minutes: service.duration,
            client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        // Validate
        const validation = validateBookingCreate({
            patientId: bookingData.client_id,
            therapistId: bookingData.therapist_id,
            serviceType: bookingData.service_category_id || '',
            scheduledAt: bookingData.scheduled_at,
            durationMinutes: bookingData.duration_minutes
        });

        if (!validation.valid) {
            return { success: false, error: formatValidationErrors(validation) };
        }

        updateState({ submitting: true });

        try {
            const result = await createBooking(bookingData);

            if (result.error) {
                updateState({ submitting: false });
                return { success: false, error: result.error };
            }

            updateState({
                submitting: false,
                bookingComplete: true,
                lastBooking: result.booking
            });

            return { success: true, booking: result.booking! };
        } catch (error) {
            updateState({ submitting: false });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Booking failed'
            };
        }
    }, [state, updateState]);

    const cancelExistingBooking = useCallback(async (bookingId: string, scheduledAt: string) => {
        const validation = validateBookingCancel(scheduledAt);
        if (!validation.valid) {
            return { success: false, error: formatValidationErrors(validation) };
        }

        try {
            const result = await cancelBooking(bookingId);
            if (!result.success) {
                return { success: false, error: result.error || 'Failed to cancel booking' };
            }
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to cancel booking'
            };
        }
    }, []);

    const rescheduleExistingBooking = useCallback(async (
        bookingId: string,
        currentScheduledAt: string,
        newScheduledAt: string
    ) => {
        const validation = validateBookingReschedule(currentScheduledAt, newScheduledAt);
        if (!validation.valid) {
            return { success: false, error: formatValidationErrors(validation) };
        }

        try {
            const result = await rescheduleBooking(bookingId, newScheduledAt);
            if (!result.success) {
                return { success: false, error: result.error || 'Failed to reschedule booking' };
            }
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to reschedule booking'
            };
        }
    }, []);

    // ============================================
    // Filter Actions
    // ============================================

    const setSearchQuery = useCallback((query: string) => {
        updateState({ searchQuery: query });
    }, [updateState]);

    const setSpecialtyFilter = useCallback((specialty: string | null) => {
        updateState({ specialtyFilter: specialty });
    }, [updateState]);

    const clearFilters = useCallback(() => {
        updateState({ searchQuery: '', specialtyFilter: null });
    }, [updateState]);

    // ============================================
    // Reset
    // ============================================

    const reset = useCallback(() => {
        setState(initialState);
    }, []);

    // ============================================
    // Filtered Therapists (memoized)
    // ============================================

    const filteredTherapists = useMemo(() => {
        return state.therapists.filter(therapist => {
            const matchesSearch = state.searchQuery === '' ||
                therapist.user.full_name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                therapist.specialties.some(s => s.toLowerCase().includes(state.searchQuery.toLowerCase()));

            const matchesSpecialty = !state.specialtyFilter ||
                therapist.specialties.includes(state.specialtyFilter);

            return matchesSearch && matchesSpecialty;
        });
    }, [state.therapists, state.searchQuery, state.specialtyFilter]);

    // Return state with filtered therapists
    const stateWithFilteredTherapists = useMemo(() => ({
        ...state,
        therapists: filteredTherapists
    }), [state, filteredTherapists]);

    // ============================================
    // Actions Object
    // ============================================

    const actions: BookingActions = useMemo(() => ({
        selectService,
        selectTherapist,
        selectDate,
        selectTime,
        loadTherapists,
        loadAvailableDates,
        loadTimeSlots,
        loadUserBookings,
        loadUpcomingBookings,
        loadStats,
        createNewBooking,
        cancelExistingBooking,
        rescheduleExistingBooking,
        setSearchQuery,
        setSpecialtyFilter,
        clearFilters,
        reset
    }), [
        selectService,
        selectTherapist,
        selectDate,
        selectTime,
        loadTherapists,
        loadAvailableDates,
        loadTimeSlots,
        loadUserBookings,
        loadUpcomingBookings,
        loadStats,
        createNewBooking,
        cancelExistingBooking,
        rescheduleExistingBooking,
        setSearchQuery,
        setSpecialtyFilter,
        clearFilters,
        reset
    ]);

    return [stateWithFilteredTherapists, actions];
}

export default useBooking;
