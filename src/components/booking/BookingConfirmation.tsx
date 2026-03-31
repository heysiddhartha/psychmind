/**
 * BookingConfirmation - Premium booking confirmation component
 */

import { useEffect, useRef } from 'react';
import {
    Calendar,
    Clock,
    Video,
    User,
    CreditCard,
    Shield,
    Edit2,
    Check
} from 'lucide-react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import type { TherapistWithDetails, ServiceType } from '@/lib/bookingService';

interface BookingConfirmationProps {
    therapist: TherapistWithDetails;
    service: ServiceType;
    selectedDate: Date;
    selectedTime: string;
    onConfirm: () => void;
    onEdit: (step: number) => void;
    loading?: boolean;
}

export default function BookingConfirmation({
    therapist,
    service,
    selectedDate,
    selectedTime,
    onConfirm,
    onEdit,
    loading = false
}: BookingConfirmationProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const elements = containerRef.current.querySelectorAll('.confirm-item');

        gsap.fromTo(elements,
            { opacity: 0, x: -20 },
            {
                opacity: 1,
                x: 0,
                duration: 0.4,
                stagger: 0.1,
                ease: 'power3.out'
            }
        );
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

    return (
        <div ref={containerRef} className="space-y-6">
            {/* Main confirmation card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">Confirm Your Booking</h2>
                    <p className="text-cyan-100">
                        Review your appointment details before confirming
                    </p>
                </div>

                {/* Booking details */}
                <div className="p-6 space-y-6">
                    {/* Therapist info */}
                    <div className="confirm-item flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white shadow-lg">
                                {therapist.user.avatar_url ? (
                                    <img
                                        src={therapist.user.avatar_url}
                                        alt={therapist.user.full_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                                        {initials}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-lg">
                                {therapist.user.full_name}
                            </p>
                            <p className="text-gray-500 text-sm">
                                {therapist.credentials}
                            </p>
                        </div>
                        <button
                            onClick={() => onEdit(2)}
                            className="p-2 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Service */}
                    <div className="confirm-item flex items-center justify-between p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Service Type</p>
                                <p className="font-semibold text-gray-900">{service.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onEdit(1)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Date */}
                    <div className="confirm-item flex items-center justify-between p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-semibold text-gray-900">{formattedDate}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onEdit(3)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Time */}
                    <div className="confirm-item flex items-center justify-between p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Time</p>
                                <p className="font-semibold text-gray-900">{selectedTime}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onEdit(4)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Session type */}
                    <div className="confirm-item flex items-center gap-3 p-4 border-b border-gray-100">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <Video className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Session Type</p>
                            <p className="font-semibold text-gray-900">Video Call</p>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="confirm-item flex items-center gap-3 p-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-semibold text-gray-900">{service.duration} minutes</p>
                        </div>
                    </div>
                </div>

                {/* Price summary */}
                <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-600">Session Fee</span>
                        <span className="text-gray-900 font-medium">${service.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            {service.price === 0 ? 'Free' : `$${service.price}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment method (for paid sessions) */}
            {service.price > 0 && (
                <div className="confirm-item bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Options
                    </h3>
                    <div className="space-y-3">
                        {/* UPI Options */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                    <span className="text-xs font-bold text-blue-600">UPI</span>
                                </div>
                                <span className="text-sm text-gray-600">GPay • PhonePe • Paytm • BHIM</span>
                            </div>
                        </div>
                        {/* Cards */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">💳</span>
                                </div>
                                <span className="text-sm text-gray-600">Credit & Debit Cards</span>
                            </div>
                        </div>
                        {/* Net Banking */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span className="text-xs font-bold text-green-600">🏦</span>
                                </div>
                                <span className="text-sm text-gray-600">Net Banking (All Banks)</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                        Powered by Razorpay • 100% Secure Payment
                    </p>
                </div>
            )}

            {/* Trust badges */}
            <div className="confirm-item flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Secure & Encrypted</span>
                </div>
            </div>

            {/* Confirm button */}
            <Button
                onClick={onConfirm}
                disabled={loading}
                className="w-full btn-icy h-14 text-lg font-semibold rounded-2xl group"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        {service.price === 0 ? 'Confirm Booking' : 'Confirm & Pay'}
                    </div>
                )}
            </Button>

            {/* Cancellation policy */}
            <p className="text-center text-sm text-gray-400">
                Free cancellation up to 24 hours before your session
            </p>
        </div>
    );
}
