import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Shield, Users, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * About Snapshot - Matching the3tree.com content
 */

const values = [
    {
        icon: Heart,
        title: "Compassionate Care",
        description: "Every interaction is guided by empathy and understanding",
    },
    {
        icon: Shield,
        title: "Safe Space",
        description: "Your story is safe with us. Always confidential.",
    },
    {
        icon: Users,
        title: "Expert Therapists",
        description: "Matched with the right therapist for your unique needs",
    },
    {
        icon: Sparkles,
        title: "Your Pace",
        description: "Heal at your own pace, on your own terms",
    },
];

export default function AboutSnapshot() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            // Header reveal
            gsap.fromTo(
                ".about-header",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".about-header",
                        start: "top 85%",
                    },
                }
            );

            // Image reveal
            gsap.fromTo(
                ".about-image",
                { opacity: 0, scale: 0.95 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".about-image",
                        start: "top 80%",
                    },
                }
            );

            // Values cards stagger
            gsap.fromTo(
                ".value-card",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".values-grid",
                        start: "top 85%",
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-24 lg:py-32 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left - Image */}
                    <div className="about-image relative order-2 lg:order-1">
                        <div className="relative rounded-3xl overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=700&h=600&fit=crop"
                                alt="Welcoming therapy environment"
                                className="w-full aspect-[5/4] object-cover"
                            />
                        </div>
                        {/* Decorative */}
                        <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/10 rounded-2xl -z-10" />
                    </div>

                    {/* Right - Content */}
                    <div className="order-1 lg:order-2">
                        <div className="about-header mb-10">
                            <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
                                About psychmind
                            </span>
                            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight">
                                A welcoming space to explore your thoughts
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-4">
                                At psychmind, we believe everyone deserves to feel seen, heard,
                                and understood. Our mission is to provide a safe space where you
                                can explore your thoughts, heal at your pace, and feel truly heard.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Whether you're facing anxiety, navigating relationships, or
                                simply seeking personal growth, our team of compassionate therapists
                                is here to walk alongside you on your journey.
                            </p>
                        </div>

                        {/* Values Grid */}
                        <div className="values-grid grid grid-cols-2 gap-4 mb-8">
                            {values.map((value) => (
                                <div
                                    key={value.title}
                                    className="value-card p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-gradient-icy rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <value.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-1">{value.title}</h4>
                                    <p className="text-sm text-gray-500">{value.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <Link
                            to="/about"
                            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                        >
                            Learn More About Us
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
