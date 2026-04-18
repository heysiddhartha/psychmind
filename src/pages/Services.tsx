import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, GraduationCap, Building2, Presentation, Video, MessageCircle, Building, Check } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BackButton from "@/components/ui/BackButton";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: "supervision",
    icon: Users,
    title: "Supervision for Therapists",
    subtitle: "Because the healer needs support too",
    description:
      "We offer structured online supervision, peer reflection spaces, and case-consultation circles for therapists and mental health professionals. Designed to prevent burnout, strengthen ethical practice, and support clinical confidence at every stage of your career.",
    features: ["Online Supervision", "Peer Reflection Spaces", "Case-Consultation Circles", "Burnout Prevention"],
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    href: "/supervision-therapists",
  },
  {
    id: "school",
    icon: GraduationCap,
    title: "School & Institutional Wellbeing Programs",
    subtitle: "Healthier classrooms start with emotionally supported systems",
    description:
      "We partner with schools and institutions to deliver structured, online mental health programs that enable early identification of student distress, build emotional literacy, equip educators with evidence-based tools that improve emotional regulation, classroom engagement, and institutional wellbeing.",
    features: ["Early Distress Identification", "Emotional Literacy Building", "Evidence-Based Tools", "Educator Support"],
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop",
    href: "/support-schools",
  },
  {
    id: "organisations",
    icon: Building2,
    title: "Support for Organisations",
    subtitle: "Building healthier teams, from the inside out",
    description:
      "We support organisations across India with structured, online mental health programs designed to reduce burnout, improve emotional resilience, and strengthen workplace culture. From early-stage start-ups to established enterprises, our services are tailored to meet employees where they are — confidential, accessible, and grounded in evidence-based psychological practice.",
    features: ["Burnout Reduction", "Emotional Resilience", "Workplace Culture", "Confidential Support"],
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
    href: "/support-businesses",
  },
  {
    id: "workshops",
    icon: Presentation,
    title: "Mental Health Workshops",
    subtitle: "Awareness that leads to action",
    description:
      "Our expert-led online workshops cover stress, emotional regulation, relationships, trauma awareness, parenting, and professional wellbeing. Designed for students, educators, employees, caregivers, and communities — practical, interactive, and grounded in real-life needs.",
    features: ["Stress Management", "Emotional Regulation", "Relationship Skills", "Trauma Awareness"],
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop",
    href: "/support-workshops",
  },
];

const modes = [
  {
    icon: Video,
    title: "Online Sessions",
    description: "Secure video sessions from the comfort of your home. Connect with your therapist from anywhere.",
  },
  {
    icon: MessageCircle,
    title: "Chat Support",
    description: "Text-based therapy for flexible communication. Perfect for those who prefer writing.",
  },
  {
    icon: Building,
    title: "In-Person",
    description: "Face-to-face sessions at our welcoming center. Experience traditional therapy in a safe space.",
  },
];

export default function Services() {
  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        ".services-hero-content",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      // Service blocks stagger
      gsap.fromTo(
        ".service-block",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".services-list",
            start: "top 80%",
          },
        }
      );

      // Modes cards
      gsap.fromTo(
        ".mode-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".modes-grid",
            start: "top 85%",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Helmet>
        <title>Support We Offer | psychmind - Therapy & Counselling</title>
        <meta
          name="description"
          content="Explore our support services: supervision for therapists, school wellbeing programs, organisational mental health support, and expert-led workshops. Building healthier communities together."
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section ref={heroRef} className="py-24 lg:py-32 bg-[#1a2744] text-white relative overflow-hidden">
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
            {/* Back Button */}
            <div className="absolute top-0 left-0">
              <BackButton to="/" label="Back to Home" className="text-white/80 hover:text-white hover:bg-white/10" />
            </div>

            <div className="services-hero-content max-w-3xl mx-auto text-center">
              <span className="inline-block text-sm tracking-[0.3em] text-cyan-300 font-medium mb-4 uppercase">
                Support We Offer
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
                Support We Offer
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                We provide comprehensive mental health support for therapists, institutions, organisations, and communities across India.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section ref={servicesRef} className="py-20 lg:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="services-list grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              {services.map((service) => (
                <div
                  key={service.id}
                  id={service.id}
                  className="service-block scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex h-full flex-col gap-6 p-8 lg:p-9">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#1a2744] flex items-center justify-center shadow-sm">
                        <service.icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h2 className="font-serif text-2xl lg:text-3xl text-gray-900 mb-1 leading-snug">
                          {service.title}
                        </h2>
                        <p className="text-primary italic text-sm lg:text-base">
                          {service.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed text-base lg:text-lg">
                      {service.description}
                    </p>

                    <ul className="flex flex-wrap gap-2.5">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-gray-800"
                        >
                          <Check className="w-4 h-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2">
                      <Button asChild className="bg-[#1a2744] hover:bg-[#0f1a2e] text-white rounded-lg w-full justify-center">
                        <Link to={service.href}>
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Counselling Modes */}
        <section className="py-20 lg:py-28 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-sm tracking-[0.2em] text-primary font-semibold mb-4 uppercase">
                Counselling Modes
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-6">
                Choose How You Connect
              </h2>
              <p className="text-gray-600">
                We offer flexible options to make therapy accessible and comfortable for you.
              </p>
            </div>
            <div className="modes-grid grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {modes.map((mode) => (
                <div key={mode.title} className="mode-card bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl bg-[#1a2744] flex items-center justify-center mx-auto mb-6">
                    <mode.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">{mode.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{mode.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28 bg-[#1a2744] text-white">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Ready to Begin?</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Take the first step towards your mental wellness journey today. We're here to support you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-white text-[#1a2744] hover:bg-gray-100 rounded-lg">
                <Link to="/booking">
                  Book Your Session
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white/10 rounded-lg">
                <Link to="/assessments">
                  Take a Free Assessment
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
