// Booking Management - Full CRUD for admin and therapists
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
    Calendar, Clock, User, Video, Phone, MessageSquare, MapPin,
    ArrowLeft, Search, Filter, CheckCircle, XCircle, AlertCircle,
    ChevronDown, ExternalLink, RefreshCw, Download, MoreHorizontal,
    DollarSign, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BookingData {
    id: string;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    session_mode: string;
    service_type: string;
    amount: number | null;
    payment_status: string | null;
    notes_client: string | null;
    meeting_url: string | null;
    created_at: string;
    client: { id: string; full_name: string; email: string; phone?: string };
    therapist: { id: string; user: { full_name: string; email: string } };
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
type TimeFilter = 'upcoming' | 'past' | 'today' | 'all';

export default function BookingManagement() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [bookings, setBookings] = useState<BookingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');
    const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    const isTherapist = user?.role === 'therapist';

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        } else if (!authLoading && !isAdmin && !isTherapist) {
            navigate('/dashboard');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user && (isAdmin || isTherapist)) {
            loadBookings();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, statusFilter, timeFilter]);

    const loadBookings = async () => {
        if (!user) return;
        setLoading(true);

        try {
            let query = supabase
                .from('bookings')
                .select(`
                    id, scheduled_at, duration_minutes, status, session_mode, 
                    service_type, amount, payment_status, notes_client, meeting_url, created_at,
                    client:users!bookings_patient_id_fkey(id, full_name, email, phone),
                    therapist:therapists!bookings_therapist_id_fkey(id, user:users(full_name, email))
                `)
                .order('scheduled_at', { ascending: timeFilter === 'upcoming' });

            // Filter by therapist if not admin
            if (isTherapist && !isAdmin) {
                const { data: therapist } = await supabase
                    .from('therapists')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (therapist) {
                    query = query.eq('therapist_id', therapist.id);
                }
            }

            // Status filter
            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            // Time filter
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

            if (timeFilter === 'upcoming') {
                query = query.gte('scheduled_at', now.toISOString());
            } else if (timeFilter === 'past') {
                query = query.lt('scheduled_at', now.toISOString());
            } else if (timeFilter === 'today') {
                query = query.gte('scheduled_at', todayStart.toISOString())
                    .lt('scheduled_at', todayEnd.toISOString());
            }

            const { data, error } = await query.limit(100);

            if (error) throw error;

            // Transform data to match BookingData interface
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const transformedData: BookingData[] = (data || []).map((b: any) => ({
                id: b.id,
                scheduled_at: b.scheduled_at,
                duration_minutes: b.duration_minutes,
                status: b.status,
                session_mode: b.session_mode,
                service_type: b.service_type,
                amount: b.amount,
                payment_status: b.payment_status,
                notes_client: b.notes_client,
                meeting_url: b.meeting_url,
                created_at: b.created_at,
                client: Array.isArray(b.client) ? b.client[0] : b.client,
                therapist: Array.isArray(b.therapist) ? b.therapist[0] : b.therapist,
            }));

            setBookings(transformedData);
        } catch (error) {
            console.error('Error loading bookings:', error);
            toast({ title: 'Error', description: 'Failed to load bookings', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId: string, newStatus: string) => {
        setActionLoading(bookingId);
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', bookingId);

            if (error) throw error;

            toast({ title: 'Status Updated', description: `Booking ${newStatus}` });
            loadBookings();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleExport = () => {
        const csv = [
            ['Date', 'Time', 'Client', 'Therapist', 'Service', 'Status', 'Amount'].join(','),
            ...bookings.map(b => [
                formatDate(b.scheduled_at),
                formatTime(b.scheduled_at),
                b.client?.full_name || 'N/A',
                b.therapist?.user?.full_name || 'N/A',
                b.service_type,
                b.status,
                b.amount || 0
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    });

    const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true
    });

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-700',
            confirmed: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
            no_show: 'bg-gray-100 text-gray-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'video': return <Video className="w-4 h-4" />;
            case 'audio': return <Phone className="w-4 h-4" />;
            case 'chat': return <MessageSquare className="w-4 h-4" />;
            case 'in_person': return <MapPin className="w-4 h-4" />;
            default: return <Calendar className="w-4 h-4" />;
        }
    };

    const filteredBookings = bookings.filter(b =>
        b.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.therapist?.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.service_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        revenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.amount || 0), 0),
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
            <Helmet><title>Booking Management | psychmind</title></Helmet>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                    <div className="container mx-auto px-4 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link to={isAdmin ? '/super-admin' : '/dashboard/therapist'} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </Link>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-cyan-500" />
                                        Booking Management
                                    </h1>
                                    <p className="text-sm text-gray-500">Manage all therapy session bookings</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={loadBookings}>
                                    <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleExport}>
                                    <Download className="w-4 h-4 mr-1" /> Export
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 lg:px-8 py-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        {[
                            { label: 'Total', value: stats.total, icon: Calendar, color: 'bg-gray-500' },
                            { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'bg-amber-500' },
                            { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'bg-blue-500' },
                            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-green-500' },
                            { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-cyan-500' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
                                <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                                    <stat.icon className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text" placeholder="Search bookings..."
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                {(['upcoming', 'today', 'past', 'all'] as TimeFilter[]).map(filter => (
                                    <button key={filter} onClick={() => setTimeFilter(filter)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${timeFilter === filter ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                                            }`}>
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-1">
                                {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as StatusFilter[]).map(status => (
                                    <button key={status} onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize ${statusFilter === status
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}>
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Session</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Client</th>
                                        {isAdmin && <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Therapist</th>}
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Service</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredBookings.length > 0 ? (
                                        filteredBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
                                                            {getModeIcon(booking.session_mode)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{formatDate(booking.scheduled_at)}</p>
                                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {formatTime(booking.scheduled_at)} • {booking.duration_minutes}min
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-gray-900">{booking.client?.full_name || 'N/A'}</p>
                                                    <p className="text-sm text-gray-500">{booking.client?.email}</p>
                                                </td>
                                                {isAdmin && (
                                                    <td className="py-3 px-4">
                                                        <p className="font-medium text-gray-900">{booking.therapist?.user?.full_name || 'N/A'}</p>
                                                    </td>
                                                )}
                                                <td className="py-3 px-4">
                                                    <span className="text-sm text-gray-600 capitalize">{booking.service_type?.replace(/_/g, ' ')}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-medium text-gray-900">₹{booking.amount || 0}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {booking.status === 'pending' && (
                                                            <>
                                                                <Button size="sm" onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                                                    disabled={actionLoading === booking.id} className="bg-green-500 hover:bg-green-600 text-white text-xs">
                                                                    Confirm
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                                                    disabled={actionLoading === booking.id} className="text-red-600 text-xs">
                                                                    Cancel
                                                                </Button>
                                                            </>
                                                        )}
                                                        {booking.status === 'confirmed' && (
                                                            <>
                                                                {booking.meeting_url && (
                                                                    <a href={booking.meeting_url} target="_blank" rel="noopener noreferrer">
                                                                        <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-xs">
                                                                            <Video className="w-3 h-3 mr-1" /> Join
                                                                        </Button>
                                                                    </a>
                                                                )}
                                                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(booking.id, 'completed')}
                                                                    disabled={actionLoading === booking.id} className="text-green-600 text-xs">
                                                                    Complete
                                                                </Button>
                                                            </>
                                                        )}
                                                        {(booking.status === 'completed' || booking.status === 'cancelled') && (
                                                            <Button size="sm" variant="ghost" onClick={() => setSelectedBooking(booking)}>
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-gray-500">
                                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p>No bookings found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Booking Detail Modal */}
                {selectedBooking && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
                        <div className="bg-white rounded-xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{formatDate(selectedBooking.scheduled_at)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Time</span><span>{formatTime(selectedBooking.scheduled_at)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Client</span><span>{selectedBooking.client?.full_name}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{selectedBooking.client?.email}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="capitalize">{selectedBooking.service_type}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Status</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedBooking.status)}`}>{selectedBooking.status}</span>
                                </div>
                                {selectedBooking.notes_client && (
                                    <div><span className="text-gray-500 block mb-1">Client Notes</span><p className="bg-gray-50 p-2 rounded">{selectedBooking.notes_client}</p></div>
                                )}
                            </div>
                            <Button onClick={() => setSelectedBooking(null)} className="w-full mt-6">Close</Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
