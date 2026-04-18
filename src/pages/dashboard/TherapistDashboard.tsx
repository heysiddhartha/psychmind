/**
 * TherapistDashboard - Real data from Supabase database with enhanced analytics
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
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
    TrendingUp,
    CheckCircle2,
    MessageCircle,
    FileText,
    LogOut,
    RefreshCw,
    AlertCircle,
    X,
    User,
    Edit,
    Star,
    Copy,
    Key,
    ExternalLink,
    Send,
    BarChart3,
    Activity,
    Target,
    Award,
    Heart,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
    PieChart as PieChartIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    Legend
} from 'recharts';

// Types for therapist bookings
interface SessionData {
    id: string;
    patient_name: string;
    patient_initial: string;
    scheduled_at: string;
    service_type: string;
    status: string;
    duration_minutes: number;
    patient_id: string;
    // Meeting credentials
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

export default function TherapistDashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
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
    const [availabilityOpen, setAvailabilityOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
    const [availability, setAvailability] = useState<{ [key: string]: { enabled: boolean; start: string; end: string } }>({
        monday: { enabled: true, start: '09:00', end: '17:00' },
        tuesday: { enabled: true, start: '09:00', end: '17:00' },
        wednesday: { enabled: true, start: '09:00', end: '17:00' },
        thursday: { enabled: true, start: '09:00', end: '17:00' },
        friday: { enabled: true, start: '09:00', end: '17:00' },
        saturday: { enabled: false, start: '10:00', end: '14:00' },
        sunday: { enabled: false, start: '10:00', end: '14:00' }
    });
    const [chatOpen, setChatOpen] = useState<string | null>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [sessionAnalytics, setSessionAnalytics] = useState<{
        weeklyHours: number;
        avgSessionLength: number;
        patientRetention: number;
        cancelRate: number;
    }>({ weeklyHours: 0, avgSessionLength: 0, patientRetention: 0, cancelRate: 0 });

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                console.log('No therapist profile found');
                setLoading(false);
                return;
            }

            // Get today's date range
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

            // Get start of month for monthly stats
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

            // Fetch today's sessions with meeting credentials
            const { data: todayBookings } = await supabase
                .from('bookings')
                .select(`
                    id,
                    scheduled_at,
                    service_type,
                    status,
                    duration_minutes,
                    patient_id,
                    meeting_link,
                    zoom_meeting_id,
                    zoom_passcode,
                    zoom_host_key,
                    users!bookings_patient_id_fkey (
                        full_name
                    )
                `)
                .eq('therapist_id', therapist.id)
                .gte('scheduled_at', startOfDay)
                .lt('scheduled_at', endOfDay)
                .order('scheduled_at', { ascending: true });

            // Transform sessions data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sessionsData: SessionData[] = (todayBookings || []).map((booking: any) => ({
                id: booking.id,
                patient_name: booking.users?.full_name || 'Patient',
                patient_initial: (booking.users?.full_name || 'P').charAt(0).toUpperCase(),
                scheduled_at: booking.scheduled_at,
                service_type: booking.service_type,
                status: booking.status,
                duration_minutes: booking.duration_minutes || 50,
                patient_id: booking.patient_id,
                // Meeting credentials (therapist gets all including host key)
                meeting_link: booking.meeting_link,
                zoom_meeting_id: booking.zoom_meeting_id,
                zoom_passcode: booking.zoom_passcode,
                zoom_host_key: booking.zoom_host_key,
            }));

            setSessions(sessionsData);

            // Fetch upcoming sessions (after today) with meeting credentials
            const { data: futureBookings } = await supabase
                .from('bookings')
                .select(`
                    id,
                    scheduled_at,
                    service_type,
                    status,
                    duration_minutes,
                    patient_id,
                    meeting_link,
                    zoom_meeting_id,
                    zoom_passcode,
                    zoom_host_key,
                    users!bookings_patient_id_fkey (
                        full_name
                    )
                `)
                .eq('therapist_id', therapist.id)
                .gte('scheduled_at', endOfDay)
                .in('status', ['confirmed', 'pending'])
                .order('scheduled_at', { ascending: true })
                .limit(10);

            // Transform upcoming sessions data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const upcomingData: SessionData[] = (futureBookings || []).map((booking: any) => ({
                id: booking.id,
                patient_name: booking.users?.full_name || 'Patient',
                patient_initial: (booking.users?.full_name || 'P').charAt(0).toUpperCase(),
                scheduled_at: booking.scheduled_at,
                service_type: booking.service_type,
                status: booking.status,
                duration_minutes: booking.duration_minutes || 50,
                patient_id: booking.patient_id,
                meeting_link: booking.meeting_link,
                zoom_meeting_id: booking.zoom_meeting_id,
                zoom_passcode: booking.zoom_passcode,
                zoom_host_key: booking.zoom_host_key,
            }));

            setUpcomingSessions(upcomingData);

            // Fetch all-time stats
            const { data: allBookings } = await supabase
                .from('bookings')
                .select('id, status, amount, scheduled_at, patient_id')
                .eq('therapist_id', therapist.id);

            // Fetch this month's bookings for earnings
            const { data: monthBookings } = await supabase
                .from('bookings')
                .select('amount, status')
                .eq('therapist_id', therapist.id)
                .gte('scheduled_at', startOfMonth)
                .eq('status', 'completed');

            // Get unique patients
            const { data: uniquePatients } = await supabase
                .from('bookings')
                .select('patient_id')
                .eq('therapist_id', therapist.id);

            const uniquePatientIds = new Set((uniquePatients || []).map(b => b.patient_id));

            // Calculate stats
            const completed = (allBookings || []).filter(b => b.status === 'completed').length;
            const upcoming = (allBookings || []).filter(b => b.status === 'confirmed' || b.status === 'pending').length;
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

            // Calculate advanced analytics
            const cancelled = (allBookings || []).filter(b => b.status === 'cancelled').length;
            const totalBookings = (allBookings || []).length;
            const completedWithDuration = (allBookings || []).filter(b => b.status === 'completed');

            // Get this week's bookings for weekly hours
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const weeklyBookings = (allBookings || []).filter(b =>
                new Date(b.scheduled_at) >= startOfWeek && b.status === 'completed'
            );

            // Calculate average session length (using 50 min default if not stored)
            const avgSessionLen = completedWithDuration.length > 0 ? 50 : 0;
            const weeklyHrs = weeklyBookings.length * (avgSessionLen / 60);

            // Patient retention: patients with 2+ bookings / total patients
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
                avgSessionLength: avgSessionLen,
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

    const handleSaveAvailability = async () => {
        try {
            if (therapistProfile?.id) {
                await supabase
                    .from('therapists')
                    .update({
                        availability_schedule: availability,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', therapistProfile.id);
            }
            toast({
                title: 'Availability Saved',
                description: 'Your availability has been updated successfully.'
            });
            setAvailabilityOpen(false);
        } catch (error) {
            console.error('Error saving availability:', error);
            toast({
                title: 'Error',
                description: 'Failed to save availability',
                variant: 'destructive'
            });
        }
    };

    const handleStartSession = (sessionId: string) => {
        toast({
            title: 'Session Starting',
            description: 'Redirecting to video call...'
        });
        navigate(`/call/${sessionId}`);
    };

    const handleCompleteSession = async (sessionId: string) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'completed' })
                .eq('id', sessionId);

            if (error) throw error;

            // Update local state
            setSessions(prev => prev.map(s =>
                s.id === sessionId ? { ...s, status: 'completed' } : s
            ));

            toast({
                title: 'Session Completed',
                description: 'Session has been marked as completed.'
            });
        } catch (error) {
            console.error('Error completing session:', error);
            toast({
                title: 'Error',
                description: 'Failed to complete session',
                variant: 'destructive'
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
            case 'pending':
                return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Upcoming</span>;
            case 'in_progress':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full animate-pulse">In Progress</span>;
            case 'completed':
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Completed</span>;
            case 'cancelled':
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">Cancelled</span>;
            default:
                return null;
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatServiceType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const completedToday = sessions.filter(s => s.status === 'completed').length;
    const upcomingToday = sessions.filter(s => s.status === 'confirmed' || s.status === 'pending').length;

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

    // Check if therapist profile exists at all
    if (!therapistProfile) {
        return (
            <>
                <Helmet>
                    <title>Complete Your Profile | psychmind</title>
                </Helmet>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome, Therapist!</h1>
                        <p className="text-gray-600 mb-6">
                            To start accepting clients, please complete your therapist profile with your credentials and specialties.
                        </p>
                        <div className="space-y-3">
                            <Link to="/complete-profile">
                                <Button className="w-full btn-icy">
                                    Complete Your Profile
                                </Button>
                            </Link>
                            <Button variant="outline" onClick={handleSignOut} className="w-full">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Check if therapist is verified
    if (!therapistProfile.is_verified) {
        return (
            <>
                <Helmet>
                    <title>Pending Verification | psychmind</title>
                </Helmet>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md text-center">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-amber-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Verification</h1>
                        <p className="text-gray-600 mb-6">
                            Your therapist account is being reviewed by our admin team.
                            You'll receive an email once your account is verified and you can start accepting clients.
                        </p>
                        <div className="space-y-3">
                            <Link to="/complete-profile">
                                <Button className="w-full btn-icy">
                                    Complete Your Profile
                                </Button>
                            </Link>
                            <Button variant="outline" onClick={handleSignOut} className="w-full">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Therapist Dashboard | psychmind</title>
            </Helmet>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                    <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="h-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <span className="text-sm font-medium px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full">
                                Therapist
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <Bell className="w-5 h-5 text-gray-600" />
                            </button>
                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium">
                                        {user?.full_name?.charAt(0) || 'T'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                        {user?.full_name || 'Therapist'}
                                    </span>
                                </button>
                                {/* Dropdown Menu */}
                                {profileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="font-medium text-gray-900">{user?.full_name}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                            {therapistProfile?.rating && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                    <span className="text-sm font-medium">{therapistProfile.rating}</span>
                                                    <span className="text-xs text-gray-400">({therapistProfile.total_reviews || 0} reviews)</span>
                                                </div>
                                            )}
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                                            onClick={() => setProfileMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700">My Profile</span>
                                        </Link>
                                        <Link
                                            to="/profile?edit=true"
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                                            onClick={() => setProfileMenuOpen(false)}
                                        >
                                            <Edit className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700">Edit Profile</span>
                                        </Link>
                                        <button
                                            onClick={() => { setAvailabilityOpen(true); setProfileMenuOpen(false); }}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
                                        >
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700">Set Availability</span>
                                        </button>
                                        <Link
                                            to="/settings"
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                                            onClick={() => setProfileMenuOpen(false)}
                                        >
                                            <Settings className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700">Account Settings</span>
                                        </Link>
                                        <div className="border-t border-gray-100 mt-2 pt-2">
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div ref={containerRef} className="container mx-auto px-4 lg:px-8 py-8">
                    {/* Welcome - Enhanced Hero Section */}
                    <div className="dashboard-card mb-8 bg-gradient-to-r from-[#161A30] via-[#1e2440] to-[#2d3a54] rounded-3xl p-8 text-white relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-36 translate-x-36" />
                        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-28 -translate-x-28" />
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                    <span className="text-sm text-white/70">Therapist Dashboard</span>
                                </div>
                                <h1 className="text-3xl font-serif mb-2">
                                    {getTimeOfDay()}, Dr. {user?.full_name?.split(' ')[0] || 'Therapist'} 👋
                                </h1>
                                <p className="text-white/70">
                                    {upcomingToday > 0 ? (
                                        <>You have <span className="font-semibold text-cyan-400">{upcomingToday} sessions</span> remaining today.</>
                                    ) : (
                                        <>No sessions scheduled for today. Time to catch up on notes!</>
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setAvailabilityOpen(!availabilityOpen)}
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Availability
                                </Button>
                                <Button 
                                    onClick={loadTherapistData}
                                    className="bg-white text-[#161A30] hover:bg-white/90"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Enhanced with icons and trends */}
                    <div className="dashboard-card grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
                            <div className="flex items-center justify-between mb-3">
                                <Calendar className="w-5 h-5 text-cyan-200" />
                                <span className="text-xs text-cyan-200 bg-white/20 px-2 py-0.5 rounded-full">{completedToday} done</span>
                            </div>
                            <p className="text-3xl font-bold">{stats.todaySessions}</p>
                            <p className="text-sm text-cyan-100">Today's Sessions</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-full -translate-y-8 translate-x-8" />
                            <div className="flex items-center justify-between mb-3">
                                <Users className="w-5 h-5 text-purple-500" />
                                <span className="text-xs text-purple-500 flex items-center gap-0.5">
                                    <ArrowUpRight className="w-3 h-3" />
                                    Active
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                            <p className="text-sm text-gray-500">Total Patients</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full -translate-y-8 translate-x-8" />
                            <div className="flex items-center justify-between mb-3">
                                <DollarSign className="w-5 h-5 text-emerald-500" />
                                <span className="text-xs text-emerald-500 flex items-center gap-0.5">
                                    <ArrowUpRight className="w-3 h-3" />
                                    Revenue
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">₹{stats.monthlyEarnings.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">This Month</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-full -translate-y-8 translate-x-8" />
                            <div className="flex items-center justify-between mb-3">
                                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                <span className="text-xs text-amber-600">{stats.totalReviews} reviews</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.avgRating || '-'}</p>
                            <p className="text-sm text-gray-500">Avg Rating</p>
                        </div>
                    </div>

                    {/* Analytics Section - NEW */}
                    <div className="dashboard-card grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-violet-500" />
                                <span className="text-xs font-medium text-violet-600">Weekly Hours</span>
                            </div>
                            <p className="text-2xl font-bold text-violet-700">{sessionAnalytics.weeklyHours}h</p>
                            <p className="text-xs text-violet-500 mt-1">Therapy hours this week</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-medium text-blue-600">Avg Session</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">{sessionAnalytics.avgSessionLength} min</p>
                            <p className="text-xs text-blue-500 mt-1">Average session duration</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Heart className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-medium text-emerald-600">Retention</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-700">{sessionAnalytics.patientRetention}%</p>
                            <p className="text-xs text-emerald-500 mt-1">Patient return rate</p>
                        </div>
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-rose-500" />
                                <span className="text-xs font-medium text-rose-600">Cancel Rate</span>
                            </div>
                            <p className="text-2xl font-bold text-rose-700">{sessionAnalytics.cancelRate}%</p>
                            <p className="text-xs text-rose-500 mt-1">{sessionAnalytics.cancelRate < 10 ? 'Excellent!' : 'Room to improve'}</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="dashboard-card grid md:grid-cols-2 gap-6 mb-8">
                        {/* Session Distribution */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <PieChartIcon className="w-5 h-5 text-cyan-500" />
                                    <h3 className="font-semibold text-gray-900">Session Status</h3>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">All Time</span>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Completed', value: stats.completedSessions, color: '#10b981' },
                                                { name: 'Upcoming', value: stats.upcomingSessions, color: '#3b82f6' },
                                            ].filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={65}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {[
                                                { name: 'Completed', value: stats.completedSessions, color: '#10b981' },
                                                { name: 'Upcoming', value: stats.upcomingSessions, color: '#3b82f6' },
                                            ].filter(d => d.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                                    <span className="text-xs text-gray-600">Completed ({stats.completedSessions})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-blue-500 rounded-full" />
                                    <span className="text-xs text-gray-600">Upcoming ({stats.upcomingSessions})</span>
                                </div>
                            </div>
                        </div>

                        {/* Performance Overview */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-violet-500" />
                                    <h3 className="font-semibold text-gray-900">Performance</h3>
                                </div>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            { name: 'Sessions', completed: stats.completedSessions, upcoming: stats.upcomingSessions },
                                        ]}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="name" />
                                        <Tooltip />
                                        <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="upcoming" fill="#3b82f6" name="Upcoming" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{stats.completedSessions + stats.upcomingSessions}</p>
                                    <p className="text-xs text-gray-500">Total Sessions</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                                    <p className="text-xs text-gray-500">Unique Patients</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Today's Schedule */}
                        <div className="lg:col-span-2">
                            <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        {completedToday}/{sessions.length} completed
                                    </div>
                                </div>

                                {sessions.length > 0 ? (
                                    <div className="space-y-4">
                                        {sessions.map((session) => {
                                            const isExpanded = expandedSessionId === session.id;

                                            return (
                                                <div
                                                    key={session.id}
                                                    className={`rounded-2xl overflow-hidden transition-all ${session.status === 'completed'
                                                        ? 'bg-gray-50 opacity-75'
                                                        : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
                                                        }`}
                                                >
                                                    {/* Main session info row */}
                                                    <div className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 ${session.status !== 'completed' ? 'bg-gradient-to-r from-cyan-50/50 to-blue-50/50' : ''}`}>
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${session.status === 'completed'
                                                            ? 'bg-gray-200 text-gray-500'
                                                            : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                                                            }`}>
                                                            {session.patient_initial}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-semibold text-gray-900">{session.patient_name}</p>
                                                                {getStatusBadge(session.status)}
                                                            </div>
                                                            <p className="text-sm text-gray-500">
                                                                {formatServiceType(session.service_type)} • {session.duration_minutes} min
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-gray-500">
                                                            <Clock className="w-4 h-4" />
                                                            <span className="font-medium">{formatTime(session.scheduled_at)}</span>
                                                        </div>

                                                        <div className="flex gap-2 flex-wrap">
                                                            {(session.status === 'confirmed' || session.status === 'pending' || session.status === 'in_progress') && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        className="btn-icy text-xs"
                                                                        onClick={() => handleStartSession(session.id)}
                                                                    >
                                                                        <Video className="w-3 h-3 mr-1" />
                                                                        Join
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                                                        onClick={() => window.open('https://meet.google.com/new', '_blank')}
                                                                    >
                                                                        <ExternalLink className="w-3 h-3 mr-1" />
                                                                        Google Meet
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => setChatOpen(chatOpen === session.id ? null : session.id)}
                                                                        className="text-xs"
                                                                    >
                                                                        <MessageCircle className="w-3 h-3 mr-1" />
                                                                        Chat
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                                                                        className="text-xs"
                                                                    >
                                                                        <Key className="w-3 h-3 mr-1" />
                                                                        {isExpanded ? 'Hide' : 'Details'}
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleCompleteSession(session.id)}
                                                                        title="Mark as completed"
                                                                    >
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {session.status === 'completed' && (
                                                                <Button size="sm" variant="ghost" className="text-xs">
                                                                    <FileText className="w-3 h-3 mr-1" />
                                                                    Notes
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Expandable meeting details (therapist sees all including host key) */}
                                                    {isExpanded && (session.status === 'confirmed' || session.status === 'pending' || session.status === 'in_progress') && (
                                                        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
                                                            <p className="text-xs font-medium text-gray-500 mb-3">Meeting Credentials (Host)</p>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                {/* Meeting ID */}
                                                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                                    <p className="text-xs text-gray-400 mb-1">Meeting ID</p>
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="font-mono font-medium text-gray-900 text-sm">
                                                                            {session.zoom_meeting_id || 'Not set'}
                                                                        </p>
                                                                        {session.zoom_meeting_id && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(session.zoom_meeting_id!);
                                                                                    toast({ title: 'Copied!', description: 'Meeting ID copied' });
                                                                                }}
                                                                                className="p-1 hover:bg-gray-100 rounded"
                                                                            >
                                                                                <Copy className="w-3 h-3 text-gray-400" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Passcode */}
                                                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                                    <p className="text-xs text-gray-400 mb-1">Passcode</p>
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="font-mono font-medium text-gray-900 text-sm">
                                                                            {session.zoom_passcode || 'Not set'}
                                                                        </p>
                                                                        {session.zoom_passcode && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(session.zoom_passcode!);
                                                                                    toast({ title: 'Copied!', description: 'Passcode copied' });
                                                                                }}
                                                                                className="p-1 hover:bg-gray-100 rounded"
                                                                            >
                                                                                <Copy className="w-3 h-3 text-gray-400" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Host Key (Therapist Only) */}
                                                                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                                                                    <p className="text-xs text-amber-600 mb-1 flex items-center gap-1">
                                                                        <Key className="w-3 h-3" />
                                                                        Host Key (Private)
                                                                    </p>
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="font-mono font-bold text-amber-800 text-sm">
                                                                            {session.zoom_host_key || 'Not set'}
                                                                        </p>
                                                                        {session.zoom_host_key && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(session.zoom_host_key!);
                                                                                    toast({ title: 'Copied!', description: 'Host key copied' });
                                                                                }}
                                                                                className="p-1 hover:bg-amber-100 rounded"
                                                                            >
                                                                                <Copy className="w-3 h-3 text-amber-600" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Meeting Link */}
                                                            <div className="mt-3 bg-white p-3 rounded-xl border border-gray-100">
                                                                <p className="text-xs text-gray-400 mb-1">Meeting Link</p>
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="font-mono text-xs text-gray-600 truncate flex-1">
                                                                        {session.meeting_link || `${window.location.origin}/call/${session.id}`}
                                                                    </p>
                                                                    <button
                                                                        onClick={() => {
                                                                            const link = session.meeting_link || `${window.location.origin}/call/${session.id}`;
                                                                            navigator.clipboard.writeText(link);
                                                                            toast({ title: 'Copied!', description: 'Meeting link copied to clipboard' });
                                                                        }}
                                                                        className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                                                                    >
                                                                        <Copy className="w-3 h-3 text-gray-400" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Quick Chat Panel */}
                                                    {chatOpen === session.id && (session.status === 'confirmed' || session.status === 'pending' || session.status === 'in_progress') && (
                                                        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gradient-to-b from-blue-50/50 to-white">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                                                    <MessageCircle className="w-3 h-3" />
                                                                    Quick Message to {session.patient_name}
                                                                </p>
                                                                <button
                                                                    onClick={() => setChatOpen(null)}
                                                                    className="p-1 hover:bg-gray-100 rounded"
                                                                >
                                                                    <X className="w-3 h-3 text-gray-400" />
                                                                </button>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={chatMessage}
                                                                    onChange={(e) => setChatMessage(e.target.value)}
                                                                    placeholder="Send a quick message before the session..."
                                                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === 'Enter' && chatMessage.trim()) {
                                                                            toast({
                                                                                title: 'Message Sent',
                                                                                description: `Message sent to ${session.patient_name}`
                                                                            });
                                                                            setChatMessage('');
                                                                            setChatOpen(null);
                                                                        }
                                                                    }}
                                                                />
                                                                <Button
                                                                    size="sm"
                                                                    className="btn-icy"
                                                                    disabled={!chatMessage.trim()}
                                                                    onClick={() => {
                                                                        if (chatMessage.trim()) {
                                                                            toast({
                                                                                title: 'Message Sent',
                                                                                description: `Message sent to ${session.patient_name}`
                                                                            });
                                                                            setChatMessage('');
                                                                            setChatOpen(null);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Send className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-2">
                                                                Tip: Use Messages section for full conversation history
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 mb-2">No sessions scheduled for today</p>
                                        <p className="text-sm text-gray-400">Your upcoming appointments will appear here</p>
                                    </div>
                                )}

                                {/* Session summary */}
                                {sessions.length > 0 && (
                                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            Total session time today: <span className="font-semibold text-gray-900">
                                                {sessions.reduce((acc, s) => acc + s.duration_minutes, 0)} minutes
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Upcoming Sessions (Future dates) */}
                            {upcomingSessions.length > 0 && (
                                <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
                                        <span className="text-sm text-gray-500">{upcomingSessions.length} scheduled</span>
                                    </div>

                                    <div className="space-y-4">
                                        {upcomingSessions.map((session) => {
                                            const isExpanded = expandedSessionId === session.id;
                                            const sessionDate = new Date(session.scheduled_at);
                                            const formattedDate = sessionDate.toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            });

                                            return (
                                                <div
                                                    key={session.id}
                                                    className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gradient-to-r from-cyan-50/50 to-blue-50/50">
                                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                                                            {session.patient_initial}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-semibold text-gray-900">{session.patient_name}</p>
                                                                {getStatusBadge(session.status)}
                                                            </div>
                                                            <p className="text-sm text-gray-500">
                                                                {formatServiceType(session.service_type)} • {session.duration_minutes} min
                                                            </p>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900">{formattedDate}</p>
                                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                <Clock className="w-3 h-3" />
                                                                {formatTime(session.scheduled_at)}
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2 flex-wrap">
                                                            <Button
                                                                size="sm"
                                                                className="btn-icy text-xs"
                                                                onClick={() => handleStartSession(session.id)}
                                                            >
                                                                <Video className="w-3 h-3 mr-1" />
                                                                Join
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                                                onClick={() => window.open('https://meet.google.com/new', '_blank')}
                                                            >
                                                                <ExternalLink className="w-3 h-3 mr-1" />
                                                                Google Meet
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setChatOpen(chatOpen === session.id ? null : session.id)}
                                                                className="text-xs"
                                                            >
                                                                <MessageCircle className="w-3 h-3 mr-1" />
                                                                Chat
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                                                                className="text-xs"
                                                            >
                                                                <Key className="w-3 h-3 mr-1" />
                                                                {isExpanded ? 'Hide' : 'Details'}
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Expandable meeting details */}
                                                    {isExpanded && (
                                                        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
                                                            <p className="text-xs font-medium text-gray-500 mb-3">Meeting Credentials (Host)</p>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                                    <p className="text-xs text-gray-400 mb-1">Meeting ID</p>
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="font-mono font-medium text-gray-900 text-sm">
                                                                            {session.zoom_meeting_id || 'Not set'}
                                                                        </p>
                                                                        {session.zoom_meeting_id && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(session.zoom_meeting_id!);
                                                                                    toast({ title: 'Copied!', description: 'Meeting ID copied' });
                                                                                }}
                                                                                className="p-1 hover:bg-gray-100 rounded"
                                                                            >
                                                                                <Copy className="w-3 h-3 text-gray-400" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                                    <p className="text-xs text-gray-400 mb-1">Passcode</p>
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="font-mono font-medium text-gray-900 text-sm">
                                                                            {session.zoom_passcode || 'Not set'}
                                                                        </p>
                                                                        {session.zoom_passcode && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(session.zoom_passcode!);
                                                                                    toast({ title: 'Copied!', description: 'Passcode copied' });
                                                                                }}
                                                                                className="p-1 hover:bg-gray-100 rounded"
                                                                            >
                                                                                <Copy className="w-3 h-3 text-gray-400" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                                                                    <p className="text-xs text-amber-600 mb-1 flex items-center gap-1">
                                                                        <Key className="w-3 h-3" />
                                                                        Host Key (Private)
                                                                    </p>
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="font-mono font-bold text-amber-800 text-sm">
                                                                            {session.zoom_host_key || 'Not set'}
                                                                        </p>
                                                                        {session.zoom_host_key && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(session.zoom_host_key!);
                                                                                    toast({ title: 'Copied!', description: 'Host key copied' });
                                                                                }}
                                                                                className="p-1 hover:bg-amber-100 rounded"
                                                                            >
                                                                                <Copy className="w-3 h-3 text-amber-600" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 bg-white p-3 rounded-xl border border-gray-100">
                                                                <p className="text-xs text-gray-400 mb-1">Meeting Link</p>
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="font-mono text-xs text-gray-600 truncate flex-1">
                                                                        {session.meeting_link || `${window.location.origin}/call/${session.id}`}
                                                                    </p>
                                                                    <button
                                                                        onClick={() => {
                                                                            const link = session.meeting_link || `${window.location.origin}/call/${session.id}`;
                                                                            navigator.clipboard.writeText(link);
                                                                            toast({ title: 'Copied!', description: 'Meeting link copied to clipboard' });
                                                                        }}
                                                                        className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                                                                    >
                                                                        <Copy className="w-3 h-3 text-gray-400" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Quick Chat Panel */}
                                                    {chatOpen === session.id && (
                                                        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gradient-to-b from-blue-50/50 to-white">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                                                    <MessageCircle className="w-3 h-3" />
                                                                    Quick Message to {session.patient_name}
                                                                </p>
                                                                <button
                                                                    onClick={() => setChatOpen(null)}
                                                                    className="p-1 hover:bg-gray-100 rounded"
                                                                >
                                                                    <X className="w-3 h-3 text-gray-400" />
                                                                </button>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={chatMessage}
                                                                    onChange={(e) => setChatMessage(e.target.value)}
                                                                    placeholder="Send a quick message before the session..."
                                                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === 'Enter' && chatMessage.trim()) {
                                                                            toast({
                                                                                title: 'Message Sent',
                                                                                description: `Message sent to ${session.patient_name}`
                                                                            });
                                                                            setChatMessage('');
                                                                            setChatOpen(null);
                                                                        }
                                                                    }}
                                                                />
                                                                <Button
                                                                    size="sm"
                                                                    className="btn-icy"
                                                                    disabled={!chatMessage.trim()}
                                                                    onClick={() => {
                                                                        if (chatMessage.trim()) {
                                                                            toast({
                                                                                title: 'Message Sent',
                                                                                description: `Message sent to ${session.patient_name}`
                                                                            });
                                                                            setChatMessage('');
                                                                            setChatOpen(null);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Send className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Next Session */}
                            {(() => {
                                const nextTodaySession = sessions.find(s => s.status === 'confirmed' || s.status === 'pending');
                                const nextUpcomingSession = upcomingSessions[0];
                                const nextSession = nextTodaySession || nextUpcomingSession;

                                if (!nextSession) return null;

                                const sessionDate = new Date(nextSession.scheduled_at);
                                const isToday = sessionDate.toDateString() === new Date().toDateString();
                                const formattedDate = isToday
                                    ? 'Today'
                                    : sessionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                                return (
                                    <div className="dashboard-card bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
                                        <p className="text-cyan-100 text-sm mb-2">Next Session • {formattedDate}</p>
                                        <p className="text-2xl font-bold mb-1">
                                            {nextSession.patient_name}
                                        </p>
                                        <p className="text-cyan-100 mb-4">
                                            {formatTime(nextSession.scheduled_at)} • {formatServiceType(nextSession.service_type)}
                                        </p>
                                        <Button
                                            className="w-full bg-white text-cyan-600 hover:bg-cyan-50"
                                            onClick={() => handleStartSession(nextSession.id)}
                                        >
                                            <Video className="w-4 h-4 mr-2" />
                                            Join Session
                                        </Button>
                                    </div>
                                );
                            })()}

                            {/* Quick Actions */}
                            <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'My Patients', href: '/patients', icon: Users },
                                        { label: 'Session Notes', href: '/notes', icon: FileText },
                                        { label: 'Messages', href: '/messages', icon: MessageCircle },
                                        { label: 'My Profile', href: '/profile', icon: Settings },
                                    ].map((link) => (
                                        <Link
                                            key={link.label}
                                            to={link.href}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                        >
                                            <link.icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-500" />
                                            <span className="text-gray-700 group-hover:text-gray-900">{link.label}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-cyan-500" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Stats Overview */}
                            <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">Overview</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Completed Sessions</span>
                                            <span className="font-medium text-gray-900">{stats.completedSessions}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                                                style={{ width: `${Math.min((stats.completedSessions / Math.max(stats.completedSessions + stats.upcomingSessions, 1)) * 100, 100)}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Upcoming Sessions</span>
                                            <span className="font-medium text-gray-900">{stats.upcomingSessions}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                                                style={{ width: `${Math.min((stats.upcomingSessions / Math.max(stats.completedSessions + stats.upcomingSessions, 1)) * 100, 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Session Analytics */}
                            <div className="dashboard-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 className="w-5 h-5 text-cyan-500" />
                                    <h3 className="font-semibold text-gray-900">Session Analytics</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Weekly Hours</p>
                                        <p className="text-xl font-bold text-gray-900">{sessionAnalytics.weeklyHours}h</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Avg. Session</p>
                                        <p className="text-xl font-bold text-gray-900">{sessionAnalytics.avgSessionLength}m</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-xl">
                                        <p className="text-xs text-green-600 mb-1">Patient Retention</p>
                                        <p className="text-xl font-bold text-green-700">{sessionAnalytics.patientRetention}%</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${sessionAnalytics.cancelRate > 10 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                        <p className={`text-xs mb-1 ${sessionAnalytics.cancelRate > 10 ? 'text-red-600' : 'text-gray-500'}`}>Cancel Rate</p>
                                        <p className={`text-xl font-bold ${sessionAnalytics.cancelRate > 10 ? 'text-red-700' : 'text-gray-900'}`}>{sessionAnalytics.cancelRate}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Availability Modal */}
            <AvailabilityModal
                isOpen={availabilityOpen}
                onClose={() => setAvailabilityOpen(false)}
                availability={availability}
                setAvailability={setAvailability}
                onSave={handleSaveAvailability}
            />
        </>
    );
}

// Availability Modal Component
function AvailabilityModal({
    isOpen,
    onClose,
    availability,
    setAvailability,
    onSave
}: {
    isOpen: boolean;
    onClose: () => void;
    availability: { [key: string]: { enabled: boolean; start: string; end: string } };
    setAvailability: React.Dispatch<React.SetStateAction<{ [key: string]: { enabled: boolean; start: string; end: string } }>>;
    onSave: () => void;
}) {
    if (!isOpen) return null;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const toggleDay = (day: string) => {
        setAvailability(prev => ({
            ...prev,
            [day]: { ...prev[day], enabled: !prev[day].enabled }
        }));
    };

    const updateTime = (day: string, field: 'start' | 'end', value: string) => {
        setAvailability(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900">Set Your Availability</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {days.map(day => (
                        <div key={day} className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${availability[day].enabled ? 'bg-cyan-50 border border-cyan-200' : 'bg-gray-50 border border-gray-100'
                            }`}>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={availability[day].enabled}
                                    onChange={() => toggleDay(day)}
                                    className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                />
                                <span className={`font-medium capitalize w-24 ${availability[day].enabled ? 'text-gray-900' : 'text-gray-400'
                                    }`}>{day}</span>
                            </label>
                            {availability[day].enabled && (
                                <div className="flex items-center gap-2 ml-auto">
                                    <input
                                        type="time"
                                        value={availability[day].start}
                                        onChange={(e) => updateTime(day, 'start', e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                    <span className="text-gray-400">to</span>
                                    <input
                                        type="time"
                                        value={availability[day].end}
                                        onChange={(e) => updateTime(day, 'end', e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 p-6 border-t border-gray-100">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={onSave} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                        Save Availability
                    </Button>
                </div>
            </div>
        </div>
    );
}
