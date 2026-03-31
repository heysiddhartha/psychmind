import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  UserRoundSearch,
  CalendarCheck,
  Video,
  HeartHandshake,
  ArrowRight,
  Sparkles
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Inline Lottie animation data for reliability
const searchAnimation = {
  v: "5.7.4", fr: 30, ip: 0, op: 90, w: 200, h: 200,
  assets: [],
  layers: [{
    ty: 4, nm: "search", sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      p: {
        a: 1, k: [
          { t: 0, s: [100, 100], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
          { t: 45, s: [100, 90], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
          { t: 90, s: [100, 100] }
        ]
      },
      s: { a: 0, k: [100, 100] },
      r: {
        a: 1, k: [
          { t: 0, s: [0], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
          { t: 45, s: [10], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
          { t: 90, s: [0] }
        ]
      }
    },
    shapes: [
      { ty: "el", s: { a: 0, k: [60, 60] }, p: { a: 0, k: [0, -10] } },
      { ty: "st", c: { a: 0, k: [0.22, 0.51, 0.96, 1] }, w: { a: 0, k: 8 } },
      {
        ty: "gr", it: [
          { ty: "rc", s: { a: 0, k: [8, 35] }, p: { a: 0, k: [0, 45] }, r: { a: 0, k: 4 } },
          { ty: "fl", c: { a: 0, k: [0.22, 0.51, 0.96, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] }, r: { a: 0, k: 45 } }
        ]
      }
    ]
  }]
};

const calendarAnimation = {
  v: "5.7.4", fr: 30, ip: 0, op: 90, w: 200, h: 200,
  assets: [],
  layers: [{
    ty: 4, nm: "calendar", sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      p: { a: 0, k: [100, 100] },
      s: {
        a: 1, k: [
          { t: 0, s: [100, 100], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
          { t: 30, s: [105, 105], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
          { t: 60, s: [100, 100] }
        ]
      }
    },
    shapes: [
      { ty: "rc", s: { a: 0, k: [70, 70] }, p: { a: 0, k: [0, 5] }, r: { a: 0, k: 8 } },
      { ty: "st", c: { a: 0, k: [0.16, 0.71, 0.53, 1] }, w: { a: 0, k: 6 } },
      {
        ty: "gr", it: [
          { ty: "rc", s: { a: 0, k: [70, 15] }, p: { a: 0, k: [0, -30] }, r: { a: 0, k: 4 } },
          { ty: "fl", c: { a: 0, k: [0.16, 0.71, 0.53, 1] } },
          { ty: "tr", p: { a: 0, k: [0, 0] } }
        ]
      }
    ]
  }]
};

const videoAnimation = {
  v: "5.7.4", fr: 30, ip: 0, op: 90, w: 200, h: 200,
  assets: [],
  layers: [{
    ty: 4, nm: "video", sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      p: { a: 0, k: [100, 100] },
      s: { a: 0, k: [100, 100] }
    },
    shapes: [
      { ty: "rc", s: { a: 0, k: [80, 55] }, p: { a: 0, k: [-5, 0] }, r: { a: 0, k: 6 } },
      { ty: "st", c: { a: 0, k: [0.55, 0.36, 0.96, 1] }, w: { a: 0, k: 6 } },
      {
        ty: "gr", it: [
          { ty: "sh", ks: { a: 0, k: { c: true, v: [[0, -15], [25, 0], [0, 15]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] } } },
          {
            ty: "fl", c: {
              a: 1, k: [
                { t: 0, s: [0.55, 0.36, 0.96, 1], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
                { t: 45, s: [0.65, 0.46, 1, 1], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
                { t: 90, s: [0.55, 0.36, 0.96, 1] }
              ]
            }
          },
          { ty: "tr", p: { a: 0, k: [50, 0] } }
        ]
      }
    ]
  }]
};

const heartAnimation = {
  v: "5.7.4", fr: 30, ip: 0, op: 60, w: 200, h: 200,
  assets: [],
  layers: [{
    ty: 4, nm: "heart", sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      p: { a: 0, k: [100, 105] },
      s: {
        a: 1, k: [
          { t: 0, s: [100, 100], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
          { t: 15, s: [115, 115], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
          { t: 30, s: [100, 100], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
          { t: 45, s: [115, 115], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
          { t: 60, s: [100, 100] }
        ]
      }
    },
    shapes: [
      {
        ty: "sh", ks: {
          a: 0, k: {
            c: true,
            v: [[0, -25], [-30, -45], [-50, -20], [-50, 5], [0, 45], [50, 5], [50, -20], [30, -45]],
            i: [[0, 0], [-15, 0], [0, -20], [0, 15], [-25, 20], [0, 0], [0, 20], [15, 0]],
            o: [[0, 0], [0, -20], [-15, 0], [-25, 0], [0, 0], [25, 20], [15, 0], [0, -20]]
          }
        }
      },
      { ty: "fl", c: { a: 0, k: [0.96, 0.35, 0.45, 1] } }
    ]
  }]
};

const steps = [
  {
    number: "01",
    icon: UserRoundSearch,
    title: "Find Your Match",
    description: "Browse our team of licensed therapists and find the one who specializes in your needs.",
    color: "from-slate-800 to-slate-900",
    bgColor: "bg-slate-100",
    iconColor: "text-slate-700",
    animation: searchAnimation,
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book Your Session",
    description: "Choose a convenient time that works for your schedule - we offer flexible appointments.",
    color: "from-slate-800 to-slate-900",
    bgColor: "bg-slate-100",
    iconColor: "text-slate-700",
    animation: calendarAnimation,
  },
  {
    number: "03",
    icon: Video,
    title: "Connect Securely",
    description: "Meet your therapist via our secure video platform from the comfort of your own space.",
    color: "from-slate-800 to-slate-900",
    bgColor: "bg-slate-100",
    iconColor: "text-slate-700",
    animation: videoAnimation,
  },
  {
    number: "04",
    icon: HeartHandshake,
    title: "Start Healing",
    description: "Begin your journey to better mental health with personalized, compassionate care.",
    color: "from-slate-800 to-slate-900",
    bgColor: "bg-slate-100",
    iconColor: "text-slate-700",
    animation: heartAnimation,
  },
];

// Animated Icon Component with custom animation
function AnimatedIcon({ animation, Icon, iconColor, isActive }: {
  animation: object;
  Icon: React.ElementType;
  iconColor: string;
  isActive: boolean;
}) {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iconRef.current || !isActive) return;

    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(iconRef.current, {
      scale: 1.15,
      rotation: 5,
      duration: 0.8,
      ease: "power2.inOut"
    });

    return () => { tl.kill(); };
  }, [isActive]);

  return (
    <div ref={iconRef} className="relative w-full h-full flex items-center justify-center">
      <Icon className={`w-10 h-10 ${iconColor} transition-all duration-300`} strokeWidth={1.5} />
      {isActive && (
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current" />
      )}
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        ".how-header",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".how-header",
            start: "top 85%",
            onEnter: () => setIsInView(true),
          },
        }
      );

      // Steps stagger reveal with scale
      gsap.fromTo(
        ".step-card",
        { opacity: 0, y: 60, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.2,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: ".steps-container",
            start: "top 75%",
          },
        }
      );

      // Animated progress line
      gsap.fromTo(
        ".progress-line-fill",
        { width: "0%" },
        {
          width: "100%",
          duration: 2.5,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: ".steps-container",
            start: "top 70%",
          },
        }
      );

      // Step connector dots
      steps.forEach((_, index) => {
        gsap.fromTo(
          `.step-dot-${index}`,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            delay: 0.5 + index * 0.4,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: ".steps-container",
              start: "top 70%",
            },
          }
        );
      });
    }, sectionRef);

    // Auto-rotate active step
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => {
      ctx.revert();
      clearInterval(interval);
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-100/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="how-header text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              How It Works
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight">
            Your journey to wellness in{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              4 simple steps
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We've made it easy to get the support you need. Here's how to get started on your path to better mental health.
          </p>
        </div>

        {/* Progress Line (Desktop) */}
        <div className="hidden lg:block relative mb-12 max-w-5xl mx-auto px-16">
          <div className="h-1 bg-gray-100 rounded-full relative">
            <div className="progress-line-fill absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500 rounded-full" />
          </div>
          {/* Step dots on the line */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`step-dot-${index} w-5 h-5 rounded-full border-4 border-white shadow-lg transition-all duration-500 cursor-pointer ${index <= activeStep
                  ? `bg-gradient-to-r ${step.color} scale-110`
                  : "bg-gray-200"
                  }`}
                onClick={() => setActiveStep(index)}
              />
            ))}
          </div>
        </div>

        {/* Steps Grid */}
        <div className="steps-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`step-card group cursor-pointer transition-all duration-500 ${index === activeStep ? "lg:scale-105 z-10" : "lg:scale-100"
                  }`}
                onMouseEnter={() => setActiveStep(index)}
              >
                {/* Card */}
                <div
                  className={`relative bg-white rounded-3xl p-6 lg:p-8 h-full transition-all duration-500 overflow-hidden ${index === activeStep
                    ? "shadow-2xl border-2 border-transparent"
                    : "shadow-lg border border-gray-100 hover:shadow-xl"
                    }`}
                  style={{
                    background: index === activeStep
                      ? `linear-gradient(white, white) padding-box, linear-gradient(135deg, ${index === 0 ? '#3b82f6, #06b6d4' :
                        index === 1 ? '#10b981, #14b8a6' :
                          index === 2 ? '#8b5cf6, #6366f1' :
                            '#f43f5e, #ec4899'
                      }) border-box`
                      : undefined
                  }}
                >
                  {/* Icon Container with Animation */}
                  <div className={`relative w-20 h-20 ${step.bgColor} rounded-2xl mb-6 flex items-center justify-center overflow-hidden transition-all duration-500 ${index === activeStep ? 'scale-110 shadow-lg' : 'group-hover:scale-105'
                    }`}>
                    <AnimatedIcon
                      animation={step.animation}
                      Icon={step.icon}
                      iconColor={step.iconColor}
                      isActive={index === activeStep}
                    />
                  </div>

                  {/* Step Number Badge */}
                  <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg transition-all duration-500 ${index === activeStep ? 'scale-110 shadow-xl' : ''
                    }`}>
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  </div>

                  {/* Content */}
                  <h3 className={`font-bold text-xl mb-3 transition-colors duration-300 ${index === activeStep ? step.iconColor : 'text-gray-900 group-hover:text-primary'
                    }`}>
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow connector (Desktop) */}
                  {index < steps.length - 1 && (
                    <div className={`hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full items-center justify-center shadow-lg border border-gray-100 z-20 transition-all duration-300 ${index === activeStep ? 'scale-110' : ''
                      }`}>
                      <ArrowRight className={`w-4 h-4 transition-colors duration-300 ${index === activeStep ? step.iconColor : 'text-gray-400'
                        }`} />
                    </div>
                  )}

                  {/* Pulse effect when active */}
                  {index === activeStep && (
                    <div className="absolute inset-0 rounded-3xl pointer-events-none">
                      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.color} opacity-5 animate-pulse`} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            to="/booking"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold rounded-full shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 group"
          >
            <span className="text-lg">Get Started Today</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-gray-500 text-sm mt-4">
            Free consultation available • No commitment required
          </p>
        </div>
      </div>
    </section>
  );
}
