import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, BookOpen, BarChart, Download } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Resources Preview - Guides, articles, research
 */

const resources = [
    {
        icon: FileText,
        type: "Guide",
        title: "Understanding Anxiety: A Complete Guide",
        description: "Learn about anxiety symptoms, causes, and coping strategies",
        downloads: "2.4k",
        slug: "understanding-anxiety",
    },
    {
        icon: BookOpen,
        type: "Article",
        title: "5 Daily Habits for Better Mental Health",
        description: "Simple practices to incorporate into your daily routine",
        downloads: "1.8k",
        slug: "daily-habits",
    },
    {
        icon: BarChart,
        type: "Research",
        title: "The Science of Therapy: What Works",
        description: "Evidence-based insights into effective therapeutic approaches",
        downloads: "1.2k",
        slug: "science-of-therapy",
    },
];

export default function ResourcesPreview() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".resources-header",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: { trigger: ".resources-header", start: "top 85%" },
                }
            );

            gsap.fromTo(
                ".resource-card",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: { trigger: ".resources-grid", start: "top 85%" },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-24 lg:py-32 bg-gray-50">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
                    {/* Left - Header */}
                    <div className="resources-header">
                        <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
                            Free Resources
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-6 leading-tight">
                            Knowledge is the first step to
                            <span className="text-gradient-icy"> healing</span>
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            Explore our library of free guides, articles, and research to
                            better understand mental health and support your journey.
                        </p>
                        <Link
                            to="/resources"
                            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                        >
                            Browse All Resources
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Right - Resource Cards */}
                    <div className="resources-grid lg:col-span-2 space-y-4">
                        {resources.map((resource) => (
                            <Link
                                key={resource.slug}
                                to={`/resources/${resource.slug}`}
                                className="resource-card group flex items-start gap-5 bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all border border-gray-100"
                            >
                                <div className="w-14 h-14 bg-gradient-icy rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <resource.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs font-medium text-primary uppercase tracking-wide">
                                        {resource.type}
                                    </span>
                                    <h3 className="font-semibold text-lg text-gray-900 mt-1 mb-1 group-hover:text-primary transition-colors">
                                        {resource.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm">{resource.description}</p>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-sm flex-shrink-0">
                                    <Download className="w-4 h-4" />
                                    <span>{resource.downloads}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
