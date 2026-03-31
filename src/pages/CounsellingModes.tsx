import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Phone, Video, MessageSquare, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const counsellingModes = [
  {
    id: "telephonic",
    title: "Telephonic Counselling",
    icon: Phone,
    description: "Telephonic counselling offers a comfortable and accessible way to receive support from anywhere. Whether you're at home, travelling, or simply prefer voice-based conversations, phone sessions provide a safe space to talk through your thoughts and emotions with a trained therapist.",
    subDescription: "It's flexible, confidential, and designed to help you get clarity and support—right when you need it.",
    helpWith: [
      "Voice-based therapy session through a phone call",
      "Suitable for those who prefer privacy without video",
      "Accessible from anywhere",
      "Same professional support as in-person sessions",
    ],
    bookingSteps: [
      "Click the button below to fill out the intake form",
      "Choose Telephonic Counselling as your preferred mode",
      "Select your therapist",
      "Share your concerns briefly",
      "Your session begins without delay",
    ],
    faqs: [
      { q: "What is telephonic counselling — and how does it differ from in-person therapy?", a: "Telephonic counselling is a type of remote therapy where you talk with a licensed therapist over the phone, instead of meeting face-to-face. Like traditional counselling, it offers you a confidential space to explore thoughts, feelings, and experiences — but with the convenience and flexibility of connecting from anywhere. It's part of broader teletherapy services, which also include video, chat, and messaging-based sessions." },
      { q: "Is phone-based therapy effective compared to in-person sessions?", a: "Yes, research shows that telephonic counselling can be as effective as in-person therapy for many concerns including anxiety, depression, and stress management." },
      { q: "Who is best suited for telephonic counselling? Is it right for me?", a: "It's ideal for those with busy schedules, limited mobility, those who prefer privacy, or anyone who feels more comfortable talking without video." },
      { q: "Is telephone counselling secure and confidential? How is my privacy protected?", a: "Yes, all sessions are completely confidential and conducted through secure channels. Your privacy is protected by professional ethics and legal standards." },
      { q: "What issues can telephonic counselling help with?", a: "Telephonic counselling can help with anxiety, depression, stress, relationship issues, grief, trauma, and many other mental health concerns." },
    ],
  },
  {
    id: "video",
    title: "Video Counselling",
    icon: Video,
    description: "Video counselling allows you to meet your therapist face-to-face from the comfort of your own space. It's convenient, flexible, and ideal for anyone who prefers the personal connection of in-person sessions but needs the ease of online support.",
    subDescription: "Through secure video sessions, you receive real-time guidance, emotional support, and a safe, private space to work through your thoughts and feelings.",
    helpWith: [
      "Face-to-face session through secure video call",
      "Allows deeper emotional connection and interaction",
      "Ideal for individual, couples, and adolescence counselling",
      "Conducted in a private and confidential setting",
    ],
    bookingSteps: [
      "Fill out the intake form",
      "Select Video Counselling as your session mode",
      "Choose your therapist",
      "Enter your details and concerns",
      "Start your session with clarity and focus",
    ],
    faqs: [
      { q: "What is video counselling?", a: "Video counselling is an online therapy session done through a secure video call, allowing you to meet your therapist face-to-face from anywhere." },
      { q: "Is video counselling as effective as in-person therapy?", a: "Yes, video counselling is clinically proven to be as effective as in-person sessions for most mental health concerns." },
      { q: "What do I need for a video counselling session?", a: "You need a device (phone, tablet, or computer) with a camera, microphone, and stable internet connection, plus a private, quiet space." },
      { q: "Is video counselling confidential?", a: "Yes, all sessions use secure, encrypted platforms to ensure complete privacy and confidentiality." },
      { q: "Who should choose video counselling?", a: "Anyone who wants face-to-face interaction with the convenience of online access, including individuals, couples, and adolescents." },
    ],
  },
  {
    id: "text-chat",
    title: "Text/Chat Counselling",
    icon: MessageSquare,
    description: "Text and chat counselling offers a private, flexible, and comfortable way to reach out for support. It's ideal for those who find it easier to express their thoughts through writing or prefer discreet communication during busy days.",
    subDescription: "With secure and confidential messaging, you can talk to a therapist at your own pace, reflect before sharing, and receive guidance that fits seamlessly into your routine.",
    helpWith: [
      "Therapy through real-time or scheduled text-based chat",
      "Suitable for those who find it easier to express in writing",
      "Discreet, flexible, and convenient",
      "Best for ongoing emotional support and guidance",
    ],
    bookingSteps: [
      "Open the intake form",
      "Select Text / Chat Counselling as your preferred mode",
      "Choose your therapist",
      "Share your concerns",
      "Begin your session smoothly",
    ],
    faqs: [
      { q: "What is text/chat counselling?", a: "Text and chat counselling lets you talk to a therapist through secure written messages instead of phone or video calls." },
      { q: "Who is text/chat counselling best suited for?", a: "It's ideal for those who prefer writing, need flexible scheduling, want to reflect before responding, or need discreet support." },
      { q: "Is text/chat counselling confidential?", a: "Yes, all messages are encrypted and stored securely. Your privacy is fully protected." },
      { q: "Can I message the therapist at my own pace?", a: "Yes, you can write your thoughts at your own pace and receive responses within the agreed timeframe." },
      { q: "What issues can text/chat counselling help with?", a: "Text counselling can help with anxiety, stress, relationship issues, self-esteem, and ongoing emotional support." },
    ],
  },
];

export default function CounsellingModes() {
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>Counselling Modes | The 3 Tree - Online Therapy Options</title>
        <meta
          name="description"
          content="Choose your preferred counselling mode: Telephonic, Video, or Text/Chat. Flexible, secure, and professional mental health support."
        />
      </Helmet>
      <Layout>
        {/* Hero Grid Section */}
        <section className="pt-24 pb-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {counsellingModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <div key={mode.id} className="relative group">
                    {/* Icon Card */}
                    <div className="aspect-square bg-[#1E293B] rounded-t-2xl flex items-center justify-center">
                      <IconComponent className="w-24 h-24 text-white" strokeWidth={1.5} />
                    </div>
                    
                    {/* Button */}
                    <button
                      onClick={() => scrollToSection(mode.id)}
                      className="w-full bg-[#1E293B] text-white py-4 px-6 text-center font-semibold hover:bg-[#2D3E5F] transition-colors rounded-b-2xl cursor-pointer border-t-2 border-white/10"
                    >
                      {mode.title}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Counselling Mode Details */}
        {counsellingModes.map((mode, index) => (
          <section
            key={mode.id}
            id={mode.id}
            className={`py-16 ${index % 2 === 0 ? "bg-[#F5F1ED]" : "bg-white"}`}
          >
            <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
              {/* Header */}
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl lg:text-4xl text-[#2D2D2D] mb-4">
                  {mode.title}
                </h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed mb-4">
                  {mode.description}
                </p>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
                  {mode.subDescription}
                </p>
                <Button
                  size="lg"
                  className="mt-6 bg-[#1E293B] hover:bg-[#2D3E5F]"
                >
                  Book An Appointment <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* We Can Help With */}
              <div className="mb-12">
                <h3 className="font-serif text-2xl lg:text-3xl text-[#2D2D2D] mb-6">
                  We Can Help With:
                </h3>
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
                  <ul className="space-y-3">
                    {mode.helpWith.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <span className="w-2 h-2 rounded-full bg-[#8BA888] mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Book a Session Steps */}
              <div className="mb-12">
                <h3 className="font-serif text-2xl lg:text-3xl text-[#2D2D2D] mb-6">
                  Book a session:
                </h3>
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
                  <ol className="space-y-3">
                    {mode.bookingSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <span className="font-bold text-[#8BA888] flex-shrink-0">
                          {idx + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center mb-8">
                <Button
                  size="lg"
                  className="bg-[#8BA888] hover:bg-[#7A9B77] text-white px-12"
                >
                  BEGIN YOUR THERAPY JOURNEY
                </Button>
              </div>

              <div className="text-center text-gray-600">
                <p>
                  Questions?{" "}
                  <button
                    onClick={() => scrollToSection("faqs")}
                    className="text-[#1E293B] font-semibold underline cursor-pointer"
                  >
                    Read Our FAQs
                  </button>
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
              {counsellingModes.map((mode, modeIndex) => (
                <div key={mode.id}>
                  <h3 className="font-serif text-2xl text-[#2D2D2D] mb-4">
                    {String(modeIndex + 1).padStart(2, "0")}. {mode.title}
                  </h3>
                  <div className="space-y-3">
                    {mode.faqs.map((faq, faqIndex) => {
                      const faqId = `${mode.id}-${faqIndex}`;
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
