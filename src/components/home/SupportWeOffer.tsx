import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, GraduationCap, ShieldCheck, Sparkles, ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const supports = [
  {
    id: "therapists",
    title: "Supervision for Therapists",
    tagline: "Because the healer needs support too",
    description:
      "We offer structured online supervision, peer reflection spaces, and case-consultation circles for therapists and mental health professionals. Designed to prevent burnout, strengthen ethical practice, and support clinical confidence at every stage of your career.",
    icon: ShieldCheck,
    href: "/supervision-therapists",
    bg: "#dce7ff",
    iconBg: "#1a2744",
  },
  {
    id: "schools",
    title: "School & Institutional Wellbeing Programs",
    tagline: "Healthier classrooms start with emotionally supported systems",
    description:
      "We partner with schools and institutions to deliver structured, online mental health programs that enable early identification of student distress, build emotional literacy, equip educators with evidence-based tools that improve emotional regulation, classroom engagement, and institutional wellbeing.",
    icon: GraduationCap,
    href: "/support-schools",
    bg: "#ffead5",
    iconBg: "#7c4a1a",
  },
  {
    id: "businesses",
    title: "Support for Organisations",
    tagline: "Building healthier teams, from the inside out",
    description:
      "We support organisations across India with structured, online mental health programs designed to reduce burnout, improve emotional resilience, and strengthen workplace culture. From early-stage start-ups to established enterprises, our services are tailored to meet employees where they are—confidential, accessible, and grounded in evidence-based psychological practice.",
    icon: Building2,
    href: "/support-businesses",
    bg: "#d1fae5",
    iconBg: "#166534",
  },
  {
    id: "workshops",
    title: "Mental Health Workshops",
    tagline: "Awareness that leads to action",
    description:
      "Our expert led online workshops cover stress, emotional regulation, relationships, trauma awareness, parenting, and professional wellbeing. Designed for students, educators, employees, caregivers, and communities—practical, interactive, and grounded in real-life needs.",
    icon: Sparkles,
    href: "/support-workshops",
    bg: "#e0f2fe",
    iconBg: "#0c4a6e",
  },
];

export default function SupportWeOffer() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserInteracting = useRef(false);

  const toggle = (index: number) => {
    isUserInteracting.current = true;
    setActiveIndex((prev) => (prev === index ? -1 : index));
    // Reset after a short delay so scroll can take over again
    setTimeout(() => { isUserInteracting.current = false; }, 2000);
  };

  const onHoverEnter = (index: number) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      isUserInteracting.current = true;
      setActiveIndex(index);
      setTimeout(() => { isUserInteracting.current = false; }, 2000);
    }, 120); // small debounce so accidental hover doesn't flicker
  };

  const onHoverLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.fromTo(
        ".support-header",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: ".support-header", start: "top 85%" },
        }
      );

      // Stagger reveal each accordion item
      gsap.fromTo(
        ".support-accordion-item",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ".support-accordion-stack", start: "top 80%" },
        }
      );

      // Auto-open cards one by one as the user scrolls down
      const items = gsap.utils.toArray<HTMLElement>(".support-accordion-item");
      items.forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 60%",
          end: "bottom 30%",
          onEnter: () => { if (!isUserInteracting.current) setActiveIndex(i); },
          onEnterBack: () => { if (!isUserInteracting.current) setActiveIndex(i); },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-gradient-to-b from-white via-[#f8f9fc] to-white overflow-hidden"
    >
      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#dce7ff]/30 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#d1fae5]/25 blur-[100px] rounded-full pointer-events-none" aria-hidden="true" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="support-header text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a2744] text-white text-xs font-semibold rounded-full tracking-[0.2em] uppercase mb-6">
            Services
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            Support We Offer
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-[44px] text-[#1a2744] leading-tight">
            Structured support tailored for teams, institutions & the professionals who care for others
          </h2>
          <p className="text-gray-500 text-lg mt-5 max-w-2xl mx-auto">
            Four focused ways we partner with you — each designed to reduce burnout, build emotional resilience, and keep care accessible.
          </p>
        </div>

        {/* Accordion stack */}
        <div className="support-accordion-stack max-w-5xl mx-auto flex flex-col gap-3">
          {supports.map((item, index) => {
            const Icon = item.icon;
            const isOpen = activeIndex === index;
            const isEven = index % 2 === 0;

            return (
              <div
                key={item.id}
                className="support-accordion-item rounded-2xl overflow-hidden transition-all duration-400"
                onMouseEnter={() => onHoverEnter(index)}
                onMouseLeave={onHoverLeave}
                style={{
                  backgroundColor: item.bg,
                  boxShadow: isOpen
                    ? "0 25px 60px rgba(16,24,40,0.1)"
                    : "0 4px 20px rgba(16,24,40,0.04)",
                  transform: isOpen ? "scale(1)" : "scale(0.995)",
                }}
              >
                {/* ---- Collapsed Header Bar (always visible, clickable) ---- */}
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 px-6 md:px-8 py-5 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span
                      className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-bold shadow-md transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: item.iconBg }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon className="w-5 h-5 text-[#1a2744]/60 flex-shrink-0" strokeWidth={2} />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-[#0f172a] text-base md:text-lg truncate">
                        {item.title}
                      </h4>
                      {!isOpen && (
                        <p className="text-[#1a2744]/50 text-sm truncate mt-0.5 hidden md:block">
                          {item.tagline}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {!isOpen && (
                      <Link
                        to={item.href}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden lg:inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a2744]/70 hover:text-[#1a2744] transition-colors"
                      >
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 text-[#1a2744]/50 transition-transform duration-500 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* ---- Expanded Body ---- */}
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: isOpen ? 600 : 0,
                    opacity: isOpen ? 1 : 0,
                    transition: isOpen
                      ? "max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease-in 0.08s"
                      : "max-height 0.35s cubic-bezier(0.4,0,0.6,1), opacity 0.2s ease-out",
                  }}
                >
                  <div className="px-6 md:px-8 pb-8">
                    <div
                      className={`flex flex-col ${
                        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                      } items-stretch gap-8 rounded-2xl bg-white/40 backdrop-blur-sm p-6 md:p-8`}
                    >
                      {/* Icon / Visual Side */}
                      <div className="relative flex items-center justify-center lg:w-[35%] py-6">
                        {/* Large watermark number */}
                        <span
                          className="absolute top-0 left-2 text-[120px] font-black leading-none select-none pointer-events-none"
                          style={{ color: "rgba(26,39,68,0.04)" }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="relative">
                          <div
                            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center shadow-xl"
                            style={{ backgroundColor: item.iconBg }}
                          >
                            <Icon className="w-12 h-12 md:w-14 md:h-14 text-white" strokeWidth={1.5} />
                          </div>
                          <span className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-sm font-bold text-[#1a2744]">
                            {index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-[#1a2744] font-semibold text-lg md:text-xl mb-3">
                          {item.tagline}
                        </p>

                        <p className="text-gray-700 text-base leading-relaxed mb-6 max-w-xl">
                          {item.description}
                        </p>

                        {/* Progress dots + CTA */}
                        <div className="flex items-center gap-5">
                          <div className="hidden sm:flex items-center gap-1.5">
                            {supports.map((_, idx) => (
                              <span
                                key={idx}
                                className="block h-1.5 rounded-full transition-all duration-500"
                                style={{
                                  width: idx <= index ? 24 : 8,
                                  backgroundColor:
                                    idx <= index ? "#1a2744" : "rgba(26,39,68,0.15)",
                                }}
                              />
                            ))}
                          </div>
                          <Link
                            to={item.href}
                            className="group/btn inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a2744] text-white text-sm font-semibold hover:bg-[#0f1a2e] transition-all duration-300 hover:gap-3"
                          >
                            Explore
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}