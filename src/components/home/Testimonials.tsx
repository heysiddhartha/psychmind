import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    id: 1,
    quote: "Finding the courage to reach out was the hardest step. The warmth and understanding I received made all the difference in my healing journey.",
    initials: "A.M.",
    type: "Individual Therapy",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    quote: "We learned to truly listen to each other. Our communication has transformed, and we're closer than we've ever been.",
    initials: "J.R.",
    type: "Couple Therapy",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    quote: "The group sessions helped me realize I'm not alone. Sharing experiences with others facing similar challenges was incredibly healing.",
    initials: "S.K.",
    type: "Group Sessions",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 4,
    quote: "My therapist gave me tools I use every day. I finally feel equipped to handle life's challenges with confidence.",
    initials: "M.T.",
    type: "Anxiety Support",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".testimonial-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".testimonial-header",
            start: "top 85%"
          }
        }
      );

      gsap.fromTo(
        ".testimonial-card-main",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".testimonial-card-main",
            start: "top 80%"
          }
        }
      );

      gsap.fromTo(
        ".testimonial-nav",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".testimonial-nav",
            start: "top 90%"
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (index: number) => {
    setCurrent(index);
  };

  const prev = () => {
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-[#1a2744] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="testimonial-header text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-sm tracking-[0.2em] text-cyan-300 font-semibold mb-4 uppercase">
            Client Stories
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6 leading-tight">
            Real people, real{" "}
            <span className="text-cyan-300">transformations</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Hear from those who have taken the step towards better mental health.
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div className="testimonial-card-main max-w-3xl mx-auto">
          <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10">
            {/* Quote Icon */}
            <Quote className="absolute top-6 right-6 w-12 h-12 text-white/10" />

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl text-white leading-relaxed mb-8 font-light">
              "{testimonials[current].quote}"
            </blockquote>

            {/* Client Info */}
            <div className="flex items-center gap-4">
              <img
                src={testimonials[current].image}
                alt=""
                className="w-14 h-14 rounded-full object-cover ring-2 ring-white/20"
              />
              <div>
                <p className="font-semibold text-white text-lg">
                  {testimonials[current].initials}
                </p>
                <p className="text-cyan-300 text-sm">
                  {testimonials[current].type}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="testimonial-nav flex justify-center items-center gap-4 mt-10">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === current
                    ? "bg-cyan-400 w-8"
                    : "bg-white/30 hover:bg-white/50"
                  }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
