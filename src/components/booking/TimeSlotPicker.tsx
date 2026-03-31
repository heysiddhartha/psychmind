/**
 * TimeSlotPicker - Premium time slot selection component
 * Enhanced with real-time slot locking indicators
 */

import { useEffect, useRef, useMemo } from 'react';
import { Clock, Sun, Sunset, Moon, Loader2 } from 'lucide-react';
import { gsap } from 'gsap';
import type { TimeSlot } from '@/lib/bookingService';

// Extended TimeSlot with real-time properties
export interface RealtimeTimeSlot extends TimeSlot {
    isLocked?: boolean;
    lockedBy?: string;
    isBeingBooked?: boolean;
}

interface TimeSlotPickerProps {
    slots: TimeSlot[] | RealtimeTimeSlot[];
    selectedTime: string | null;
    onTimeSelect: (time: string, slotIso?: string) => void | Promise<void> | Promise<boolean>;
    loading?: boolean;
    lockStatus?: 'none' | 'locking' | 'locked' | 'failed';
}


const PERIOD_ICONS = {
    morning: Sun,
    afternoon: Sunset,
    evening: Moon
};

const PERIOD_LABELS = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening'
};

const PERIOD_COLORS = {
    morning: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        iconBg: 'bg-amber-100'
    },
    afternoon: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        iconBg: 'bg-orange-100'
    },
    evening: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        iconBg: 'bg-indigo-100'
    }
};

export default function TimeSlotPicker({
    slots,
    selectedTime,
    onTimeSelect,
    loading = false,
    lockStatus = 'none'
}: TimeSlotPickerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Group slots by period
    const groupedSlots = useMemo(() => {
        const groups: Record<string, RealtimeTimeSlot[]> = {
            morning: [],
            afternoon: [],
            evening: []
        };

        slots.forEach(slot => {
            if (groups[slot.period]) {
                groups[slot.period].push(slot as RealtimeTimeSlot);
            }
        });

        return groups;
    }, [slots]);

    // Initial animation
    useEffect(() => {
        if (!containerRef.current || loading) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const sections = containerRef.current.querySelectorAll('.time-section');

        gsap.fromTo(sections,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.1,
                ease: 'power3.out'
            }
        );
    }, [slots, loading]);

    const handleTimeClick = async (slot: RealtimeTimeSlot) => {
        if (!slot.available || slot.isBeingBooked) return;

        // Animate selection
        const button = containerRef.current?.querySelector(`[data-time="${slot.time}"]`);
        if (button) {
            gsap.fromTo(button,
                { scale: 0.9 },
                { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
            );
        }

        // Call onTimeSelect with both time and ISO datetime
        await onTimeSelect(slot.time, slot.iso);
    };

    if (loading) {
        return <TimeSlotPickerSkeleton />;
    }

    if (slots.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Available Slots
                </h3>
                <p className="text-gray-500">
                    There are no available time slots for this date. Please select another date.
                </p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Available Times</h3>
                    <p className="text-sm text-gray-500">
                        {slots.filter(s => s.available).length} slots available
                    </p>
                </div>
            </div>

            {/* Time slot sections */}
            {(['morning', 'afternoon', 'evening'] as const).map((period) => {
                const periodSlots = groupedSlots[period];
                if (periodSlots.length === 0) return null;

                const IconComponent = PERIOD_ICONS[period];
                const colors = PERIOD_COLORS[period];

                return (
                    <div
                        key={period}
                        className={`time-section rounded-2xl p-5 ${colors.bg} border ${colors.border}`}
                    >
                        {/* Period header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-8 h-8 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
                                <IconComponent className={`w-4 h-4 ${colors.text}`} />
                            </div>
                            <span className={`font-semibold ${colors.text}`}>
                                {PERIOD_LABELS[period]}
                            </span>
                            <span className="text-sm text-gray-400">
                                ({periodSlots.filter(s => s.available).length} available)
                            </span>
                        </div>

                        {/* Time slots grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {periodSlots.map((slot) => {
                                const isSelected = selectedTime === slot.time;
                                const isBeingBooked = slot.isBeingBooked && !isSelected;
                                const isLocking = isSelected && lockStatus === 'locking';

                                // Determine if slot is effectively unavailable
                                const effectivelyUnavailable = !slot.available || isBeingBooked;

                                return (
                                    <button
                                        key={slot.time}
                                        data-time={slot.time}
                                        onClick={() => handleTimeClick(slot)}
                                        disabled={effectivelyUnavailable || isLocking}
                                        className={`
                                            py-3 px-4 rounded-xl text-sm font-medium
                                            transition-all duration-200 relative
                                            ${isSelected
                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105'
                                                : isBeingBooked
                                                    ? 'bg-yellow-50 text-yellow-700 border-2 border-yellow-300 cursor-not-allowed animate-pulse'
                                                    : slot.available
                                                        ? 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-md border border-gray-200 hover:border-gray-300'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                                            }
                                        `}
                                    >
                                        <span className="flex items-center justify-center gap-1">
                                            {isLocking && (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            )}
                                            {slot.time}
                                        </span>

                                        {/* Selected indicator */}
                                        {isSelected && !isLocking && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
                                                <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                                            </span>
                                        )}

                                        {/* Being booked indicator */}
                                        {isBeingBooked && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow">
                                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-3 h-3 rounded-full bg-white border border-gray-300" />
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                    <span>Being booked</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <span>Unavailable</span>
                </div>
            </div>

            {/* Help text */}
            <p className="text-center text-xs text-gray-400 mt-2">
                All times are shown in your local timezone • Slots are reserved for 5 minutes
            </p>
        </div>
    );
}

/**
 * TimeSlotPickerSkeleton - Loading skeleton
 */
export function TimeSlotPickerSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div>
                    <div className="h-5 bg-gray-200 rounded w-32 mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
            </div>

            {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl p-5 bg-gray-100 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                        <div className="h-5 bg-gray-200 rounded w-24" />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="h-12 bg-gray-200 rounded-xl" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
