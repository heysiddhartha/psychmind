import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { User, Users, UsersRound, Baby, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Premium Services Carousel - Matching the3tree.com design
 * Dark cards with icons and hover reveal effect
 */

const services = [
    {
        id: "individual",
        icon: User,
        title: "INDIVIDUAL",
        subtitle: "THERAPY",
        description: "A safe, personal space for one-on-one therapy to explore your feelings, understand yourself better, and grow emotionally and mentally.",
        href: "/booking?service=individual",
    },
    {
        id: "couple",
        icon: Users,
        title: "COUPLE",
        subtitle: "THERAPY",
        description: "Therapy for couples to explore relationship dynamics, enhance understanding, manage disagreements, and nurture intimacy, empathy, and mutual support.",
        href: "/booking?service=couple",
    },
    {
        id: "group",
        icon: UsersRound,
        title: "GROUP",
        subtitle: "THERAPY",
        description: "Share experiences and heal together in a supportive group environment guided by professional therapists.",
        href: "/booking?service=group",
    },
    {
        id: "child",
        icon: Baby,
        title: "CHILD &",
        subtitle: "ADOLESCENCE THERAPY",
        description: "Age-appropriate support for young minds to navigate emotions, school challenges, and the complexities of growing up.",
        href: "/booking?service=child",
    },
    {
        id: "holistic",
        icon: Sparkles,
        title: "HOLISTIC",
        subtitle: "CONSCIOUSNESS COACHING",
        description: "Explore your inner self through holistic practices that integrate mind, body, and spirit for complete wellness.",
        href: "/booking?service=holistic",
    },
];

export default function ServicesCarousel() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            // Header animation with smooth reveal
            gsap.fromTo(
                ".carousel-header",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".carousel-header",
                        start: "top 85%",
                    },
                }
            );

            // Cards staggered reveal
            gsap.fromTo(
                ".service-carousel-card",
                { opacity: 0, y: 50, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".services-carousel-grid",
                        start: "top 80%",
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-20 lg:py-28 bg-white relative overflow-hidden"
        >
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                {/* Header */}
                <div className="carousel-header text-center max-w-2xl mx-auto mb-14">
                    <span className="inline-block text-sm tracking-[0.3em] text-gray-500 font-medium mb-4 uppercase">
                        Self Care Isn't Selfish
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-tight">
                        Find The Right Support For You
                    </h2>
                </div>

                {/* Services Grid - Matching the3tree.com design */}
                <div className="services-carousel-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {services.map((service) => (
                        <Link
                            key={service.id}
                            to={service.href}
                            className="service-carousel-card group relative block"
                            onMouseEnter={() => setHoveredCard(service.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Card Container */}
                            <div
                                className={`
                  relative h-[280px] md:h-[320px] lg:h-[360px] rounded-lg overflow-hidden
                  transition-all duration-500 ease-out
                  ${hoveredCard === service.id ? "bg-white shadow-2xl" : "bg-[#1a2744]"}
                `}
                            >
                                {/* Default State - Dark with Icon */}
                                <div
                                    className={`
                    absolute inset-0 flex flex-col items-center justify-center p-6 text-center
                    transition-opacity duration-500
                    ${hoveredCard === service.id ? "opacity-0" : "opacity-100"}
                  `}
                                >
                                    <service.icon
                                        className="w-10 h-10 md:w-12 md:h-12 text-white/90 mb-6"
                                        strokeWidth={1.5}
                                    />
                                    <h3 className="text-white font-semibold text-sm md:text-base tracking-wide">
                                        {service.title}
                                    </h3>
                                    <p className="text-white font-semibold text-sm md:text-base tracking-wide">
                                        {service.subtitle}
                                    </p>
                                </div>

                                {/* Hover State - Light with Description */}
                                <div
                                    className={`
                    absolute inset-0 flex flex-col items-center justify-center p-5 text-center
                    transition-opacity duration-500 bg-white
                    ${hoveredCard === service.id ? "opacity-100" : "opacity-0"}
                  `}
                                >
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                        {service.description}
                                    </p>
                                    <span className="inline-flex items-center justify-center px-5 py-2.5 bg-[#1a2744] text-white text-xs font-medium rounded tracking-wide hover:bg-[#0f1a2e] transition-colors">
                                        Book Now
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
