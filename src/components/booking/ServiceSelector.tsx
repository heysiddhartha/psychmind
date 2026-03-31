/**
 * ServiceSelector - Premium service type selection component
 */

import { useEffect, useRef } from 'react';
import { User, Heart, Users, MessageCircle, Check, Baby } from 'lucide-react';
import { gsap } from 'gsap';
import type { ServiceType } from '@/lib/bookingService';

interface ServiceSelectorProps {
    services: ServiceType[];
    selectedService: string | null;
    onSelect: (serviceId: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    User: User,
    Heart: Heart,
    Users: Users,
    MessageCircle: MessageCircle,
    Baby: Baby,
};

export default function ServiceSelector({ services, selectedService, onSelect }: ServiceSelectorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const cards = containerRef.current.querySelectorAll('.service-card');

        gsap.fromTo(cards,
            { opacity: 0, y: 30, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power3.out'
            }
        );
    }, []);

    const handleSelect = (serviceId: string) => {
        onSelect(serviceId);

        // Animate selection
        const card = containerRef.current?.querySelector(`[data-service="${serviceId}"]`);
        if (card) {
            gsap.fromTo(card,
                { scale: 0.98 },
                { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
            );
        }
    };

    return (
        <div ref={containerRef} className="space-y-4">
            {services.map((service) => {
                const IconComponent = iconMap[service.icon] || User;
                const isSelected = selectedService === service.id;

                return (
                    <button
                        key={service.id}
                        data-service={service.id}
                        onClick={() => handleSelect(service.id)}
                        className={`service-card w-full p-6 rounded-2xl text-left transition-all duration-300 group relative overflow-hidden ${isSelected
                            ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-500 shadow-lg shadow-cyan-500/10'
                            : 'bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-md'
                            }`}
                    >
                        {/* Background gradient on hover */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSelected ? 'opacity-100' : ''
                                }`}
                        />

                        <div className="relative flex items-start gap-4">
                            {/* Icon */}
                            <div
                                className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isSelected
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
                                    : 'bg-gray-100 group-hover:bg-gray-200'
                                    }`}
                            >
                                <IconComponent
                                    className={`w-7 h-7 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-600'
                                        }`}
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3
                                            className={`font-semibold text-lg transition-colors duration-300 ${isSelected ? 'text-cyan-700' : 'text-gray-900'
                                                }`}
                                        >
                                            {service.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                            {service.description}
                                        </p>
                                    </div>

                                    {/* Selection indicator */}
                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected
                                            ? 'bg-cyan-500 shadow-lg shadow-cyan-500/30'
                                            : 'bg-gray-100 group-hover:bg-gray-200'
                                            }`}
                                    >
                                        {isSelected ? (
                                            <Check className="w-5 h-5 text-white" />
                                        ) : (
                                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Shine effect on selected */}
                        {isSelected && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-12 animate-shine" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
