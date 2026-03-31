import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Briefcase } from "lucide-react";
import { useState } from "react";

const services = [
  {
    title: "Online Employee Counselling (1:1 Sessions)",
    description: "Confidential professional counselling for stress, burnout, anxiety, conflict, emotional regulation, and personal issues impacting work.",
  },
  {
    title: "Leadership & Manager Emotional Intelligence Coaching",
    description: "Coaching for managers to improve communication, empathy, conflict navigation, and team motivation.",
  },
  {
    title: "Stress & Burnout Prevention Programs",
    description: "Online sessions teaching employees how to manage workload pressure, exhaustion, and emotional fatigue.",
  },
  {
    title: "Workplace Conflict Resolution Support",
    description: "Helping teams navigate interpersonal conflicts, miscommunication, trust issues, and team friction.",
  },
  {
    title: "Online Workshops & Masterclasses",
    description: "Sessions on topics such as:",
    subtopics: [
      "Stress Management",
      "Emotional Regulation",
      "Boundaries at Work",
      "Work-Life Balance",
      "Mindfulness & Grounding",
      "Handling Difficult Conversations",
      "Psychological Safety at Work",
    ],
  },
  {
    title: "Monthly Wellness Retainers",
    description: "Companies seek this for ongoing employee support:",
    subtopics: [
      "Fixed number of counselling hours per month",
      "Monthly workshops",
      "HR check-ins",
      "Well-being reports",
    ],
  },
  {
    title: "Mental Health Screening (Voluntary)",
    description: "Online assessments for burnout, stress levels, emotional well-being (non-AI, via validated tools).",
  },
  {
    title: "Crisis & Change Management Support",
    description: "Providing psychological first-aid during layoffs, restructuring, conflicts, or distressing events.",
  },
  {
    title: "HR Advisory on Wellness Strategy",
    description: "Helping HR build policies, communication strategies, boundaries, and wellness initiatives.",
  },
  {
    title: "Group Support Circles (Online)",
    description: "Guided circles for teams on:",
    subtopics: [
      "Stress sharing",
      "Coping strategies",
      "Emotional check-ins",
      "Team cohesiveness",
    ],
  },
];

const howItWorks = [
  { step: 1, title: "Share Your Organisation's Needs", desc: "Fill out the consultation form with your company's challenges, team size, and wellness goals." },
  { step: 2, title: "Choose Your Service Format", desc: "Select from individual employee counselling, leadership coaching, team workshops, or a monthly corporate wellness plan." },
  { step: 3, title: "Schedule a Discovery Call", desc: "A brief call to understand workplace concerns, burnout levels, communication patterns, and organisational culture." },
  { step: 4, title: "Tailored Proposal", desc: "Receive a customised plan designed specifically for your workforce needs—whether it's stress management, emotional regulation, conflict resolution, or leadership development." },
  { step: 5, title: "Begin Workplace Support", desc: "Sessions or workshops begin in your selected mode: Online, On-Site, or Hybrid." },
  { step: 6, title: "Ongoing Guidance", desc: "Continuous check-ins, progress reviews, and refinements based on employee feedback and organisational goals." },
  { step: 7, title: "Monthly Reporting & Recommendations (Optional)", desc: "Get insights on workplace well-being trends, psychological risks, and strategies to build healthier teams." },
];

const availableServices = [
  "Employee Counselling",
  "Leadership Coaching",
  "Team Workshops",
  "Support Circles",
  "HR Wellness Advisory",
  "Monthly Wellness Retainers",
];

const pricingFactors = [
  "Team size",
  "Number of counselling sessions required",
  "Workshop frequency",
  "Leadership coaching needs",
  "Level of ongoing support",
  "Duration of engagement (one-time or monthly retainer)",
];

const faqs = [
  { q: "What is business counselling or workplace mental health support?", a: "Business counselling provides mental-health support, conflict resolution, stress management, and wellness programs tailored for employees, teams, and leadership." },
  { q: "How can counselling help my employees and workplace?", a: "Counselling improves employee well-being, reduces stress and burnout, enhances communication, resolves conflicts, and creates a healthier, more productive work environment." },
  { q: "Do you offer customised programs for companies?", a: "Yes, all programs are tailored to your organisation's specific needs, team size, challenges, and wellness goals." },
  { q: "Can counselling be provided online or on-site?", a: "Yes, we offer flexible formats including online sessions (video or call), on-site visits, or a hybrid approach based on your preference." },
  { q: "Is business counselling confidential for employees?", a: "Absolutely. All employee conversations remain strictly confidential and follow professional ethical standards." },
];

export default function SupportBusinesses() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      <Helmet>
        <title>Support for Businesses | The 3 Tree - Workplace Mental Health</title>
        <meta
          name="description"
          content="Enhancing workplace well-being, emotional intelligence, and team resilience through evidence-based psychological support for businesses."
        />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-[#1E293B] to-[#2D3E5F] text-white">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <Briefcase className="w-16 h-16" strokeWidth={1.5} />
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl mb-6">
                Support for Businesses
              </h1>
              <p className="text-lg lg:text-xl text-gray-200 mb-10 leading-relaxed">
                Enhancing workplace well-being, emotional intelligence, and team resilience 
                through evidence-based psychological support.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#1E293B] hover:bg-gray-100 font-semibold px-8"
              >
                Get Started <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {services.map((service, index) => (
                <div
                  key={index}
                  className={`p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all ${
                    index % 2 === 0
                      ? "bg-[#1E293B] text-white"
                      : "bg-white text-[#2D2D2D] border-2 border-[#1E293B]"
                  }`}
                >
                  <h3 className="font-serif text-xl lg:text-2xl mb-4 leading-tight">
                    {service.title}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-3 ${
                    index % 2 === 0 ? "text-gray-200" : "text-gray-700"
                  }`}>
                    {service.description}
                  </p>
                  {service.subtopics && (
                    <ul className="space-y-2 mt-4">
                      {service.subtopics.map((topic, idx) => (
                        <li
                          key={idx}
                          className={`text-sm flex items-start gap-2 ${
                            index % 2 === 0 ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                            index % 2 === 0 ? "bg-blue-400" : "bg-[#8BA888]"
                          }`} />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <h2 className="font-serif text-3xl lg:text-4xl text-center text-[#2D2D2D] mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {howItWorks.map((step) => (
                <div
                  key={step.step}
                  className="bg-[#F5F1ED] p-6 rounded-xl shadow-md border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#8BA888] text-white rounded-full flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#2D2D2D] mb-2">
                        {step.title}
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Details Section */}
        <section className="py-16 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-[#1E293B] mb-8">
              <h3 className="font-serif text-2xl text-[#2D2D2D] mb-4">
                Book a session:
              </h3>
              <p className="text-gray-700 mb-6">
                <span className="font-semibold">Format:</span> Online (Video or Call)
              </p>
              
              <h4 className="font-serif text-xl text-[#2D2D2D] mb-4">
                Services Available:
              </h4>
              <ul className="space-y-2 mb-8">
                {availableServices.map((service, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-[#8BA888] mt-2 flex-shrink-0" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-[#1E293B] text-white p-6 rounded-xl mb-8">
                <h4 className="font-serif text-xl mb-4">
                  Customised Pricing for Every Organisation:
                </h4>
                <p className="text-gray-200 mb-4 leading-relaxed">
                  Every organisation has unique needs, challenges, and team dynamics. 
                  Pricing is customised based on:
                </p>
                <ul className="space-y-2">
                  {pricingFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-gray-700">
                  <span className="font-semibold">Confidentiality:</span> All employee 
                  conversations remain strictly confidential.
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Cancellation Policy:</span> 24-hour prior 
                  notice required for rescheduling or cancellations.
                </p>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-[#8BA888] hover:bg-[#7A9B77] text-white px-12"
                >
                  Contact Us For Consultation
                </Button>
              </div>
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

            <div>
              <h3 className="font-serif text-2xl text-[#2D2D2D] mb-4">
                Support for Businesses
              </h3>
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
          </div>
        </section>
      </Layout>
    </>
  );
}
