import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Activity } from 'lucide-react';

interface ChartData {
    name: string;
    value: number;
}

interface AnalyticsData {
    bookingsByDay: ChartData[];
    bookingsByStatus: ChartData[];
    userGrowth: ChartData[];
    revenueByMonth: ChartData[];
}

export default function AnalyticsCharts() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        fetchAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // Fetch bookings for the period
            const { data: bookings } = await supabase
                .from('bookings')
                .select('created_at, status, amount')
                .gte('created_at', startDate.toISOString());

            // Fetch users for growth
            const { data: users } = await supabase
                .from('users')
                .select('created_at')
                .gte('created_at', startDate.toISOString());

            // Process data
            const bookingsByDay = processBookingsByDay(bookings || [], days);
            const bookingsByStatus = processBookingsByStatus(bookings || []);
            const userGrowth = processUserGrowth(users || [], days);
            const revenueByMonth = processRevenueByMonth(bookings || []);

            setData({ bookingsByDay, bookingsByStatus, userGrowth, revenueByMonth });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processBookingsByDay = (bookings: any[], days: number): ChartData[] => {
        const result: ChartData[] = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = bookings.filter(b => b.created_at?.startsWith(dateStr)).length;
            result.push({ name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: count });
        }

        // Sample every nth element if too many
        if (result.length > 15) {
            const step = Math.ceil(result.length / 15);
            return result.filter((_, i) => i % step === 0);
        }
        return result;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processBookingsByStatus = (bookings: any[]): ChartData[] => {
        const statuses: Record<string, number> = {};
        bookings.forEach(b => {
            statuses[b.status] = (statuses[b.status] || 0) + 1;
        });
        return Object.entries(statuses).map(([name, value]) => ({ name, value }));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processUserGrowth = (users: any[], days: number): ChartData[] => {
        const result: ChartData[] = [];
        const now = new Date();
        let cumulative = 0;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            cumulative += users.filter(u => u.created_at?.startsWith(dateStr)).length;
            result.push({ name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: cumulative });
        }

        if (result.length > 15) {
            const step = Math.ceil(result.length / 15);
            return result.filter((_, i) => i % step === 0);
        }
        return result;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processRevenueByMonth = (bookings: any[]): ChartData[] => {
        const months: Record<string, number> = {};
        bookings.forEach(b => {
            if (b.amount && b.status === 'completed') {
                const month = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short' });
                months[month] = (months[month] || 0) + b.amount;
            }
        });
        return Object.entries(months).map(([name, value]) => ({ name, value }));
    };

    const getMaxValue = (data: ChartData[]) => Math.max(...data.map(d => d.value), 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex justify-end gap-2">
                {(['7d', '30d', '90d'] as const).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${period === p
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                    </button>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Bookings Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-cyan-500" />
                            Bookings Over Time
                        </h3>
                    </div>
                    <div className="h-48">
                        {data?.bookingsByDay && data.bookingsByDay.length > 0 ? (
                            <SimpleBarChart data={data.bookingsByDay} color="#0ea5e9" />
                        ) : (
                            <EmptyState message="No booking data" />
                        )}
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-500" />
                            User Growth
                        </h3>
                    </div>
                    <div className="h-48">
                        {data?.userGrowth && data.userGrowth.length > 0 ? (
                            <SimpleLineChart data={data.userGrowth} color="#10b981" />
                        ) : (
                            <EmptyState message="No user data" />
                        )}
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-500" />
                            Booking Status
                        </h3>
                    </div>
                    <div className="h-48">
                        {data?.bookingsByStatus && data.bookingsByStatus.length > 0 ? (
                            <StatusPieChart data={data.bookingsByStatus} />
                        ) : (
                            <EmptyState message="No status data" />
                        )}
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-amber-500" />
                            Revenue by Month
                        </h3>
                    </div>
                    <div className="h-48">
                        {data?.revenueByMonth && data.revenueByMonth.length > 0 ? (
                            <SimpleBarChart data={data.revenueByMonth} color="#f59e0b" prefix="₹" />
                        ) : (
                            <EmptyState message="No revenue data" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple Bar Chart Component
function SimpleBarChart({ data, color, prefix = '' }: { data: ChartData[]; color: string; prefix?: string }) {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="h-full flex items-end gap-1">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                        className="w-full rounded-t transition-all hover:opacity-80"
                        style={{
                            height: `${(item.value / maxValue) * 100}%`,
                            backgroundColor: color,
                            minHeight: item.value > 0 ? '4px' : '0'
                        }}
                        title={`${prefix}${item.value}`}
                    />
                    <span className="text-[8px] text-gray-400 truncate max-w-full">{item.name}</span>
                </div>
            ))}
        </div>
    );
}

// Simple Line Chart Component  
function SimpleLineChart({ data, color }: { data: ChartData[]; color: string }) {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const points = data.map((item, i) => ({
        x: (i / (data.length - 1 || 1)) * 100,
        y: 100 - (item.value / maxValue) * 80,
    }));

    const pathD = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    return (
        <div className="h-full relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`${pathD} V 100 H 0 Z`} fill={`url(#gradient-${color})`} />
                <path d={pathD} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} />
                ))}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-gray-400">
                <span>{data[0]?.name}</span>
                <span>{data[data.length - 1]?.name}</span>
            </div>
        </div>
    );
}

// Status Pie Chart
function StatusPieChart({ data }: { data: ChartData[] }) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const colors: Record<string, string> = {
        pending: '#f59e0b',
        confirmed: '#3b82f6',
        completed: '#10b981',
        cancelled: '#ef4444',
        no_show: '#6b7280',
    };

    return (
        <div className="h-full flex items-center gap-4">
            <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {data.reduce((acc, item, i) => {
                        const percentage = (item.value / total) * 100;
                        const offset = acc.offset;
                        const color = colors[item.name] || '#94a3b8';
                        acc.elements.push(
                            <circle
                                key={i}
                                cx="50" cy="50" r="40"
                                fill="none"
                                stroke={color}
                                strokeWidth="20"
                                strokeDasharray={`${percentage * 2.51} 251`}
                                strokeDashoffset={-offset * 2.51}
                            />
                        );
                        acc.offset += percentage;
                        return acc;
                    }, { elements: [] as JSX.Element[], offset: 0 }).elements}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">{total}</span>
                </div>
            </div>
            <div className="flex-1 space-y-2">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[item.name] || '#94a3b8' }} />
                        <span className="text-sm text-gray-600 capitalize">{item.name}</span>
                        <span className="text-sm font-medium text-gray-900 ml-auto">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Empty State
function EmptyState({ message }: { message: string }) {
    return (
        <div className="h-full flex items-center justify-center text-gray-400">
            <p>{message}</p>
        </div>
    );
}
