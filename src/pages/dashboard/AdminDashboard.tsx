/**
 * AdminDashboard - Enhanced with booking overview and analytics
 */

import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { gsap } from 'gsap';
import {
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    Bell,
    Settings,
    UserCheck,
    UserPlus,
    AlertCircle,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    Activity,
    BarChart3,
    LogOut,
    Eye,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Mock data
const platformStats = [
    { label: 'Total Users', value: '1,248', icon: Users, change: '+24 this week', color: 'text-blue-400' },
    { label: 'Active Therapists', value: '52', icon: UserCheck, change: '3 pending approval', color: 'text-green-400' },
    { label: 'Total Bookings', value: '856', icon: Calendar, change: '+156 this month', color: 'text-purple-400' },
    { label: 'Revenue', value: '$48,250', icon: DollarSign, change: '+18% vs last month', color: 'text-amber-400' },
];

const pendingApprovals = [
    { id: 1, name: 'Dr. Emily Wright', specialty: 'Clinical Psychology', date: 'Jan 2, 2026', credentials: 'Ph.D., Licensed Psychologist' },
    { id: 2, name: 'Dr. James Miller', specialty: 'Psychiatry', date: 'Jan 3, 2026', credentials: 'M.D., Board Certified' },
    { id: 3, name: 'Dr. Lisa Chen', specialty: 'Counseling', date: 'Jan 4, 2026', credentials: 'LPC, NCC' },
];

const recentBookings = [
    { id: 'b1', patient: 'John D.', therapist: 'Dr. Sarah Johnson', date: 'Jan 4, 2026', time: '10:00 AM', status: 'confirmed', amount: 75 },
    { id: 'b2', patient: 'Sarah M.', therapist: 'Dr. Michael Chen', date: 'Jan 4, 2026', time: '11:00 AM', status: 'confirmed', amount: 85 },
    { id: 'b3', patient: 'Michael R.', therapist: 'Dr. Emily Wright', date: 'Jan 4, 2026', time: '2:00 PM', status: 'pending', amount: 90 },
    { id: 'b4', patient: 'Emily T.', therapist: 'Dr. Sarah Johnson', date: 'Jan 5, 2026', time: '9:00 AM', status: 'confirmed', amount: 75 },
    { id: 'b5', patient: 'David K.', therapist: 'Dr. Michael Chen', date: 'Jan 5, 2026', time: '3:00 PM', status: 'cancelled', amount: 85 },
];

const recentActivity = [
    { id: 1, action: 'New user registered', user: 'Michael Brown', time: '2 min ago', type: 'user' },
    { id: 2, action: 'Booking completed', user: 'Sarah Davis', time: '15 min ago', type: 'booking' },
    { id: 3, action: 'Therapist approved', user: 'Dr. Kevin Lee', time: '1 hour ago', type: 'approval' },
    { id: 4, action: 'Payment received', user: '$85.00', time: '2 hours ago', type: 'payment' },
    { id: 5, action: 'New therapist application', user: 'Dr. Anna Smith', time: '3 hours ago', type: 'application' },
];

const weeklyStats = [
    { day: 'Mon', bookings: 45, revenue: 3825 },
    { day: 'Tue', bookings: 52, revenue: 4420 },
    { day: 'Wed', bookings: 38, revenue: 3230 },
    { day: 'Thu', bookings: 61, revenue: 5185 },
    { day: 'Fri', bookings: 48, revenue: 4080 },
    { day: 'Sat', bookings: 22, revenue: 1870 },
    { day: 'Sun', bookings: 15, revenue: 1275 },
];

export default function AdminDashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);

    const [approvals, setApprovals] = useState(pendingApprovals);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Animate on load
    useEffect(() => {
        if (!containerRef.current || authLoading) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const elements = containerRef.current.querySelectorAll('.dashboard-card');
        gsap.fromTo(elements,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
        );
    }, [authLoading]);

    const handleApprove = (id: number) => {
        setApprovals(prev => prev.filter(a => a.id !== id));
        toast({
            title: 'Therapist Approved',
            description: 'The therapist has been approved and notified.'
        });
    };

    const handleReject = (id: number) => {
        setApprovals(prev => prev.filter(a => a.id !== id));
        toast({
            title: 'Application Rejected',
            description: 'The application has been rejected.',
            variant: 'destructive'
        });
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">Confirmed</span>;
            case 'pending':
                return <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">Pending</span>;
            case 'cancelled':
                return <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">Cancelled</span>;
            default:
                return null;
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user': return <UserPlus className="w-4 h-4 text-blue-400" />;
            case 'booking': return <Calendar className="w-4 h-4 text-purple-400" />;
            case 'approval': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
            case 'payment': return <DollarSign className="w-4 h-4 text-amber-400" />;
            case 'application': return <UserCheck className="w-4 h-4 text-cyan-400" />;
            default: return <Activity className="w-4 h-4 text-gray-400" />;
        }
    };

    // Calculate max for chart
    const maxBookings = Math.max(...weeklyStats.map(s => s.bookings));

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | 3-3.com Counseling</title>
            </Helmet>
            <div className="min-h-screen bg-gray-900">
                {/* Header */}
                <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
                    <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="h-10 brightness-0 invert" />
                            <span className="text-sm font-medium px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full">
                                Admin
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64 pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                            <button className="relative p-2 rounded-full hover:bg-gray-700 transition-colors">
                                <Bell className="w-5 h-5 text-gray-400" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-700">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm">
                                    A
                                </div>
                                <span className="text-sm font-medium text-gray-300 hidden sm:block">Admin</span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <div ref={containerRef} className="container mx-auto px-4 lg:px-8 py-8">
                    {/* Welcome */}
                    <div className="dashboard-card mb-8">
                        <h1 className="text-3xl font-serif text-white mb-2">Admin Dashboard</h1>
                        <p className="text-gray-400">Monitor and manage the entire platform.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="dashboard-card grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {platformStats.map((stat) => (
                            <div key={stat.label} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 hover:border-gray-600 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    <span className="text-xs text-gray-500">{stat.change}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-gray-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Weekly Overview Chart */}
                            <div className="dashboard-card bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                                        <h2 className="text-xl font-semibold text-white">Weekly Overview</h2>
                                    </div>
                                    <div className="flex gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-cyan-500" />
                                            <span className="text-gray-400">Bookings</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Simple bar chart */}
                                <div className="flex items-end justify-between h-40 gap-2">
                                    {weeklyStats.map((day) => (
                                        <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full flex flex-col items-center">
                                                <span className="text-xs text-gray-400 mb-1">{day.bookings}</span>
                                                <div
                                                    className="w-full max-w-[40px] bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg transition-all hover:from-cyan-500 hover:to-cyan-300"
                                                    style={{ height: `${(day.bookings / maxBookings) * 100}%`, minHeight: '20px' }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">{day.day}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary */}
                                <div className="flex gap-6 mt-6 pt-4 border-t border-gray-700">
                                    <div>
                                        <p className="text-2xl font-bold text-white">{weeklyStats.reduce((a, b) => a + b.bookings, 0)}</p>
                                        <p className="text-sm text-gray-400">Total Bookings</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-400">${weeklyStats.reduce((a, b) => a + b.revenue, 0).toLocaleString()}</p>
                                        <p className="text-sm text-gray-400">Total Revenue</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Approvals */}
                            <div className="dashboard-card bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold text-white">Pending Approvals</h2>
                                        {approvals.length > 0 && (
                                            <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                                                {approvals.length} pending
                                            </span>
                                        )}
                                    </div>
                                    <Link to="/admin/approvals" className="text-cyan-400 text-sm font-medium hover:underline">
                                        View All
                                    </Link>
                                </div>

                                {approvals.length > 0 ? (
                                    <div className="space-y-4">
                                        {approvals.map((therapist) => (
                                            <div
                                                key={therapist.id}
                                                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-700/50 rounded-xl"
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-gray-300 font-bold">
                                                    {therapist.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-white">{therapist.name}</p>
                                                    <p className="text-sm text-gray-400">{therapist.specialty}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{therapist.credentials}</p>
                                                </div>
                                                <p className="text-sm text-gray-500">{therapist.date}</p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleReject(therapist.id)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(therapist.id)}
                                                        className="bg-green-600 hover:bg-green-500 text-white"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                        <p className="text-gray-400">All caught up! No pending approvals.</p>
                                    </div>
                                )}
                            </div>

                            {/* Recent Bookings */}
                            <div className="dashboard-card bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-white">Recent Bookings</h2>
                                    <Link to="/admin/bookings" className="text-cyan-400 text-sm font-medium hover:underline">
                                        View All
                                    </Link>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                                                <th className="pb-3 font-medium">Patient</th>
                                                <th className="pb-3 font-medium">Therapist</th>
                                                <th className="pb-3 font-medium">Date</th>
                                                <th className="pb-3 font-medium">Status</th>
                                                <th className="pb-3 font-medium text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentBookings.map((booking) => (
                                                <tr key={booking.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                                    <td className="py-3 text-white font-medium">{booking.patient}</td>
                                                    <td className="py-3 text-gray-300">{booking.therapist}</td>
                                                    <td className="py-3 text-gray-400 text-sm">
                                                        <div>{booking.date}</div>
                                                        <div className="text-xs text-gray-500">{booking.time}</div>
                                                    </td>
                                                    <td className="py-3">{getStatusBadge(booking.status)}</td>
                                                    <td className="py-3 text-right text-green-400 font-medium">${booking.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Recent Activity */}
                            <div className="dashboard-card bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-cyan-400" />
                                    Recent Activity
                                </h3>
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white truncate">{activity.action}</p>
                                                <p className="text-xs text-gray-500">
                                                    {activity.user} • {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="dashboard-card bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4">Management</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'User Management', href: '/admin/users', icon: Users },
                                        { label: 'Therapist Management', href: '/admin/therapists', icon: UserCheck },
                                        { label: 'Booking Management', href: '/admin/bookings', icon: Calendar },
                                        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
                                        { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
                                    ].map((link) => (
                                        <Link
                                            key={link.label}
                                            to={link.href}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-700 text-gray-300 hover:text-white transition-colors group"
                                        >
                                            <link.icon className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
                                            <span>{link.label}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-600 ml-auto group-hover:text-gray-400" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="dashboard-card bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                <h3 className="font-semibold text-white mb-4">System Status</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">API Status</span>
                                        <span className="flex items-center gap-1 text-green-400 text-sm">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            Operational
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Database</span>
                                        <span className="flex items-center gap-1 text-green-400 text-sm">
                                            <span className="w-2 h-2 bg-green-400 rounded-full" />
                                            Healthy
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Video Service</span>
                                        <span className="flex items-center gap-1 text-green-400 text-sm">
                                            <span className="w-2 h-2 bg-green-400 rounded-full" />
                                            Online
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Payment Gateway</span>
                                        <span className="flex items-center gap-1 text-green-400 text-sm">
                                            <span className="w-2 h-2 bg-green-400 rounded-full" />
                                            Connected
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
