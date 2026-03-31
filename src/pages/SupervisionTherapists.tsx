import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Users, UserCheck, UsersRound } from "lucide-react";
import { useState } from "react";

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const features = [
  { title: "Goal Setting", desc: "Collaborative goal development to strengthen clinical focus, treatment planning, and therapy outcomes." },
  { title: "Structured Supervision Process", desc: "A clear supervision framework with agreed frequency, mode, boundaries, and session structure." },
  { title: "Case Supervision", desc: "Structured case discussions to enhance clinical decision-making, ethical practice, and therapeutic effectiveness." },
  { title: "Evidence-Based Guidance", desc: "Support in applying evidence-based psychotherapeutic techniques across initial, middle, and termination phases." },
  { title: "Reflective Practice", desc: "Developing self-awareness, insight into countertransference, and reflective skills for deeper therapeutic work." },
  { title: "Ethical Standards & Boundaries", desc: "Guidance on confidentiality, documentation, cultural sensitivity, and professional ethics in all clinical work." },
  { title: "Skill Building", desc: "Strengthening assessment skills, intervention strategies, session structure, and therapeutic communication." },
  { title: "Feedback & Evaluation", desc: "Balanced, constructive feedback to promote growth, competence, and confidence in your therapeutic identity." },
  { title: "Documentation Support", desc: "Help with supervision contracts, session notes, case documentation, and ethical record-keeping practices." },
  { title: "Cultural Competence", desc: "Integrating culturally sensitive approaches essential for working within India's diverse social contexts." },
  { title: "Supervisor Reflection Support", desc: "A space where the supervisor models reflective thinking, objectivity, and self-awareness to enrich your learning." },
  { title: "Therapist Well-Being", desc: "A supportive environment to process emotional strain, prevent burnout, and build resilience as a practitioner." },
];

const supervisionTypes = [
  {
    id: "individual",
    title: "Individual Supervision",
    icon: UserCheck,
    description: "Personalized one-on-one therapy designed to help you understand your emotions, navigate life challenges, and work toward clarity, stability, and personal growth.",
    howItWorks: [
      { step: 1, title: "Share Your Details", desc: "Fill out the supervision intake form with your background, training level, and supervision needs." },
      { step: 2, title: "Choose Your Supervisor", desc: "Select the supervisor you wish to work with for personalised one-to-one support." },
      { step: 3, title: "Select Supervision Mode", desc: "Choose your preferred format: Video, Phone Call, or In-Person (if available)." },
      { step: 4, title: "Submit Your Request", desc: "Submit the form to confirm your supervision booking." },
      { step: 5, title: "Secure Information Sharing", desc: "Your details are safely and confidentially shared with the supervisor." },
      { step: 6, title: "Supervisor Review", desc: "Your supervisor reviews your information, goals, and any submitted cases before the session." },
      { step: 7, title: "Set Your Goals", desc: "Begin the first session by collaboratively setting clear supervision goals." },
      { step: 8, title: "Begin Supervision", desc: "Engage in focused, structured clinical supervision tailored to your needs." },
      { step: 9, title: "Ongoing Support", desc: "Receive step-by-step guidance, case feedback, and reflective support throughout your sessions." },
      { step: 10, title: "Follow-Up Support", desc: "Benefit from continuous evaluation, updated goals, and supervision adapted to your growth." },
    ],
    sessionDetails: {
      type: "Individual Supervision",
      duration: "60 minutes",
      format: "Video, Call",
      fee: "₹1,000 – ₹2,000",
      cancellation: "24-hour prior notice required for rescheduling or cancellation.",
    },
    whatYouReceive: [
      "Case Supervision: Detailed discussions to improve clinical decision-making & ethical practice.",
      "Goal Setting: Clear therapeutic goals for client progress and therapist clarity.",
      "Evidence-Based Guidance: Support with CBT, psychodynamic, humanistic & integrative approaches.",
      "Reflective Practice: Explore countertransference, therapist challenges, and professional identity.",
      "Session Structuring: Help with assessment, intervention planning, and managing initial–middle–terminal phases.",
      "Ethical Consultation: Guidance on confidentiality, boundaries, documentation & dilemmas.",
      "Skill Development: Constructive feedback to enhance competence and confidence.",
    ],
    faqs: [
      { q: "Who is Individual Supervision best suited for?", a: "Individual supervision is ideal for therapists who want personalised guidance, case clarity, ethical support, structured feedback, and reflective space to grow their therapeutic identity." },
      { q: "Can I bring multiple cases to a single supervision session?", a: "Yes, you can discuss multiple cases in a single session, though depth may vary based on time constraints." },
      { q: "Do I need to prepare anything before the session?", a: "Yes, it's helpful to prepare case notes, specific questions, and areas you'd like to focus on during supervision." },
      { q: "Will my clinical work be judged or evaluated?", a: "Supervision is a supportive, growth-oriented process, not evaluative judgment. Feedback is constructive and collaborative." },
      { q: "Are my client details kept confidential?", a: "Yes, all client information shared in supervision is kept completely confidential and follows professional ethical standards." },
    ],
  },
  {
    id: "advanced",
    title: "Advanced Supervision",
    icon: Users,
    description: "Deeper supervision for complex cases, transcripts, long-term planning, and professional refinement. Best for therapists working with challenging presentations or looking to strengthen advanced clinical skills.",
    howItWorks: [
      { step: 1, title: "Share Your Details", desc: "Fill out the supervision intake form with your background and current supervision needs." },
      { step: 2, title: "Choose Your Supervisor", desc: "Select the supervisor you want to work with." },
      { step: 3, title: "Select Supervision Mode", desc: "Choose Video or Call." },
      { step: 4, title: "Supervisor Review", desc: "Your supervisor reviews your submitted details, cases, and any documents in advance." },
      { step: 5, title: "Begin Advanced Supervision", desc: "Engage in deeper case formulation, transcript review, and advanced therapeutic reflection." },
      { step: 6, title: "Ongoing Advanced Support", desc: "Receive continued guidance with evolving goals, detailed feedback, and professional refinement." },
    ],
    sessionDetails: {
      type: "Advanced Supervision",
      duration: "90 minutes",
      format: "Video, Call, or In-Person",
      suitableFor: "Complex cases, long-term clients, and advanced skill refinement",
      fee: "₹1,500 – ₹2,500",
      cancellation: "24-hour prior notice required for rescheduling or cancellation.",
    },
    whatYouReceive: [
      "Everything in Individual Supervision, plus:",
      "Extended Time: Space to explore more than one case thoroughly.",
      "Advanced Case Formulation: Long-term planning for complex or chronic clients.",
      "Session Transcript/Recording Review: Detailed analysis to sharpen therapeutic communication.",
      "Treatment Planning & Revisions: Multi-phase intervention strategies for deeper clinical work.",
      "Therapist Development Work: Addressing blind spots, internal blocks, and meta-competence.",
      "Documentation Review: Support with progress notes, treatment plans, and assessments.",
      "Cultural Competency Work: Integrating culturally sensitive and inclusive frameworks.",
      "Evaluation & Reflection: Deeper, structured feedback cycles to accelerate mastery.",
    ],
    faqs: [
      { q: "How is Advanced Supervision different from Individual Supervision?", a: "Advanced supervision offers deeper, specialised work including case formulation, long-term planning, transcript/recording review, complex presentations, therapist development work, and refining your therapeutic style." },
      { q: "Is Advanced Supervision only for experienced therapists?", a: "No, it's suitable for any therapist working with complex cases or wanting deeper clinical refinement, regardless of experience level." },
      { q: "Do I need to prepare anything before an Advanced Supervision session?", a: "Yes, preparing case notes, transcripts (if applicable), specific questions, and treatment plans will help maximize the session's value." },
      { q: "Can we revise or redesign long-term treatment plans in Advanced Supervision?", a: "Absolutely, Advanced Supervision is ideal for reviewing and refining long-term treatment strategies." },
      { q: "Can I contact the supervisor between sessions for small doubts?", a: "This depends on the supervision agreement. Discuss this with your supervisor during the goal-setting session." },
      { q: "How often should I book Advanced Supervision?", a: "Frequency depends on your needs and goals. Many therapists find bi-weekly or monthly sessions beneficial." },
    ],
  },
  {
    id: "group",
    title: "Group Supervision",
    icon: UsersRound,
    description: "Collaborative, peer-based learning with diverse clinical perspectives under guided supervision. Best for interns and early-career therapists who benefit from shared insights and cost-effective supervision.",
    howItWorks: [
      { step: 1, title: "Share Your Details", desc: "Fill out the group supervision form with your experience level and case interests." },
      { step: 2, title: "Choose a Group Slot", desc: "Select from available group timings (limited seats per group)." },
      { step: 3, title: "Join the Group Session", desc: "Participate via Video or In-Person, depending on your preference." },
      { step: 4, title: "Supervisor Review", desc: "Cases submitted in advance are reviewed by the supervisor for structured discussion." },
      { step: 5, title: "Begin Collaborative Supervision", desc: "Engage in guided peer learning, case exploration, and reflective dialogue." },
      { step: 6, title: "Ongoing Group Support", desc: "Gain continuous insights as group themes evolve across sessions." },
    ],
    sessionDetails: {
      type: "Group Supervision",
      duration: "120 minutes",
      format: "Video or Call",
      focus: "Peer learning, multiple case perspectives, collaborative skill-building",
      fee: "₹1,000 (Per participant, per session)",
      cancellation: "24-hour prior notice required",
    },
    whatYouReceive: [
      "Multi-Perspective Case Insights: Diverse peer viewpoints that expand clinical understanding.",
      "Collaborative Learning: Exposure to a variety of cases, interventions, and therapeutic styles.",
      "Peer Reflection & Discussion: Guided reflection to build self-awareness and sensitivity.",
      "Ethical Case Exploration: Group discussions on ethical dilemmas within a confidential space.",
      "Skill Expansion Through Observation: Learn from how others conceptualize and intervene.",
      "Case Presentation Practice: Build clarity and structure in presenting your cases.",
      "Cultural & Contextual Awareness: Understand how therapists navigate cultural and contextual challenges.",
      "Emotional Processing: Safely explore emotional reactions and countertransference themes in a supportive group.",
    ],
    faqs: [
      { q: "Why choose group supervision?", a: "You gain multi-perspective insights, observe different therapeutic approaches, build presentation skills, and learn vicariously through shared challenges." },
      { q: "How many participants are in a group?", a: "Groups typically have 4-6 participants to ensure quality discussion time and diverse perspectives." },
      { q: "Will I get enough time to discuss my case?", a: "Yes, the 120-minute format is designed to give each participant adequate time for case presentation and feedback." },
      { q: "Do I have to present a case in every session?", a: "Not necessarily. Participation can be flexible based on your current caseload and learning needs." },
      { q: "Is group supervision confidential?", a: "Yes, all participants agree to maintain strict confidentiality of cases and discussions shared within the group." },
    ],
  },
];

export default function SupervisionTherapists() {
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>Supervision For Therapists | The 3 Tree</title>
        <meta
          name="description"
          content="Professional supervision for therapists. Individual, Advanced, and Group supervision options with evidence-based guidance and reflective practice."
        />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-[#1E293B] to-[#2D3E5F] text-white">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl mb-6">
                Supervision For Therapists
              </h1>
              <p className="text-lg lg:text-xl text-gray-200 mb-10 leading-relaxed">
                Grow into the therapist you're meant to be by strengthening your skills, 
                refining your approach, and grounding yourself in clarity, confidence, and ethical practice.
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

        {/* Features Grid */}
        <section className="py-16 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <h3 className="font-semibold text-lg text-[#2D2D2D] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hero Grid for Supervision Types */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {supervisionTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div key={type.id} className="relative group">
                    {/* Watercolor Image Placeholder */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50 rounded-t-2xl flex items-center justify-center">
                      <IconComponent className="w-20 h-20 text-[#1E293B]" strokeWidth={1.5} />
                    </div>
                    
                    {/* Button */}
                    <button
                      onClick={() => scrollToSection(type.id)}
                      className="w-full bg-[#1E293B] text-white py-4 px-6 text-center font-semibold hover:bg-[#2D3E5F] transition-colors rounded-b-2xl cursor-pointer"
                    >
                      {type.title}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Supervision Type Details */}
        {supervisionTypes.map((type, index) => (
          <section
            key={type.id}
            id={type.id}
            className={`py-16 ${index % 2 === 0 ? "bg-[#F5F1ED]" : "bg-white"}`}
          >
            <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
              {/* Header */}
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl lg:text-4xl text-[#2D2D2D] mb-4">
                  {type.title}
                </h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed mb-6">
                  {type.description}
                </p>
                <Button
                  size="lg"
                  className="bg-[#1E293B] hover:bg-[#2D3E5F]"
                >
                  BOOK AN APPOINTMENT <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* How It Works */}
              <div className="mb-12">
                <h3 className="font-serif text-2xl lg:text-3xl text-[#2D2D2D] mb-8 text-center">
                  How It Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {type.howItWorks.map((step) => (
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

              {/* Session Details */}
              <div className="bg-[#1E293B] text-white p-8 rounded-2xl mb-8">
                <h3 className="font-serif text-2xl mb-4">Session Details</h3>
                <div className="space-y-2">
                  {Object.entries(type.sessionDetails).map(([key, value]) => (
                    <p key={key} className="text-gray-200">
                      <span className="font-semibold capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>{" "}
                      {value}
                    </p>
                  ))}
                </div>
              </div>

              {/* What You Receive */}
              <div className="mb-8">
                <h3 className="font-serif text-2xl lg:text-3xl text-[#2D2D2D] mb-6">
                  What You Receive
                </h3>
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
                  <ul className="space-y-3">
                    {type.whatYouReceive.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <span className="w-2 h-2 rounded-full bg-[#8BA888] mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-[#8BA888] hover:bg-[#7A9B77] text-white px-12"
                >
                  Book {type.id === "individual" ? "an" : type.id === "advanced" ? "" : ""} {type.title.split(" ")[0]} {type.title.includes("Supervision") ? "Supervision" : ""} Session
                </Button>
              </div>
            </div>
          </section>
        ))}

        {/* FAQ Section */}
        <section id="faqs" className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-serif text-3xl lg:text-4xl text-center text-[#2D2D2D] mb-2">
              Find Your Answers Here
            </h2>
            <div className="w-24 h-1 bg-[#2D2D2D] mx-auto mb-12" />

            <div className="space-y-8">
              {supervisionTypes.map((type, typeIndex) => (
                <div key={type.id}>
                  <h3 className="font-serif text-2xl text-[#2D2D2D] mb-4">
                    {String(typeIndex + 1).padStart(2, "0")}. {type.title}
                  </h3>
                  <div className="space-y-3">
                    {type.faqs.map((faq, faqIndex) => {
                      const faqId = `${type.id}-${faqIndex}`;
                      return (
                        <div
                          key={faqId}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() =>
                              setOpenFaqIndex(openFaqIndex === faqId ? null : faqId)
                            }
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-left text-[#2D2D2D] font-medium">
                              {faq.q}
                            </span>
                            <Plus
                              className={`w-5 h-5 text-gray-600 transition-transform flex-shrink-0 ml-4 ${
                                openFaqIndex === faqId ? "rotate-45" : ""
                              }`}
                            />
                          </button>
                          {openFaqIndex === faqId && (
                            <div className="px-6 pb-4 text-gray-700">
                              <p>{faq.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
