import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
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
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".cta-content",
            start: "top 85%",
          },
        }
      );

      gsap.fromTo(
        ".cta-card",
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".cta-cards",
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Main CTA */}
        <div className="cta-content text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm tracking-[0.2em] text-primary font-semibold mb-4 uppercase">
            Ready to Start?
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight">
            Take the first step towards a{" "}
            <span className="text-primary">healthier you</span>
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Your journey to mental wellness begins with a single step. We're here to
            support you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              Book Your Session
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/assessments"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-slate-900 font-semibold rounded-full border-2 border-slate-200 hover:border-slate-300 hover:-translate-y-1 transition-all duration-300"
            >
              Take a Free Assessment
            </Link>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="cta-cards grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Phone */}
          <a
            href="tel:+1234567890"
            className="cta-card flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">Call Us</p>
              <p className="text-gray-500 text-sm">+91 123 456 7890</p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:psychmind.com"
            className="cta-card flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">Email Us</p>
              <p className="text-gray-500 text-sm">hello@psychmind.com</p>
            </div>
          </a>

          {/* Location */}
          <div className="cta-card flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">Visit Us</p>
              <p className="text-gray-500 text-sm">Online & In-Person</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
