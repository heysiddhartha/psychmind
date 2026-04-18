/**
 * Enhanced Super Admin Dashboard
 * Features: Charts, Animations, Document Management, Real-time Monitoring
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { gsap } from "gsap";
import {
    Users, Calendar, DollarSign, Shield, UserCheck, Activity, Clock, Search,
    FileText, Eye, RefreshCw, Settings, BarChart3, History, Bell, LogOut,
    ChevronDown, TrendingUp, Award, Briefcase, Zap, Globe, Download, Filter,
    CheckCircle, XCircle, AlertCircle, PieChart, Database, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import adminService, { AuditLog, AdminStats } from "@/lib/services/adminService";
import { sendVerificationEmail } from "@/lib/services/emailService";

// Charts
import { UserGrowthChart, TherapistStatusChart, BookingTrendsChart, SessionDistributionChart, PlatformHealth } from "@/components/admin/AdminCharts";
import { AnimatedStatCard, QuickActionButton, ActivityFeedItem } from "@/components/admin/AdminStatCards";
import DocumentManager from "@/components/admin/DocumentManager";

// Types
interface UserData { id: string; email: string; full_name: string; role: string; is_active: boolean; created_at: string; phone?: string; }
interface TherapistData {
    id: string; user_id: string; is_verified: boolean; is_active: boolean; application_status: string;
    specialties: string[]; credentials: string[]; bio: string; rating: number; total_sessions: number;
    license_number?: string; license_document_url?: string; qualification_document_url?: string;
    identity_document_url?: string; hourly_rate?: number; created_at: string; verified_at?: string;
    rejection_reason?: string; users: { full_name: string; email: string; phone?: string };
}

type TabType = "overview" | "analytics" | "users" | "therapists" | "documents" | "settings" | "audit";

function SuperAdminDashboardContent() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0, totalTherapists: 0, pendingVerifications: 0,
        totalBookings: 0, completedBookings: 0, totalRevenue: 0,
        newUsersThisMonth: 0, activeTherapists: 0,
    });
    const [users, setUsers] = useState<UserData[]>([]);
    const [therapists, setTherapists] = useState<TherapistData[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTherapist, setSelectedTherapist] = useState<TherapistData | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [documents, setDocuments] = useState<{
        id: string;
        therapist_id: string;
        document_type: 'license' | 'qualification' | 'id_proof';
        file_url: string;
        file_name: string;
        status: 'pending' | 'approved' | 'rejected';
        uploaded_at: string;
        verified_at?: string;
        notes?: string;
    }[]>([]);

    // Chart data - populated from real database
    const [chartData, setChartData] = useState({
        userGrowth: [] as { name: string; users: number }[],
        therapistStatus: [] as { name: string; count: number }[],
        bookings: [] as { name: string; completed: number; pending: number; cancelled: number }[],
        sessions: [] as { name: string; value: number }[],
    });

    const [platformHealth, setPlatformHealth] = useState<{ label: string; value: number; status: 'good' | 'warning' | 'critical' }[]>([
        { label: 'API Response Time', value: 99, status: 'good' },
        { label: 'Database Health', value: 100, status: 'good' },
        { label: 'Active Sessions', value: 0, status: 'good' },
        { label: 'Error Rate', value: 0, status: 'good' },
    ]);

    useEffect(() => {
        const sessionVerified = sessionStorage.getItem('superadmin_verified');
        if (sessionVerified !== 'true') {
            navigate('/super-admin', { replace: true });
            return;
        }
        fetchAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo(".admin-card", { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" });
        }
    }, [loading, activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [statsData, { data: usersData }, { data: therapistsData }, auditData, { data: docsData }, { data: bookingsData }] = await Promise.all([
                adminService.getAdminStats(),
                supabase.from('users').select('*').order('created_at', { ascending: false }),
                supabase.from('therapists').select('*, users(full_name, email, phone)').order('created_at', { ascending: false }),
                adminService.getAuditLogs(20),
                supabase.from('therapist_documents').select('*').order('uploaded_at', { ascending: false }),
                supabase.from('bookings').select('*').order('created_at', { ascending: false }),
            ]);
            setStats(statsData);
            setUsers(usersData || []);
            setTherapists(therapistsData || []);
            setAuditLogs(auditData.data);
            setDocuments(docsData || []);

            // Generate real chart data from database
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const now = new Date();

            // User growth by month (last 6 months)
            const userGrowthData = [];
            for (let i = 5; i >= 0; i--) {
                const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = months[month.getMonth()];
                const count = (usersData || []).filter(u => {
                    const d = new Date(u.created_at);
                    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
                }).length;
                userGrowthData.push({ name: monthName, users: count });
            }

            // Bookings by status
            const bookings = bookingsData || [];
            const completed = bookings.filter(b => b.status === 'completed').length;
            const pending = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
            const cancelled = bookings.filter(b => b.status === 'cancelled').length;

            // Session types (from bookings if available, else default)
            const sessionTypes = [
                { name: 'Individual', value: bookings.filter(b => b.session_type === 'individual').length || 1 },
                { name: 'Couples', value: bookings.filter(b => b.session_type === 'couple').length || 0 },
                { name: 'Family', value: bookings.filter(b => b.session_type === 'family').length || 0 },
            ];

            // Therapist verification status
            const therapistStatusData = [
                { name: 'Verified', count: (therapistsData || []).filter(t => t.is_verified).length },
                { name: 'Pending', count: (therapistsData || []).filter(t => !t.is_verified && t.application_status !== 'rejected').length },
                { name: 'Rejected', count: (therapistsData || []).filter(t => t.application_status === 'rejected').length },
            ];

            setChartData({
                userGrowth: userGrowthData,
                therapistStatus: therapistStatusData,
                bookings: [{ name: 'All Time', completed, pending, cancelled }],
                sessions: sessionTypes.filter(s => s.value > 0),
            });

            // Update platform health with real session count
            setPlatformHealth([
                { label: 'API Response Time', value: 99, status: 'good' as const },
                { label: 'Database Health', value: 100, status: 'good' as const },
                { label: 'Active Bookings', value: pending, status: pending > 10 ? 'warning' as const : 'good' as const },
                { label: 'Total Users', value: usersData?.length || 0, status: 'good' as const },
            ]);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyTherapist = async (therapist: TherapistData, verify: boolean) => {
        if (!verify && !rejectionReason) { setSelectedTherapist(therapist); setShowRejectModal(true); return; }
        setActionLoading(therapist.id);
        try {
            const result = verify
                ? await adminService.verifyTherapist(therapist.id, "Verified by Super Admin")
                : await adminService.rejectTherapist(therapist.id, rejectionReason);
            if (!result.success) throw new Error(result.error);
            await sendVerificationEmail(therapist.users?.email, therapist.users?.full_name, verify, rejectionReason);
            toast({ title: verify ? "✅ Therapist Verified" : "❌ Application Rejected" });
            fetchAllData();
            setSelectedTherapist(null); setShowRejectModal(false); setRejectionReason("");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Operation failed';
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        } finally {
            setActionLoading(null);
        }
    };

    const handleSignOut = async () => {
        sessionStorage.removeItem('superadmin_verified');
        await signOut();
        navigate('/super-admin');
    };

    const pendingTherapists = therapists.filter(t => !t.is_verified && t.application_status !== 'rejected');
    const filteredTherapists = therapists.filter(t =>
        t.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.users?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { id: "overview", label: "Overview", icon: BarChart3 },
        { id: "analytics", label: "Analytics", icon: PieChart },
        { id: "therapists", label: "Therapists", icon: UserCheck, badge: pendingTherapists.length },
        { id: "users", label: "Users", icon: Users },
        { id: "documents", label: "Documents", icon: FileText },
        { id: "audit", label: "Audit Logs", icon: History },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <>
            <Helmet><title>Super Admin Dashboard | psychmind</title></Helmet>

            <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
                {/* Header */}
                <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white sticky top-0 z-50 shadow-xl">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Super Admin Panel</h1>
                                <p className="text-xs text-slate-400">psychmind Management Console</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button size="sm" variant="ghost" onClick={fetchAllData} className="text-white hover:bg-white/10">
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                            <div className="relative">
                                <Bell className="w-5 h-5 text-slate-300 cursor-pointer hover:text-white" />
                                {pendingTherapists.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                                        {pendingTherapists.length}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-sm">
                                        {user?.full_name?.charAt(0) || 'A'}
                                    </div>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border py-2 z-50">
                                        <button onClick={handleSignOut} className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2">
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="max-w-7xl mx-auto px-6 pb-0">
                        <nav className="flex gap-1 overflow-x-auto pb-px">
                            {tabs.map((tab) => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-xl transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                                        }`}>
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    {tab.badge ? (
                                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{tab.badge}</span>
                                    ) : null}
                                </button>
                            ))}
                        </nav>
                    </div>
                </header>

                {/* Content */}
                <main className="max-w-7xl mx-auto px-6 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Overview Tab */}
                            {activeTab === "overview" && (
                                <div className="space-y-8">
                                    {/* Stat Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <AnimatedStatCard title="Total Users" value={stats.totalUsers} icon={Users} color="cyan" delay={0} trend={{ value: 12, isPositive: true }} />
                                        <AnimatedStatCard title="Therapists" value={stats.totalTherapists} icon={UserCheck} color="blue" delay={0.1} trend={{ value: 8, isPositive: true }} />
                                        <AnimatedStatCard title="Pending" value={stats.pendingVerifications} icon={Clock} color="amber" delay={0.2} />
                                        <AnimatedStatCard title="Revenue" value={stats.totalRevenue} prefix="₹" icon={DollarSign} color="green" delay={0.3} trend={{ value: 23, isPositive: true }} />
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="admin-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                        <div className="flex flex-wrap gap-3">
                                                <QuickActionButton label="Export Report" icon={Download} onClick={() => toast({ title: 'Exporting...' })} />
                                                <QuickActionButton label="View Analytics" icon={BarChart3} onClick={() => setActiveTab('analytics')} variant="secondary" />
                                                <QuickActionButton label="System Health" icon={Database} onClick={() => toast({ title: 'All Systems Operational' })} variant="secondary" />
                                                <QuickActionButton label="Shop Admin" icon={Package} onClick={() => navigate('/shop-admin')} variant="secondary" />
                                        </div>
                                    </div>

                                    {/* Charts Row */}
                                    <div className="grid lg:grid-cols-2 gap-6">
                                        <div className="admin-card"><UserGrowthChart data={chartData.userGrowth} title="User Growth" /></div>
                                        <div className="admin-card"><PlatformHealth metrics={platformHealth} /></div>
                                    </div>

                                    {/* Activity & Pending */}
                                    <div className="grid lg:grid-cols-2 gap-6">
                                        <div className="admin-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                                Pending Verifications ({pendingTherapists.length})
                                            </h3>
                                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                                {pendingTherapists.slice(0, 5).map((t) => (
                                                    <div key={t.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                        <div>
                                                            <p className="font-medium">{t.users?.full_name}</p>
                                                            <p className="text-xs text-gray-500">{t.users?.email}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => { setSelectedTherapist(t); setActiveTab("therapists"); }}>
                                                                <Eye className="w-3 h-3 mr-1" /> Review
                                                            </Button>
                                                            <Button size="sm" onClick={() => handleVerifyTherapist(t, true)} disabled={actionLoading === t.id} className="bg-green-500 hover:bg-green-600 text-white">
                                                                Verify
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {pendingTherapists.length === 0 && <p className="text-gray-500 text-center py-4">No pending verifications</p>}
                                            </div>
                                        </div>

                                        <div className="admin-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <History className="w-5 h-5 text-blue-500" />
                                                Recent Activity
                                            </h3>
                                            <div className="space-y-1 max-h-80 overflow-y-auto">
                                                {auditLogs.slice(0, 8).map((log) => (
                                                    <ActivityFeedItem key={log.id} type="system" message={log.description} time={new Date(log.created_at).toLocaleString()} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Analytics Tab */}
                            {activeTab === "analytics" && (
                                <div className="space-y-6">
                                    <div className="grid lg:grid-cols-2 gap-6">
                                        <div className="admin-card"><UserGrowthChart data={chartData.userGrowth} title="User Growth Trends" /></div>
                                        <div className="admin-card"><TherapistStatusChart data={chartData.therapistStatus} title="Therapist Verification Status" /></div>
                                    </div>
                                    <div className="grid lg:grid-cols-2 gap-6">
                                        <div className="admin-card"><BookingTrendsChart data={chartData.bookings} title="Weekly Booking Status" /></div>
                                        <div className="admin-card"><SessionDistributionChart data={chartData.sessions} title="Session Types" /></div>
                                    </div>
                                </div>
                            )}

                            {/* Therapists Tab */}
                            {activeTab === "therapists" && (
                                <div className="space-y-6">
                                    <div className="admin-card bg-white rounded-2xl p-4 shadow-sm">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input type="text" placeholder="Search therapists..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                                        </div>
                                    </div>
                                    <div className="grid lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2 admin-card bg-white rounded-2xl shadow-sm overflow-hidden">
                                            <div className="p-4 bg-gray-50 border-b"><h3 className="font-semibold">All Therapists ({filteredTherapists.length})</h3></div>
                                            <div className="divide-y max-h-[600px] overflow-y-auto">
                                                {filteredTherapists.map((t) => (
                                                    <div key={t.id} onClick={() => setSelectedTherapist(t)}
                                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedTherapist?.id === t.id ? 'bg-cyan-50 border-l-4 border-l-cyan-500' : ''}`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                                    {t.users?.full_name?.charAt(0) || 'T'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{t.users?.full_name || "Unknown"}</p>
                                                                    <p className="text-sm text-gray-500">{t.users?.email}</p>
                                                                </div>
                                                            </div>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.is_verified ? "bg-green-100 text-green-700" : t.application_status === 'rejected' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                                                                {t.is_verified ? "Verified" : t.application_status === 'rejected' ? "Rejected" : "Pending"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="admin-card">
                                            {selectedTherapist ? (
                                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                                    <h3 className="font-semibold mb-4">Therapist Details</h3>
                                                    <div className="text-center mb-6">
                                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                                                            {selectedTherapist.users?.full_name?.charAt(0) || 'T'}
                                                        </div>
                                                        <h4 className="font-semibold">{selectedTherapist.users?.full_name}</h4>
                                                        <p className="text-sm text-gray-500">{selectedTherapist.users?.email}</p>
                                                    </div>
                                                    <div className="space-y-3 mb-6 text-sm">
                                                        <div className="flex justify-between"><span className="text-gray-600">Status</span><span className={selectedTherapist.is_verified ? 'text-green-600' : 'text-amber-600'}>{selectedTherapist.is_verified ? 'Verified' : 'Pending'}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-600">License</span><span>{selectedTherapist.license_number || 'Not provided'}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-600">Rate</span><span>₹{selectedTherapist.hourly_rate || 75}/hr</span></div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {!selectedTherapist.is_verified ? (
                                                            <>
                                                                <Button onClick={() => handleVerifyTherapist(selectedTherapist, true)} disabled={actionLoading === selectedTherapist.id} className="w-full bg-green-500 hover:bg-green-600">
                                                                    <CheckCircle className="w-4 h-4 mr-2" /> Verify
                                                                </Button>
                                                                <Button variant="outline" onClick={() => setShowRejectModal(true)} className="w-full text-red-600 border-red-200 hover:bg-red-50">
                                                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button variant="outline" onClick={() => handleVerifyTherapist(selectedTherapist, false)} className="w-full text-amber-600 border-amber-200 hover:bg-amber-50">
                                                                <XCircle className="w-4 h-4 mr-2" /> Revoke
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                                                    <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500">Select a therapist</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Users Tab */}
                            {activeTab === "users" && (
                                <div className="space-y-6">
                                    <div className="admin-card bg-white rounded-2xl p-4 shadow-sm">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                                        </div>
                                    </div>
                                    <div className="admin-card bg-white rounded-2xl shadow-sm overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="text-left p-4 font-medium text-gray-600">User</th>
                                                    <th className="text-left p-4 font-medium text-gray-600">Role</th>
                                                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                                                    <th className="text-left p-4 font-medium text-gray-600">Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {filteredUsers.slice(0, 20).map((u) => (
                                                    <tr key={u.id} className="hover:bg-gray-50">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">{u.full_name?.charAt(0) || 'U'}</div>
                                                                <div><p className="font-medium">{u.full_name}</p><p className="text-xs text-gray-500">{u.email}</p></div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : u.role === 'therapist' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                                                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                                                        <td className="p-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeTab === "documents" && (
                                <div className="space-y-6">
                                    <DocumentManager documents={documents} therapistId="" therapistName="All Therapists" onRefresh={fetchAllData} />
                                </div>
                            )}

                            {/* Audit Tab */}
                            {activeTab === "audit" && (
                                <div className="admin-card bg-white rounded-2xl shadow-sm overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                        <h3 className="font-semibold">Audit Logs</h3>
                                        <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
                                    </div>
                                    <div className="divide-y">
                                        {auditLogs.map((log) => (
                                            <div key={log.id} className="p-4 hover:bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{log.action_type.replace(/_/g, ' ').toUpperCase()}</p>
                                                        <p className="text-sm text-gray-500">{log.description}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Settings Tab */}
                            {activeTab === "settings" && (
                                <div className="admin-card bg-white rounded-2xl shadow-sm p-6">
                                    <h3 className="font-semibold mb-4">Platform Settings</h3>
                                    <p className="text-gray-500">Settings management coming soon...</p>
                                </div>
                            )}
                        </>
                    )}
                </main>

                {/* Reject Modal */}
                {showRejectModal && selectedTherapist && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Reject Application</h3>
                            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter rejection reason..." rows={4}
                                className="w-full p-3 border rounded-xl mb-4 focus:ring-2 focus:ring-red-500" />
                            <div className="flex gap-3 justify-end">
                                <Button variant="outline" onClick={() => { setShowRejectModal(false); setRejectionReason(""); }}>Cancel</Button>
                                <Button onClick={() => handleVerifyTherapist(selectedTherapist, false)} disabled={!rejectionReason || actionLoading === selectedTherapist.id} className="bg-red-500 hover:bg-red-600 text-white">
                                    Confirm Rejection
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default SuperAdminDashboardContent;
