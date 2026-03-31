import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, User, Users, UsersRound, Baby } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Services Overview - Matching the3tree.com content
 */

const services = [
    {
        icon: User,
        title: "Individual Therapy",
        description:
            "A safe, personal space for one-on-one therapy to explore your feelings, understand why, and grow emotionally and mentally.",
        image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&h=280&fit=crop",
        href: "/services/individual",
    },
    {
        icon: Users,
        title: "Couple Therapy",
        description:
            "Strengthen your relationship through guided conversations. Learn to communicate, resolve conflicts, and reconnect with your partner.",
        image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=280&fit=crop",
        href: "/services/couple",
    },
    {
        icon: UsersRound,
        title: "Family Counseling",
        description:
            "Navigate family dynamics and build stronger bonds. Address generational patterns and improve family communication.",
        image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=280&fit=crop",
        href: "/services/family",
    },
    {
        icon: Baby,
        title: "Child & Teen Therapy",
        description:
            "Age-appropriate support for young minds. Help children and adolescents navigate emotions, school, and growing up.",
        image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=280&fit=crop",
        href: "/services/youth",
    },
];

export default function ServicesOverview() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            // Header
            gsap.fromTo(
                ".services-header",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".services-header",
                        start: "top 85%",
                    },
                }
            );

            // Cards stagger
            gsap.fromTo(
                ".service-card",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".services-grid",
                        start: "top 80%",
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-24 lg:py-32 bg-gray-50">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="services-header text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
                        Find the right support for you
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight">
                        Our
                        <span className="text-gradient-icy"> Services</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Whatever you're facing, we have experienced therapists ready to support
                        you with compassionate, personalized care.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="services-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {services.map((service) => (
                        <Link
                            key={service.title}
                            to={service.href}
                            className="service-card group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
                        >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                {/* Icon */}
                                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <service.icon className="w-6 h-6 text-primary" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="font-serif text-xl text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    {service.description}
                                </p>
                                <span className="inline-flex items-center text-primary font-medium text-sm">
                                    Learn more
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-14">
                    <Link
                        to="/services"
                        className="inline-flex items-center gap-2 btn-icy-outline px-8 py-3 rounded-full font-semibold"
                    >
                        View All Services
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
