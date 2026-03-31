/**
 * BookingCalendar - Premium animated calendar component for date selection
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { gsap } from 'gsap';

interface BookingCalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    availableDates?: Date[];
    minDate?: Date;
    maxDate?: Date;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BookingCalendar({
    selectedDate,
    onDateSelect,
    availableDates = [],
    minDate,
    maxDate
}: BookingCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [isAnimating, setIsAnimating] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    const daysContainerRef = useRef<HTMLDivElement>(null);

    // Set min date to today if not provided
    const effectiveMinDate = minDate || new Date();
    effectiveMinDate.setHours(0, 0, 0, 0);

    // Set max date to 60 days from now if not provided
    const effectiveMaxDate = maxDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    // Create a set of available date strings for quick lookup
    const availableDateStrings = useMemo(() => {
        return new Set(availableDates.map(d => d.toDateString()));
    }, [availableDates]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const days: (Date | null)[] = [];

        // Add padding for days before the first of the month
        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= totalDays; day++) {
            days.push(new Date(year, month, day));
        }

        // Add padding to complete the last week
        const endPadding = 7 - (days.length % 7);
        if (endPadding < 7) {
            for (let i = 0; i < endPadding; i++) {
                days.push(null);
            }
        }

        return days;
    }, [currentMonth]);

    // Check if a date is selectable
    const isDateSelectable = (date: Date): boolean => {
        if (date < effectiveMinDate) return false;
        if (date > effectiveMaxDate) return false;

        // If we have specific available dates, check against them
        if (availableDates.length > 0) {
            return availableDateStrings.has(date.toDateString());
        }

        // Otherwise, all future dates are selectable
        return true;
    };

    // Check if date is today
    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Check if date is selected
    const isSelected = (date: Date): boolean => {
        return selectedDate?.toDateString() === date.toDateString();
    };

    // Navigate to previous month
    const goToPreviousMonth = () => {
        if (isAnimating) return;

        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);

        // Don't go before the current month
        const now = new Date();
        if (prevMonth.getFullYear() < now.getFullYear() ||
            (prevMonth.getFullYear() === now.getFullYear() && prevMonth.getMonth() < now.getMonth())) {
            return;
        }

        animateMonthChange('left', prevMonth);
    };

    // Navigate to next month
    const goToNextMonth = () => {
        if (isAnimating) return;

        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        // Don't go beyond max date
        if (nextMonth > effectiveMaxDate) return;

        animateMonthChange('right', nextMonth);
    };

    // Animate month change
    const animateMonthChange = (direction: 'left' | 'right', newMonth: Date) => {
        if (!daysContainerRef.current) {
            setCurrentMonth(newMonth);
            return;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setCurrentMonth(newMonth);
            return;
        }

        setIsAnimating(true);

        const xOffset = direction === 'left' ? 50 : -50;

        gsap.to(daysContainerRef.current, {
            opacity: 0,
            x: xOffset,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
                setCurrentMonth(newMonth);

                gsap.fromTo(daysContainerRef.current,
                    { opacity: 0, x: -xOffset },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.3,
                        ease: 'power2.out',
                        onComplete: () => setIsAnimating(false)
                    }
                );
            }
        });
    };

    // Handle date selection
    const handleDateClick = (date: Date | null) => {
        if (!date || !isDateSelectable(date)) return;

        onDateSelect(date);

        // Animate selection
        const dayElement = calendarRef.current?.querySelector(`[data-date="${date.toDateString()}"]`);
        if (dayElement) {
            gsap.fromTo(dayElement,
                { scale: 0.9 },
                { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
            );
        }
    };

    // Initial animation
    useEffect(() => {
        if (!calendarRef.current) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        gsap.fromTo(calendarRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
    }, []);

    // Check if can navigate
    const canGoPrevious = (): boolean => {
        const now = new Date();
        return currentMonth.getFullYear() > now.getFullYear() ||
            (currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() > now.getMonth());
    };

    const canGoNext = (): boolean => {
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth <= effectiveMaxDate;
    };

    return (
        <div ref={calendarRef} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={goToPreviousMonth}
                    disabled={!canGoPrevious() || isAnimating}
                    className={`p-3 rounded-xl transition-all duration-200 ${canGoPrevious()
                            ? 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-cyan-500" />
                    <h3 className="text-xl font-semibold text-gray-900">
                        {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                </div>

                <button
                    onClick={goToNextMonth}
                    disabled={!canGoNext() || isAnimating}
                    className={`p-3 rounded-xl transition-all duration-200 ${canGoNext()
                            ? 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_OF_WEEK.map((day) => (
                    <div
                        key={day}
                        className="text-center text-sm font-semibold text-gray-400 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar days */}
            <div ref={daysContainerRef} className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                    if (!date) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const selectable = isDateSelectable(date);
                    const today = isToday(date);
                    const selected = isSelected(date);

                    return (
                        <button
                            key={date.toISOString()}
                            data-date={date.toDateString()}
                            onClick={() => handleDateClick(date)}
                            disabled={!selectable}
                            className={`
                                aspect-square rounded-xl flex items-center justify-center
                                text-sm font-medium transition-all duration-200 relative
                                ${selected
                                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105'
                                    : selectable
                                        ? 'hover:bg-cyan-50 hover:text-cyan-700 text-gray-700'
                                        : 'text-gray-300 cursor-not-allowed'
                                }
                                ${today && !selected ? 'ring-2 ring-cyan-500 ring-offset-2' : ''}
                            `}
                        >
                            {date.getDate()}

                            {/* Today indicator */}
                            {today && !selected && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-500 rounded-full" />
                            )}

                            {/* Available indicator */}
                            {selectable && !selected && availableDates.length > 0 && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-400 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-3 h-3 rounded-full ring-2 ring-cyan-500" />
                    <span>Today</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600" />
                    <span>Selected</span>
                </div>
                {availableDates.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                        <span>Available</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * BookingCalendarSkeleton - Loading skeleton for calendar
 */
export function BookingCalendarSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="h-6 bg-gray-200 rounded w-40" />
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {Array(7).fill(0).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded" />
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array(35).fill(0).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-xl" />
                ))}
            </div>
        </div>
    );
}
