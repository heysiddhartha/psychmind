import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const topics = [
  // Row 1: 1 blue card (position 1)
  {
    title: "ADHD",
    fullTitle: "Attention-Deficit/Hyperactivity Disorder",
    description: "Attention-Deficit/Hyperactivity Disorder (ADHD) is often portrayed as a childhood condition characterised by hyperactivity, but in...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  {
    title: "ADDICTION",
    fullTitle: "Addiction",
    description: "Addiction is often misunderstood as a matter of willpower, but in reality, it is a complex condition...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "ADJUSTMENT DISORDER",
    fullTitle: "Adjustment Disorder",
    description: "Adjustment Disorder is a stress-related mental health condition that occurs when someone struggles to cope...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  // Row 2: 2 consecutive blues (positions 4-5)
  {
    title: "ANXIETY",
    fullTitle: "Anxiety",
    description: "Anxiety is one of the most common mental health concerns in the world, yet it impacts everyone differently...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  {
    title: "Assertiveness Training",
    fullTitle: "Assertiveness Training",
    description: "Assertiveness is a communication skill that allows individuals to express their thoughts, feelings, needs, and...",
    imageType: "dark", 
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Attachment Styles",
    fullTitle: "Attachment Styles",
    description: "Attachment styles describe the patterns through which individuals form emotional bonds, respond to closeness, handle...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  // Row 3: 1 blue card (position 7)
  {
    title: "Autism",
    fullTitle: "Autism (ASD)",
    description: "Autism Spectrum Disorder (ASD) is a neurodevelopmental condition that affects how a person processes information,...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]", 
    textColor: "text-white"
  },
  {
    title: "Behavioral Therapy",
    fullTitle: "Behavioral Therapy",
    description: "Behavioral Therapy is a form of psychotherapy that focuses on identifying and modifying unhealthy patterns...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  {
    title: "Bereavement",
    fullTitle: "Bereavement",
    description: "Bereavement, commonly referred to as grief, is the emotional response to losing someone or something...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  // Row 4: 2 consecutive blues (positions 9-10)
  {
    title: "Bipolar Disorder",
    fullTitle: "Bipolar Disorder",
    description: "Bipolar Disorder is a mood disorder characterised by intense shifts in mood, energy, behaviour, and...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Boundaries",
    fullTitle: "Boundaries",
    description: "Personal boundaries are the emotional, physical, and psychological limits that define what a person is...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Burnout",
    fullTitle: "Burnout",
    description: "Burnout is a state of emotional, mental, and physical exhaustion caused by prolonged or excessive...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  // Row 5: 1 blue card (position 13)
  {
    title: "Cognitive Distortions",
    fullTitle: "Cognitive Distortions",
    description: "Cognitive distortions are habitual, inaccurate patterns of thinking that negatively influence how individuals...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Child Psychology",
    fullTitle: "Child Psychology",
    description: "Child Psychology is the study of how children think, feel, learn, behave, and develop from...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  {
    title: "Cognitive Behavioral Therapy (CBT)",
    fullTitle: "Cognitive Behavioral Therapy (CBT)",
    description: "CBT is a widely used, evidence-based form of psychotherapy that focuses on...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  // Row 6: 2 consecutive blues (positions 16-17)
  {
    title: "Compassion Fatigue",
    fullTitle: "Compassion Fatigue",
    description: "Compassion Fatigue is a state of emotional, mental, and physical exhaustion that occurs when someone...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Coping Mechanisms",
    fullTitle: "Coping Mechanisms",
    description: "Coping mechanisms are the strategies individuals use—consciously or unconsciously—to manage stress, regulate emotions, and...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Conflict Resolution",
    fullTitle: "Conflict Resolution",
    description: "Conflict Resolution is the process of identifying, understanding, and addressing disagreements or tensions between...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  // Row 7: 1 blue card (position 19)
  {
    title: "Coping With Childhood Trauma",
    fullTitle: "Coping With Childhood Trauma",
    description: "Childhood trauma refers to deeply distressing or overwhelming experiences that occur before the age of...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  {
    title: "Crisis Intervention",
    fullTitle: "Crisis Intervention",
    description: "Crisis Intervention is a short-term, immediate, and supportive process designed to help individuals experiencing...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Counselling Process",
    fullTitle: "Counselling Process",
    description: "The counselling process is the structured, professional approach through which a psychologist or counsellor helps...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  // Row 8: 2 consecutive blues (positions 22-23)
  {
    title: "Cultural Psychology",
    fullTitle: "Cultural Psychology",
    description: "Cultural Psychology is the study of how culture influences human thoughts, emotions, behaviour, identity, and...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Depression",
    fullTitle: "Depression",
    description: "Depression is a serious mood disorder characterized by persistent sadness, loss of interest, and emotional numbness...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Defense Mechanisms",
    fullTitle: "Defense Mechanisms",
    description: "Defense mechanisms are unconscious psychological strategies individuals use to protect themselves from anxiety, emotional...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  // Row 9: 1 blue card (position 25)
  {
    title: "Detachment Issues",
    fullTitle: "Detachment Issues",
    description: "Detachment issues refer to difficulties in forming emotional connections, maintaining closeness, or experiencing feelings fully...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  {
    title: "Disability Psychology",
    fullTitle: "Disability Psychology",
    description: "Disability psychology is the study of how physical, intellectual, sensory, or developmental disabilities affect an...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Developmental Disorders",
    fullTitle: "Developmental Disorders",
    description: "Developmental disorders are a group of conditions that begin in childhood and affect how a...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  // Row 10: 2 consecutive blues (positions 28-29)
  {
    title: "Domestic Violence Trauma",
    fullTitle: "Domestic Violence Trauma",
    description: "Domestic violence trauma is the emotional, psychological, and physical impact of abuse experienced within...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Distress Tolerance",
    fullTitle: "Distress Tolerance",
    description: "Distress tolerance refers to the ability to endure and manage intense emotional discomfort without engaging...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Dissociation",
    fullTitle: "Dissociation",
    description: "Dissociation is a psychological response in which a person feels disconnected from their thoughts, feelings,...",
    imageType: "text",
    bgColor: "bg-white",
    textColor: "text-[#1E293B]"
  },
  // Row 11: 1 blue card (position 32)
  {
    title: "Dysfunctional Family Dynamics",
    fullTitle: "Dysfunctional Family Dynamics",
    description: "Dysfunctional family dynamics refer to unhealthy interaction patterns, communication styles, and emotional environments that...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
  {
    title: "Emotion Regulation",
    fullTitle: "Emotion Regulation",
    description: "Emotion regulation is the ability to recognize, understand, and manage emotions in healthy, adaptive ways...",
    imageType: "dark",
    bgColor: "bg-[#1E293B]",
    textColor: "text-white"
  },
];

const faqs = [
  {
    q: "How can I lift my mood?",
    a: "Some things that help our clients lift their moods are taking walks, connecting with loved ones, making art, and attending therapy every week. Low mood is a common experience in today’s world, and the experienced therapists at L’espace are ready to help you feel like yourself again.",
  },
  {
    q: "What does an anxiety attack feel like?",
    a: "An anxiety attack can feel like a sudden surge of overwhelming fear or distress. Physical symptoms may include a racing heart, sweating, shaking, shortness of breath, and a feeling of impending doom or loss of control.",
  },
  {
    q: "Can I talk about my relationship in individual therapy?",
    a: "Absolutely. Individual therapy is a safe space to discuss any aspect of your life, including your relationships. Your therapist can help you navigate challenges, improve communication, and understand your own patterns.",
  },
  {
    q: "How do I know if I need to see a therapist?",
    a: "If you are feeling overwhelmed, stuck, or finding it difficult to cope with daily life, therapy can be beneficial. It's also helpful for personal growth, self-exploration, and navigating life transitions.",
  },
];

export default function Topics() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(9);

  const handleLoadMore = () => {
    setVisibleCount((current) => Math.min(current + 9, topics.length));
  };

  return (
    <>
      <Helmet>
        <title>A-Z Mental Health Topics | The 3 Tree</title>
        <meta
          name="description"
          content="Explore our comprehensive A-Z guide of mental health topics, conditions, and therapies."
        />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-[#F5F1ED] text-center">
          <div className="container mx-auto px-4 lg:px-8">
            <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl text-[#2D2D2D] mb-6">
              A To Z Topics
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              An A–Z guide exploring key topics from A to Z, offering a complete overview 
              of concepts that shape understanding, growth, and awareness.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                size="lg"
                className="bg-[#1E293B] text-white hover:bg-[#2D3E5F] px-8"
                onClick={() => document.getElementById('topics-grid')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started
              </Button>
            </div>
            
            {/* Search Bar Placeholder for future functionality */}
            <div className="max-w-md mx-auto mt-12 relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search for a topic..." 
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-[#1E293B] focus:ring-1 focus:ring-[#1E293B] outline-none transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Topics Grid */}
        <section id="topics-grid" className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {topics.slice(0, visibleCount).map((topic, index) => (
                <div key={index} className="flex flex-col group cursor-pointer">
                  {/* Card Image Area */}
                  <div className={`aspect-[4/3] w-full relative flex items-center justify-center p-8 mb-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl ${topic.bgColor} ${topic.bgColor === 'bg-white' ? 'border-2 border-[#1E293B]' : 'shadow-md'}`}>
                    
                    {/* Decorative Inner Border for White Cards */}
                    {topic.bgColor === 'bg-white' && (
                      <div className="absolute inset-4 border border-[#1E293B] opacity-20 pointer-events-none" />
                    )}
                    
                    {/* Decorative Inner Border for Dark Cards */}
                    {topic.bgColor !== 'bg-white' && (
                      <div className="absolute inset-4 border border-white opacity-20 pointer-events-none" />
                    )}

                    <div className="text-center relative z-10 px-4">
                      <h3 className={`font-serif text-4xl lg:text-5xl mb-4 leading-tight ${topic.textColor}`}>
                        {topic.title}
                      </h3>
                      <div className={`h-px w-12 mx-auto mb-4 ${topic.bgColor === 'bg-white' ? 'bg-[#1E293B]' : 'bg-white'} opacity-30`} />
                      <p className={`text-[10px] uppercase tracking-[0.2em] font-medium ${topic.textColor} opacity-80`}>
                        Mental Health Guide
                      </p>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow">
                    <h3 className="font-serif text-2xl text-[#2D2D2D] mb-3 group-hover:text-blue-700 transition-colors">
                      {topic.fullTitle}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4 line-clamp-3">
                      {topic.description}
                    </p>
                    <Link 
                      to={`/topics/${topic.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center text-[#1E293B] font-bold hover:text-blue-700 transition-colors text-sm uppercase tracking-wide border-b border-[#1E293B] hover:border-blue-700 pb-1"
                    >
                      Read Guide
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {visibleCount < topics.length && (
              <div className="text-center mt-16">
                <Button
                  variant="outline"
                  className="border-[#1E293B] text-[#1E293B] hover:bg-[#1E293B] hover:text-white px-8 py-6 uppercase tracking-wider text-sm font-semibold"
                  onClick={handleLoadMore}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-serif text-3xl lg:text-4xl text-center text-[#2D2D2D] mb-2">
              Find Your Answers Here
            </h2>
            <div className="w-24 h-1 bg-[#2D2D2D] mx-auto mb-12" />

            <div className="bg-white rounded-2xl p-2 shadow-sm">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-gray-100 last:border-0"
                >
                  <button
                    onClick={() =>
                      setOpenFaqIndex(openFaqIndex === index ? null : index)
                    }
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-[#2D2D2D] font-medium text-lg">
                      {faq.q}
                    </span>
                    <Plus
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                        openFaqIndex === index ? "rotate-45" : ""
                      }`}
                    />
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ${
                      openFaqIndex === index ? "max-h-48 pb-6 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">{faq.a}</p>
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
