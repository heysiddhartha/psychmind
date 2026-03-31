import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Presentation } from "lucide-react";
import { useState } from "react";

const services = [
  {
    title: "Institutional Advisory On Mental-Health Frameworks",
    description: "Support in building policies, referral pathways, crisis protocols, confidentiality norms, and mental-wellness strategies tailored to your school.",
  },
  {
    title: "Teacher Training",
    description: "Workshops for teachers on recognising distress, managing classroom behaviour, responding to emotional needs, and reducing burnout.",
  },
  {
    title: "Parent Guidance & Family Support",
    description: "Sessions helping parents understand adolescent behaviour, communication gaps, academic pressure, and emotional needs at home.",
  },
  {
    title: "Mental Health Screening",
    description: "Online assessments to identify early signs of stress, anxiety, emotional distress, behavioural concerns, and coping challenges.",
  },
  {
    title: "Early Identification of At-Risk Students",
    description: "Mental-health screenings and assessments help identify students experiencing emotional, behavioural, or developmental concerns early, enabling timely intervention.",
  },
  {
    title: "Student Counselling (1:1 Online Sessions)",
    description: "Confidential emotional support for anxiety, stress, exam pressure, peer issues, behavioural concerns, and emotional regulation.",
  },
  {
    title: "Behaviour & Peer-Conflict Support",
    description: "Guidance for addressing bullying, peer conflicts, classroom disruptions, interpersonal issues, and social-emotional challenges.",
  },
  {
    title: "Student Stress & Exam Anxiety Programs",
    description: "Sessions teaching students practical tools for managing academic pressure, emotional overwhelm, motivation challenges, and performance anxiety.",
  },
  {
    title: "Online Workshops & Mental Health Masterclasses",
    description: "Sessions on topics such as:",
    subtopics: [
      "Stress & exam anxiety",
      "Emotional regulation",
      "Building resilience",
      "Peer relationships & communication",
      "Mindfulness & grounding",
      "Healthy boundaries",
      "Digital well-being",
      "Self-esteem & adolescent emotional skills",
    ],
  },
  {
    title: "School Wellness Retainers (Monthly Support)",
    description: "Institutions choose this for ongoing mental-health services, including:",
    subtopics: [
      "Fixed counselling hours per month",
      "Monthly workshops",
      "Teacher/parent consultations",
      "Well-being insights & recommendations",
    ],
  },
];

const howItWorks = [
  { step: 1, title: "Share Your Institution's Needs", desc: "Fill out the consultation form with details about your school/college, student age groups, concerns, and wellness goals." },
  { step: 2, title: "Choose Your Service Format", desc: "Select from student counselling, teacher training, parent sessions, SEL programs, support circles, mental-health screening, or a monthly school wellness plan." },
  { step: 3, title: "Schedule a Discovery Call", desc: "A brief online meeting to understand student challenges, teacher needs, parent concerns, behavioural patterns, and school culture." },
  { step: 4, title: "Receive a Tailored Mental-Health Plan", desc: "A customised program designed for your institution—covering counselling hours, workshop recommendations, SEL modules, crisis readiness, or teacher support." },
  { step: 5, title: "Begin Online School Support", desc: "All services (counselling, workshops, parent sessions, SEL programs) begin through secure video platforms, scheduled according to your school timetable." },
  { step: 6, title: "Ongoing Coordination & Guidance", desc: "Regular check-ins with teachers, counsellors, and school leadership to track progress, address concerns, and refine the program." },
  { step: 7, title: "Monthly Insights & Recommendations", desc: "Receive well-being reports, common emotional themes, early risk indicators, and recommendations to strengthen student support systems." },
];

const servicesIncluded = [
  "Student Counselling (1:1)",
  "Teacher Training Workshops",
  "Parent Guidance Sessions",
  "SEL (Social–Emotional Learning) Programs",
  "Group Support Circles",
  "Mental Health Screening",
  "Crisis & Psychological First-Aid",
  "Monthly Wellness Retainers",
  "Institutional Policy & Advisory Support",
];

const pricingFactors = [
  "Student strength",
  "Counselling hours needed",
  "Workshop/SEL frequency",
  "Teacher & parent engagement",
  "Level of ongoing support",
  "One-time vs. monthly partnership",
];

const faqs = [
  { q: "How can I lift my mood?", a: "Some things that help our clients lift their moods are taking walks, connecting with loved ones, making art, and attending therapy every week. Low mood is a common experience in today's world, and the experienced therapists at The 3 Tree are ready to help you feel like yourself again." },
  { q: "What does an anxiety attack feel like?", a: "An anxiety attack can involve rapid heartbeat, shortness of breath, sweating, trembling, feeling of losing control, and intense fear. Everyone's experience is different, and our therapists can help you understand and manage these symptoms." },
  { q: "Can I talk about my relationship in individual therapy?", a: "Yes, absolutely. Individual therapy is a safe space to explore any aspect of your life, including relationships. Your therapist can help you understand relationship patterns, communicate better, and make healthier choices." },
  { q: "How do I know if I need to see a therapist?", a: "If you're experiencing persistent distress, difficulty functioning in daily life, relationship problems, overwhelming emotions, or simply want personal growth, therapy can help. You don't need to be in crisis to benefit from therapy." },
];

export default function SupportWorkshops() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      <Helmet>
        <title>Support Workshops | The 3 Tree - Mental Health Workshops</title>
        <meta
          name="description"
          content="Professional mental health workshops and training programs for institutions, organizations, and communities."
        />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-[#1E293B] to-[#2D3E5F] text-white">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <Presentation className="w-16 h-16" strokeWidth={1.5} />
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl mb-6">
                Support Workshops
              </h1>
              <p className="text-lg lg:text-xl text-gray-200 mb-10 leading-relaxed">
                Professional mental health workshops and training programs designed to empower 
                individuals, teams, and communities with practical tools for emotional well-being 
                and resilience.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#1E293B] hover:bg-gray-100 font-semibold px-8"
              >
                Book An Appointment <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-white">
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
        <section className="py-16 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <h2 className="font-serif text-3xl lg:text-4xl text-center text-[#2D2D2D] mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {howItWorks.map((step) => (
                <div
                  key={step.step}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
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

        {/* Program Details */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <h2 className="font-serif text-3xl text-[#2D2D2D] mb-8">
              Program Details:
            </h2>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-[#1E293B] mb-8">
              <div className="space-y-6">
                <div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Format:</span> Online delivery via Zoom/Google Meet.
                  </p>
                </div>

                <div>
                  <h4 className="font-serif text-xl text-[#2D2D2D] mb-4">
                    Services Included:
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {servicesIncluded.map((service, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <span className="w-2 h-2 rounded-full bg-[#8BA888] mt-2 flex-shrink-0" />
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-serif text-xl text-[#2D2D2D] mb-4">
                    Duration:
                  </h4>
                  <ul className="space-y-2">
                    <li className="text-gray-700">• Counselling: 45–60 mins</li>
                    <li className="text-gray-700">• Workshops/Trainings: 60–90 mins</li>
                    <li className="text-gray-700">• SEL Programs: 4–8 session modules</li>
                    <li className="text-gray-700">• Support Circles: 45–60 mins</li>
                    <li className="text-gray-700">• Crisis Support: As required</li>
                  </ul>
                </div>

                <div className="bg-[#1E293B] text-white p-6 rounded-xl">
                  <h4 className="font-serif text-xl mb-4">
                    Customised Pricing:
                  </h4>
                  <p className="text-gray-200 mb-4">Pricing depends on:</p>
                  <ul className="space-y-2">
                    {pricingFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700">
                    <span className="font-semibold">Confidentiality:</span> All student 
                    interactions follow strict ethical and confidentiality standards.
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Scheduling:</span> Sessions and programs 
                    are scheduled during or after school hours based on institutional needs.
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Cancellation Policy:</span> 24-hour notice 
                    required for changes or rescheduling.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="bg-[#8BA888] hover:bg-[#7A9B77] text-white px-12"
              >
                Book an Institutional Consultation
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faqs" className="py-16 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-serif text-3xl lg:text-4xl text-center text-[#2D2D2D] mb-2">
              Find Your Answers Here
            </h2>
            <div className="w-24 h-1 bg-[#2D2D2D] mx-auto mb-12" />

            <div>
              <h3 className="font-serif text-2xl text-[#2D2D2D] mb-4">
                Support Workshops
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white"
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
