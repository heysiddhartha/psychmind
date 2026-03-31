/**
 * TherapistCard - Premium therapist selection card component
 */

import { useEffect, useRef } from 'react';
import { Star, Check, MapPin, Award, Clock } from 'lucide-react';
import { gsap } from 'gsap';
import type { TherapistWithDetails } from '@/lib/bookingService';

interface TherapistCardProps {
    therapist: TherapistWithDetails;
    isSelected: boolean;
    onSelect: () => void;
    index?: number;
}

export default function TherapistCard({ therapist, isSelected, onSelect, index = 0 }: TherapistCardProps) {
    const cardRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!cardRef.current) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        gsap.fromTo(cardRef.current,
            { opacity: 0, y: 30, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                delay: index * 0.1,
                ease: 'power3.out'
            }
        );
    }, [index]);

    const handleClick = () => {
        onSelect();

        if (cardRef.current) {
            gsap.fromTo(cardRef.current,
                { scale: 0.98 },
                { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
            );
        }
    };

    // Generate initials for fallback avatar
    const initials = therapist.user.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Get availability preview
    const availableDays = Object.keys(therapist.availability).slice(0, 3);

    return (
        <button
            ref={cardRef}
            onClick={handleClick}
            className={`w-full p-6 rounded-2xl text-left transition-all duration-300 group relative overflow-hidden ${isSelected
                ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-500 shadow-xl shadow-cyan-500/15'
                : 'bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg'
                }`}
        >
            {/* Selection badge */}
            {isSelected && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 z-10">
                    <Check className="w-5 h-5 text-white" />
                </div>
            )}

            {/* Top section - Avatar and basic info */}
            <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <div className={`w-20 h-20 rounded-2xl overflow-hidden transition-all duration-300 ${isSelected ? 'ring-4 ring-cyan-500/30' : 'ring-2 ring-gray-100'
                        }`}>
                        {therapist.user.avatar_url ? (
                            <img
                                src={therapist.user.avatar_url}
                                alt={therapist.user.full_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                                {initials}
                            </div>
                        )}
                    </div>

                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                </div>

                {/* Name and credentials */}
                <div className="flex-1 min-w-0 pt-1">
                    <h3 className={`font-semibold text-lg truncate transition-colors duration-300 ${isSelected ? 'text-cyan-700' : 'text-gray-900'
                        }`}>
                        {therapist.user.full_name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                        {therapist.credentials}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">{therapist.rating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                            {therapist.total_sessions.toLocaleString()} sessions
                        </span>
                    </div>
                </div>
            </div>

            {/* Specialties */}
            <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                    {therapist.specialties.slice(0, 3).map((specialty) => (
                        <span
                            key={specialty}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${isSelected
                                ? 'bg-cyan-100 text-cyan-700'
                                : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            {specialty}
                        </span>
                    ))}
                    {therapist.specialties.length > 3 && (
                        <span className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-50 rounded-full">
                            +{therapist.specialties.length - 3} more
                        </span>
                    )}
                </div>
            </div>

            {/* Bio excerpt */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {therapist.bio}
            </p>

            {/* Bottom section - Availability and Price */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {/* Availability preview */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="truncate">
                        {availableDays.join(', ')}
                    </span>
                </div>

                {/* Price */}
                <div className={`text-xl font-bold ${isSelected ? 'text-cyan-600' : 'text-gray-900'
                    }`}>
                    ₹{therapist.hourly_rate?.toLocaleString('en-IN') || '3,500'}
                    <span className="text-sm font-normal text-gray-400">/session</span>
                </div>
            </div>

            {/* Hover effect overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${isSelected ? 'opacity-100' : ''
                }`} />

            {/* Shine effect on selected */}
            {isSelected && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-12 animate-shine" />
                </div>
            )}
        </button>
    );
}

/**
 * TherapistCardSkeleton - Loading skeleton for therapist card
 */
export function TherapistCardSkeleton() {
    return (
        <div className="w-full p-6 rounded-2xl bg-white border-2 border-gray-100 animate-pulse">
            <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-200" />
                <div className="flex-1 pt-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
            </div>
            <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-20" />
                <div className="h-6 bg-gray-200 rounded-full w-24" />
                <div className="h-6 bg-gray-200 rounded-full w-16" />
            </div>
            <div className="h-10 bg-gray-200 rounded mb-4" />
            <div className="flex justify-between pt-4 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
        </div>
    );
}
