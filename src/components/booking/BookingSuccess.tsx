/**
 * BookingSuccess - Premium booking success component with animations
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Check,
    Calendar,
    Clock,
    Video,
    ArrowRight,
    Download,
    Share2,
    Home,
    MessageCircle
} from 'lucide-react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import type { TherapistWithDetails, ServiceType } from '@/lib/bookingService';

interface BookingSuccessProps {
    bookingId: string;
    therapist: TherapistWithDetails;
    service: ServiceType;
    selectedDate: Date;
    selectedTime: string;
    meetingLink?: string;
}

export default function BookingSuccess({
    bookingId,
    therapist,
    service,
    selectedDate,
    selectedTime,
    meetingLink
}: BookingSuccessProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const confettiRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            // Success circle animation
            gsap.fromTo('.success-circle',
                { scale: 0, rotation: -180 },
                {
                    scale: 1,
                    rotation: 0,
                    duration: 0.6,
                    ease: 'back.out(1.7)',
                    delay: 0.2
                }
            );

            // Check mark animation
            gsap.fromTo('.success-check',
                { opacity: 0, scale: 0 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    ease: 'back.out(2)',
                    delay: 0.6
                }
            );

            // Title animation
            gsap.fromTo('.success-title',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, delay: 0.8 }
            );

            // Subtitle animation
            gsap.fromTo('.success-subtitle',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, delay: 1 }
            );

            // Card animation
            gsap.fromTo('.success-card',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, delay: 1.2 }
            );

            // Actions animation
            gsap.fromTo('.success-actions',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, delay: 1.5 }
            );

            // Confetti animation
            if (confettiRef.current) {
                const colors = ['#0ea5e9', '#06b6d4', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

                for (let i = 0; i < 50; i++) {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti-piece';
                    confetti.style.cssText = `
                        position: absolute;
                        width: ${Math.random() * 10 + 5}px;
                        height: ${Math.random() * 10 + 5}px;
                        background: ${colors[Math.floor(Math.random() * colors.length)]};
                        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        pointer-events: none;
                    `;
                    confettiRef.current.appendChild(confetti);

                    gsap.to(confetti, {
                        x: (Math.random() - 0.5) * 400,
                        y: (Math.random() - 0.5) * 400,
                        rotation: Math.random() * 720,
                        opacity: 0,
                        duration: 1.5 + Math.random() * 0.5,
                        delay: 0.6 + Math.random() * 0.3,
                        ease: 'power2.out',
                        onComplete: () => {
                            confetti.remove();
                        }
                    });
                }
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // Generate initials for fallback avatar
    const initials = therapist.user.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Generate calendar event URL
    const calendarEventUrl = generateCalendarUrl({
        title: `Therapy Session with ${therapist.user.full_name}`,
        description: `${service.name} session via video call`,
        startDate: selectedDate,
        startTime: selectedTime,
        duration: service.duration,
        location: meetingLink || ''
    });

    return (
        <div ref={containerRef} className="text-center space-y-8 py-8">
            {/* Confetti container */}
            <div ref={confettiRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" />

            {/* Success animation */}
            <div className="relative inline-block">
                <div className="success-circle w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 mx-auto">
                    <Check className="success-check w-14 h-14 text-white stroke-[3]" />
                </div>

                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />
            </div>

            {/* Success message */}
            <div>
                <h1 className="success-title text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Booking Confirmed!
                </h1>
                <p className="success-subtitle text-gray-500 text-lg">
                    Your appointment has been successfully scheduled
                </p>
            </div>

            {/* Booking details card */}
            <div className="success-card bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xl max-w-md mx-auto">
                {/* Booking ID */}
                <div className="text-center mb-6 pb-6 border-b border-gray-100">
                    <p className="text-sm text-gray-400 mb-1">Booking ID</p>
                    <p className="font-mono text-lg font-semibold text-gray-900">{bookingId}</p>
                </div>

                {/* Therapist info */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-gray-100 flex-shrink-0">
                        {therapist.user.avatar_url ? (
                            <img
                                src={therapist.user.avatar_url}
                                alt={therapist.user.full_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                {initials}
                            </div>
                        )}
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-gray-900">{therapist.user.full_name}</p>
                        <p className="text-sm text-gray-500">{service.name}</p>
                    </div>
                </div>

                {/* Details grid */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Date</p>
                            <p className="font-medium text-gray-900">{formattedDate}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Time</p>
                            <p className="font-medium text-gray-900">{selectedTime}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Video className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Session Type</p>
                            <p className="font-medium text-gray-900">Video Call ({service.duration} min)</p>
                        </div>
                    </div>
                </div>

                {/* Quick actions in card */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                    <a
                        href={calendarEventUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Add to Calendar
                    </a>
                    <button className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* What's next section */}
            <div className="success-actions max-w-md mx-auto space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>

                <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 bg-cyan-50 rounded-2xl text-left">
                        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">1</span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Check your email</p>
                            <p className="text-sm text-gray-500">
                                We've sent a confirmation email with all the details
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl text-left">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">2</span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Prepare for your session</p>
                            <p className="text-sm text-gray-500">
                                Find a quiet, private space for your video call
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl text-left">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">3</span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Join 5 minutes early</p>
                            <p className="text-sm text-gray-500">
                                You'll receive a reminder and link before your session
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button
                        asChild
                        className="flex-1 btn-icy h-12 rounded-xl group"
                    >
                        <Link to="/dashboard" className="flex items-center justify-center gap-2">
                            <Home className="w-5 h-5" />
                            Go to Dashboard
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        className="flex-1 h-12 rounded-xl border-2"
                    >
                        <Link to="/messages" className="flex items-center justify-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            Message Therapist
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

/**
 * Generate Google Calendar URL for adding event
 */
function generateCalendarUrl({
    title,
    description,
    startDate,
    startTime,
    duration,
    location
}: {
    title: string;
    description: string;
    startDate: Date;
    startTime: string;
    duration: number;
    location: string;
}): string {
    // Parse time
    const timeMatch = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return '#';

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const start = new Date(startDate);
    start.setHours(hours, minutes, 0, 0);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);

    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        details: description,
        location: location,
        dates: `${formatDate(start)}/${formatDate(end)}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
