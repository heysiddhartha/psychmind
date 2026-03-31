/**
 * Mind Body Soul Section
 * 
 * Clean, humanized design with horizontal layout
 * Small Lottie animation on the side, minimal floating elements
 * Uses website's color palette for consistency
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DotLottieAnimation from "@/components/ui/DotLottieAnimation";

gsap.registerPlugin(ScrollTrigger);

type Pillar = {
    number: string;
    title: string;
    description: string;
};

// Wellness pillars - clean text-based approach
const pillars: Pillar[] = [
    {
        number: "01",
        title: "Mind",
        description: "Professional mental health support from clinical and counselling psychologists to help you navigate stress, anxiety, and life challenges with clarity.",
    },
    {
        number: "02",
        title: "Body",
        description: "Holistic physical wellness through yoga, nutrition guidance, and somatic practices that boost your vitality and overall well-being.",
    },
    {
        number: "03",
        title: "Soul",
        description: "Emotional and spiritual balance through mindfulness practices that help you connect with your inner self and find lasting peace.",
    }
];

export default function MindBodySoul() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            // Header animation
            gsap.fromTo(
                ".mbs-header",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".mbs-header",
                        start: "top 85%"
                    }
                }
            );

            // Left Content (Lottie)
            gsap.fromTo(
                ".mbs-lottie-container",
                { opacity: 0, x: -30, scale: 0.95 },
                {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".mbs-lottie-container",
                        start: "top 80%"
                    }
                }
            );

            // Pillar items stagger
            gsap.fromTo(
                ".mbs-pillar",
                { opacity: 0, x: 20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".mbs-pillars",
                        start: "top 80%"
                    }
                }
            );

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-20 lg:py-32 bg-white overflow-hidden relative"
        >
            {/* Ambient Background Element */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-50/50 to-blue-50/30 rounded-full blur-3xl -z-10 opacity-60" />

            <div className="container mx-auto px-4 lg:px-8">
                {/* Header - Clean and Simple */}
                <div className="mbs-header text-center max-w-2xl mx-auto mb-16 lg:mb-24">
                    <span className="inline-block text-xs tracking-[0.25em] text-cyan-600/80 font-bold mb-4 uppercase">
                        Our Philosophy
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 tracking-tight">
                        Mind. Body. Soul.
                    </h2>
                    <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
                        We believe in holistic wellness — nurturing every aspect of your being
                        to help you achieve lasting peace, balance, and fulfillment.
                    </p>
                </div>

                {/* Content - Two Column Layout */}
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">

                    {/* Left - Animation with floating effect */}
                    <div className="mbs-lottie-container lg:col-span-6 flex justify-center lg:justify-end relative">
                        {/* Decor circles */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-100/20 rounded-full blur-2xl animate-pulse" />

                        <div className="w-full max-w-[600px] aspect-square relative z-10 animate-float">
                            <DotLottieAnimation
                                src="/animations/peace-of-mind.lottie"
                                className="w-full h-full drop-shadow-xl"
                                loop={true}
                                autoplay={true}
                                speed={1}
                            />
                        </div>
                    </div>

                    {/* Right - Pillars List */}
                    <div className="mbs-pillars lg:col-span-6 space-y-6">
                        {pillars.map((pillar) => (
                            <div
                                key={pillar.number}
                                className="mbs-pillar group relative p-6 rounded-2xl hover:bg-white hover:shadow-card transition-all duration-500 border border-transparent hover:border-gray-100 cursor-default"
                            >
                                <div className="flex gap-6 items-start">
                                    {/* Number */}
                                    <div className="flex-shrink-0 pt-1">
                                        <span className="text-sm font-bold text-cyan-200 group-hover:text-cyan-500 transition-colors duration-300 tracking-wider">
                                            {pillar.number}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-3">
                                        <h3 className="font-serif text-2xl text-gray-900 group-hover:text-cyan-900 transition-colors duration-300">
                                            {pillar.title}
                                        </h3>
                                        <p className="text-gray-500 text-base leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                                            {pillar.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
