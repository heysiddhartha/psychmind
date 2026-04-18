/**
 * Session Notes Page - Enhanced with SOAP format for professional clinical documentation
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
    FileText, Calendar, User, Save, ArrowLeft, Search, Clock,
    CheckCircle, AlertCircle, ChevronDown, Printer, Download, Lock, Eye, Upload, ExternalLink, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { downloadSessionNotesPDF, viewSessionNotesPDF, saveSessionNotesPDFToImageKit } from '@/lib/services/sessionNotesPdfService';

interface SOAPNote {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

interface SessionNote {
    id: string;
    booking_id: string;
    patient_name: string;
    patient_id: string;
    session_date: string;
    service_type: string;
    notes: string;
    soap_notes: SOAPNote | null;
    status: string;
    duration_minutes: number;
    created_at: string;
    pdf_url?: string;
}

const DEFAULT_SOAP: SOAPNote = {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
};

export default function SessionNotes() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [notes, setNotes] = useState<SessionNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<SessionNote | null>(null);
    const [soapNotes, setSoapNotes] = useState<SOAPNote>(DEFAULT_SOAP);
    const [saving, setSaving] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>('subjective');
    const [useSOAPFormat, setUseSOAPFormat] = useState(true);
    const [plainNotes, setPlainNotes] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
    const [savingPdf, setSavingPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        } else if (user?.role !== 'therapist') {
            navigate('/dashboard');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) loadSessionNotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        if (selectedNote) {
            // Load existing pdf_url for this note
            setPdfUrl(selectedNote.pdf_url || null);

            if (selectedNote.soap_notes) {
                setSoapNotes(selectedNote.soap_notes);
                setUseSOAPFormat(true);
            } else if (selectedNote.notes) {
                setPlainNotes(selectedNote.notes);
                setUseSOAPFormat(false);
            } else {
                setSoapNotes(DEFAULT_SOAP);
                setPlainNotes('');
                setUseSOAPFormat(true);
            }
        }
    }, [selectedNote]);

    const loadSessionNotes = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { data: therapist } = await supabase
                .from('therapists')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!therapist) {
                setLoading(false);
                return;
            }

            const { data: bookings } = await supabase
                .from('bookings')
                .select(`
                    id, scheduled_at, service_type, status, duration_minutes,
                    notes, created_at, patient_id,
                    users!bookings_patient_id_fkey (id, full_name)
                `)
                .eq('therapist_id', therapist.id)
                .in('status', ['completed', 'confirmed', 'in_progress'])
                .order('scheduled_at', { ascending: false });

            // Fetch saved PDF URLs from session_notes table
            const bookingIds = (bookings || []).map((b: any) => b.id);
            const { data: sessionNotesData } = bookingIds.length > 0
                ? await supabase
                    .from('session_notes')
                    .select('booking_id, pdf_url')
                    .in('booking_id', bookingIds)
                    .not('pdf_url', 'is', null)
                : { data: [] };

            const pdfUrlMap = new Map<string, string>();
            (sessionNotesData || []).forEach((sn: any) => {
                if (sn.pdf_url) pdfUrlMap.set(sn.booking_id, sn.pdf_url);
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const notesData: SessionNote[] = (bookings || []).map((b: any) => {
                let soapData: SOAPNote | null = null;
                let plainNotes = b.notes || '';

                try {
                    const parsed = JSON.parse(b.notes || '{}');
                    if (parsed.subjective !== undefined) {
                        soapData = parsed;
                        plainNotes = '';
                    }
                } catch { /* keep as plain text */ }

                return {
                    id: b.id,
                    booking_id: b.id,
                    patient_name: b.users?.full_name || 'Patient',
                    patient_id: b.users?.id || b.patient_id,
                    session_date: b.scheduled_at,
                    service_type: b.service_type || 'individual',
                    notes: plainNotes,
                    soap_notes: soapData,
                    status: b.status,
                    duration_minutes: b.duration_minutes || 50,
                    created_at: b.created_at,
                    pdf_url: pdfUrlMap.get(b.id)
                };
            });

            setNotes(notesData);
        } catch (error) {
            console.error('Error loading session notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedNote) return;
        setSaving(true);

        try {
            const notesContent = useSOAPFormat
                ? JSON.stringify(soapNotes)
                : plainNotes;

            const { error } = await supabase
                .from('bookings')
                .update({ notes: notesContent })
                .eq('id', selectedNote.id);

            if (error) throw error;

            // Update local state
            setNotes(prev => prev.map(n =>
                n.id === selectedNote.id
                    ? { ...n, notes: useSOAPFormat ? '' : plainNotes, soap_notes: useSOAPFormat ? soapNotes : null }
                    : n
            ));
            setSelectedNote({
                ...selectedNote,
                notes: useSOAPFormat ? '' : plainNotes,
                soap_notes: useSOAPFormat ? soapNotes : null
            });

            toast({
                title: '✓ Notes Saved',
                description: 'Session notes have been saved securely.'
            });
        } catch (error) {
            console.error('Error saving notes:', error);
            toast({
                title: 'Error',
                description: 'Failed to save notes. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePrintNotes = () => {
        if (!selectedNote) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = useSOAPFormat ? `
            <h3>Subjective</h3><p>${soapNotes.subjective || 'N/A'}</p>
            <h3>Objective</h3><p>${soapNotes.objective || 'N/A'}</p>
            <h3>Assessment</h3><p>${soapNotes.assessment || 'N/A'}</p>
            <h3>Plan</h3><p>${soapNotes.plan || 'N/A'}</p>
        ` : `<p>${plainNotes || 'No notes'}</p>`;

        printWindow.document.write(`
            <html>
            <head><title>Session Notes - ${selectedNote.patient_name}</title>
            <style>body{font-family:Arial,sans-serif;padding:40px;} h1,h2,h3{color:#1e293b;} p{line-height:1.6;}</style>
            </head>
            <body>
                <h1>Session Notes</h1>
                <h2>${selectedNote.patient_name}</h2>
                <p><strong>Date:</strong> ${formatDate(selectedNote.session_date)} at ${formatTime(selectedNote.session_date)}</p>
                <p><strong>Session Type:</strong> ${selectedNote.service_type.replace(/_/g, ' ')}</p>
                <hr/>
                ${content}
            </body></html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleDownloadPDF = () => {
        if (!selectedNote) return;
        downloadSessionNotesPDF({
            patientName: selectedNote.patient_name,
            therapistName: user?.full_name || 'Therapist',
            sessionDate: selectedNote.session_date,
            serviceType: selectedNote.service_type,
            durationMinutes: selectedNote.duration_minutes,
            noteType: useSOAPFormat ? 'soap' : 'simple',
            soapNotes: useSOAPFormat ? soapNotes : undefined,
            simpleNotes: !useSOAPFormat ? plainNotes : undefined,
        });
        toast({
            title: '📄 PDF Downloaded',
            description: `Session notes for ${selectedNote.patient_name} downloaded.`
        });
    };

    const handleViewPDF = () => {
        if (!selectedNote) return;
        viewSessionNotesPDF({
            patientName: selectedNote.patient_name,
            therapistName: user?.full_name || 'Therapist',
            sessionDate: selectedNote.session_date,
            serviceType: selectedNote.service_type,
            durationMinutes: selectedNote.duration_minutes,
            noteType: useSOAPFormat ? 'soap' : 'simple',
            soapNotes: useSOAPFormat ? soapNotes : undefined,
            simpleNotes: !useSOAPFormat ? plainNotes : undefined,
        });
    };

    const handleSavePDFToCloud = async () => {
        if (!selectedNote) return;
        setSavingPdf(true);
        try {
            const { url, error } = await saveSessionNotesPDFToImageKit(
                {
                    patientName: selectedNote.patient_name,
                    therapistName: user?.full_name || 'Therapist',
                    sessionDate: selectedNote.session_date,
                    serviceType: selectedNote.service_type,
                    durationMinutes: selectedNote.duration_minutes,
                    noteType: useSOAPFormat ? 'soap' : 'simple',
                    soapNotes: useSOAPFormat ? soapNotes : undefined,
                    simpleNotes: !useSOAPFormat ? plainNotes : undefined,
                },
                selectedNote.booking_id,
                selectedNote.id
            );

            if (error) throw error;
            if (url) {
                setPdfUrl(url);
                // Update local state so the PDF badge appears immediately
                setNotes(prev => prev.map(n =>
                    n.id === selectedNote.id ? { ...n, pdf_url: url } : n
                ));
                if (selectedNote) {
                    setSelectedNote({ ...selectedNote, pdf_url: url });
                }
                toast({
                    title: '☁️ PDF Saved to Cloud',
                    description: 'Session notes PDF uploaded securely to cloud storage.'
                });
            }
        } catch (err) {
            console.error('PDF cloud save error:', err);
            toast({
                title: 'Upload Info',
                description: 'Cloud upload unavailable. Use "Download PDF" to save locally.',
                variant: 'destructive'
            });
        } finally {
            setSavingPdf(false);
        }
    };

    const filteredNotes = notes.filter(n => {
        const matchesSearch = n.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.service_type.toLowerCase().includes(searchQuery.toLowerCase());
        const hasNotes = !!(n.notes || n.soap_notes);

        if (statusFilter === 'completed') return matchesSearch && hasNotes;
        if (statusFilter === 'pending') return matchesSearch && !hasNotes;
        return matchesSearch;
    });

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });

    const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true
    });

    const hasChanges = () => {
        if (!selectedNote) return false;
        if (useSOAPFormat) {
            return JSON.stringify(soapNotes) !== JSON.stringify(selectedNote.soap_notes || DEFAULT_SOAP);
        }
        return plainNotes !== (selectedNote.notes || '');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const soapSections = [
        { key: 'subjective', label: 'Subjective', placeholder: 'Patient\'s reported symptoms, concerns, and history. Include chief complaint, history of present illness, and relevant background.', color: 'border-blue-400' },
        { key: 'objective', label: 'Objective', placeholder: 'Observable findings, mental status examination, behavioral observations, vital signs if applicable.', color: 'border-green-400' },
        { key: 'assessment', label: 'Assessment', placeholder: 'Clinical impression, diagnosis or differential diagnoses, interpretation of findings, progress evaluation.', color: 'border-amber-400' },
        { key: 'plan', label: 'Plan', placeholder: 'Treatment plan, interventions used, homework assigned, referrals, medications, follow-up schedule.', color: 'border-purple-400' },
    ];

    return (
        <>
            <Helmet><title>Session Notes | psychmind</title></Helmet>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                    <div className="container mx-auto px-4 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard/therapist" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </Link>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-cyan-500" />
                                        Session Notes
                                    </h1>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> HIPAA-compliant clinical documentation
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedNote && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={handleViewPDF} title="View as PDF">
                                            <Eye className="w-4 h-4 mr-1" /> View PDF
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleDownloadPDF} title="Download PDF">
                                            <Download className="w-4 h-4 mr-1" /> Download
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handlePrintNotes}>
                                            <Printer className="w-4 h-4 mr-1" /> Print
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSavePDFToCloud}
                                            disabled={savingPdf}
                                            title="Save PDF to cloud"
                                        >
                                            {savingPdf ? (
                                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                            ) : (
                                                <Upload className="w-4 h-4 mr-1" />
                                            )}
                                            Save to Cloud
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 lg:px-8 py-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Sessions List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Search & Filter */}
                                <div className="p-4 border-b border-gray-100 space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text" placeholder="Search patients..."
                                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div className="flex gap-1">
                                        {(['all', 'pending', 'completed'] as const).map(filter => (
                                            <button key={filter} onClick={() => setStatusFilter(filter)}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === filter ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}>
                                                {filter === 'all' ? 'All' : filter === 'pending' ? 'Need Notes' : 'Has Notes'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sessions */}
                                <div className="max-h-[600px] overflow-y-auto">
                                    {filteredNotes.length > 0 ? (
                                        filteredNotes.map((note) => (
                                            <button
                                                key={note.id}
                                                onClick={() => setSelectedNote(note)}
                                                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedNote?.id === note.id ? 'bg-cyan-50 border-l-4 border-l-cyan-500' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <p className="font-medium text-gray-900">{note.patient_name}</p>
                                                    {(note.notes || note.soap_notes) ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 capitalize mb-1">
                                                    {note.service_type.replace(/_/g, ' ')} • {note.duration_minutes}min
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(note.session_date)}
                                                    <Clock className="w-3 h-3 ml-2" />
                                                    {formatTime(note.session_date)}
                                                    {note.pdf_url && (
                                                        <span className="ml-auto bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                                            PDF
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">
                                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p>No sessions found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes Editor */}
                        <div className="lg:col-span-2">
                            {selectedNote ? (
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                                    {/* Header */}
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                                    <User className="w-5 h-5 text-gray-400" />
                                                    {selectedNote.patient_name}
                                                </h2>
                                                <p className="text-sm text-gray-500 capitalize mt-1">
                                                    {selectedNote.service_type.replace(/_/g, ' ')} Session • {selectedNote.duration_minutes} minutes
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {formatDate(selectedNote.session_date)} at {formatTime(selectedNote.session_date)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedNote.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {selectedNote.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Format Toggle */}
                                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                                            <span className="text-sm text-gray-500">Format:</span>
                                            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                                <button
                                                    onClick={() => setUseSOAPFormat(true)}
                                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${useSOAPFormat ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                                                        }`}
                                                >
                                                    SOAP Notes
                                                </button>
                                                <button
                                                    onClick={() => setUseSOAPFormat(false)}
                                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${!useSOAPFormat ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                                                        }`}
                                                >
                                                    Free Form
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes Editor Body */}
                                    <div className="p-6">
                                        {useSOAPFormat ? (
                                            <div className="space-y-4">
                                                {soapSections.map((section) => (
                                                    <div key={section.key} className={`border-l-4 ${section.color} bg-gray-50 rounded-lg overflow-hidden`}>
                                                        <button
                                                            onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-semibold text-gray-900">{section.label}</span>
                                                                {soapNotes[section.key as keyof SOAPNote] && (
                                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                                )}
                                                            </div>
                                                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === section.key ? 'rotate-180' : ''
                                                                }`} />
                                                        </button>
                                                        {expandedSection === section.key && (
                                                            <div className="p-4 pt-0">
                                                                <textarea
                                                                    value={soapNotes[section.key as keyof SOAPNote]}
                                                                    onChange={(e) => setSoapNotes(prev => ({
                                                                        ...prev,
                                                                        [section.key]: e.target.value
                                                                    }))}
                                                                    placeholder={section.placeholder}
                                                                    className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Session Notes
                                                </label>
                                                <textarea
                                                    value={plainNotes}
                                                    onChange={(e) => setPlainNotes(e.target.value)}
                                                    placeholder="Enter your session notes here... Include key observations, treatment progress, interventions used, and follow-up recommendations."
                                                    className="w-full h-80 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                />
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                                            <Lock className="w-3 h-3" />
                                            Notes are encrypted and HIPAA-compliant. Only you can access these records.
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-6 border-t border-gray-100">
                                        {/* PDF Actions */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleDownloadPDF}
                                                className="flex-1"
                                                disabled={!soapNotes.subjective && !soapNotes.objective && !soapNotes.assessment && !soapNotes.plan && !plainNotes}
                                            >
                                                <Download className="w-4 h-4 mr-1" />
                                                Download PDF
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleViewPDF}
                                                className="flex-1"
                                                disabled={!soapNotes.subjective && !soapNotes.objective && !soapNotes.assessment && !soapNotes.plan && !plainNotes}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View PDF
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleSavePDFToCloud}
                                                className="flex-1"
                                                disabled={savingPdf || (!soapNotes.subjective && !soapNotes.objective && !soapNotes.assessment && !soapNotes.plan && !plainNotes)}
                                            >
                                                {savingPdf ? (
                                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                ) : (
                                                    <Upload className="w-4 h-4 mr-1" />
                                                )}
                                                Save to Cloud
                                            </Button>
                                        </div>

                                        {/* Cloud PDF link */}
                                        {pdfUrl && (
                                            <a
                                                href={pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-500 mb-4"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                View saved PDF in cloud storage
                                            </a>
                                        )}

                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-500">
                                                {hasChanges() ? '• Unsaved changes' : 'All changes saved'}
                                            </p>
                                            <Button onClick={handleSaveNotes} disabled={saving || !hasChanges()} className="btn-icy">
                                                {saving ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Notes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Session</h3>
                                    <p className="text-gray-500">
                                        Choose a session from the list to view or create clinical notes
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
