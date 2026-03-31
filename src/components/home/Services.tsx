import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: "Individual Therapy",
    description: "One-on-one sessions to explore your thoughts, emotions, and behaviors in a safe, confidential space.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&h=350&fit=crop",
    href: "/services#individual",
  },
  {
    title: "Couple Therapy",
    description: "Strengthen your relationship through guided conversations, understanding, and healing together.",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500&h=350&fit=crop",
    href: "/services#couple",
  },
  {
    title: "Family Counseling",
    description: "Navigate family dynamics and build stronger, healthier connections with those who matter most.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&h=350&fit=crop",
    href: "/services#family",
  },
  {
    title: "Child & Teen Therapy",
    description: "Age-appropriate support to help young minds navigate emotions, school, and growing up.",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&h=350&fit=crop",
    href: "/services#youth",
  },
  {
    title: "Anxiety & Stress",
    description: "Learn practical strategies to manage anxiety, reduce stress, and find calm in daily life.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=350&fit=crop",
    href: "/services#anxiety",
  },
  {
    title: "Trauma Recovery",
    description: "Compassionate support to process difficult experiences and reclaim your sense of safety.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=350&fit=crop",
    href: "/services#trauma",
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        ".services-header",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".services-header", start: "top 85%" },
        }
      );

      // Cards animation
      gsap.fromTo(
        ".service-card",
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ".services-grid", start: "top 80%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-gray-50 relative">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-white to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="services-header text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
            Our Services
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-6">
            Personalized care for
            <span className="text-gradient-icy"> every need</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Whatever you're facing, we have experienced therapists
            ready to support you with evidence-based approaches.
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link
              key={service.title}
              to={service.href}
              className="service-card group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-serif text-xl text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
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
            className="inline-flex items-center gap-2 btn-icy-outline font-semibold text-base"
          >
            View All Services
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
