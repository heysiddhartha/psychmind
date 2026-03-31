// Prescription Service - Create, manage and share prescriptions
import { supabase } from '@/lib/supabase';

export interface PrescriptionMedicine {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

export interface Prescription {
    id: string;
    booking_id: string;
    therapist_id: string;
    patient_id: string;
    patient_name?: string;
    therapist_name?: string;
    diagnosis: string;
    medicines: PrescriptionMedicine[];
    advice?: string;
    follow_up_date?: string;
    pdf_url?: string;
    created_at: string;
    updated_at?: string;
}

export interface CreatePrescriptionInput {
    booking_id: string;
    therapist_id: string;
    patient_id: string;
    diagnosis: string;
    medicines: PrescriptionMedicine[];
    advice?: string;
    follow_up_date?: string;
}

/**
 * Create a new prescription
 */
export async function createPrescription(
    input: CreatePrescriptionInput
): Promise<{ data: Prescription | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('prescriptions')
            .insert({
                booking_id: input.booking_id,
                therapist_id: input.therapist_id,
                patient_id: input.patient_id,
                diagnosis: input.diagnosis,
                medicines: input.medicines,
                advice: input.advice,
                follow_up_date: input.follow_up_date,
            })
            .select()
            .single();

        if (error) {
            return { data: null, error: new Error(error.message) };
        }

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Update an existing prescription
 */
export async function updatePrescription(
    prescriptionId: string,
    updates: Partial<CreatePrescriptionInput>
): Promise<{ data: Prescription | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('prescriptions')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', prescriptionId)
            .select()
            .single();

        if (error) {
            return { data: null, error: new Error(error.message) };
        }

        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Get prescription by ID
 */
export async function getPrescription(
    prescriptionId: string
): Promise<{ data: Prescription | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                patient:users!prescriptions_patient_id_fkey(full_name),
                therapist:therapists!prescriptions_therapist_id_fkey(
                    user:users!therapists_user_id_fkey(full_name)
                )
            `)
            .eq('id', prescriptionId)
            .single();

        if (error) {
            return { data: null, error: new Error(error.message) };
        }

        // Transform data
        const prescription: Prescription = {
            ...data,
            patient_name: data.patient?.full_name,
            therapist_name: data.therapist?.user?.full_name,
        };

        return { data: prescription, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Get prescriptions for a patient
 */
export async function getPatientPrescriptions(
    patientId: string
): Promise<{ data: Prescription[]; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                therapist:therapists!prescriptions_therapist_id_fkey(
                    user:users!therapists_user_id_fkey(full_name)
                )
            `)
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) {
            return { data: [], error: new Error(error.message) };
        }

        const prescriptions: Prescription[] = (data || []).map(p => ({
            ...p,
            therapist_name: p.therapist?.user?.full_name,
        }));

        return { data: prescriptions, error: null };
    } catch (error) {
        return { data: [], error: error as Error };
    }
}

/**
 * Get prescriptions written by a therapist
 */
export async function getTherapistPrescriptions(
    therapistId: string
): Promise<{ data: Prescription[]; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                patient:users!prescriptions_patient_id_fkey(full_name)
            `)
            .eq('therapist_id', therapistId)
            .order('created_at', { ascending: false });

        if (error) {
            return { data: [], error: new Error(error.message) };
        }

        const prescriptions: Prescription[] = (data || []).map(p => ({
            ...p,
            patient_name: p.patient?.full_name,
        }));

        return { data: prescriptions, error: null };
    } catch (error) {
        return { data: [], error: error as Error };
    }
}

/**
 * Get prescription for a booking
 */
export async function getBookingPrescription(
    bookingId: string
): Promise<{ data: Prescription | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                patient:users!prescriptions_patient_id_fkey(full_name),
                therapist:therapists!prescriptions_therapist_id_fkey(
                    user:users!therapists_user_id_fkey(full_name)
                )
            `)
            .eq('booking_id', bookingId)
            .single();

        if (error && error.code !== 'PGRST116') { // Not found is ok
            return { data: null, error: new Error(error.message) };
        }

        if (!data) {
            return { data: null, error: null };
        }

        const prescription: Prescription = {
            ...data,
            patient_name: data.patient?.full_name,
            therapist_name: data.therapist?.user?.full_name,
        };

        return { data: prescription, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Save PDF URL to prescription
 */
export async function savePrescriptionPdf(
    prescriptionId: string,
    pdfUrl: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('prescriptions')
            .update({ pdf_url: pdfUrl })
            .eq('id', prescriptionId);

        if (error) {
            return { error: new Error(error.message) };
        }

        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Generate prescription HTML for PDF
 */
export function generatePrescriptionHtml(prescription: Prescription): string {
    const currentDate = new Date(prescription.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const followUpDate = prescription.follow_up_date 
        ? new Date(prescription.follow_up_date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
        : null;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Prescription - ${prescription.patient_name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: white;
            color: #333;
        }
        .header {
            border-bottom: 3px solid #0891b2;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .clinic-name {
            font-size: 24px;
            font-weight: bold;
            color: #0891b2;
            margin-bottom: 5px;
        }
        .clinic-tagline {
            color: #666;
            font-size: 14px;
        }
        .rx-symbol {
            font-size: 32px;
            font-weight: bold;
            color: #0891b2;
            margin: 20px 0;
        }
        .patient-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
        }
        .info-item label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-item p {
            font-size: 16px;
            font-weight: 500;
            margin-top: 4px;
        }
        .diagnosis {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin-bottom: 30px;
            border-radius: 0 8px 8px 0;
        }
        .diagnosis-label {
            font-size: 12px;
            color: #92400e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .diagnosis-text {
            font-size: 16px;
            font-weight: 500;
            color: #78350f;
        }
        .medicines {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        .medicine-item {
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .medicine-name {
            font-size: 16px;
            font-weight: 600;
            color: #0891b2;
            margin-bottom: 8px;
        }
        .medicine-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            font-size: 14px;
        }
        .medicine-detail label {
            font-size: 11px;
            color: #666;
            display: block;
        }
        .medicine-instructions {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px dashed #e5e7eb;
            font-size: 13px;
            color: #666;
            font-style: italic;
        }
        .advice {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 15px 20px;
            margin-bottom: 30px;
            border-radius: 0 8px 8px 0;
        }
        .advice-label {
            font-size: 12px;
            color: #166534;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .advice-text {
            font-size: 14px;
            color: #15803d;
            line-height: 1.6;
        }
        .follow-up {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px 20px;
            margin-bottom: 30px;
            border-radius: 0 8px 8px 0;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
        }
        .signature {
            text-align: right;
        }
        .signature-line {
            border-top: 1px solid #333;
            width: 200px;
            margin-top: 50px;
            padding-top: 10px;
        }
        .doctor-name {
            font-weight: 600;
        }
        .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            color: #e5e7eb;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="clinic-name">3tree Counseling</div>
        <div class="clinic-tagline">Professional Mental Health Services</div>
    </div>

    <div class="rx-symbol">℞</div>

    <div class="patient-info">
        <div class="info-item">
            <label>Patient Name</label>
            <p>${prescription.patient_name || 'N/A'}</p>
        </div>
        <div class="info-item">
            <label>Date</label>
            <p>${currentDate}</p>
        </div>
        <div class="info-item">
            <label>Therapist</label>
            <p>Dr. ${prescription.therapist_name || 'N/A'}</p>
        </div>
        <div class="info-item">
            <label>Prescription ID</label>
            <p>${prescription.id.slice(0, 8).toUpperCase()}</p>
        </div>
    </div>

    <div class="diagnosis">
        <div class="diagnosis-label">Diagnosis / Clinical Impression</div>
        <div class="diagnosis-text">${prescription.diagnosis}</div>
    </div>

    <div class="medicines">
        <div class="section-title">Prescribed Medications</div>
        ${prescription.medicines.map((med, index) => `
            <div class="medicine-item">
                <div class="medicine-name">${index + 1}. ${med.name}</div>
                <div class="medicine-details">
                    <div>
                        <label>Dosage</label>
                        <span>${med.dosage}</span>
                    </div>
                    <div>
                        <label>Frequency</label>
                        <span>${med.frequency}</span>
                    </div>
                    <div>
                        <label>Duration</label>
                        <span>${med.duration}</span>
                    </div>
                </div>
                ${med.instructions ? `<div class="medicine-instructions">📝 ${med.instructions}</div>` : ''}
            </div>
        `).join('')}
    </div>

    ${prescription.advice ? `
    <div class="advice">
        <div class="advice-label">Advice & Recommendations</div>
        <div class="advice-text">${prescription.advice}</div>
    </div>
    ` : ''}

    ${followUpDate ? `
    <div class="follow-up">
        <div class="advice-label">Follow-up Appointment</div>
        <div class="advice-text">Please schedule your next appointment on or before <strong>${followUpDate}</strong></div>
    </div>
    ` : ''}

    <div class="footer">
        <div>
            <p style="font-size: 12px; color: #666;">This is a computer-generated prescription.</p>
            <p style="font-size: 12px; color: #666;">Valid for consultation purposes only.</p>
        </div>
        <div class="signature">
            <div class="signature-line">
                <div class="doctor-name">Dr. ${prescription.therapist_name || 'N/A'}</div>
                <div style="font-size: 12px; color: #666;">Licensed Therapist</div>
            </div>
        </div>
    </div>

    <div class="watermark">3tree Counseling • www.the3tree.com</div>
</body>
</html>
    `;
}
