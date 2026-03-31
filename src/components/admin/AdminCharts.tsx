/**
 * Admin Charts Component - Interactive charts for Super Admin Dashboard
 */
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

interface ChartProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    title: string;
}

// User Growth Chart
export function UserGrowthChart({ data, title }: ChartProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// Therapist Status Chart (replaces Revenue - more appropriate for Super Admin)
export function TherapistStatusChart({ data, title }: ChartProps) {
    const COLORS_STATUS = ['#10b981', '#f59e0b', '#ef4444']; // green, amber, red
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#9ca3af" width={80} />
                    <Tooltip contentStyle={{ borderRadius: 12 }} />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// Booking Trends Chart
export function BookingTrendsChart({ data, title }: ChartProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ borderRadius: 12 }} />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Completed" />
                    <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Pending" />
                    <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Cancelled" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// Session Distribution Pie Chart
export function SessionDistributionChart({ data, title }: ChartProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

// Platform Health Indicator
export function PlatformHealth({ metrics }: { metrics: { label: string; value: number; status: 'good' | 'warning' | 'critical' }[] }) {
    const statusColors = { good: 'bg-green-500', warning: 'bg-amber-500', critical: 'bg-red-500' };
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
            <div className="space-y-4">
                {metrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <span className="text-gray-600">{m.label}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{m.value}%</span>
                            <div className={`w-3 h-3 rounded-full ${statusColors[m.status]} animate-pulse`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default { UserGrowthChart, TherapistStatusChart, BookingTrendsChart, SessionDistributionChart, PlatformHealth };
