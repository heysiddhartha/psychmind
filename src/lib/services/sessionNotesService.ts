// Session Notes Service - Therapist documentation for patient sessions
import { supabase } from '@/lib/supabase';

// ==========================================
// Types
// ==========================================

export interface SessionNote {
    id: string;
    booking_id: string;
    therapist_id: string;
    patient_id: string;
    // SOAP Format
    subjective: string;      // Patient's reported symptoms/concerns
    objective: string;       // Therapist's observations
    assessment: string;      // Clinical assessment/diagnosis
    plan: string;           // Treatment plan/next steps
    // Additional fields
    session_goals?: string;
    interventions?: string[];
    progress_notes?: string;
    homework_assigned?: string;
    risk_assessment?: string;
    // Metadata
    is_signed: boolean;
    signed_at?: string;
    pdf_url?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateSessionNoteData {
    booking_id: string;
    patient_id: string;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    session_goals?: string;
    interventions?: string[];
    progress_notes?: string;
    homework_assigned?: string;
    risk_assessment?: string;
}

export interface SessionNoteSummary {
    id: string;
    booking_id: string;
    patient_name: string;
    session_date: string;
    is_signed: boolean;
    created_at: string;
}

// ==========================================
// Session Notes CRUD
// ==========================================

export async function createSessionNote(
    therapistId: string,
    data: CreateSessionNoteData
): Promise<{ data: SessionNote | null; error: Error | null }> {
    try {
        const { data: note, error } = await supabase
            .from('session_notes')
            .insert({
                booking_id: data.booking_id,
                therapist_id: therapistId,
                patient_id: data.patient_id,
                subjective: data.subjective || '',
                objective: data.objective || '',
                assessment: data.assessment || '',
                plan: data.plan || '',
                session_goals: data.session_goals,
                interventions: data.interventions || [],
                progress_notes: data.progress_notes,
                homework_assigned: data.homework_assigned,
                risk_assessment: data.risk_assessment,
                is_signed: false,
            })
            .select()
            .single();

        if (error) {
            return { data: null, error: new Error(error.message) };
        }

        return { data: note, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

export async function getSessionNote(
    noteId: string
): Promise<{ data: SessionNote | null; error: Error | null }> {
    try {
        const { data: note, error } = await supabase
            .from('session_notes')
            .select('*')
            .eq('id', noteId)
            .single();

        if (error) {
            return { data: null, error: new Error(error.message) };
        }

        return { data: note, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

export async function getSessionNoteByBooking(
    bookingId: string
): Promise<{ data: SessionNote | null; error: Error | null }> {
    try {
        const { data: note, error } = await supabase
            .from('session_notes')
            .select('*')
            .eq('booking_id', bookingId)
            .maybeSingle();

        if (error) {
            return { data: null, error: new Error(error.message) };
        }

        return { data: note, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

export async function getTherapistNotes(
    therapistId: string,
    options?: { limit?: number; patientId?: string; signed?: boolean }
): Promise<{ data: SessionNote[]; error: Error | null }> {
    try {
        let query = supabase
            .from('session_notes')
            .select('*')
            .eq('therapist_id', therapistId)
            .order('created_at', { ascending: false });

        if (options?.patientId) {
            query = query.eq('patient_id', options.patientId);
        }

        if (options?.signed !== undefined) {
            query = query.eq('is_signed', options.signed);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data: notes, error } = await query;

        if (error) {
            return { data: [], error: new Error(error.message) };
        }

        return { data: notes || [], error: null };
    } catch (error) {
        return { data: [], error: error as Error };
    }
}

export async function getPatientNotes(
    patientId: string,
    options?: { limit?: number }
): Promise<{ data: SessionNote[]; error: Error | null }> {
    try {
        let query = supabase
            .from('session_notes')
            .select('*')
            .eq('patient_id', patientId)
            .eq('is_signed', true) // Patients can only see signed notes
            .order('created_at', { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data: notes, error } = await query;

        if (error) {
            return { data: [], error: new Error(error.message) };
        }

        return { data: notes || [], error: null };
    } catch (error) {
        return { data: [], error: error as Error };
    }
}

export async function updateSessionNote(
    noteId: string,
    updates: Partial<SessionNote>
): Promise<{ error: Error | null }> {
    try {
        // Don't allow updating signed notes
        const { data: existingNote } = await supabase
            .from('session_notes')
            .select('is_signed')
            .eq('id', noteId)
            .single();

        if (existingNote?.is_signed) {
            return { error: new Error('Cannot modify signed session notes') };
        }

        const { error } = await supabase
            .from('session_notes')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', noteId);

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

export async function signSessionNote(
    noteId: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('session_notes')
            .update({
                is_signed: true,
                signed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', noteId);

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

export async function deleteSessionNote(
    noteId: string
): Promise<{ error: Error | null }> {
    try {
        // Don't allow deleting signed notes
        const { data: existingNote } = await supabase
            .from('session_notes')
            .select('is_signed')
            .eq('id', noteId)
            .single();

        if (existingNote?.is_signed) {
            return { error: new Error('Cannot delete signed session notes') };
        }

        const { error } = await supabase
            .from('session_notes')
            .delete()
            .eq('id', noteId);

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

// ==========================================
// Templates
// ==========================================

export const NOTE_TEMPLATES = {
    initial_assessment: {
        name: 'Initial Assessment',
        subjective: 'Chief complaint:\nHistory of present illness:\nPsychiatric history:\nSubstance use history:\nFamily history:\nSocial history:',
        objective: 'Mental status exam:\n- Appearance:\n- Behavior:\n- Speech:\n- Mood:\n- Affect:\n- Thought process:\n- Thought content:\n- Perceptions:\n- Cognition:\n- Insight/Judgment:',
        assessment: 'Diagnostic impressions:\n1.\n2.\nRisk assessment:\n- Suicidal ideation:\n- Homicidal ideation:\n- Self-harm:',
        plan: 'Treatment plan:\n1.\n2.\n3.\nFollow-up:',
    },
    follow_up: {
        name: 'Follow-up Session',
        subjective: 'Interval history since last visit:\nCurrent symptoms:\nMedication adherence:\nSide effects:',
        objective: 'Mental status changes:\nBehavioral observations:',
        assessment: 'Progress toward goals:\nCurrent functioning:',
        plan: 'Adjustments to treatment:\nHomework/exercises:\nNext session focus:',
    },
    crisis: {
        name: 'Crisis Session',
        subjective: 'Precipitating event:\nCurrent safety status:\nCoping strategies used:',
        objective: 'Risk level assessment:\nSupport system availability:',
        assessment: 'Immediate safety plan:\nNeed for higher level of care:',
        plan: 'Crisis intervention provided:\nSafety plan developed:\nFollow-up timeline:',
    },
};

// ==========================================
// Helpers
// ==========================================

export function formatNoteDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function calculateNotesStats(notes: SessionNote[]): {
    total: number;
    signed: number;
    unsigned: number;
    thisMonth: number;
} {
    const now = new Date();
    const thisMonth = notes.filter(n => {
        const noteDate = new Date(n.created_at);
        return noteDate.getMonth() === now.getMonth() && noteDate.getFullYear() === now.getFullYear();
    });

    return {
        total: notes.length,
        signed: notes.filter(n => n.is_signed).length,
        unsigned: notes.filter(n => !n.is_signed).length,
        thisMonth: thisMonth.length,
    };
}
