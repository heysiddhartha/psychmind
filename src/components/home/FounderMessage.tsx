/**
 * Founder Message Section
 * 
 * Personal, warm message from the founder
 * Clean design with optional photo and signature
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Quote } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function FounderMessage() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".founder-content",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".founder-content",
                        start: "top 85%"
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-20 lg:py-28 bg-[#f8f7f4]"
        >
            <div className="container mx-auto px-4 lg:px-8">
                <div className="founder-content max-w-3xl mx-auto text-center">

                    {/* Quote Icon */}
                    <div className="mb-8">
                        <Quote className="w-10 h-10 text-primary/20 mx-auto" />
                    </div>

                    {/* Message */}
                    <blockquote className="font-serif text-xl md:text-2xl lg:text-[1.7rem] text-gray-800 leading-relaxed mb-10">
                        "Mental health is not a destination, but a journey. At psychmind,
                        we walk alongside you — providing the support, understanding, and
                        expertise you need to nurture your mind, body, and soul.
                        <span className="text-primary"> You are not alone.</span>"
                    </blockquote>

                    {/* Founder Info */}
                    <div className="flex flex-col items-center">
                        {/* Photo placeholder - uncomment when image available */}
                        {/* 
                        <div className="w-16 h-16 rounded-full bg-gray-200 mb-4 overflow-hidden">
                            <img 
                                src="/founder-photo.jpg" 
                                alt="Founder"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        */}

                        <div>
                            <p className="font-medium text-gray-900 mb-1">
                                Siddhartha Sarkar
                            </p>
                            <p className="text-sm text-gray-500">
                                Founder, psychmind
                            </p>
                        </div>

                        {/* Signature line */}
                        <div className="mt-6 w-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    </div>
                </div>
            </div>
        </section>
    );
}
