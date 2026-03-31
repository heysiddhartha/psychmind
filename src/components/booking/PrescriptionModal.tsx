/**
 * PrescriptionModal - In-meeting prescription writing component
 * Allows therapists to write prescriptions during video calls
 */

import { useState, useEffect } from 'react';
import {
    X, Plus, Trash2, Save, FileText, Download, Send, Loader2,
    AlertCircle, CheckCircle2, Pill
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    createPrescription,
    updatePrescription,
    getBookingPrescription,
    generatePrescriptionHtml,
    PrescriptionMedicine,
    Prescription
} from '@/lib/services/prescriptionService';
import { sendMessage, getOrCreateConversation } from '@/lib/services/messageService';

interface PrescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    therapistId: string;
    patientId: string;
    patientName: string;
    therapistName: string;
}

const EMPTY_MEDICINE: PrescriptionMedicine = {
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
};

const FREQUENCY_OPTIONS = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime',
    'Morning only',
    'Evening only'
];

const DURATION_OPTIONS = [
    '1 week',
    '2 weeks',
    '3 weeks',
    '1 month',
    '2 months',
    '3 months',
    '6 months',
    'Ongoing',
    'Until next visit'
];

export default function PrescriptionModal({
    isOpen,
    onClose,
    bookingId,
    therapistId,
    patientId,
    patientName,
    therapistName
}: PrescriptionModalProps) {
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [existingPrescription, setExistingPrescription] = useState<Prescription | null>(null);
    
    // Form state
    const [diagnosis, setDiagnosis] = useState('');
    const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([{ ...EMPTY_MEDICINE }]);
    const [advice, setAdvice] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');

    // Load existing prescription if any
    useEffect(() => {
        if (isOpen && bookingId) {
            loadExistingPrescription();
        }
    }, [isOpen, bookingId]);

    const loadExistingPrescription = async () => {
        setLoading(true);
        try {
            const { data, error } = await getBookingPrescription(bookingId);
            if (data) {
                setExistingPrescription(data);
                setDiagnosis(data.diagnosis || '');
                setMedicines(data.medicines?.length > 0 ? data.medicines : [{ ...EMPTY_MEDICINE }]);
                setAdvice(data.advice || '');
                setFollowUpDate(data.follow_up_date || '');
            }
        } catch (err) {
            console.error('Error loading prescription:', err);
        } finally {
            setLoading(false);
        }
    };

    const addMedicine = () => {
        setMedicines([...medicines, { ...EMPTY_MEDICINE }]);
    };

    const removeMedicine = (index: number) => {
        if (medicines.length > 1) {
            setMedicines(medicines.filter((_, i) => i !== index));
        }
    };

    const updateMedicine = (index: number, field: keyof PrescriptionMedicine, value: string) => {
        const updated = [...medicines];
        updated[index] = { ...updated[index], [field]: value };
        setMedicines(updated);
    };

    const validateForm = () => {
        if (!diagnosis.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a diagnosis',
                variant: 'destructive'
            });
            return false;
        }

        const validMedicines = medicines.filter(m => m.name.trim());
        if (validMedicines.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'Please add at least one medication',
                variant: 'destructive'
            });
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const validMedicines = medicines.filter(m => m.name.trim());
            
            if (existingPrescription) {
                // Update existing
                const { data, error } = await updatePrescription(existingPrescription.id, {
                    diagnosis,
                    medicines: validMedicines,
                    advice,
                    follow_up_date: followUpDate || undefined
                });

                if (error) throw error;
                setExistingPrescription(data);
            } else {
                // Create new
                const { data, error } = await createPrescription({
                    booking_id: bookingId,
                    therapist_id: therapistId,
                    patient_id: patientId,
                    diagnosis,
                    medicines: validMedicines,
                    advice,
                    follow_up_date: followUpDate || undefined
                });

                if (error) throw error;
                setExistingPrescription(data);
            }

            toast({
                title: '✓ Prescription Saved',
                description: 'The prescription has been saved successfully.'
            });
        } catch (err) {
            console.error('Error saving prescription:', err);
            toast({
                title: 'Error',
                description: 'Failed to save prescription. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!existingPrescription) {
            toast({
                title: 'Save First',
                description: 'Please save the prescription before downloading.',
                variant: 'destructive'
            });
            return;
        }

        try {
            const html = generatePrescriptionHtml({
                ...existingPrescription,
                patient_name: patientName,
                therapist_name: therapistName
            });

            // Create a new window and print as PDF
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(html);
                printWindow.document.close();
                printWindow.focus();
                
                // Delay print to allow styles to load
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            }
        } catch (err) {
            console.error('Error generating PDF:', err);
            toast({
                title: 'Error',
                description: 'Failed to generate PDF. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const handleSendToPatient = async () => {
        if (!existingPrescription) {
            toast({
                title: 'Save First',
                description: 'Please save the prescription before sending.',
                variant: 'destructive'
            });
            return;
        }

        setSending(true);
        try {
            // Get or create conversation
            const { data: conversation, error: convError } = await getOrCreateConversation(
                therapistId,
                patientId
            );

            if (convError || !conversation) {
                throw new Error('Could not create conversation');
            }

            // Format prescription as message
            const messageContent = formatPrescriptionMessage(existingPrescription, patientName, therapistName);

            // Send message
            const { error: sendError } = await sendMessage(
                conversation.id,
                therapistId,
                messageContent,
                patientId
            );

            if (sendError) throw sendError;

            toast({
                title: '✓ Prescription Sent',
                description: `Prescription has been sent to ${patientName}'s messages.`
            });
        } catch (err) {
            console.error('Error sending prescription:', err);
            toast({
                title: 'Error',
                description: 'Failed to send prescription. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Write Prescription</h2>
                            <p className="text-sm text-cyan-100">Patient: {patientName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                        </div>
                    ) : (
                        <>
                            {/* Status Badge */}
                            {existingPrescription && (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">Prescription saved</span>
                                </div>
                            )}

                            {/* Diagnosis */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Diagnosis / Clinical Impression *
                                </label>
                                <textarea
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    placeholder="Enter diagnosis, clinical impression, or reason for prescription..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none"
                                    rows={2}
                                />
                            </div>

                            {/* Medications */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Pill className="w-4 h-4 text-cyan-500" />
                                        Medications *
                                    </label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addMedicine}
                                        className="text-cyan-600 border-cyan-200 hover:bg-cyan-50"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Medicine
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {medicines.map((medicine, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-500">
                                                    Medicine #{index + 1}
                                                </span>
                                                {medicines.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMedicine(index)}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="md:col-span-2">
                                                    <input
                                                        type="text"
                                                        value={medicine.name}
                                                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                                        placeholder="Medicine name"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={medicine.dosage}
                                                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                                    placeholder="Dosage (e.g., 10mg, 20mg)"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                                                />
                                                <select
                                                    value={medicine.frequency}
                                                    onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm bg-white"
                                                >
                                                    <option value="">Select frequency</option>
                                                    {FREQUENCY_OPTIONS.map(f => (
                                                        <option key={f} value={f}>{f}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={medicine.duration}
                                                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm bg-white"
                                                >
                                                    <option value="">Select duration</option>
                                                    {DURATION_OPTIONS.map(d => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    value={medicine.instructions}
                                                    onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                                                    placeholder="Special instructions (optional)"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Advice */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Advice & Recommendations
                                </label>
                                <textarea
                                    value={advice}
                                    onChange={(e) => setAdvice(e.target.value)}
                                    placeholder="Lifestyle recommendations, precautions, dietary advice..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Follow-up Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Follow-up Date
                                </label>
                                <input
                                    type="date"
                                    value={followUpDate}
                                    onChange={(e) => setFollowUpDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleDownloadPdf}
                            disabled={!existingPrescription}
                            className="text-gray-600"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleSendToPatient}
                            disabled={!existingPrescription || sending}
                            className="text-cyan-600 border-cyan-200 hover:bg-cyan-50"
                        >
                            {sending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Send to Patient
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Save Prescription
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Format prescription as a message
 */
function formatPrescriptionMessage(
    prescription: Prescription,
    patientName: string,
    therapistName: string
): string {
    const date = new Date(prescription.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    let message = `📋 *PRESCRIPTION*\n`;
    message += `━━━━━━━━━━━━━━━━━━\n\n`;
    message += `👤 Patient: ${patientName}\n`;
    message += `👨‍⚕️ Doctor: Dr. ${therapistName}\n`;
    message += `📅 Date: ${date}\n\n`;
    message += `🔹 *Diagnosis:*\n${prescription.diagnosis}\n\n`;
    message += `💊 *Medications:*\n`;
    
    prescription.medicines.forEach((med, index) => {
        message += `\n${index + 1}. ${med.name}\n`;
        message += `   • Dosage: ${med.dosage}\n`;
        message += `   • Frequency: ${med.frequency}\n`;
        message += `   • Duration: ${med.duration}\n`;
        if (med.instructions) {
            message += `   • Note: ${med.instructions}\n`;
        }
    });

    if (prescription.advice) {
        message += `\n📝 *Advice:*\n${prescription.advice}\n`;
    }

    if (prescription.follow_up_date) {
        const followUp = new Date(prescription.follow_up_date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        message += `\n📆 *Follow-up:* ${followUp}\n`;
    }

    message += `\n━━━━━━━━━━━━━━━━━━\n`;
    message += `🏥 3tree Counseling`;

    return message;
}
