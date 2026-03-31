import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Testimonials - Anonymous client stories
 * Uses initials only for privacy
 */

const testimonials = [
    {
        id: 1,
        quote:
            "Finding the courage to reach out was the hardest step. The warmth and understanding I received made all the difference in my healing journey.",
        initials: "A.M.",
        service: "Individual Therapy",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    },
    {
        id: 2,
        quote:
            "We learned to truly listen to each other. Our communication has transformed, and we're closer than we've ever been.",
        initials: "J.R.",
        service: "Couple Therapy",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    },
    {
        id: 3,
        quote:
            "The group sessions helped me realize I'm not alone. Sharing experiences with others facing similar challenges was incredibly healing.",
        initials: "S.K.",
        service: "Group Sessions",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    },
    {
        id: 4,
        quote:
            "My therapist gave me tools I use every day. I finally feel equipped to handle life's challenges with confidence.",
        initials: "M.T.",
        service: "Anxiety Support",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    },
];

export default function TestimonialsPreview() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState(0);

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".testimonials-header",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: { trigger: ".testimonials-header", start: "top 85%" },
                }
            );

            gsap.fromTo(
                ".testimonial-card",
                { opacity: 0, scale: 0.98 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: { trigger: ".testimonial-card", start: "top 80%" },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const goToPrev = () =>
        setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    const goToNext = () =>
        setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));

    return (
        <section ref={sectionRef} className="py-24 lg:py-32 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="testimonials-header text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
                        Client Stories
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight">
                        Real journeys, real
                        <span className="text-gradient-icy"> transformations</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Anonymous stories from individuals who found strength through therapy.
                    </p>
                </div>

                {/* Testimonial Card */}
                <div className="testimonial-card max-w-3xl mx-auto">
                    <div className="relative bg-gray-50 rounded-3xl p-8 lg:p-12">
                        <Quote className="absolute top-8 right-8 w-16 h-16 text-gray-200" />

                        {/* Stars */}
                        <div className="flex gap-1 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                            ))}
                        </div>

                        {/* Quote */}
                        <blockquote className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 min-h-[100px]">
                            "{testimonials[current].quote}"
                        </blockquote>

                        {/* Author */}
                        <div className="flex items-center gap-4">
                            <img
                                src={testimonials[current].image}
                                alt=""
                                className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md"
                            />
                            <div>
                                <p className="font-semibold text-gray-900 text-lg">
                                    {testimonials[current].initials}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {testimonials[current].service}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            onClick={goToPrev}
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrent(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === current ? "w-6 bg-primary" : "w-2 bg-gray-300"
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={goToNext}
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
