import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const therapyTypes = [
  {
    id: "individual",
    title: "Individual Therapy",
    description: "Personalized one-on-one therapy designed to help you understand your emotions, navigate life challenges, and work toward clarity, stability, and personal growth.",
    howItWorks: [
      { step: 1, title: "Share Your Details", desc: "Fill the intake form with your basic details and concerns" },
      { step: 2, title: "Choose Your Therapist", desc: "Select the therapist of your choice" },
      { step: 3, title: "Select Session Mode", desc: "Choose your preferred session mode: Video, Phone Call, or Chat" },
      { step: 4, title: "Submit Your Request", desc: "Submit the form to confirm your request" },
      { step: 5, title: "Secure Information Sharing", desc: "Your details are securely shared with the selected therapist" },
      { step: 6, title: "Therapist Review", desc: "The therapist reviews your information before the session" },
      { step: 7, title: "Set Your Goals", desc: "Set goals together in the first session" },
      { step: 8, title: "Begin Therapy", desc: "Begin therapy with clarity and direction" },
      { step: 9, title: "Ongoing Support", desc: "Ongoing support with sessions adapted to your progress" },
      { step: 10, title: "Follow-Up Support", desc: "Regular follow-ups to track progress, address challenges, and adjust therapy as needed" },
    ],
    sessionDetails: {
      duration: "60-minute sessions",
      mode: "Video, Call, Chat",
      cancellation: "24-hour prior notice required",
    },
    quote: "Your healing begins the moment you choose yourself.",
    faqs: [
      { q: "What is individual therapy?", a: "Individual therapy is a one-on-one session with a trained therapist where you explore your thoughts, emotions, and challenges in a safe, private space." },
      { q: "What issues can individual therapy help with?", a: "Individual therapy can help with anxiety, depression, stress, trauma, relationship issues, life transitions, and more." },
      { q: "How long does individual therapy take to show results?", a: "Results vary by individual and concern. Some see improvement in a few sessions, while deeper work may take longer." },
      { q: "Is everything I share in therapy kept confidential?", a: "Yes, confidentiality is maintained except in cases of risk of harm to self or others, or legal obligations." },
      { q: "How do I know if individual therapy is right for me?", a: "If you're experiencing emotional distress, relationship challenges, or want personal growth, therapy can help." },
    ],
  },
  {
    id: "couple",
    title: "Couple Therapy",
    description: "Supportive sessions for couples seeking to rebuild trust, improve communication, resolve conflicts, and strengthen their emotional connection—whether you are dating, engaged, or married.",
    howItWorks: [
      { step: 1, title: "Share Couple Details", desc: "Fill the intake form with basic details of both partners and your relationship concerns" },
      { step: 2, title: "Choose Your Therapist", desc: "Select the therapist of your choice" },
      { step: 3, title: "Select Session Mode", desc: "Choose your preferred session mode: Video, Phone Call, or Chat" },
      { step: 4, title: "Submit Your Request", desc: "Submit the form to confirm your request" },
      { step: 5, title: "Secure Information Sharing", desc: "Your details are securely shared with the selected therapist" },
      { step: 6, title: "Dual Assessment", desc: "The therapist understands both partners' perspectives and concerns" },
      { step: 7, title: "Set Relationship Goals", desc: "Define shared goals for therapy together" },
      { step: 8, title: "Joint Therapy Sessions", desc: "Work through challenges, conflicts, and emotional disconnect" },
      { step: 9, title: "Skill Building", desc: "Learn communication, conflict-resolution, and emotional regulation skills" },
      { step: 10, title: "Ongoing Relationship Support", desc: "Develop long-term tools to maintain a healthy, balanced relationship" },
    ],
    sessionDetails: {
      duration: "60-minute sessions",
      mode: "Video Call, Phone Call, Chat",
      for: "Married couples and partners in a relationship",
      approach: "Confidential, non-judgmental, evidence-based therapy",
      cancellation: "24-hour prior notice required",
    },
    quote: "Your relationship deserves care, understanding, and support. Every strong relationship starts with honest effort.",
    faqs: [
      { q: "What is couple therapy?", a: "Couple therapy helps partners understand each other better, resolve conflicts, and strengthen their emotional and relational connection." },
      { q: "Who should consider couple therapy?", a: "Any couple facing communication issues, trust concerns, conflicts, or wanting to strengthen their bond." },
      { q: "Can couple therapy help even if we're not in a crisis?", a: "Yes, it's beneficial for prevention, growth, and maintaining a healthy relationship." },
      { q: "Will the therapist take sides during sessions?", a: "No, the therapist remains neutral and helps both partners equally." },
      { q: "How long does couple therapy take?", a: "It varies based on concerns and goals, typically ranging from a few sessions to several months." },
    ],
  },
  {
    id: "group",
    title: "Group Therapy",
    description: "Healing in a shared space. Group therapy offers a supportive and guided environment where individuals connect with others facing similar challenges. Through shared experiences, reflection, and professional guidance, participants gain insight, emotional strength, and a sense of belonging.",
    howItWorks: [
      { step: 1, title: "Share Your Details", desc: "Fill the intake form with your basic details and concerns" },
      { step: 2, title: "Choose Group Therapy", desc: "Select Group Therapy as your preferred service" },
      { step: 3, title: "Select Session Mode", desc: "Choose your session mode: Video Call or Chat" },
      { step: 4, title: "Submit Your Request", desc: "Submit the form to confirm your interest" },
      { step: 5, title: "Secure Information Sharing", desc: "Your details are securely shared with the group therapist" },
      { step: 6, title: "Pre-Screening Review", desc: "The therapist reviews your information to ensure suitability for a group setting" },
      { step: 7, title: "Group Allocation", desc: "You are informed about the upcoming group that matches your concerns" },
      { step: 8, title: "Join the Online Group Session", desc: "Join a secure, therapist-led online group with participants facing similar themes" },
      { step: 9, title: "Participate & Reflect", desc: "Listen, share at your comfort level, and engage in guided group discussions" },
      { step: 10, title: "Ongoing Group Support", desc: "Groups run over multiple sessions to deepen healing, insight, and connection" },
    ],
    sessionDetails: {
      duration: "60–90 minutes per session",
      mode: "Online – Video Call / Chat",
      limit: "Maximum 6 participants per group",
      format: "Small, therapist-led structured groups",
      participation: "Sharing is encouraged but always optional",
      approach: "Confidential, supportive, and evidence-based group therapy",
      frequency: "Weekly or as per group schedule",
      cancellation: "24-hour prior notice required",
    },
    quote: "Take the first step toward shared healing.",
    faqs: [
      { q: "What is group therapy?", a: "Group therapy is a guided session where individuals with similar experiences come together to share, learn, and grow with the support of a trained therapist." },
      { q: "How does group therapy help?", a: "It provides peer support, reduces isolation, offers different perspectives, and creates a sense of community." },
      { q: "Who can join a group therapy session?", a: "Anyone facing similar challenges like anxiety, grief, relationships, or life transitions." },
      { q: "Will I be required to share everything?", a: "No, participation is voluntary. You can share at your own comfort level." },
      { q: "Is group therapy confidential?", a: "Yes, all participants agree to maintain confidentiality of what is shared in the group." },
    ],
  },
  {
    id: "child-adolescent",
    title: "Child & Adolescent Therapy",
    description: "A safe, supportive, and non-judgmental space for adolescents to understand their emotions, manage stress, build confidence, and navigate academic, social, and personal challenges during this crucial phase of growth.",
    howItWorks: [
      { step: 1, title: "Parent/Guardian Enquiry", desc: "A parent or legal guardian initiates the request and shares the primary concerns." },
      { step: 2, title: "Informed Consent", desc: "Written consent is obtained from the parent/guardian before therapy begins, including agreement to confidentiality, safety, and ethical guidelines." },
      { step: 3, title: "Adolescent Assent", desc: "The adolescent's willingness to participate is taken to ensure comfort, trust, and cooperation." },
      { step: 4, title: "Confidentiality & Safety Explained", desc: "Privacy is maintained and clearly explained to both parent and adolescent. Confidentiality is only broken in cases of: Risk of self-harm or suicide, Risk of harm to others, Abuse or legal obligations" },
      { step: 5, title: "Assessment & Goal Setting", desc: "Initial sessions focus on emotional, behavioural, social, and academic assessment, followed by collaborative goal setting." },
      { step: 6, title: "Begin Therapy", desc: "Sessions begin in a safe, age-appropriate, and supportive environment." },
      { step: 7, title: "Ongoing Monitoring & Support", desc: "Progress is reviewed regularly and therapy is adjusted as needed." },
    ],
    sessionDetails: {
      duration: "60–90 minutes per session",
      mode: "Online – Video Call / Chat",
      ageGroup: "10–18 years",
      approach: "Safe, supportive, and evidence-based",
      parentalInvolvement: "As required and appropriate",
      cancellation: "24-hour prior notice required",
    },
    quote: "Start your child's journey toward emotional safety, confidence, and healthy self-expression.",
    faqs: [
      { q: "What is Child & Adolescent Therapy?", a: "It's a specialised form of counselling that helps children and teenagers understand their emotions, cope with challenges, and build healthy behaviour and communication skills." },
      { q: "What issues can therapy help children and teens with?", a: "Anxiety, depression, behavioural issues, academic stress, social challenges, family conflicts, and more." },
      { q: "How does therapy work for children and adolescents?", a: "Through age-appropriate techniques, play therapy, talk therapy, and creative expression." },
      { q: "Do parents stay involved in the therapy process?", a: "Yes, parental involvement is important and included as appropriate for the child's age and needs." },
      { q: "How do I know if my child needs therapy?", a: "If you notice persistent mood changes, behavioural issues, academic decline, or social withdrawal, therapy may help." },
    ],
  },
  {
    id: "holistic",
    title: "Holistic Consciousness Healing",
    description: "An integrative approach supporting emotional, mental, physical, and spiritual wellbeing through Yoga, Nutrition Guidance, and Somatic Healing practices to support the mind, body, spirit, and nervous system.",
    contactBased: true,
    howItWorks: [
      { step: 1, title: "Share Your Details", desc: "Fill out the holistic intake form covering: Emotional concerns, Physical symptoms (stress, fatigue, pain, sleep, digestion), Lifestyle, nutrition, and body-related patterns" },
      { step: 2, title: "Holistic Assessment", desc: "Your information is reviewed from multiple lenses: Psychological, Somatic (body-based), Lifestyle & nutrition, Mind–body balance" },
      { step: 3, title: "Choose Your Primary Therapist", desc: "Select your preferred therapist who coordinates your holistic care." },
      { step: 4, title: "Integrated Therapy Planning", desc: "A customised plan is created, which may include: Counselling sessions, Yoga-based practices, Nutrition guidance, Somatic healing techniques (Only what is relevant to you — nothing is forced.)" },
      { step: 5, title: "Select Session Mode", desc: "Choose your preferred format: Video, Phone Call, Chat" },
      { step: 6, title: "Secure Information Sharing", desc: "Your details are securely shared only with: Your therapist, Yoga practitioner / nutritionist (if included in your plan)" },
      { step: 7, title: "Goal Setting (Collaborative)", desc: "In the first session, you and your therapist: Identify emotional and physical goals, Decide which modalities will support you best, Set realistic, achievable outcomes" },
      { step: 8, title: "Begin Holistic Therapy", desc: "Counselling: Emotional processing, Stress, anxiety, trauma, relationships. Yoga Therapy: Gentle asanas, Breathwork (pranayama). Nutrition Support: Mood–food connection. Somatic Healing: Body awareness, Release of stored emotional tension" },
      { step: 9, title: "Ongoing Integrated Support", desc: "Sessions evolve as you progress, Modalities are adjusted based on your needs, Continuous coordination between practices" },
      { step: 10, title: "Follow-Up & Review", desc: "Regular check-ins, Progress tracking (mind & body), Refinement of goals and practices" },
    ],
    sessionDetails: {
      duration: "60 minutes per session",
      mode: "Online – Video, Call, Chat",
      approach: "Integrated & personalised",
      cancellation: "24-hour prior notice required",
    },
    quote: "Your healing begins when your mind and body are heard together.",
    faqs: [
      { q: "What is Holistic Therapy?", a: "Holistic Therapy is an integrated approach that combines counselling, yoga-based practices, nutrition guidance, and somatic (body-based) healing to support emotional, mental, and physical wellbeing together—not in isolation." },
      { q: "How is Holistic Therapy different from Individual Counselling?", a: "It addresses mental and physical health together, incorporating body-based practices alongside therapy." },
      { q: "Will I receive yoga, nutrition, and somatic work in every session?", a: "No, only what's relevant to your needs. It's customised based on your goals." },
      { q: "Who guides the yoga and nutrition components?", a: "Certified yoga therapists and nutrition experts work alongside your primary therapist." },
      { q: "Is Holistic Therapy suitable if I have physical limitations or health conditions?", a: "Yes, all practices are adapted to your body's needs and capabilities." },
      { q: "Do I need prior experience in yoga or mindfulness?", a: "No, everything is taught from the basics and tailored to your level." },
      { q: "How many sessions will I need?", a: "It varies based on your goals and progress, typically discussed in the initial sessions." },
      { q: "Is there a fixed price for Holistic Therapy?", a: "Pricing is customised based on the modalities included in your plan." },
    ],
  },
];

export default function CounsellingTypes() {
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>Counselling Types | The 3 Tree - Mental Health Services</title>
        <meta
          name="description"
          content="Explore our counselling services: Individual, Couple, Group, Child & Adolescent Therapy, and Holistic Consciousness Healing."
        />
      </Helmet>
      <Layout>
        {/* Hero Grid Section */}
        <section className="pt-24 pb-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {therapyTypes.map((type, index) => (
                <div
                  key={type.id}
                  className={`relative group ${
                    index === 3 ? "lg:col-start-1" : index === 4 ? "lg:col-start-2" : ""
                  }`}
                >
                  {/* Watercolor Image Placeholder */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50 rounded-t-2xl" />
                  
                  {/* Button */}
                  <button
                    onClick={() => scrollToSection(type.id)}
                    className="w-full bg-[#1E293B] text-white py-4 px-6 text-center font-semibold hover:bg-[#2D3E5F] transition-colors rounded-b-2xl cursor-pointer"
                  >
                    {type.title}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Therapy Type Details */}
        {therapyTypes.map((type) => (
          <section
            key={type.id}
            id={type.id}
            className="py-16 odd:bg-[#F5F1ED] even:bg-white"
          >
            <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
              {/* Header */}
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl lg:text-4xl text-[#2D2D2D] mb-4">
                  {type.title}
                </h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  {type.description}
                </p>
                <Button
                  size="lg"
                  className="mt-6 bg-[#1E293B] hover:bg-[#2D3E5F]"
                >
                  {type.contactBased ? "Contact Us For Session" : "Book An Appointment"}{" "}
                  <ChevronRight className="ml-2 h-5 w-5" />
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

              {/* Quote */}
              <div className="text-center mb-8">
                <p className="font-serif text-xl lg:text-2xl text-[#2D2D2D] italic">
                  "{type.quote}"
                </p>
                <Button
                  size="lg"
                  className="mt-6 bg-[#8BA888] hover:bg-[#7A9B77] text-white"
                >
                  {type.contactBased ? "Contact For Holistic Therapy Session" : "Book a Session"}
                </Button>
              </div>

              <div className="text-center text-gray-600">
                <p>
                  Questions?{" "}
                  <Link to="#faqs" className="text-[#1E293B] font-semibold underline">
                    Read Our FAQs
                  </Link>
                </p>
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
              {therapyTypes.map((type, typeIndex) => (
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
