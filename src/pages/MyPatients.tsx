/**
 * My Patients Page - Therapists can view their patients
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
    Users,
    ArrowLeft,
    Search,
    Calendar,
    MessageCircle,
    Clock,
    User,
    Mail,
    Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PatientData {
    id: string;
    patient_id: string;
    full_name: string;
    email: string;
    phone: string | null;
    total_sessions: number;
    last_session: string | null;
    first_session: string | null;
}

export default function MyPatients() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [patients, setPatients] = useState<PatientData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        } else if (user?.role !== 'therapist') {
            navigate('/dashboard');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            loadPatients();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadPatients = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Get therapist profile
            const { data: therapist } = await supabase
                .from('therapists')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!therapist) {
                setLoading(false);
                return;
            }

            // Get all bookings for this therapist
            const { data: bookings } = await supabase
                .from('bookings')
                .select(`
                    patient_id,
                    scheduled_at,
                    users!bookings_patient_id_fkey (
                        id,
                        full_name,
                        email,
                        phone
                    )
                `)
                .eq('therapist_id', therapist.id)
                .order('scheduled_at', { ascending: false });

            // Aggregate patient data
            const patientMap = new Map<string, PatientData>();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (bookings || []).forEach((booking: any) => {
                const patientId = booking.patient_id;
                const existing = patientMap.get(patientId);

                if (existing) {
                    existing.total_sessions += 1;
                    if (!existing.first_session || new Date(booking.scheduled_at) < new Date(existing.first_session)) {
                        existing.first_session = booking.scheduled_at;
                    }
                    if (!existing.last_session || new Date(booking.scheduled_at) > new Date(existing.last_session)) {
                        existing.last_session = booking.scheduled_at;
                    }
                } else {
                    patientMap.set(patientId, {
                        id: patientId,
                        patient_id: patientId,
                        full_name: booking.users?.full_name || 'Unknown Patient',
                        email: booking.users?.email || '',
                        phone: booking.users?.phone || null,
                        total_sessions: 1,
                        first_session: booking.scheduled_at,
                        last_session: booking.scheduled_at
                    });
                }
            });

            setPatients(Array.from(patientMap.values()));
        } catch (error) {
            console.error('Error loading patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>My Patients | The 3 Tree</title>
            </Helmet>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                    <div className="container mx-auto px-4 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </Link>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-cyan-500" />
                                        My Patients
                                    </h1>
                                    <p className="text-sm text-gray-500">{patients.length} patients total</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 lg:px-8 py-8">
                    {/* Search */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search patients by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Patients Grid */}
                    {filteredPatients.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPatients.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                                >
                                    {/* Avatar & Name */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                                            {patient.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{patient.full_name}</h3>
                                            <p className="text-sm text-gray-500 truncate">{patient.email}</p>
                                            {patient.phone && (
                                                <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                                    <Phone className="w-3 h-3" />
                                                    {patient.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Total Sessions</p>
                                            <p className="font-semibold text-gray-900">{patient.total_sessions}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Last Session</p>
                                            <p className="text-sm text-gray-700">{formatDate(patient.last_session)}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/messages?patient=${patient.id}`}
                                            className="flex-1"
                                        >
                                            <Button variant="outline" className="w-full text-sm">
                                                <MessageCircle className="w-4 h-4 mr-2" />
                                                Message
                                            </Button>
                                        </Link>
                                        <Link
                                            to="/notes"
                                            className="flex-1"
                                        >
                                            <Button variant="outline" className="w-full text-sm">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Notes
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Yet</h3>
                            <p className="text-gray-500 mb-4">
                                When clients book sessions with you, they'll appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
