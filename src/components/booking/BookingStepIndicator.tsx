/**
 * BookingStepIndicator - Premium animated step progress indicator
 */

import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { gsap } from 'gsap';

interface Step {
    number: number;
    label: string;
}

interface BookingStepIndicatorProps {
    currentStep: number;
    steps: Step[];
}

export default function BookingStepIndicator({ currentStep, steps }: BookingStepIndicatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const prevStepRef = useRef(currentStep);

    useEffect(() => {
        if (!containerRef.current) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Animate step change
        if (prevStepRef.current !== currentStep) {
            const stepElements = containerRef.current.querySelectorAll('.step-circle');
            const lineElements = containerRef.current.querySelectorAll('.step-line');

            if (currentStep > prevStepRef.current) {
                // Moving forward
                const targetStep = stepElements[currentStep - 1];
                const targetLine = lineElements[currentStep - 2];

                if (targetLine) {
                    gsap.fromTo(targetLine,
                        { scaleX: 0 },
                        { scaleX: 1, duration: 0.4, ease: 'power2.out' }
                    );
                }

                if (targetStep) {
                    gsap.fromTo(targetStep,
                        { scale: 0.8 },
                        { scale: 1, duration: 0.3, ease: 'back.out(1.7)', delay: 0.2 }
                    );
                }
            } else {
                // Moving backward
                gsap.to(stepElements[currentStep], {
                    scale: 1,
                    duration: 0.2
                });
            }

            prevStepRef.current = currentStep;
        }
    }, [currentStep]);

    return (
        <div ref={containerRef} className="w-full max-w-3xl mx-auto mb-12">
            {/* Desktop View */}
            <div className="hidden sm:flex items-center justify-center">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`step-circle relative w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${currentStep > step.number
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                                        : currentStep === step.number
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 ring-4 ring-cyan-500/20'
                                            : 'bg-gray-100 text-gray-400'
                                    }`}
                            >
                                {currentStep > step.number ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    step.number
                                )}

                                {/* Pulse animation for current step */}
                                {currentStep === step.number && (
                                    <span className="absolute inset-0 rounded-full bg-cyan-500 animate-ping opacity-20" />
                                )}
                            </div>

                            {/* Step Label */}
                            <span
                                className={`mt-3 text-sm font-medium transition-colors duration-300 ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="relative w-20 lg:w-28 h-1 mx-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`step-line absolute inset-y-0 left-0 w-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full origin-left transition-transform duration-300 ${currentStep > step.number ? 'scale-x-100' : 'scale-x-0'
                                        }`}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Mobile View */}
            <div className="sm:hidden">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">
                        Step {currentStep} of {steps.length}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                        {steps.find(s => s.number === currentStep)?.label}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {/* Step Dots */}
                <div className="flex justify-between mt-2">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep >= step.number
                                    ? 'bg-cyan-500'
                                    : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
