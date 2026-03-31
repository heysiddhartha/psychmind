import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, GraduationCap } from "lucide-react";
import { useState } from "react";

const services = [
  {
    title: "Institutional Advisory on Mental-Health Frameworks",
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
  {
    title: "Student Access to Mental-Health Counselling",
    subtopics: [
      "One-on-one online counselling with qualified therapists",
      "Support for emotional, behavioural, academic, and personal concerns",
      "Ethical, confidential, age-appropriate care",
      "Flexible access via referral-based or scheduled sessions",
    ],
  },
  {
    title: "Mental-Health Awareness Programs for Students",
    description: "Schools may engage us for mental-health awareness programs delivered as:",
    subtopics: [
      "In-person seminars (depending on location and feasibility)",
      "Online webinars (accessible and scalable)",
    ],
  },
  {
    title: "Teacher Workshops & Capacity Building",
    description: "Institutions can opt for workshops designed specifically for teachers, focusing on:",
    subtopics: [
      "Recognising emotional distress in students",
      "Managing classroom behaviour with sensitivity",
      "Responding to emotional needs without burnout",
      "Supporting student well-being while maintaining boundaries",
    ],
  },
  {
    title: "Parent Guidance & One-on-One Support",
    description: "Schools may offer parents access to:",
    subtopics: [
      "One-on-one counselling sessions to understand and support their children better",
      "Parent awareness sessions on adolescent mental health",
      "Guidance on communication gaps, academic pressure, emotional regulation, and behavioural concerns",
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
  { q: "How does the Institutional Mental-Health Support work?", a: "We begin with an online consultation to understand your school's structure, existing practices, and challenges. Based on this, we design clear mental-health frameworks covering policies, referral pathways, crisis protocols, confidentiality norms, and roles—tailored specifically to your institution." },
  { q: "Does this require major changes to our existing systems?", a: "No, we work within your existing structure and enhance it with mental health support systems that integrate smoothly with your current processes." },
  { q: "Who from the institution needs to be involved?", a: "Typically, school leadership, counselors, teachers, and HR/admin staff are involved in planning and implementation." },
  { q: "Is this advisory aligned with Indian educational and ethical standards?", a: "Yes, all our programs are designed to align with Indian educational standards and professional ethical guidelines." },
  { q: "Does this include guidance on confidentiality and information sharing?", a: "Absolutely. We provide clear protocols on maintaining student confidentiality and appropriate information sharing with parents/staff." },
  { q: "How does a mental-health framework help during emergencies or crises?", a: "A well-defined framework ensures your institution has crisis protocols, trained responders, and clear pathways for immediate support during emergencies." },
  { q: "How do students access counselling sessions online during school/institutional hours?", a: "Sessions are scheduled during or after school hours based on institutional needs, conducted via secure video platforms." },
  { q: "How is parental consent handled for student counselling?", a: "We follow proper consent protocols as per institutional policies and ethical standards before beginning any counselling with minors." },
  { q: "What age groups do you work with?", a: "We work with students from primary through higher secondary levels, with age-appropriate approaches for each group." },
  { q: "Will teachers or parents receive updates about individual students?", a: "Updates are shared only with appropriate consent and in accordance with confidentiality protocols and institutional policies." },
  { q: "Do teachers receive emotional support for burnout and stress?", a: "Yes, we offer dedicated teacher support programs focusing on stress management, burnout prevention, and emotional well-being." },
  { q: "How are parents included without overstepping school boundaries?", a: "Parent programs are designed in consultation with the school to complement institutional efforts while respecting boundaries." },
  { q: "Are parent and teacher sessions conducted individually or in groups?", a: "Both formats are available based on the institution's needs and preferences." },
  { q: "How do you handle differing parenting styles or cultural beliefs?", a: "We respect cultural diversity and work with families to find approaches that honor their values while supporting student well-being." },
  { q: "Can teacher and parent programs be customised separately?", a: "Yes, all programs are fully customizable based on specific needs of teachers, parents, and students." },
  { q: "How do online programs remain engaging for students and teachers?", a: "We use interactive, age-appropriate methods, practical tools, and evidence-based approaches to ensure engagement." },
  { q: "Is this advisory a one-time consultation or ongoing support?", a: "Both options are available. Institutions can choose one-time consultations or ongoing monthly support packages." },
  { q: "How is pricing decided for institutional support?", a: "Pricing is customized based on student strength, services required, frequency of support, and duration of engagement." },
];

export default function SupportSchools() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      <Helmet>
        <title>Support for Schools & Institutions | The 3 Tree</title>
        <meta
          name="description"
          content="Holistic mental-health framework supporting students, empowering teachers, and guiding parents—creating emotionally stable and resilient learning ecosystems."
        />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-[#1E293B] to-[#2D3E5F] text-white">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <GraduationCap className="w-16 h-16" strokeWidth={1.5} />
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl mb-6">
                Support for Schools/Institutions
              </h1>
              <p className="text-lg lg:text-xl text-gray-200 mb-10 leading-relaxed">
                A holistic mental-health framework that supports students, empowers teachers, 
                and guides parents—creating emotionally stable and resilient learning ecosystems.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#1E293B] hover:bg-gray-100 font-semibold px-8"
              >
                Contact Us For Packages <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* What You Receive Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-serif text-3xl lg:text-4xl text-center text-[#2D2D2D] mb-12">
              What You Receive
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {services.map((service, index) => (
                <div
                  key={index}
                  className={`p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all ${
                    index % 2 === 0
                      ? "bg-[#1E293B] text-white"
                      : "bg-[#F5F1ED] text-[#2D2D2D] border-2 border-[#1E293B]"
                  }`}
                >
                  <h3 className="font-serif text-lg lg:text-xl mb-4 leading-tight">
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className={`text-sm leading-relaxed mb-3 ${
                      index % 2 === 0 ? "text-gray-200" : "text-gray-700"
                    }`}>
                      {service.description}
                    </p>
                  )}
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
                Contact Us For Institutional Consultation
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
                Support for Schools & Institutions
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
