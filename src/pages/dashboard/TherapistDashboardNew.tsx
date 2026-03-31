/**
 * TherapistDashboard - Modern redesign with sidebar navigation
 * Inspired by modern healthcare dashboard UIs
 */

import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { gsap } from 'gsap';
import {
    Calendar,
    Users,
    DollarSign,
    Clock,
    Video,
    Settings,
    Bell,
    ChevronRight,
    ChevronLeft,
    TrendingUp,
    CheckCircle2,
    MessageCircle,
    FileText,
    LogOut,
    RefreshCw,
    AlertCircle,
    X,
    User,
    Star,
    Copy,
    Key,
    ExternalLink,
    Send,
    BarChart3,
    Home,
    ClipboardList,
    Pill,
    Search,
    Menu,
    ChevronDown,
    Eye,
    Activity,
    HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PrescriptionModal from '@/components/booking/PrescriptionModal';
import PatientAssessmentPreview from '@/components/booking/PatientAssessmentPreview';

// Types
interface SessionData {
    id: string;
    patient_name: string;
    patient_initial: string;
    scheduled_at: string;
    service_type: string;
    status: string;
    duration_minutes: number;
    patient_id: string;
    meeting_link?: string;
    zoom_meeting_id?: string;
    zoom_passcode?: string;
    zoom_host_key?: string;
}

interface TherapistStats {
    todaySessions: number;
    totalPatients: number;
    monthlyEarnings: number;
    avgRating: number;
    totalReviews: number;
    completedSessions: number;
    upcomingSessions: number;
}

// Sidebar Navigation Items
const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: Home, href: '/dashboard' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, href: '/dashboard?tab=schedule' },
    { id: 'patients', label: 'My Patients', icon: Users, href: '/patients' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/messages' },
    { id: 'notes', label: 'Session Notes', icon: FileText, href: '/notes' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard?tab=analytics' },
];

const BOTTOM_NAV_ITEMS = [
    { id: 'support', label: 'Support', icon: HelpCircle, href: '/support' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export default function TherapistDashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);

    // State
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<SessionData[]>([]);
    const [stats, setStats] = useState<TherapistStats>({
        todaySessions: 0,
        totalPatients: 0,
        monthlyEarnings: 0,
        avgRating: 0,
        totalReviews: 0,
        completedSessions: 0,
        upcomingSessions: 0
    });
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [therapistProfile, setTherapistProfile] = useState<any>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeNav, setActiveNav] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal states
    const [prescriptionModal, setPrescriptionModal] = useState<{
        open: boolean;
        bookingId: string;
        patientId: string;
        patientName: string;
    }>({ open: false, bookingId: '', patientId: '', patientName: '' });
    
    const [assessmentModal, setAssessmentModal] = useState<{
        open: boolean;
        patientId: string;
        patientName: string;
    }>({ open: false, patientId: '', patientName: '' });

    const [sessionAnalytics, setSessionAnalytics] = useState({
        weeklyHours: 0,
        avgSessionLength: 0,
        patientRetention: 0,
        cancelRate: 0
    });

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            loadTherapistData();
        }
    }, [user]);

    // Animate on load
    useEffect(() => {
        if (!containerRef.current || loading) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const elements = containerRef.current.querySelectorAll('.dashboard-card');
        gsap.fromTo(elements,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
        );
    }, [loading]);

    const loadTherapistData = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Get therapist profile
            const { data: therapist } = await supabase
                .from('therapists')
                .select('*')
                .eq('user_id', user.id)
                .single();

            setTherapistProfile(therapist);

            if (!therapist) {
                setLoading(false);
                return;
            }

            // Date calculations
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

            // Fetch today's sessions
            const { data: todayBookings } = await supabase
                .from('bookings')
                .select(`
                    id, scheduled_at, service_type, status, duration_minutes, patient_id,
                    meeting_link, zoom_meeting_id, zoom_passcode, zoom_host_key,
                    users!bookings_patient_id_fkey (full_name)
                `)
                .eq('therapist_id', therapist.id)
                .gte('scheduled_at', startOfDay)
                .lt('scheduled_at', endOfDay)
                .order('scheduled_at', { ascending: true });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sessionsData: SessionData[] = (todayBookings || []).map((b: any) => ({
                id: b.id,
                patient_name: b.users?.full_name || 'Patient',
                patient_initial: (b.users?.full_name || 'P').charAt(0).toUpperCase(),
                scheduled_at: b.scheduled_at,
                service_type: b.service_type,
                status: b.status,
                duration_minutes: b.duration_minutes || 50,
                patient_id: b.patient_id,
                meeting_link: b.meeting_link,
                zoom_meeting_id: b.zoom_meeting_id,
                zoom_passcode: b.zoom_passcode,
                zoom_host_key: b.zoom_host_key,
            }));

            setSessions(sessionsData);

            // Fetch upcoming sessions
            const { data: futureBookings } = await supabase
                .from('bookings')
                .select(`
                    id, scheduled_at, service_type, status, duration_minutes, patient_id,
                    meeting_link, zoom_meeting_id, zoom_passcode, zoom_host_key,
                    users!bookings_patient_id_fkey (full_name)
                `)
                .eq('therapist_id', therapist.id)
                .gte('scheduled_at', endOfDay)
                .in('status', ['confirmed', 'pending'])
                .order('scheduled_at', { ascending: true })
                .limit(10);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const upcomingData: SessionData[] = (futureBookings || []).map((b: any) => ({
                id: b.id,
                patient_name: b.users?.full_name || 'Patient',
                patient_initial: (b.users?.full_name || 'P').charAt(0).toUpperCase(),
                scheduled_at: b.scheduled_at,
                service_type: b.service_type,
                status: b.status,
                duration_minutes: b.duration_minutes || 50,
                patient_id: b.patient_id,
                meeting_link: b.meeting_link,
                zoom_meeting_id: b.zoom_meeting_id,
                zoom_passcode: b.zoom_passcode,
                zoom_host_key: b.zoom_host_key,
            }));

            setUpcomingSessions(upcomingData);

            // Fetch stats
            const { data: allBookings } = await supabase
                .from('bookings')
                .select('id, status, amount, scheduled_at, patient_id')
                .eq('therapist_id', therapist.id);

            const { data: monthBookings } = await supabase
                .from('bookings')
                .select('amount, status')
                .eq('therapist_id', therapist.id)
                .gte('scheduled_at', startOfMonth)
                .eq('status', 'completed');

            const uniquePatientIds = new Set((allBookings || []).map(b => b.patient_id));
            const completed = (allBookings || []).filter(b => b.status === 'completed').length;
            const upcoming = (allBookings || []).filter(b => ['confirmed', 'pending'].includes(b.status)).length;
            const monthlyTotal = (monthBookings || []).reduce((sum, b) => sum + (b.amount || 0), 0);

            setStats({
                todaySessions: sessionsData.length,
                totalPatients: uniquePatientIds.size,
                monthlyEarnings: monthlyTotal,
                avgRating: therapist.rating || 0,
                totalReviews: therapist.total_reviews || 0,
                completedSessions: completed,
                upcomingSessions: upcoming
            });

            // Analytics
            const cancelled = (allBookings || []).filter(b => b.status === 'cancelled').length;
            const totalBookings = (allBookings || []).length;
            
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            
            const weeklyBookings = (allBookings || []).filter(b =>
                new Date(b.scheduled_at) >= startOfWeek && b.status === 'completed'
            );
            
            const weeklyHrs = weeklyBookings.length * (50 / 60);
            
            const patientBookingCounts: { [key: string]: number } = {};
            (allBookings || []).forEach(b => {
                if (b.patient_id) {
                    patientBookingCounts[b.patient_id] = (patientBookingCounts[b.patient_id] || 0) + 1;
                }
            });
            const returningPatients = Object.values(patientBookingCounts).filter(count => count >= 2).length;
            const retention = uniquePatientIds.size > 0 ? (returningPatients / uniquePatientIds.size) * 100 : 0;

            setSessionAnalytics({
                weeklyHours: Math.round(weeklyHrs * 10) / 10,
                avgSessionLength: 50,
                patientRetention: Math.round(retention),
                cancelRate: totalBookings > 0 ? Math.round((cancelled / totalBookings) * 100) : 0
            });

        } catch (error) {
            console.error('Error loading therapist data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load dashboard data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleStartSession = (sessionId: string) => {
        navigate(`/call/${sessionId}`);
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatServiceType = (type: string) => {
        return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Session';
    };

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
            case 'pending':
                return 'bg-blue-100 text-blue-700';
            case 'in_progress':
                return 'bg-green-100 text-green-700 animate-pulse';
            case 'completed':
                return 'bg-gray-100 text-gray-600';
            case 'cancelled':
                return 'bg-red-100 text-red-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const completedToday = sessions.filter(s => s.status === 'completed').length;

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!therapistProfile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-lg">
                    <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-cyan-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Profile</h1>
                    <p className="text-gray-600 mb-6">
                        To start accepting clients, please complete your therapist profile.
                    </p>
                    <Link to="/complete-profile">
                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
                            Complete Profile
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!therapistProfile.is_verified) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-lg">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Pending Verification</h1>
                    <p className="text-gray-600 mb-6">
                        Your account is being reviewed. You'll receive an email once verified.
                    </p>
                    <Button variant="outline" onClick={handleSignOut} className="w-full">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Therapist Dashboard | 3tree Counseling</title>
            </Helmet>
            
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar - Desktop */}
                <aside className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
                    sidebarCollapsed ? 'w-20' : 'w-64'
                }`}>
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                        {!sidebarCollapsed && (
                            <Link to="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">3T</span>
                                </div>
                                <span className="font-semibold text-gray-900">3tree</span>
                            </Link>
                        )}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {sidebarCollapsed ? (
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronLeft className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-4 px-3 space-y-1">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.id}
                                to={item.href}
                                onClick={() => setActiveNav(item.id)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                    activeNav === item.id
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${activeNav === item.id ? 'text-white' : ''}`} />
                                {!sidebarCollapsed && (
                                    <span className="font-medium">{item.label}</span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom Navigation */}
                    <div className="py-4 px-3 border-t border-gray-100 space-y-1">
                        {BOTTOM_NAV_ITEMS.map((item) => (
                            <Link
                                key={item.id}
                                to={item.href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                            </Link>
                        ))}
                    </div>

                    {/* User Profile */}
                    <div className="p-4 border-t border-gray-100">
                        <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium">
                                {user?.full_name?.charAt(0) || 'T'}
                            </div>
                            {!sidebarCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{user?.full_name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)} />
                )}

                {/* Mobile Sidebar */}
                <aside className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 transform transition-transform ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">3T</span>
                            </div>
                            <span className="font-semibold text-gray-900">3tree</span>
                        </Link>
                        <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <nav className="py-4 px-3 space-y-1">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.id}
                                to={item.href}
                                onClick={() => { setActiveNav(item.id); setMobileMenuOpen(false); }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                    activeNav === item.id
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                    {/* Top Header */}
                    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
                                <Search className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search patients, sessions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm w-48 lg:w-64"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="relative p-2 hover:bg-gray-100 rounded-xl">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                            <button
                                onClick={loadTherapistData}
                                className="p-2 hover:bg-gray-100 rounded-xl"
                                title="Refresh"
                            >
                                <RefreshCw className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm">Sign out</span>
                            </button>
                        </div>
                    </header>

                    {/* Dashboard Content */}
                    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 lg:p-8">
                        {/* Welcome Section */}
                        <div className="dashboard-card mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                        {getTimeOfDay()}, Dr. {user?.full_name?.split(' ')[0]} 👋
                                    </h1>
                                    <p className="text-gray-500 mt-1">
                                        {sessions.length > 0
                                            ? `You have ${sessions.length - completedToday} session${sessions.length - completedToday !== 1 ? 's' : ''} remaining today`
                                            : "No sessions scheduled for today"
                                        }
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="border-gray-200"
                                        onClick={() => navigate('/booking-management')}
                                    >
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Manage Bookings
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="dashboard-card grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {/* Today's Sessions */}
                            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                        {completedToday} done
                                    </span>
                                </div>
                                <p className="text-3xl font-bold">{stats.todaySessions}</p>
                                <p className="text-cyan-100 text-sm">Today's Sessions</p>
                            </div>

                            {/* Total Patients */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                                <p className="text-gray-500 text-sm">Total Patients</p>
                            </div>

                            {/* Monthly Earnings */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    ${stats.monthlyEarnings.toLocaleString()}
                                </p>
                                <p className="text-gray-500 text-sm">This Month</p>
                            </div>

                            {/* Rating */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <Star className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="text-xs text-gray-400">{stats.totalReviews} reviews</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{stats.avgRating || '-'}</p>
                                <p className="text-gray-500 text-sm">Avg Rating</p>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Today's Schedule */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="dashboard-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-5 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
                                            <span className="text-sm text-gray-500">
                                                {completedToday}/{sessions.length} completed
                                            </span>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-gray-100">
                                        {sessions.length > 0 ? (
                                            sessions.map((session) => (
                                                <SessionCard
                                                    key={session.id}
                                                    session={session}
                                                    onJoin={() => handleStartSession(session.id)}
                                                    onViewAssessment={() => setAssessmentModal({
                                                        open: true,
                                                        patientId: session.patient_id,
                                                        patientName: session.patient_name
                                                    })}
                                                    onWritePrescription={() => setPrescriptionModal({
                                                        open: true,
                                                        bookingId: session.id,
                                                        patientId: session.patient_id,
                                                        patientName: session.patient_name
                                                    })}
                                                    formatTime={formatTime}
                                                    formatServiceType={formatServiceType}
                                                    getStatusColor={getStatusColor}
                                                />
                                            ))
                                        ) : (
                                            <div className="p-12 text-center">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Calendar className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-900 font-medium mb-1">No sessions today</p>
                                                <p className="text-gray-500 text-sm">Enjoy your day off!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upcoming Sessions */}
                                {upcomingSessions.length > 0 && (
                                    <div className="dashboard-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="p-5 border-b border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
                                                <Link to="/booking-management" className="text-sm text-cyan-600 hover:text-cyan-700">
                                                    View all
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {upcomingSessions.slice(0, 5).map((session) => (
                                                <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                            {session.patient_initial}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 truncate">
                                                                {session.patient_name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {formatDate(session.scheduled_at)} • {formatTime(session.scheduled_at)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="btn-icy text-xs"
                                                                onClick={() => handleStartSession(session.id)}
                                                                title="Join meeting"
                                                            >
                                                                <Video className="w-3 h-3 mr-1" />
                                                                Join
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setAssessmentModal({
                                                                    open: true,
                                                                    patientId: session.patient_id,
                                                                    patientName: session.patient_name
                                                                })}
                                                                title="View assessments"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Cards */}
                            <div className="space-y-6">
                                {/* Quick Actions */}
                                <div className="dashboard-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'My Patients', href: '/patients', icon: Users, color: 'text-purple-500' },
                                            { label: 'Session Notes', href: '/notes', icon: FileText, color: 'text-blue-500' },
                                            { label: 'Messages', href: '/messages', icon: MessageCircle, color: 'text-green-500' },
                                            { label: 'My Profile', href: '/profile', icon: User, color: 'text-amber-500' },
                                        ].map((item) => (
                                            <Link
                                                key={item.label}
                                                to={item.href}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                            >
                                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                                <span className="text-gray-700 group-hover:text-gray-900 flex-1">
                                                    {item.label}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Analytics Card */}
                                <div className="dashboard-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Activity className="w-5 h-5 text-cyan-500" />
                                        <h3 className="font-semibold text-gray-900">Performance</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-xs text-gray-500 mb-1">Weekly Hours</p>
                                            <p className="text-xl font-bold text-gray-900">{sessionAnalytics.weeklyHours}h</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-xs text-gray-500 mb-1">Avg Session</p>
                                            <p className="text-xl font-bold text-gray-900">{sessionAnalytics.avgSessionLength}m</p>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-3">
                                            <p className="text-xs text-green-600 mb-1">Retention</p>
                                            <p className="text-xl font-bold text-green-700">{sessionAnalytics.patientRetention}%</p>
                                        </div>
                                        <div className={`rounded-xl p-3 ${sessionAnalytics.cancelRate > 10 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                            <p className={`text-xs mb-1 ${sessionAnalytics.cancelRate > 10 ? 'text-red-600' : 'text-gray-500'}`}>
                                                Cancel Rate
                                            </p>
                                            <p className={`text-xl font-bold ${sessionAnalytics.cancelRate > 10 ? 'text-red-700' : 'text-gray-900'}`}>
                                                {sessionAnalytics.cancelRate}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="dashboard-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <h3 className="font-semibold text-gray-900 mb-4">Session Progress</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">Completed</span>
                                                <span className="font-medium">{stats.completedSessions}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                                    style={{
                                                        width: `${Math.min(
                                                            (stats.completedSessions / Math.max(stats.completedSessions + stats.upcomingSessions, 1)) * 100,
                                                            100
                                                        )}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">Upcoming</span>
                                                <span className="font-medium">{stats.upcomingSessions}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                                    style={{
                                                        width: `${Math.min(
                                                            (stats.upcomingSessions / Math.max(stats.completedSessions + stats.upcomingSessions, 1)) * 100,
                                                            100
                                                        )}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
            <PrescriptionModal
                isOpen={prescriptionModal.open}
                onClose={() => setPrescriptionModal({ open: false, bookingId: '', patientId: '', patientName: '' })}
                bookingId={prescriptionModal.bookingId}
                therapistId={therapistProfile?.id || ''}
                patientId={prescriptionModal.patientId}
                patientName={prescriptionModal.patientName}
                therapistName={user?.full_name || ''}
            />

            <PatientAssessmentPreview
                isOpen={assessmentModal.open}
                onClose={() => setAssessmentModal({ open: false, patientId: '', patientName: '' })}
                patientId={assessmentModal.patientId}
                patientName={assessmentModal.patientName}
            />
        </>
    );
}

/**
 * Session Card Component
 */
function SessionCard({
    session,
    onJoin,
    onViewAssessment,
    onWritePrescription,
    formatTime,
    formatServiceType,
    getStatusColor
}: {
    session: SessionData;
    onJoin: () => void;
    onViewAssessment: () => void;
    onWritePrescription: () => void;
    formatTime: (date: string) => string;
    formatServiceType: (type: string) => string;
    getStatusColor: (status: string) => string;
}) {
    const [showActions, setShowActions] = useState(false);
    const isActive = ['confirmed', 'pending', 'in_progress'].includes(session.status);

    return (
        <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    session.status === 'completed'
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                }`}>
                    {session.patient_initial}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 truncate">{session.patient_name}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                            {session.status === 'in_progress' ? 'In Progress' : session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        {formatServiceType(session.service_type)} • {session.duration_minutes} min
                    </p>
                </div>

                {/* Time */}
                <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{formatTime(session.scheduled_at)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {isActive && (
                        <>
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                                onClick={onJoin}
                            >
                                <Video className="w-4 h-4 mr-1" />
                                Join
                            </Button>
                            <div className="relative">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowActions(!showActions)}
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                                {showActions && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowActions(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                            <button
                                                onClick={() => { onViewAssessment(); setShowActions(false); }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <ClipboardList className="w-4 h-4 text-purple-500" />
                                                View Assessments
                                            </button>
                                            <button
                                                onClick={() => { onWritePrescription(); setShowActions(false); }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Pill className="w-4 h-4 text-cyan-500" />
                                                Write Prescription
                                            </button>
                                            <Link
                                                to={`/messages`}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <MessageCircle className="w-4 h-4 text-green-500" />
                                                Send Message
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                    {session.status === 'completed' && (
                        <Button size="sm" variant="ghost">
                            <FileText className="w-4 h-4 mr-1" />
                            Notes
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
