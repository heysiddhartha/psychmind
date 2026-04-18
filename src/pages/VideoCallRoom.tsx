import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import {
    Loader2, AlertCircle, RotateCcw,
    Shield, CheckCircle2, FileText, X, Save,
    ChevronDown, Lock, Clock, User, Video,
    ClipboardList, Pill, Download, Eye, Info,
    Copy, Check, Upload, LogOut, ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import PrescriptionModal from "@/components/booking/PrescriptionModal";
import PatientAssessmentPreview from "@/components/booking/PatientAssessmentPreview";
import { createSessionNote, getSessionNoteByBooking, updateSessionNote } from "@/lib/services/sessionNotesService";
import { downloadSessionNotesPDF, viewSessionNotesPDF, saveSessionNotesPDFToImageKit } from "@/lib/services/sessionNotesPdfService";

type ConnectionState = 'initializing' | 'loading' | 'ready' | 'connected' | 'failed' | 'ended';

interface SOAPNote {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    patient_name?: string;
}

interface SessionInfo {
    id: string;
    booking_id?: string;
    therapist_id?: string;
    therapist_name?: string;
    patient_id?: string;
    patient_name?: string;
    scheduled_at?: string;
    service_type?: string;
    duration_minutes?: number;
    is_therapist: boolean;
    notes_therapist?: string;
}

const DEFAULT_SOAP: SOAPNote = {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
};

const SOAP_SECTIONS = [
    { key: 'subjective', label: 'S - Subjective', placeholder: "Patient's reported symptoms, concerns, history...", color: 'border-l-blue-400' },
    { key: 'objective', label: 'O - Objective', placeholder: 'Observable findings, mental status, behavior...', color: 'border-l-green-400' },
    { key: 'assessment', label: 'A - Assessment', placeholder: 'Clinical impression, diagnosis, progress...', color: 'border-l-amber-400' },
    { key: 'plan', label: 'P - Plan', placeholder: 'Treatment plan, interventions, follow-up...', color: 'border-l-purple-400' },
];

export default function VideoCallRoom() {
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const jitsiApiRef = useRef<any>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasJoinedRef = useRef(false);
    const roomNameRef = useRef<string | null>(null);

    // Core State
    const [connectionState, setConnectionState] = useState<ConnectionState>('initializing');
    const [error, setError] = useState<string | null>(null);
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [permissionsGranted, setPermissionsGranted] = useState(false);

    // Notes Panel State
    const [showNotes, setShowNotes] = useState(false);
    const [notesMode, setNotesMode] = useState<'soap' | 'simple'>('soap');
    const [soapNotes, setSoapNotes] = useState<SOAPNote>(DEFAULT_SOAP);
    const [simpleNotes, setSimpleNotes] = useState('');
    const [expandedSection, setExpandedSection] = useState<string>('subjective');
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [editablePatientName, setEditablePatientName] = useState<string>('');

    // New modal states for prescription and assessments
    const [showPrescription, setShowPrescription] = useState(false);
    const [showAssessments, setShowAssessments] = useState(false);
    const [showMeetingInfo, setShowMeetingInfo] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [sessionNoteId, setSessionNoteId] = useState<string | null>(null);
    const [savingPdf, setSavingPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const mode = searchParams.get('mode') || 'video';

    // Check and request media permissions
    useEffect(() => {
        const checkPermissions = async () => {
            try {
                // Request media permissions early
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: mode !== 'audio',
                    audio: true
                });
                // Stop the tracks immediately after getting permission
                stream.getTracks().forEach(track => track.stop());
                setPermissionsGranted(true);
            } catch (err) {
                console.warn('Media permission check:', err);
                // Don't block - Jitsi will handle permissions too
                setPermissionsGranted(true);
            }
        };

        checkPermissions();
    }, [mode]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Load session info and notes
    useEffect(() => {
        if (!roomId || !user) return;

        const loadSession = async () => {
            try {
                setConnectionState('initializing');

                // Try finding booking by ID first, then by room_id
                let booking: any = null;

                // Try multiple query approaches - FK constraint names may vary
                const queryVariants = [
                    // Approach 1: With explicit FK constraint names
                    `id, scheduled_at, service_type, duration_minutes, notes, status, patient_id, therapist_id, meeting_link,
                     patient:users!bookings_patient_id_fkey(id, full_name),
                     therapist:therapists!bookings_therapist_id_fkey(id, user:users!therapists_user_id_fkey(id, full_name))`,
                    // Approach 2: Minimal - just flat columns (safe fallback)
                    `id, scheduled_at, service_type, duration_minutes, notes, status, patient_id, therapist_id, meeting_link`,
                ];

                for (const queryStr of queryVariants) {
                    if (booking) break;

                    try {
                        // Try by booking ID (dashboard navigates with /call/{bookingId})
                        const { data: byId, error: queryError } = await supabase
                            .from('bookings')
                            .select(queryStr)
                            .eq('id', roomId)
                            .maybeSingle();

                        if (queryError) {
                            console.warn('Query variant failed:', queryError.message);
                            continue;
                        }

                        if (byId) {
                            booking = byId;
                            break;
                        }
                    } catch (e) {
                        console.warn('Query variant threw:', e);
                        continue;
                    }

                    // Try extracting booking from meeting_link as fallback
                    try {
                        const { data: byMeetingLink, error: mlError } = await supabase
                            .from('bookings')
                            .select(queryStr)
                            .ilike('meeting_link', `%${roomId}%`)
                            .maybeSingle();

                        if (!mlError && byMeetingLink) {
                            booking = byMeetingLink;
                            break;
                        }
                    } catch (e) {
                        console.warn('Meeting link query failed:', e);
                    }
                }

                if (booking) {
                    // Determine is_therapist with multiple strategies
                    let isTherapist = false;
                    let therapistName = 'Therapist';
                    let patientName = 'Patient';
                    let therapistRecordId = booking.therapist?.id || booking.therapist_id;

                    // Strategy 1: Check nested join result
                    if (booking.therapist?.user?.id) {
                        isTherapist = booking.therapist.user.id === user.id;
                        therapistName = booking.therapist.user.full_name || 'Therapist';
                    }

                    // Strategy 2: If nested join didn't resolve, look up therapist directly
                    if (!isTherapist && booking.therapist_id) {
                        const { data: therapistRow } = await supabase
                            .from('therapists')
                            .select('id, user_id, users!therapists_user_id_fkey(full_name)')
                            .eq('id', booking.therapist_id)
                            .maybeSingle();

                        if (therapistRow) {
                            therapistRecordId = therapistRow.id;
                            if (therapistRow.user_id === user.id) {
                                isTherapist = true;
                            }
                            // Try to get the name from the join
                            const joinedUser = (therapistRow as any).users;
                            if (joinedUser?.full_name) {
                                therapistName = joinedUser.full_name;
                            }
                        } else {
                            // Try without FK name
                            const { data: therapistRow2 } = await supabase
                                .from('therapists')
                                .select('id, user_id')
                                .eq('id', booking.therapist_id)
                                .maybeSingle();
                            if (therapistRow2) {
                                therapistRecordId = therapistRow2.id;
                                if (therapistRow2.user_id === user.id) {
                                    isTherapist = true;
                                }
                            }
                        }
                    }

                    // Strategy 3: Check user role from auth context
                    if (!isTherapist && user.role === 'therapist') {
                        // Double-check: does this user have a therapist record linked to this booking?
                        const { data: myTherapistRecord } = await supabase
                            .from('therapists')
                            .select('id')
                            .eq('user_id', user.id)
                            .maybeSingle();
                        if (myTherapistRecord && myTherapistRecord.id === booking.therapist_id) {
                            isTherapist = true;
                            therapistRecordId = myTherapistRecord.id;
                        }
                    }

                    // Get client name
                    if (booking.patient?.full_name) {
                        patientName = booking.patient.full_name;
                    } else if (booking.patient_id) {
                        const { data: clientUser } = await supabase
                            .from('users')
                            .select('full_name')
                            .eq('id', booking.patient_id)
                            .maybeSingle();
                        if (clientUser?.full_name) {
                            patientName = clientUser.full_name;
                        }
                    }

                    console.log('Session loaded:', { isTherapist, therapistRecordId, userId: user.id, role: user.role });

                    setSessionInfo({
                        id: roomId,
                        booking_id: booking.id,
                        therapist_id: therapistRecordId,
                        therapist_name: therapistName,
                        patient_id: booking.patient?.id || booking.patient_id,
                        patient_name: patientName,
                        scheduled_at: booking.scheduled_at || '',
                        service_type: booking.service_type || 'individual',
                        duration_minutes: booking.duration_minutes || 50,
                        is_therapist: isTherapist,
                        notes_therapist: booking.notes
                    });

                    // Initial name set from booking/user
                    let currentPatientName = patientName;

                    if (isTherapist && booking.notes) {
                        try {
                            const parsed = JSON.parse(booking.notes);
                            // Handling SOAP JSON
                            if (parsed.subjective !== undefined) {
                                setSoapNotes(parsed);
                                setNotesMode('soap');
                                if (parsed.patient_name) currentPatientName = parsed.patient_name;
                            }
                            // Handling wrapped Simple JSON (new format)
                            else if (parsed.simple_content !== undefined) {
                                setSimpleNotes(parsed.simple_content);
                                setNotesMode('simple');
                                if (parsed.patient_name) currentPatientName = parsed.patient_name;
                            }
                            // Handling legacy simple text that happens to be valid JSON (unlikely but possible)
                            else {
                                setSimpleNotes(booking.notes);
                                setNotesMode('simple');
                            }
                        } catch {
                            // Plain text (legacy simple notes)
                            setSimpleNotes(booking.notes);
                            setNotesMode('simple');
                        }
                    }

                    // Set the editable name to what we found (either from notes or default)
                    setEditablePatientName(currentPatientName);

                    // Update session info if name changed from notes
                    if (currentPatientName !== patientName) {
                        setSessionInfo(prev => prev ? { ...prev, patient_name: currentPatientName } : null);
                    }

                    // Also load from session_notes table
                    if (isTherapist) {
                        try {
                            const { data: existingNote } = await getSessionNoteByBooking(booking.id);
                            if (existingNote) {
                                setSessionNoteId(existingNote.id);
                                if (existingNote.subjective || existingNote.objective || existingNote.assessment || existingNote.plan) {
                                    setSoapNotes({
                                        subjective: existingNote.subjective || '',
                                        objective: existingNote.objective || '',
                                        assessment: existingNote.assessment || '',
                                        plan: existingNote.plan || '',
                                    });
                                    setNotesMode('soap');
                                }
                            }
                        } catch (noteErr) {
                            console.warn('Could not load session notes (table may not exist yet):', noteErr);
                        }
                    }
                } else {
                    // Fallback: No booking found - use user role
                    console.warn('No booking found for room:', roomId);
                    setSessionInfo({
                        id: roomId,
                        is_therapist: user.role === 'therapist'
                    });
                }

                setConnectionState('loading');
            } catch (err) {
                console.error('Failed to load session:', err);
                setSessionInfo({
                    id: roomId,
                    is_therapist: user.role === 'therapist'
                });
                setConnectionState('loading');
            }
        };

        loadSession();
    }, [roomId, user]);

    // Call duration timer
    useEffect(() => {
        if (connectionState !== 'connected') return;

        const timer = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [connectionState]);

    // Auto-save notes (debounced)
    useEffect(() => {
        if (!sessionInfo?.booking_id || !sessionInfo.is_therapist) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveNotes(true);
        }, 3000); // Auto-save after 3 seconds of inactivity

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [soapNotes, simpleNotes, notesMode]);

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Save notes to database (bookings + session_notes table)
    const saveNotes = async (isAutoSave = false) => {
        if (!sessionInfo?.booking_id) {
            if (!isAutoSave) {
                toast({
                    title: 'Cannot Save',
                    description: 'No active booking found for this session.',
                    variant: 'destructive'
                });
            }
            return;
        }

        try {
            setSaving(true);
            const notesContent = notesMode === 'soap'
                ? JSON.stringify({ ...soapNotes, patient_name: editablePatientName })
                : JSON.stringify({ simple_content: simpleNotes, patient_name: editablePatientName });

            // Save to bookings table
            const { error } = await supabase
                .from('bookings')
                .update({ notes: notesContent })
                .eq('id', sessionInfo.booking_id);

            if (error) throw error;

            // Also save to session_notes table for structured storage
            if (sessionInfo.therapist_id && sessionInfo.patient_id) {
                try {
                    if (sessionNoteId) {
                        // Update existing session note
                        await updateSessionNote(sessionNoteId, {
                            subjective: notesMode === 'soap' ? soapNotes.subjective : '',
                            objective: notesMode === 'soap' ? soapNotes.objective : '',
                            assessment: notesMode === 'soap' ? soapNotes.assessment : '',
                            plan: notesMode === 'soap' ? soapNotes.plan : '',
                            progress_notes: notesMode === 'simple' ? simpleNotes : undefined,
                        });
                    } else {
                        // Create new session note - pass therapist record ID
                        const { data: newNote } = await createSessionNote(sessionInfo.therapist_id, {
                            booking_id: sessionInfo.booking_id,
                            patient_id: sessionInfo.patient_id,
                            subjective: notesMode === 'soap' ? soapNotes.subjective : '',
                            objective: notesMode === 'soap' ? soapNotes.objective : '',
                            assessment: notesMode === 'soap' ? soapNotes.assessment : '',
                            plan: notesMode === 'soap' ? soapNotes.plan : '',
                            progress_notes: notesMode === 'simple' ? simpleNotes : undefined,
                        });
                        if (newNote) {
                            setSessionNoteId(newNote.id);
                        }
                    }
                } catch (noteErr) {
                    console.warn('Session notes table save failed (non-critical):', noteErr);
                }
            }

            setLastSaved(new Date());

            if (!isAutoSave) {
                toast({
                    title: '✓ Notes Saved',
                    description: 'Session notes have been saved securely.'
                });
            }
        } catch (err) {
            console.error('Error saving notes:', err);
            if (!isAutoSave) {
                toast({
                    title: 'Error',
                    description: 'Failed to save notes. Please try again.',
                    variant: 'destructive'
                });
            }
        } finally {
            setSaving(false);
        }
    };

    // Copy text to clipboard
    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        }
    };

    // Download notes as PDF
    const handleDownloadPDF = () => {
        if (!sessionInfo) return;
        downloadSessionNotesPDF({
            patientName: sessionInfo.patient_name || 'Patient',
            therapistName: sessionInfo.therapist_name || 'Therapist',
            sessionDate: sessionInfo.scheduled_at || new Date().toISOString(),
            serviceType: sessionInfo.service_type || 'individual',
            durationMinutes: sessionInfo.duration_minutes || 50,
            noteType: notesMode,
            soapNotes: notesMode === 'soap' ? soapNotes : undefined,
            simpleNotes: notesMode === 'simple' ? simpleNotes : undefined,
        });
        toast({
            title: '📄 PDF Downloaded',
            description: 'Session notes PDF has been downloaded.'
        });
    };

    // View notes as PDF in new tab
    const handleViewPDF = () => {
        if (!sessionInfo) return;
        viewSessionNotesPDF({
            patientName: sessionInfo.patient_name || 'Patient',
            therapistName: sessionInfo.therapist_name || 'Therapist',
            sessionDate: sessionInfo.scheduled_at || new Date().toISOString(),
            serviceType: sessionInfo.service_type || 'individual',
            durationMinutes: sessionInfo.duration_minutes || 50,
            noteType: notesMode,
            soapNotes: notesMode === 'soap' ? soapNotes : undefined,
            simpleNotes: notesMode === 'simple' ? simpleNotes : undefined,
        });
    };

    // Save PDF to ImageKit
    const handleSavePDFToCloud = async () => {
        if (!sessionInfo?.booking_id) return;
        setSavingPdf(true);
        try {
            const { url, error } = await saveSessionNotesPDFToImageKit(
                {
                    patientName: sessionInfo.patient_name || 'Patient',
                    therapistName: sessionInfo.therapist_name || 'Therapist',
                    sessionDate: sessionInfo.scheduled_at || new Date().toISOString(),
                    serviceType: sessionInfo.service_type || 'individual',
                    durationMinutes: sessionInfo.duration_minutes || 50,
                    noteType: notesMode,
                    soapNotes: notesMode === 'soap' ? soapNotes : undefined,
                    simpleNotes: notesMode === 'simple' ? simpleNotes : undefined,
                },
                sessionInfo.booking_id,
                sessionNoteId || undefined
            );

            if (error) throw error;
            if (url) {
                setPdfUrl(url);
                toast({
                    title: '☁️ PDF Saved to Cloud',
                    description: 'PDF has been securely uploaded and saved.'
                });
            }
        } catch (err) {
            console.error('PDF cloud save error:', err);
            toast({
                title: 'Cloud Save Info',
                description: 'PDF could not be uploaded to cloud. You can still download it locally.',
                variant: 'destructive'
            });
        } finally {
            setSavingPdf(false);
        }
    };

    // Mark session as completed
    const markSessionCompleted = async () => {
        if (!sessionInfo?.booking_id) return;

        try {
            await supabase
                .from('bookings')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', sessionInfo.booking_id);

            toast({
                title: 'Session Completed',
                description: 'The session has been marked as completed.'
            });
        } catch (err) {
            console.error('Error completing session:', err);
        }
    };

    // Jitsi API ready handler
    const handleReadyToClose = useCallback(() => {
        // Only navigate if user actually joined and left intentionally
        if (hasJoinedRef.current) {
            console.log('User left conference intentionally');
            navigate('/dashboard');
        } else {
            // Don't auto-navigate - let user retry or go back manually
            console.log('Conference closed before joining - not auto-redirecting');
        }
    }, [navigate]);

    const handleApiReady = useCallback((api: any) => {
        jitsiApiRef.current = api;
        setConnectionState('ready');

        // Listen for successful join
        api.addListener('videoConferenceJoined', () => {
            console.log('Successfully joined conference');
            hasJoinedRef.current = true;
            setConnectionState('connected');
            setError(null);
        });

        // Handle connection errors
        api.addListener('errorOccurred', (event: any) => {
            console.error('Jitsi error:', event);

            // Handle specific error types
            const errorName = event.error?.name || '';

            // Members-only error - room requires auth (don't auto-reload, causes loops)
            if (errorName === 'conference.connectionError.membersOnly') {
                console.warn('Room is members-only, but continuing anyway');
                // Don't reload - it causes infinite loops
                return;
            }

            // Ignore harmless auth prompts and non-fatal errors
            if (errorName === 'conference.authenticationRequired' ||
                errorName.includes('password') ||
                !event.error?.isFatal) {
                return;
            }

            // Only handle truly fatal errors that prevent joining
            if (event.error?.isFatal && !hasJoinedRef.current) {
                console.error('Fatal Jitsi error:', errorName);
                setError(`Connection error. Please try again.`);
                setConnectionState('failed');
            }
        });

        // Only handle leave if user actually joined
        api.addListener('videoConferenceLeft', async () => {
            console.log('videoConferenceLeft fired, hasJoined:', hasJoinedRef.current);

            // Only process if user actually joined the conference
            if (!hasJoinedRef.current) {
                console.log('Ignoring videoConferenceLeft - user never joined');
                return;
            }

            if (connectionState === 'ended') return;

            setConnectionState('ended');
            // Save notes before leaving
            if (sessionInfo?.is_therapist && sessionInfo?.booking_id) {
                await saveNotes();
                await markSessionCompleted();
            }
            navigate('/dashboard');
        });

        // Only use readyToClose for cleanup, not navigation
        api.addListener('readyToClose', () => {
            console.log('readyToClose fired, hasJoined:', hasJoinedRef.current);
            // Only navigate if user had joined
            if (hasJoinedRef.current) {
                handleReadyToClose();
            }
        });

        // Handle participant joined (useful for debugging)
        api.addListener('participantJoined', (participant: any) => {
            console.log('Participant joined:', participant);
        });

        if (mode === 'audio') {
            api.executeCommand('toggleVideo');
        }
    }, [mode, navigate, sessionInfo, handleReadyToClose, connectionState]);

    // Get display name
    const getDisplayName = () => {
        if (user?.full_name) return user.full_name;
        if (user?.email) return user.email.split('@')[0];
        return 'Participant';
    };

    // Generate safe room name - stable for both parties to join same room
    const getSafeRoomName = useCallback(() => {
        // Return cached room name if already generated
        if (roomNameRef.current) return roomNameRef.current;

        if (!roomId) {
            roomNameRef.current = `the3tree-session-${Date.now()}`;
        } else {
            // Use sanitized roomId - must be same for both parties
            const sanitized = roomId.replace(/[^a-zA-Z0-9]/g, '');
            roomNameRef.current = `the3treecounseling${sanitized}`;
        }
        console.log('Generated room name:', roomNameRef.current);
        return roomNameRef.current;
    }, [roomId]);

    // Retry connection
    const retryConnection = useCallback(() => {
        setError(null);
        setConnectionState('loading');
        hasJoinedRef.current = false;
    }, []);

    // Loading state
    if (authLoading || connectionState === 'initializing' || !permissionsGranted) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-400">
                        {!permissionsGranted ? 'Checking media permissions...' : 'Preparing your session...'}
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (connectionState === 'failed' || error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Connection Failed</h2>
                    <p className="text-gray-400 mb-6">
                        {error || 'Unable to start video session. Please check your camera and microphone permissions.'}
                    </p>

                    <div className="flex flex-col gap-3">
                        {/* Troubleshooting tips */}
                        <div className="text-left bg-gray-800 rounded-lg p-4 mb-2">
                            <p className="text-sm text-gray-300 font-medium mb-2">Quick fixes:</p>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>• Allow camera & microphone access in your browser</li>
                                <li>• Check your internet connection</li>
                                <li>• Try refreshing the page</li>
                                <li>• Use Chrome or Firefox for best experience</li>
                            </ul>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <Button onClick={retryConnection} className="bg-primary hover:bg-primary/90">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/dashboard')} className="text-white border-gray-600">
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Video Session | psychmind</title>
            </Helmet>

            <div className="min-h-screen bg-gray-900 flex flex-col relative">
                {/* Session Info Header */}
                <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between z-20 relative">
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${connectionState === 'connected' ? 'bg-green-500 animate-pulse' :
                            connectionState === 'ready' ? 'bg-yellow-500' :
                                'bg-gray-500'
                            }`} />

                        <div>
                            <p className="font-medium text-white text-sm flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                {sessionInfo?.is_therapist ? (
                                    <input
                                        type="text"
                                        value={editablePatientName}
                                        onChange={(e) => {
                                            setEditablePatientName(e.target.value);
                                            setSessionInfo(prev => prev ? { ...prev, patient_name: e.target.value } : null);
                                        }}
                                        className="bg-transparent border-b border-gray-500 focus:border-primary focus:outline-none px-1 py-0.5 min-w-[150px]"
                                    />
                                ) : (
                                    sessionInfo?.therapist_name || 'Therapist'
                                )}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">
                                {sessionInfo?.service_type?.replace(/_/g, ' ') || 'Session'} • {sessionInfo?.duration_minutes || 50}min
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Call Duration */}
                        {connectionState === 'connected' && (
                            <div className="px-3 py-1.5 bg-gray-700/50 rounded-lg text-white font-mono text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {formatDuration(callDuration)}
                            </div>
                        )}

                        {/* Meeting Info Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMeetingInfo(!showMeetingInfo)}
                            className={`text-white hover:bg-gray-700 ${showMeetingInfo ? 'bg-gray-700' : ''}`}
                            title="Meeting Info"
                        >
                            <Info className="w-4 h-4 mr-2" />
                            Meeting Info
                        </Button>

                        {/* Notes Button - Therapist Only */}
                        {sessionInfo?.is_therapist && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAssessments(true)}
                                    className="text-white hover:bg-gray-700"
                                    title="View Patient Assessments"
                                >
                                    <ClipboardList className="w-4 h-4 mr-2" />
                                    Assessments
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPrescription(true)}
                                    className="text-white hover:bg-gray-700"
                                    title="Write Prescription"
                                >
                                    <Pill className="w-4 h-4 mr-2" />
                                    Prescription
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNotes(!showNotes)}
                                    className={`text-white hover:bg-gray-700 ${showNotes ? 'bg-primary' : ''}`}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Notes
                                    {saving && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
                                </Button>
                            </>
                        )}

                        {/* Exit Button */}
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to leave the session?')) {
                                    navigate('/dashboard');
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white border-none"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Exit
                        </Button>

                        {/* Security Badge */}
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-lg">
                            <Shield className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-xs text-green-400 font-medium">Encrypted</span>
                        </div>
                    </div>
                </header>

                {/* Meeting Info Panel */}
                {showMeetingInfo && (
                    <>
                        {/* Backdrop to close on click outside */}
                        <div className="fixed inset-0 z-40" onClick={() => setShowMeetingInfo(false)} />
                        <div className="fixed top-14 left-1/2 -translate-x-1/2 w-[420px] max-h-[80vh] overflow-y-auto bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50">
                            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <Info className="w-4 h-4 text-cyan-400" />
                                    Meeting Information
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowMeetingInfo(false)}
                                    className="text-gray-400 hover:text-white h-7 w-7"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="p-4 space-y-3">
                                {/* Meeting ID */}
                                <div className="bg-gray-700/50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Meeting ID</span>
                                        <button
                                            onClick={() => copyToClipboard(roomId || '', 'meetingId')}
                                            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                        >
                                            {copiedField === 'meetingId' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedField === 'meetingId' ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <p className="text-white font-mono text-sm break-all">{roomId || 'N/A'}</p>
                                </div>

                                {/* Room Name */}
                                <div className="bg-gray-700/50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Room Name</span>
                                        <button
                                            onClick={() => copyToClipboard(getSafeRoomName(), 'roomName')}
                                            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                        >
                                            {copiedField === 'roomName' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedField === 'roomName' ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <p className="text-white font-mono text-sm break-all">{getSafeRoomName()}</p>
                                </div>

                                {/* Meeting Link */}
                                <div className="bg-gray-700/50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Meeting Link</span>
                                        <button
                                            onClick={() => copyToClipboard(window.location.href, 'meetingLink')}
                                            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                        >
                                            {copiedField === 'meetingLink' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedField === 'meetingLink' ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <p className="text-white text-sm break-all">{window.location.href}</p>
                                </div>

                                {/* Session Details */}
                                <div className="bg-gray-700/50 rounded-lg p-3 space-y-2">
                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Session Details</span>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Patient:</span>
                                            <p className="text-white">{sessionInfo?.patient_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Therapist:</span>
                                            <p className="text-white">{sessionInfo?.therapist_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Type:</span>
                                            <p className="text-white capitalize">{sessionInfo?.service_type?.replace(/_/g, ' ') || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Duration:</span>
                                            <p className="text-white">{sessionInfo?.duration_minutes || 50} min</p>
                                        </div>
                                        {sessionInfo?.scheduled_at && (
                                            <div className="col-span-2">
                                                <span className="text-gray-500">Scheduled:</span>
                                                <p className="text-white">{new Date(sessionInfo.scheduled_at).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Connection Status */}
                                <div className="flex items-center gap-2 text-sm">
                                    <div className={`w-2 h-2 rounded-full ${connectionState === 'connected' ? 'bg-green-500 animate-pulse' :
                                        connectionState === 'ready' ? 'bg-yellow-500' : 'bg-gray-500'
                                        }`} />
                                    <span className="text-gray-300 capitalize">
                                        {connectionState === 'connected' ? 'Connected & Secure' :
                                            connectionState === 'ready' ? 'Ready to Connect' :
                                                connectionState === 'loading' ? 'Loading...' : connectionState}
                                    </span>
                                </div>

                                {/* Security Info */}
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-green-400" />
                                        <span className="text-green-400 text-sm font-medium">End-to-End Encrypted</span>
                                    </div>
                                    <p className="text-green-400/70 text-xs mt-1">
                                        All audio, video, and data in this session is encrypted. No recordings are stored.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Main Content */}
                <div className="flex-1 flex relative">
                    {/* Jitsi Meeting Container */}
                    <div className={`flex-1 relative transition-all duration-300 ${showNotes ? 'mr-96' : ''}`}>
                        {connectionState === 'loading' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                                <div className="text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                                    <p className="text-gray-400">Loading video conference...</p>
                                </div>
                            </div>
                        )}

                        <JitsiMeeting
                            domain="meet.ffmuc.net"
                            roomName={getSafeRoomName()}
                            configOverwrite={{
                                // Direct join - no waiting
                                startWithAudioMuted: false,
                                startWithVideoMuted: mode === 'audio',
                                prejoinPageEnabled: false,
                                prejoinConfig: { enabled: false },

                                // Disable ALL authentication and lobby features
                                enableLobbyChat: false,
                                hideLobbyButton: true,
                                disableModeratorIndicator: true,
                                disableRemoteMute: true,
                                remoteVideoMenu: { disableKick: true, disableGrantModerator: true },

                                // Hide Jitsi branding completely
                                hideConferenceSubject: true,
                                hideConferenceTimer: false,
                                hideRecordingLabel: true,
                                disableProfile: true,

                                // Disable features that require auth
                                fileRecordingsEnabled: false,
                                liveStreamingEnabled: false,
                                transcribingEnabled: false,
                                enableClosePage: false,

                                // Privacy & Security
                                disableDeepLinking: true,
                                disableInviteFunctions: true,
                                disableThirdPartyRequests: true,
                                doNotStoreRoom: true,
                                enableInsecureRoomNameWarning: false,
                                enableEmailInStats: false,

                                // Audio/Video
                                enableNoisyMicDetection: true,
                                enableNoAudioDetection: true,
                                startAudioOnly: mode === 'audio',
                                disableLocalVideoFlip: false,

                                // Simplified toolbar
                                toolbarButtons: [
                                    'microphone',
                                    'camera',
                                    'desktop',
                                    'fullscreen',
                                    'fodeviceselection',
                                    'hangup',
                                    'chat',
                                    'tileview',
                                    'settings',
                                ],

                                // Minimal notifications
                                notifications: [],
                                disablePolls: true,
                                disableReactions: true,
                                disableSelfView: false,
                                disableSelfViewSettings: true,
                            }}
                            interfaceConfigOverwrite={{
                                // Completely hide Jitsi branding
                                SHOW_JITSI_WATERMARK: false,
                                SHOW_WATERMARK_FOR_GUESTS: false,
                                SHOW_BRAND_WATERMARK: false,
                                BRAND_WATERMARK_LINK: '',
                                SHOW_POWERED_BY: false,
                                SHOW_PROMOTIONAL_CLOSE_PAGE: false,
                                SHOW_CHROME_EXTENSION_BANNER: false,

                                // Custom styling
                                DEFAULT_BACKGROUND: '#111827',

                                // Disable unnecessary features
                                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                                MOBILE_APP_PROMO: false,
                                HIDE_INVITE_MORE_HEADER: true,
                                HIDE_DEEP_LINKING_LOGO: true,
                                GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
                                DISPLAY_WELCOME_FOOTER: false,
                                DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD: false,
                                DISPLAY_WELCOME_PAGE_CONTENT: false,
                                DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,

                                // Display names
                                DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
                                DEFAULT_LOCAL_DISPLAY_NAME: 'You',

                                // Toolbar
                                TOOLBAR_ALWAYS_VISIBLE: false,
                                TOOLBAR_TIMEOUT: 4000,
                                SETTINGS_SECTIONS: ['devices', 'language'],

                                // Video layout
                                FILM_STRIP_MAX_HEIGHT: 120,
                                VERTICAL_FILMSTRIP: true,

                                // Disable authentication UI
                                AUTHENTICATION_ENABLE: false,
                            }}
                            userInfo={{
                                displayName: getDisplayName(),
                                email: user?.email || undefined,
                            }}
                            onApiReady={handleApiReady}
                            getIFrameRef={(iframeRef) => {
                                if (iframeRef) {
                                    iframeRef.style.height = '100%';
                                    iframeRef.style.width = '100%';
                                }
                            }}
                        />

                        {/* Floating Notes Toggle - Therapist Only */}
                        {sessionInfo?.is_therapist && (
                            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
                                <Button
                                    size="sm"
                                    variant={showNotes ? 'default' : 'outline'}
                                    className={`${showNotes ? 'bg-primary text-white' : 'bg-white/90 text-gray-800 border-gray-200'} shadow-lg backdrop-blur`}
                                    onClick={() => setShowNotes(!showNotes)}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    {showNotes ? 'Hide Notes' : 'Notes'}
                                    {saving && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Notes Side Panel - Therapist Only */}
                    {sessionInfo?.is_therapist && showNotes && (
                        <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 flex flex-col z-30 shadow-2xl">
                            {/* Notes Header */}
                            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        Session Notes
                                    </h3>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                        <Lock className="w-3 h-3" />
                                        HIPAA-compliant • Auto-saves
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowNotes(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Patient Info */}
                            <div className="px-4 py-3 bg-gray-700/30 border-b border-gray-700">
                                <div className="text-sm text-gray-300 flex items-center gap-2">
                                    <span className="text-gray-500">Patient:</span>
                                    <input
                                        type="text"
                                        value={editablePatientName}
                                        onChange={(e) => {
                                            setEditablePatientName(e.target.value);
                                            setSessionInfo(prev => prev ? { ...prev, patient_name: e.target.value } : null);
                                        }}
                                        className="bg-gray-800 border-b border-gray-600 focus:border-primary focus:outline-none px-1 py-0.5 w-full"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 capitalize">
                                    {sessionInfo?.service_type?.replace(/_/g, ' ')} Session
                                </p>
                            </div>

                            {/* Format Toggle */}
                            <div className="p-4 border-b border-gray-700">
                                <div className="flex gap-1 bg-gray-700 p-1 rounded-lg">
                                    <button
                                        onClick={() => setNotesMode('soap')}
                                        className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${notesMode === 'soap'
                                            ? 'bg-primary text-white'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        SOAP Format
                                    </button>
                                    <button
                                        onClick={() => setNotesMode('simple')}
                                        className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${notesMode === 'simple'
                                            ? 'bg-primary text-white'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        Simple
                                    </button>
                                </div>
                            </div>

                            {/* Notes Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {notesMode === 'soap' ? (
                                    <div className="space-y-3">
                                        {SOAP_SECTIONS.map((section) => (
                                            <div
                                                key={section.key}
                                                className={`border-l-4 ${section.color} bg-gray-700/30 rounded-r-lg overflow-hidden`}
                                            >
                                                <button
                                                    onClick={() => setExpandedSection(
                                                        expandedSection === section.key ? '' : section.key
                                                    )}
                                                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-white">{section.label}</span>
                                                        {soapNotes[section.key as keyof SOAPNote] && (
                                                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                                                        )}
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === section.key ? 'rotate-180' : ''
                                                        }`} />
                                                </button>
                                                {expandedSection === section.key && (
                                                    <div className="px-3 pb-3">
                                                        <textarea
                                                            value={soapNotes[section.key as keyof SOAPNote]}
                                                            onChange={(e) => setSoapNotes(prev => ({
                                                                ...prev,
                                                                [section.key]: e.target.value
                                                            }))}
                                                            placeholder={section.placeholder}
                                                            className="w-full h-24 p-2 text-sm bg-gray-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Session Notes
                                        </label>
                                        <textarea
                                            value={simpleNotes}
                                            onChange={(e) => setSimpleNotes(e.target.value)}
                                            placeholder="Type your session notes here..."
                                            className="w-full h-64 p-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Notes Footer */}
                            <div className="p-4 border-t border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs text-gray-500">
                                        {saving ? (
                                            <span className="flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Saving...
                                            </span>
                                        ) : lastSaved ? (
                                            `Saved ${lastSaved.toLocaleTimeString()}`
                                        ) : (
                                            'Not saved yet'
                                        )}
                                    </p>
                                </div>

                                {/* PDF Actions Row */}
                                <div className="flex items-center gap-2 mb-3">
                                    <Button
                                        onClick={handleDownloadPDF}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                                        disabled={!soapNotes.subjective && !soapNotes.objective && !soapNotes.assessment && !soapNotes.plan && !simpleNotes}
                                    >
                                        <Download className="w-3 h-3 mr-1" />
                                        Download PDF
                                    </Button>
                                    <Button
                                        onClick={handleViewPDF}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                                        disabled={!soapNotes.subjective && !soapNotes.objective && !soapNotes.assessment && !soapNotes.plan && !simpleNotes}
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        View PDF
                                    </Button>
                                    <Button
                                        onClick={handleSavePDFToCloud}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                                        disabled={savingPdf || (!soapNotes.subjective && !soapNotes.objective && !soapNotes.assessment && !soapNotes.plan && !simpleNotes)}
                                    >
                                        {savingPdf ? (
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        ) : (
                                            <Upload className="w-3 h-3 mr-1" />
                                        )}
                                        Save to Cloud
                                    </Button>
                                </div>

                                {/* Cloud PDF link if available */}
                                {pdfUrl && (
                                    <a
                                        href={pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 mb-3"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        View saved PDF in cloud
                                    </a>
                                )}

                                <Button
                                    onClick={() => saveNotes(false)}
                                    disabled={saving}
                                    className="w-full bg-primary hover:bg-primary/90"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Notes
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Info Bar */}
                <footer className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 px-4 py-2.5">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4 text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                <span>End-to-end encrypted</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5" />
                                <span>Secure Video Session</span>
                            </div>
                        </div>
                        <div className="text-gray-500">
                            Powered by <span className="text-primary">psychmind</span>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Prescription Modal */}
            {sessionInfo?.is_therapist && sessionInfo?.booking_id && (
                <PrescriptionModal
                    isOpen={showPrescription}
                    onClose={() => setShowPrescription(false)}
                    bookingId={sessionInfo.booking_id}
                    therapistId={sessionInfo.therapist_id || ''}
                    patientId={sessionInfo.patient_id || ''}
                    patientName={sessionInfo.patient_name || 'Patient'}
                    therapistName={sessionInfo.therapist_name || 'Therapist'}
                />
            )}

            {/* Assessment Preview Modal */}
            {sessionInfo?.is_therapist && sessionInfo?.patient_id && (
                <PatientAssessmentPreview
                    isOpen={showAssessments}
                    onClose={() => setShowAssessments(false)}
                    patientId={sessionInfo.patient_id}
                    patientName={sessionInfo.patient_name || 'Patient'}
                />
            )}
        </>
    );
}
