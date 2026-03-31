import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, ClipboardList } from "lucide-react";
import { useState } from "react";

// Assessment images
import depressionImg from "@/assets/generate-images-about-_Could-I-Be-Experiencing-Depression__-Text_-keep-the-color-theme-as-navy-blue-ice-blue-white-and-beige-you-can-use-a-human-in-sketch-paint.webp";
import anxietyImg from "@/assets/generate-images-about-_Is-Anxiety-Affecting-My-Daily-Life__-Text_-keep-the-color-theme-as-navy-blue-ice-blue-white-and-beige-you-can-use-a-human-in-sketch-paint.webp";
import stressImg from "@/assets/generate-images-about-_How-Stressed-Am-I-Really___-Text_-keep-the-color-theme-as-navy-blue-ice-blue-white-and-beige-you-can-use-a-human-in-sketch-paint.webp";
import ptsdImg from "@/assets/generate-images-about-_Am-I-Still-Affected-by-Past-Trauma___-Text_-keep-the-color-theme-as-navy-blue-ice-blue-white-and-beige-you-can-use-a-human-in-sketch-paint.webp";
import dastImg from "@/assets/generate-images-about-_medicine__-Text_-keep-the-color-theme-as-navy-blue-ice-blue-white-and-beige-you-can-use-a-human-in-sketch-paint.webp";
import eatingImg from "@/assets/generate-images-about-_Are-My-Eating-Habits-Affecting-My-Health____-Text_-keep-the-color-theme-as-navy-blue-ice-blue-white-and-beige-you-can-use-a-human-in-sketch-paint.webp";
import personalityImg from "@/assets/generate-images-about-_What-Are-My-Core-Personality-Traits_____-Text_-keep-the-color-theme-as-navy-blue-ice-blue-white-and-beige-you-can-use-a-human-in-sketch-paint.webp";

const assessments = [
  {
    id: "phq9",
    question: "Could I Be Experiencing Depression?",
    title: "PHQ-9 (Depression)",
    description: "Persistent sadness or loss of interest might be more than just a phase—this test offers insight.",
    link: "/phq-9-questionnaire",
    image: depressionImg,
  },
  {
    id: "gad7",
    question: "Is Anxiety Affecting My Daily Life?",
    title: "GAD-7 (Anxiety)",
    description: "Unchecked worry can silently disrupt routines—see how much it's impacting you.",
    link: "/gad-7-questionnaire",
    image: anxietyImg,
  },
  {
    id: "pss",
    question: "How Stressed Am I Really?",
    title: "PSS (Stress)",
    description: "Life feels overwhelming sometimes—this test helps you understand your current stress levels.",
    link: "/pss-questionnaire",
    image: stressImg,
  },
  {
    id: "ptsd",
    question: "Am I Still Affected by Past Trauma?",
    title: "PC-PTSD-5 (PTSD)",
    description: "If old memories feel too vivid or disturbing, this self-assessment may offer clarity.",
    link: "/ptsd-questionnaire",
    image: ptsdImg,
  },
  {
    id: "dast",
    question: "Is My Use of Drugs Safe?",
    title: "DAST-10 (Drug use)",
    description: "Understand whether your habits are within safe limits or need professional attention.",
    link: "/dast-questionnaire",
    image: dastImg,
  },
  {
    id: "scoff",
    question: "Are My Eating Habits Affecting My Health?",
    title: "SCOFF (Eating Disorders)",
    description: "A short check-in that can flag potential signs of an unhealthy relationship with food.",
    link: "/scoff-questionnaire",
    image: eatingImg,
  },
  {
    id: "bfi",
    question: "What Are My Core Personality Traits?",
    title: "BFI-10 (Personality)",
    description: "Discover your unique personality profile across five major dimensions.",
    link: "/bfi-questionnaire",
    image: personalityImg,
  },
];

const faqs = [
  { 
    q: "What are self-assessments, and how do they help me?", 
    a: "Self-assessments are evidence-based questionnaires that help you gain insight into your mental and emotional well-being. They provide a structured way to understand symptoms, identify patterns, and determine if professional support might be helpful." 
  },
  { 
    q: "Are my responses private and secure?", 
    a: "Yes, all your responses are completely private and secure. The assessments are designed for self-reflection, and your answers are not stored or shared unless you choose to discuss them with a therapist." 
  },
  { 
    q: "Do these tests replace professional diagnosis or therapy?", 
    a: "No, these self-assessments are screening tools only and do not replace professional diagnosis or therapy. Only a qualified mental health professional can provide an accurate diagnosis and treatment plan." 
  },
  { 
    q: "How long does it take to complete a self-assessment?", 
    a: "Most assessments take between 5-10 minutes to complete. They're designed to be quick and straightforward while still providing meaningful insights." 
  },
  { 
    q: "What should I do after completing a self-assessment?", 
    a: "Your results will provide guidance on your current state. If your score indicates a concern or if you feel distressed, consider reaching out to a psychologist or therapist for further support." 
  },
];

export default function Assessments() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      <Helmet>
        <title>Mental Health Assessments | psychmind - Self Assessment Tools</title>
        <meta
          name="description"
          content="Take quick, evidence-based self-assessments to gain insights into your emotional and mental health. Private, easy to complete."
        />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-[#1E293B] to-[#2D3E5F] text-white">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <ClipboardList className="w-16 h-16" strokeWidth={1.5} />
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl mb-6">
                Understand Your Mental Well-being
              </h1>
              <p className="text-lg lg:text-xl text-gray-200 mb-10 leading-relaxed">
                Take quick, evidence-based self-assessments to gain insights into your emotional 
                and mental health. These tests are private, easy to complete, and help you take 
                the first step toward self-awareness and growth.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#1E293B] hover:bg-gray-100 font-semibold px-8"
              >
                Start Your Assessment <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Assessments Grid */}
        <section className="py-16 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {assessments.map((assessment, index) => (
                <div
                  key={assessment.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-200"
                >
                  <div className="flex gap-4 p-6">
                    {/* Assessment Image */}
                    <div className="flex-shrink-0 w-32 h-40 rounded-lg overflow-hidden">
                      <img 
                        src={assessment.image} 
                        alt={assessment.question}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-serif text-xl text-[#2D2D2D] mb-2 leading-tight">
                        {assessment.question}
                      </h3>
                      <p className="font-semibold text-sm text-gray-600 mb-3">
                        {assessment.title}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed mb-4 flex-1">
                        {assessment.description}
                      </p>
                      <Button
                        size="sm"
                        className="bg-[#1E293B] hover:bg-[#2D3E5F] self-start"
                        onClick={() => window.location.href = assessment.link}
                      >
                        Test It <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faqs" className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-serif text-3xl lg:text-4xl text-center text-[#2D2D2D] mb-2">
              Find Your Answers Here
            </h2>
            <div className="w-24 h-1 bg-[#2D2D2D] mx-auto mb-12" />

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenFaqIndex(openFaqIndex === index ? null : index)
                    }
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-left text-[#2D2D2D] font-medium">
                      {faq.q}
                    </span>
                    <Plus
                      className={`w-5 h-5 text-gray-600 transition-transform flex-shrink-0 ml-4 ${
                        openFaqIndex === index ? "rotate-45" : ""
                      }`}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-6 pb-4 text-gray-700">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer Section */}
        <section className="py-12 bg-[#1E293B] text-white">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <p className="text-sm text-gray-300 italic leading-relaxed">
              This tool is for self-assessment only and is not a diagnosis. Only a qualified 
              clinician can provide a diagnosis. If you are in crisis, please contact emergency 
              services or a local mental-health helpline.
            </p>
          </div>
        </section>
      </Layout>
    </>
  );
}
