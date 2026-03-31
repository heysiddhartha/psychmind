import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Final CTA Section - Strong but not aggressive call to action
 */

export default function FinalCTA() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".cta-content",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
                }
            );

            gsap.fromTo(
                ".cta-image",
                { opacity: 0, scale: 0.95 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-24 lg:py-32 bg-gray-50">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left - Image */}
                    <div className="cta-image relative order-2 lg:order-1">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=700&h=500&fit=crop"
                                alt="Start your therapy journey today"
                                className="w-full aspect-[4/3] object-cover"
                            />
                        </div>
                        {/* Floating card */}
                        <div className="absolute -right-6 -bottom-6 bg-white rounded-2xl p-5 shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-icy rounded-xl flex items-center justify-center">
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Free Consultation</p>
                                    <p className="text-sm text-gray-500">15 min • No commitment</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/10 rounded-2xl -z-10" />
                    </div>

                    {/* Right - Content */}
                    <div className="cta-content order-1 lg:order-2">
                        <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
                            Self Care isn't selfish
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight">
                            Ready to feel
                            <span className="text-gradient-icy"> understood?</span>
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            A welcoming space to explore your thoughts, heal at your pace,
                            and feel truly heard. Our compassionate therapists are ready to
                            guide you towards a healthier, more fulfilling life.
                        </p>

                        {/* Benefits */}
                        <ul className="space-y-3 mb-10">
                            {[
                                "Feel seen, heard, and understood",
                                "Heal at your own pace",
                                "Matched with the right therapist",
                                "Safe and confidential space",
                            ].map((benefit) => (
                                <li key={benefit} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    </div>
                                    <span className="text-gray-700">{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                asChild
                                size="lg"
                                className="btn-icy h-14 px-8 rounded-full group"
                            >
                                <Link to="/booking" className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Book Your Session
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                asChild
                                className="h-14 px-8 rounded-full border-2"
                            >
                                <Link to="/contact" className="flex items-center gap-2">
                                    <Phone className="w-5 h-5" />
                                    Talk to Us
                                </Link>
                            </Button>
                        </div>

                        {/* Trust */}
                        <p className="text-sm text-gray-400 mt-6">
                            🔒 HIPAA Compliant • Secure & Confidential
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
