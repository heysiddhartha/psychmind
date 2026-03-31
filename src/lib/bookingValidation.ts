/**
 * Booking Validation Utilities
 * Production-grade validation for booking operations
 */

// ============================================
// Types
// ============================================

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export interface BookingValidationData {
    patientId?: string;
    therapistId?: string;
    serviceType?: string;
    scheduledAt?: string;
    durationMinutes?: number;
}

// ============================================
// Validation Rules
// ============================================

const MIN_BOOKING_ADVANCE_HOURS = 1; // Minimum hours before a booking can be made
const MAX_BOOKING_ADVANCE_DAYS = 60; // Maximum days in advance
const MIN_SESSION_DURATION = 15; // Minimum session duration in minutes
const MAX_SESSION_DURATION = 180; // Maximum session duration in minutes

const VALID_SERVICE_TYPES = ['individual', 'couple', 'family', 'group', 'consultation'];
const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

// ============================================
// Validation Functions
// ============================================

/**
 * Validate booking creation data
 */
export function validateBookingCreate(data: BookingValidationData): ValidationResult {
    const errors: string[] = [];

    // Patient ID validation
    if (!data.patientId || data.patientId.trim() === '') {
        errors.push('Patient ID is required');
    }

    // Therapist ID validation
    if (!data.therapistId || data.therapistId.trim() === '') {
        errors.push('Therapist ID is required');
    }

    // Service type validation
    if (!data.serviceType) {
        errors.push('Service type is required');
    } else if (!VALID_SERVICE_TYPES.includes(data.serviceType)) {
        errors.push(`Invalid service type. Must be one of: ${VALID_SERVICE_TYPES.join(', ')}`);
    }

    // Scheduled time validation
    if (!data.scheduledAt) {
        errors.push('Scheduled time is required');
    } else {
        const scheduledDate = new Date(data.scheduledAt);

        if (isNaN(scheduledDate.getTime())) {
            errors.push('Invalid scheduled time format');
        } else {
            const now = new Date();
            const minBookingTime = new Date(now.getTime() + MIN_BOOKING_ADVANCE_HOURS * 60 * 60 * 1000);
            const maxBookingTime = new Date(now.getTime() + MAX_BOOKING_ADVANCE_DAYS * 24 * 60 * 60 * 1000);

            if (scheduledDate < minBookingTime) {
                errors.push(`Booking must be at least ${MIN_BOOKING_ADVANCE_HOURS} hour(s) in advance`);
            }

            if (scheduledDate > maxBookingTime) {
                errors.push(`Booking cannot be more than ${MAX_BOOKING_ADVANCE_DAYS} days in advance`);
            }

            // Check if it's during reasonable hours (8 AM - 9 PM)
            const hour = scheduledDate.getHours();
            if (hour < 8 || hour >= 21) {
                errors.push('Booking must be between 8:00 AM and 9:00 PM');
            }
        }
    }

    // Duration validation
    if (!data.durationMinutes) {
        errors.push('Duration is required');
    } else if (data.durationMinutes < MIN_SESSION_DURATION) {
        errors.push(`Session duration must be at least ${MIN_SESSION_DURATION} minutes`);
    } else if (data.durationMinutes > MAX_SESSION_DURATION) {
        errors.push(`Session duration cannot exceed ${MAX_SESSION_DURATION} minutes`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate booking cancellation
 */
export function validateBookingCancel(scheduledAt: string): ValidationResult {
    const errors: string[] = [];
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();

    // Check if booking is in the past
    if (scheduledDate < now) {
        errors.push('Cannot cancel a past booking');
    }

    // Check if cancellation is too close to the appointment (24 hour policy)
    const hoursUntilAppointment = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilAppointment < 24 && hoursUntilAppointment > 0) {
        errors.push('Cancellations must be made at least 24 hours before the appointment');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate booking reschedule
 */
export function validateBookingReschedule(
    currentScheduledAt: string,
    newScheduledAt: string
): ValidationResult {
    const errors: string[] = [];
    const currentDate = new Date(currentScheduledAt);
    const newDate = new Date(newScheduledAt);
    const now = new Date();

    // Check if current booking is in the past
    if (currentDate < now) {
        errors.push('Cannot reschedule a past booking');
    }

    // Validate new date
    if (isNaN(newDate.getTime())) {
        errors.push('Invalid new scheduled time format');
    } else {
        const minBookingTime = new Date(now.getTime() + MIN_BOOKING_ADVANCE_HOURS * 60 * 60 * 1000);
        const maxBookingTime = new Date(now.getTime() + MAX_BOOKING_ADVANCE_DAYS * 24 * 60 * 60 * 1000);

        if (newDate < minBookingTime) {
            errors.push(`New booking must be at least ${MIN_BOOKING_ADVANCE_HOURS} hour(s) from now`);
        }

        if (newDate > maxBookingTime) {
            errors.push(`New booking cannot be more than ${MAX_BOOKING_ADVANCE_DAYS} days in advance`);
        }

        // Check if trying to reschedule to the same time
        if (currentDate.getTime() === newDate.getTime()) {
            errors.push('New time must be different from the current time');
        }

        // Check if it's during reasonable hours
        const hour = newDate.getHours();
        if (hour < 8 || hour >= 21) {
            errors.push('New booking must be between 8:00 AM and 9:00 PM');
        }
    }

    // Check rescheduling policy (24 hour notice)
    const hoursUntilAppointment = (currentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilAppointment < 24 && hoursUntilAppointment > 0) {
        errors.push('Rescheduling must be done at least 24 hours before the appointment');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format (US)
 */
export function validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?1?\d{10,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .slice(0, 1000); // Limit length
}

/**
 * Validate notes field
 */
export function validateNotes(notes: string): ValidationResult {
    const errors: string[] = [];

    if (notes.length > 2000) {
        errors.push('Notes cannot exceed 2000 characters');
    }

    // Check for potential XSS
    if (/<script|javascript:|on\w+=/i.test(notes)) {
        errors.push('Notes contain invalid characters');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Check if user can book with a specific therapist
 * (e.g., check for blocked users, subscription limits, etc.)
 */
export async function canUserBookWithTherapist(
    userId: string,
    therapistId: string
): Promise<ValidationResult> {
    const errors: string[] = [];

    // In production, this would check:
    // 1. If user is blocked by therapist
    // 2. If user has reached booking limits
    // 3. If user's subscription allows this service
    // 4. If therapist is currently accepting new patients

    // For now, always allow
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: ValidationResult): string {
    if (result.valid) return '';
    return result.errors.join('. ');
}

export default {
    validateBookingCreate,
    validateBookingCancel,
    validateBookingReschedule,
    validateEmail,
    validatePhone,
    sanitizeInput,
    validateNotes,
    canUserBookWithTherapist,
    formatValidationErrors
};
