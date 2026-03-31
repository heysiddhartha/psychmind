/**
 * Animated Stat Cards Component - Premium stat cards with GSAP animations
 */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    icon: LucideIcon;
    trend?: { value: number; isPositive: boolean };
    color: 'cyan' | 'blue' | 'purple' | 'amber' | 'green' | 'red';
    delay?: number;
}

const colorClasses = {
    cyan: { bg: 'bg-cyan-50', icon: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-100' },
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-100' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-100' },
    green: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-100' },
    red: { bg: 'bg-red-50', icon: 'bg-red-500', text: 'text-red-600', border: 'border-red-100' },
};

export function AnimatedStatCard({ title, value, prefix = '', suffix = '', icon: Icon, trend, color, delay = 0 }: StatCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const valueRef = useRef<HTMLSpanElement>(null);
    const colors = colorClasses[color];

    useEffect(() => {
        if (!cardRef.current || !valueRef.current) return;

        // Card entrance animation
        gsap.fromTo(cardRef.current,
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, delay, ease: 'power3.out' }
        );

        // Count-up animation
        gsap.fromTo(valueRef.current,
            { innerText: 0 },
            {
                innerText: value,
                duration: 2,
                delay: delay + 0.3,
                ease: 'power2.out',
                snap: { innerText: 1 },
                onUpdate: function () {
                    if (valueRef.current) {
                        const current = Math.round(parseFloat(valueRef.current.innerText) || 0);
                        valueRef.current.innerText = current.toLocaleString();
                    }
                }
            }
        );
    }, [value, delay]);

    return (
        <div ref={cardRef} className={`relative overflow-hidden rounded-2xl p-6 ${colors.bg} border ${colors.border} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {prefix}<span ref={valueRef}>0</span>{suffix}
                    </p>
                    {trend && (
                        <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
                            <span className="text-gray-500 ml-1">vs last month</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            {/* Decorative element */}
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${colors.icon} opacity-10`} />
        </div>
    );
}

// Quick Action Button
interface QuickActionProps {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

export function QuickActionButton({ label, icon: Icon, onClick, variant = 'primary' }: QuickActionProps) {
    const variants = {
        primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
    };

    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${variants[variant]}`}>
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}

// Activity Feed Item
interface ActivityItemProps {
    type: 'user' | 'booking' | 'therapist' | 'system';
    message: string;
    time: string;
    avatar?: string;
}

export function ActivityFeedItem({ type, message, time }: ActivityItemProps) {
    const typeColors = {
        user: 'bg-blue-500',
        booking: 'bg-green-500',
        therapist: 'bg-purple-500',
        system: 'bg-gray-500',
    };

    return (
        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`w-2 h-2 rounded-full ${typeColors[type]} mt-2`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{message}</p>
                <p className="text-xs text-gray-500">{time}</p>
            </div>
        </div>
    );
}

export default { AnimatedStatCard, QuickActionButton, ActivityFeedItem };
