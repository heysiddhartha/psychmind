import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Shield,
  Clock,
  Video,
  Globe,
  Lock,
  HeartHandshake,
  CheckCircle2
} from "lucide-react";
import DotLottieAnimation from "@/components/ui/DotLottieAnimation";

gsap.registerPlugin(ScrollTrigger);


const features = [
  {
    icon: Shield,
    title: "Licensed Professionals",
    description: "All therapists are verified and licensed with years of experience."
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Book sessions that fit your lifestyle - mornings, evenings, weekends."
  },
  {
    icon: Video,
    title: "Secure Video Sessions",
    description: "HIPAA-compliant platform ensuring your complete privacy."
  },
  {
    icon: Globe,
    title: "Connect From Anywhere",
    description: "Access therapy from home, office, or wherever you feel comfortable."
  },
  {
    icon: Lock,
    title: "100% Confidential",
    description: "Your conversations and records remain completely private."
  },
  {
    icon: HeartHandshake,
    title: "Personalized Matching",
    description: "Find the right therapist matched to your specific needs."
  },
];

const highlights = [
  "Evidence-based therapy approaches",
  "Ongoing support between sessions",
  "Culturally sensitive care",
  "Affordable pricing options",
];

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.fromTo(
        ".why-header",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".why-header",
            start: "top 85%"
          }
        }
      );

      // Image reveal with parallax
      gsap.fromTo(
        ".why-image",
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".why-image",
            start: "top 80%"
          }
        }
      );

      // Floating card reveal
      gsap.fromTo(
        ".floating-stat",
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: 0.3,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: ".why-image",
            start: "top 70%"
          }
        }
      );

      // Features stagger
      gsap.fromTo(
        ".feature-item",
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".features-list",
            start: "top 80%"
          }
        }
      );

      // Highlights reveal
      gsap.fromTo(
        ".highlight-item",
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".highlights-list",
            start: "top 85%"
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-[#F8FAFC] relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Animation */}
          <div className="why-image relative order-2 lg:order-1">
            {/* Main Animation Container - Clean background */}
            <div className="relative rounded-3xl overflow-hidden">
              <DotLottieAnimation
                src="/animations/yoga-black.lottie"
                className="w-full h-full"
                loop={true}
                autoplay={true}
                speed={1}
              />
            </div>

            {/* Floating Stats Card */}
            <div className="floating-stat absolute -right-4 lg:-right-8 bottom-8 lg:bottom-16 bg-white rounded-xl p-5 lg:p-6 shadow-xl border border-gray-100/50 max-w-[220px]">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">98%</p>
                  <p className="text-xs text-gray-500">Satisfaction</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Based on post-session client feedback
              </p>
            </div>

            {/* Decorative Elements - Minimal & Professional */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/10 rounded-xl -z-10 animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/5 rounded-full -z-10 blur-sm" />
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2">
            <div className="why-header mb-10">
              <span className="inline-block text-sm tracking-[0.2em] text-primary font-semibold mb-4 uppercase">
                Why Choose Us
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight">
                Your wellbeing is our{" "}
                <span className="text-primary">priority</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                We've built a platform that puts you first—making quality mental
                healthcare accessible, private, and convenient for everyone.
              </p>
            </div>

            {/* Features Grid */}
            <div className="features-list grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="feature-item flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm group-hover:text-primary transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="highlights-list flex flex-wrap gap-3 mb-8">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="highlight-item flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              to="/about"
              className="inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all group"
            >
              Learn more about our approach
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
