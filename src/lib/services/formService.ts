/**
 * Forms Service - Dynamic Form Management
 * Handles intake forms, consent forms, and feedback forms
 */

import { supabase } from '../supabase';

// ==========================================
// Types
// ==========================================

export type FormFieldType =
    | 'text'
    | 'textarea'
    | 'email'
    | 'phone'
    | 'number'
    | 'date'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'checkboxGroup'
    | 'signature'
    | 'file';

export interface FormField {
    id: string;
    name: string;
    label: string;
    type: FormFieldType;
    placeholder?: string;
    required: boolean;
    options?: { value: string; label: string }[];
    validation?: {
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    };
    helpText?: string;
    conditional?: {
        field: string;
        value: string | number | boolean;
    };
}

export interface FormSection {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
}

export interface FormSchema {
    id: string;
    name: string;
    slug: string;
    type: 'intake' | 'consent' | 'assessment' | 'feedback' | 'contact';
    description?: string;
    sections: FormSection[];
    version: number;
    is_active: boolean;
    requires_signature: boolean;
    created_at: string;
}

export interface FormSubmission {
    id: string;
    form_id: string;
    user_id: string;
    booking_id?: string;
    data: Record<string, unknown>;
    version: number;
    submitted_at: string;
    signature_data?: string;
}

// ==========================================
// Form Definitions
// ==========================================

const INTAKE_FORM: FormSchema = {
    id: 'intake-general',
    name: 'General Intake Form',
    slug: 'intake',
    type: 'intake',
    description: 'Please complete this form before your first session. All information is confidential.',
    version: 1,
    is_active: true,
    requires_signature: false,
    created_at: '2024-01-01',
    sections: [
        {
            id: 'personal',
            title: 'Personal Information',
            description: 'Basic contact and demographic information',
            fields: [
                { id: 'full_name', name: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your legal name' },
                { id: 'preferred_name', name: 'preferred_name', label: 'Preferred Name', type: 'text', required: false, placeholder: 'Name you like to be called' },
                { id: 'date_of_birth', name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
                { id: 'phone', name: 'phone', label: 'Phone Number', type: 'phone', required: true },
                { id: 'email', name: 'email', label: 'Email Address', type: 'email', required: true },
                { id: 'address', name: 'address', label: 'Address', type: 'textarea', required: false, placeholder: 'Street, City, State, ZIP' },
            ]
        },
        {
            id: 'emergency',
            title: 'Emergency Contact',
            description: 'Who should we contact in case of emergency?',
            fields: [
                { id: 'emergency_name', name: 'emergency_name', label: 'Contact Name', type: 'text', required: true },
                { id: 'emergency_relationship', name: 'emergency_relationship', label: 'Relationship', type: 'text', required: true },
                { id: 'emergency_phone', name: 'emergency_phone', label: 'Contact Phone', type: 'phone', required: true },
            ]
        },
        {
            id: 'reason',
            title: 'Reason for Seeking Help',
            fields: [
                {
                    id: 'primary_concerns',
                    name: 'primary_concerns',
                    label: 'What brings you to therapy?',
                    type: 'checkboxGroup',
                    required: true,
                    options: [
                        { value: 'anxiety', label: 'Anxiety' },
                        { value: 'depression', label: 'Depression' },
                        { value: 'stress', label: 'Stress' },
                        { value: 'relationship', label: 'Relationship Issues' },
                        { value: 'trauma', label: 'Trauma/PTSD' },
                        { value: 'grief', label: 'Grief/Loss' },
                        { value: 'self_esteem', label: 'Self-Esteem' },
                        { value: 'work', label: 'Work/Career' },
                        { value: 'family', label: 'Family Issues' },
                        { value: 'other', label: 'Other' },
                    ]
                },
                {
                    id: 'concern_details',
                    name: 'concern_details',
                    label: 'Please describe your concerns in more detail:',
                    type: 'textarea',
                    required: true,
                    validation: { minLength: 50 },
                    placeholder: 'Take your time to share what\'s been on your mind...'
                },
                {
                    id: 'goals',
                    name: 'goals',
                    label: 'What do you hope to achieve through therapy?',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Your therapy goals...'
                }
            ]
        },
        {
            id: 'history',
            title: 'History',
            fields: [
                {
                    id: 'previous_therapy',
                    name: 'previous_therapy',
                    label: 'Have you been in therapy before?',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                    ]
                },
                {
                    id: 'previous_therapy_details',
                    name: 'previous_therapy_details',
                    label: 'If yes, please describe your previous therapy experience:',
                    type: 'textarea',
                    required: false,
                    conditional: { field: 'previous_therapy', value: 'yes' }
                },
                {
                    id: 'current_medications',
                    name: 'current_medications',
                    label: 'Are you currently taking any medications?',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                    ]
                },
                {
                    id: 'medication_details',
                    name: 'medication_details',
                    label: 'Please list current medications:',
                    type: 'textarea',
                    required: false,
                    conditional: { field: 'current_medications', value: 'yes' }
                }
            ]
        },
        {
            id: 'safety',
            title: 'Safety Assessment',
            description: 'These questions help us ensure your safety.',
            fields: [
                {
                    id: 'suicidal_thoughts',
                    name: 'suicidal_thoughts',
                    label: 'Have you had thoughts of hurting yourself or ending your life?',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: 'never', label: 'Never' },
                        { value: 'past', label: 'In the past, but not currently' },
                        { value: 'current', label: 'Yes, currently' },
                    ]
                },
                {
                    id: 'harm_others',
                    name: 'harm_others',
                    label: 'Have you had thoughts of hurting others?',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: 'never', label: 'Never' },
                        { value: 'past', label: 'In the past, but not currently' },
                        { value: 'current', label: 'Yes, currently' },
                    ]
                }
            ]
        }
    ]
};

const CONSENT_FORM: FormSchema = {
    id: 'consent-therapy',
    name: 'Informed Consent for Therapy',
    slug: 'consent',
    type: 'consent',
    description: 'Please read and acknowledge the following consent information.',
    version: 1,
    is_active: true,
    requires_signature: true,
    created_at: '2024-01-01',
    sections: [
        {
            id: 'confidentiality',
            title: 'Confidentiality',
            description: 'Your privacy is important to us. All information shared during therapy is confidential, with the following exceptions required by law:',
            fields: [
                {
                    id: 'confidentiality_ack',
                    name: 'confidentiality_ack',
                    label: 'I understand that my information is confidential except when: (1) I pose a danger to myself or others, (2) Child, elder, or dependent adult abuse is suspected, (3) A court order requires disclosure, (4) I provide written authorization.',
                    type: 'checkbox',
                    required: true
                }
            ]
        },
        {
            id: 'therapy_nature',
            title: 'Nature of Therapy',
            fields: [
                {
                    id: 'therapy_nature_ack',
                    name: 'therapy_nature_ack',
                    label: 'I understand that therapy involves discussing personal topics that may cause discomfort, and that there is no guarantee of specific outcomes.',
                    type: 'checkbox',
                    required: true
                }
            ]
        },
        {
            id: 'telehealth',
            title: 'Telehealth Consent',
            fields: [
                {
                    id: 'telehealth_ack',
                    name: 'telehealth_ack',
                    label: 'I consent to receiving therapy services via video/audio telehealth. I understand that while precautions are taken, electronic communications cannot be guaranteed to be 100% secure.',
                    type: 'checkbox',
                    required: true
                }
            ]
        },
        {
            id: 'cancellation',
            title: 'Cancellation Policy',
            fields: [
                {
                    id: 'cancellation_ack',
                    name: 'cancellation_ack',
                    label: 'I understand that I must provide at least 24 hours notice to cancel or reschedule an appointment, and that late cancellations may result in a fee.',
                    type: 'checkbox',
                    required: true
                }
            ]
        },
        {
            id: 'signature',
            title: 'Signature',
            fields: [
                {
                    id: 'signature',
                    name: 'signature',
                    label: 'Please sign below to indicate your agreement',
                    type: 'signature',
                    required: true
                },
                {
                    id: 'consent_date',
                    name: 'consent_date',
                    label: 'Date',
                    type: 'date',
                    required: true
                }
            ]
        }
    ]
};

const FEEDBACK_FORM: FormSchema = {
    id: 'feedback-session',
    name: 'Session Feedback',
    slug: 'feedback',
    type: 'feedback',
    description: 'Your feedback helps us improve our services.',
    version: 1,
    is_active: true,
    requires_signature: false,
    created_at: '2024-01-01',
    sections: [
        {
            id: 'experience',
            title: 'Your Experience',
            fields: [
                {
                    id: 'overall_rating',
                    name: 'overall_rating',
                    label: 'How would you rate your overall experience?',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: '5', label: 'Excellent' },
                        { value: '4', label: 'Good' },
                        { value: '3', label: 'Average' },
                        { value: '2', label: 'Below Average' },
                        { value: '1', label: 'Poor' },
                    ]
                },
                {
                    id: 'therapist_rating',
                    name: 'therapist_rating',
                    label: 'How helpful was your therapist?',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: '5', label: 'Extremely helpful' },
                        { value: '4', label: 'Very helpful' },
                        { value: '3', label: 'Somewhat helpful' },
                        { value: '2', label: 'Not very helpful' },
                        { value: '1', label: 'Not helpful at all' },
                    ]
                },
                {
                    id: 'felt_heard',
                    name: 'felt_heard',
                    label: 'Did you feel heard and understood?',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: 'yes', label: 'Yes, completely' },
                        { value: 'mostly', label: 'For the most part' },
                        { value: 'somewhat', label: 'Somewhat' },
                        { value: 'no', label: 'Not really' },
                    ]
                },
                {
                    id: 'additional_feedback',
                    name: 'additional_feedback',
                    label: 'Any additional feedback or suggestions?',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Your feedback helps us improve...'
                }
            ]
        }
    ]
};

const availableForms = [INTAKE_FORM, CONSENT_FORM, FEEDBACK_FORM];

// ==========================================
// Form Service Functions
// ==========================================

/**
 * Fetch all active forms
 */
export async function fetchForms(type?: string): Promise<FormSchema[]> {
    try {
        let query = supabase
            .from('forms')
            .select('*')
            .eq('is_active', true);

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) throw error;
        if (data && data.length > 0) {
            return data as FormSchema[];
        }
    } catch (error) {
        console.log('Using built-in forms');
    }

    return type
        ? availableForms.filter(f => f.type === type)
        : availableForms;
}

/**
 * Get form by slug
 */
export async function getFormBySlug(slug: string): Promise<FormSchema | null> {
    try {
        const { data, error } = await supabase
            .from('forms')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) throw error;
        return data as FormSchema;
    } catch (error) {
        console.log('Using built-in form');
    }

    return availableForms.find(f => f.slug === slug) || null;
}

/**
 * Submit form
 */
export async function submitForm(
    formId: string,
    userId: string,
    data: Record<string, unknown>,
    bookingId?: string,
    signatureData?: string
): Promise<{ submission: FormSubmission | null; error: string | null }> {
    const form = availableForms.find(f => f.id === formId);
    if (!form) {
        return { submission: null, error: 'Form not found' };
    }

    const submissionData = {
        form_id: formId,
        user_id: userId,
        booking_id: bookingId || null,
        data,
        version: form.version,
        signature_data: signatureData
    };

    try {
        const { data: result, error } = await supabase
            .from('form_submissions')
            .insert(submissionData)
            .select()
            .single();

        if (error) throw error;
        return { submission: result as FormSubmission, error: null };
    } catch (error) {
        // Return mock submission for development
        const mockSubmission: FormSubmission = {
            id: `sub_${Date.now()}`,
            ...submissionData,
            submitted_at: new Date().toISOString()
        };
        return { submission: mockSubmission, error: null };
    }
}

/**
 * Get user's form submissions
 */
export async function getUserSubmissions(userId: string): Promise<FormSubmission[]> {
    try {
        const { data, error } = await supabase
            .from('form_submissions')
            .select('*')
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return data as FormSubmission[];
    } catch (error) {
        return [];
    }
}

/**
 * Check if user has completed required forms for booking
 */
export async function checkRequiredForms(
    userId: string,
    requiredFormTypes: string[]
): Promise<{ complete: boolean; missing: string[] }> {
    const submissions = await getUserSubmissions(userId);
    const submittedFormIds = new Set(submissions.map(s => s.form_id));

    const missing: string[] = [];

    for (const formType of requiredFormTypes) {
        const form = availableForms.find(f => f.type === formType);
        if (form && !submittedFormIds.has(form.id)) {
            missing.push(form.name);
        }
    }

    return {
        complete: missing.length === 0,
        missing
    };
}

/**
 * Validate form data against schema
 */
export function validateFormData(
    form: FormSchema,
    data: Record<string, unknown>
): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const section of form.sections) {
        for (const field of section.fields) {
            const value = data[field.name];

            // Check required
            if (field.required && (value === undefined || value === null || value === '')) {
                errors[field.name] = `${field.label} is required`;
                continue;
            }

            // Skip validation if not required and empty
            if (!value) continue;

            // Check validation rules
            if (field.validation) {
                if (field.validation.minLength && String(value).length < field.validation.minLength) {
                    errors[field.name] = `${field.label} must be at least ${field.validation.minLength} characters`;
                }
                if (field.validation.maxLength && String(value).length > field.validation.maxLength) {
                    errors[field.name] = `${field.label} must be less than ${field.validation.maxLength} characters`;
                }
                if (field.validation.pattern) {
                    const regex = new RegExp(field.validation.pattern);
                    if (!regex.test(String(value))) {
                        errors[field.name] = `${field.label} format is invalid`;
                    }
                }
            }
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

export default {
    fetchForms,
    getFormBySlug,
    submitForm,
    getUserSubmissions,
    checkRequiredForms,
    validateFormData
};
