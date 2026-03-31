import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, FileText, BarChart3, Download } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Assessments Highlight - Self-assessment tools preview
 */

const assessments = [
    {
        icon: ClipboardList,
        title: "Anxiety Assessment",
        description: "Understand your anxiety levels with our GAD-7 based screening",
        duration: "5 min",
        slug: "gad7",
    },
    {
        icon: BarChart3,
        title: "Depression Screening",
        description: "PHQ-9 validated tool to assess depression symptoms",
        duration: "5 min",
        slug: "phq9",
    },
    {
        icon: FileText,
        title: "Stress Check",
        description: "Evaluate your stress levels and get personalized tips",
        duration: "7 min",
        slug: "stress",
    },
];

export default function AssessmentsHighlight() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".assessments-header",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: { trigger: ".assessments-header", start: "top 85%" },
                }
            );

            gsap.fromTo(
                ".assessment-card",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: "power2.out",
                    scrollTrigger: { trigger: ".assessments-grid", start: "top 85%" },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-24 lg:py-32 bg-gray-50">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="assessments-header text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
                        Self-Assessment Tools
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight">
                        Understand yourself
                        <span className="text-gradient-icy"> better</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Take our confidential assessments to gain insights into your mental
                        health. Results include personalized recommendations and downloadable reports.
                    </p>
                </div>

                {/* Assessment Cards */}
                <div className="assessments-grid grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12">
                    {assessments.map((assessment) => (
                        <Link
                            key={assessment.slug}
                            to={`/assessments/${assessment.slug}`}
                            className="assessment-card group block bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
                        >
                            <div className="w-14 h-14 bg-gradient-icy rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <assessment.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-semibold text-xl text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                {assessment.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                {assessment.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                                    {assessment.duration}
                                </span>
                                <span className="text-primary font-medium text-sm flex items-center gap-1">
                                    Start
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Features */}
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-primary" />
                        <span>PDF Reports Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>100% Confidential</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-primary" />
                        <span>Clinically Validated</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
