import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Video, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Booking Preview - Shows real-like availability
 * Note: In production, this would fetch from Supabase
 */

const sessionModes = [
    { id: "video", icon: Video, label: "Video Call" },
    { id: "audio", icon: Phone, label: "Audio Only" },
    { id: "chat", icon: MessageCircle, label: "Text Chat" },
];

const availableSlots = [
    { date: "Today", times: ["2:00 PM", "4:30 PM", "6:00 PM"] },
    { date: "Tomorrow", times: ["9:00 AM", "11:00 AM", "3:00 PM", "5:30 PM"] },
    { date: "Wed, Jan 8", times: ["10:00 AM", "1:00 PM", "4:00 PM"] },
];

export default function BookingPreview() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [selectedMode, setSelectedMode] = useState("video");

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".booking-content",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: { trigger: ".booking-content", start: "top 85%" },
                }
            );

            gsap.fromTo(
                ".booking-preview-card",
                { opacity: 0, x: 30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: { trigger: ".booking-preview-card", start: "top 80%" },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-24 lg:py-32 relative overflow-hidden"
        >
            {/* Background with image */}
            <div className="absolute inset-0 -z-10">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/90 to-gray-900/80" />
            </div>

            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left - Content */}
                    <div className="booking-content text-white">
                        <span className="inline-block px-4 py-2 bg-white/10 text-cyan-300 text-sm font-semibold rounded-full mb-6">
                            Book Today
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight">
                            Your first step is just
                            <span className="text-cyan-300"> a click away</span>
                        </h2>
                        <p className="text-gray-300 text-lg leading-relaxed mb-8">
                            Choose your preferred session type and find a time that works for
                            you. Our therapists have flexible availability to fit your schedule.
                        </p>

                        {/* Session Modes */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            {sessionModes.map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setSelectedMode(mode.id)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${selectedMode === mode.id
                                            ? "bg-primary text-white"
                                            : "bg-white/10 text-white hover:bg-white/20"
                                        }`}
                                >
                                    <mode.icon className="w-5 h-5" />
                                    <span className="font-medium">{mode.label}</span>
                                </button>
                            ))}
                        </div>

                        <Button asChild size="lg" className="btn-icy h-14 px-8 rounded-full group">
                            <Link to="/booking" className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Book Your Session
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>

                    {/* Right - Availability Preview */}
                    <div className="booking-preview-card bg-white rounded-3xl p-6 lg:p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-icy rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Available Times</h3>
                                <p className="text-sm text-gray-500">Next available slots</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {availableSlots.map((slot) => (
                                <div key={slot.date}>
                                    <p className="text-sm font-medium text-gray-700 mb-2">{slot.date}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {slot.times.map((time) => (
                                            <button
                                                key={time}
                                                className="px-4 py-2 text-sm font-medium bg-gray-50 hover:bg-primary hover:text-white rounded-lg transition-all"
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Real-time availability • Updated just now
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
