import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Specialties Overview - Areas of expertise
 */

const specialties = [
    { name: "Anxiety & Stress", slug: "anxiety", count: 12 },
    { name: "Depression", slug: "depression", count: 10 },
    { name: "Trauma & PTSD", slug: "trauma", count: 8 },
    { name: "Relationship Issues", slug: "relationships", count: 9 },
    { name: "Grief & Loss", slug: "grief", count: 6 },
    { name: "Self-Esteem", slug: "self-esteem", count: 7 },
    { name: "Life Transitions", slug: "transitions", count: 5 },
    { name: "Anger Management", slug: "anger", count: 4 },
    { name: "OCD", slug: "ocd", count: 3 },
    { name: "Addiction", slug: "addiction", count: 5 },
    { name: "Eating Disorders", slug: "eating", count: 4 },
    { name: "Sleep Issues", slug: "sleep", count: 6 },
];

export default function SpecialtiesOverview() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".specialties-header",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: { trigger: ".specialties-header", start: "top 85%" },
                }
            );

            gsap.fromTo(
                ".specialty-tag",
                { opacity: 0, scale: 0.9 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: "back.out(1.5)",
                    scrollTrigger: { trigger: ".specialties-list", start: "top 85%" },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-24 lg:py-32 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left - Content */}
                    <div>
                        <div className="specialties-header">
                            <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
                                Specialties
                            </span>
                            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight">
                                Expert support for
                                <span className="text-gradient-icy"> every challenge</span>
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                Our therapists specialize in a wide range of mental health areas.
                                Whatever you're going through, we have someone who understands.
                            </p>
                            <Link
                                to="/specialties"
                                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                            >
                                View All Specialties
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Right - Tags Cloud */}
                    <div className="specialties-list flex flex-wrap gap-3">
                        {specialties.map((specialty) => (
                            <Link
                                key={specialty.slug}
                                to={`/specialties/${specialty.slug}`}
                                className="specialty-tag group flex items-center gap-2 px-5 py-3 bg-gray-50 hover:bg-primary hover:text-white rounded-full transition-all duration-300 border border-gray-100"
                            >
                                <span className="font-medium">{specialty.name}</span>
                                <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full text-gray-400 group-hover:text-white/80 group-hover:bg-white/20">
                                    {specialty.count} therapists
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
