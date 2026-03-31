import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Download, Star, Quote } from "lucide-react";
import { useState } from "react";

const guideCategories = [
  {
    title: "Awareness & Emotional Regulation",
    guides: [
      {
        title: "Feeling Wheel & Emotion Identification Chart",
        description: "Help users name and understand their emotions more clearly.",
        link: "#", // Placeholder for actual PDF link
      },
    ],
  },
  {
    title: "Cognitive & Behavioral Tools",
    guides: [
      {
        title: "Cognitive Restructuring Worksheet",
        description: "Identify unhelpful thoughts and learn how to reframe them.",
        link: "#",
      },
    ],
  },
  {
    title: "Mental Health Planning & Routines",
    guides: [
      {
        title: "Weekly Mental Health Planner",
        description: "Set goals and track weekly emotional wellbeing.",
        link: "#",
      },
      {
        title: "Daily Wellness Routine Tracker",
        description: "Maintain balance with a consistent routine.",
        link: "#",
      },
    ],
  },
];

const testimonials = [
  {
    name: "Jordan T.",
    text: "The Feeling Wheel guide helped me finally put words to how I’ve been feeling. I never realized how important it was to name my emotions.",
  },
  {
    name: "Aarushi M.",
    text: "The Cognitive Restructuring Worksheet completely shifted the way I talk to myself. It's now part of my weekly reflection routine.",
  },
  {
    name: "Dev R.",
    text: "The Mental Health Planner keeps me grounded. I’ve been using it every Sunday to plan my emotional goals for the week",
  },
  {
    name: "Sanya K.",
    text: "I downloaded the Wellness Tracker just to try it out—and now it’s become my morning ritual. It’s simple but powerful.",
  },
  {
    name: "Rakesh V.",
    text: "These guides feel like a therapist in your pocket. They’re well-designed, easy to use, and genuinely helpful when you’re overwhelmed.",
  },
];

const faqs = [
  {
    q: "Are the downloadable guides free to access?",
    a: "Some guides are free, while others may require a small fee or sign-up to access premium content. Each guide clearly states its availability.",
  },
  {
    q: "How can these guides help me?",
    a: "These guides provide structured tools and practical exercises to help you build self-awareness, manage stress, and develop healthier mental habits independently.",
  },
  {
    q: "Do I need any special software to open the guides?",
    a: "No, most guides are provided in standard PDF format, which can be opened on any computer, tablet, or smartphone without special software.",
  },
  {
    q: "Can I share these guides with my friends or colleagues?",
    a: "You are welcome to share the free resources! For premium content, we ask that you encourage others to download their own copies to support our work.",
  },
  {
    q: "Are these guides a substitute for therapy?",
    a: "No, while these tools are helpful for self-management and personal growth, they are not a replacement for professional therapy or medical advice.",
  },
];

export default function DownloadableGuides() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      <Helmet>
        <title>Downloadable Guides | The 3 Tree - Mental Health Tools</title>
        <meta
          name="description"
          content="Access a curated library of downloadable mental health guides, worksheets, and trackers."
        />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-[#1E293B] to-[#2D3E5F] text-white">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <Download className="w-16 h-16" strokeWidth={1.5} />
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl mb-6">
                Practical Tools for a Healthier Mind
              </h1>
              <p className="text-lg lg:text-xl text-gray-200 mb-10 leading-relaxed">
                Access a curated library of downloadable guides designed to help you manage 
                stress, build resilience, and create a balanced routine—anytime, anywhere.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#1E293B] hover:bg-gray-100 font-semibold px-8"
                onClick={() => document.getElementById('guides')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Guides <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Guides Section */}
        <section id="guides" className="py-16 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {/* Optional: Add a filter header here later if needed */}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {guideCategories.flatMap(category => 
                  category.guides.map(guide => ({ ...guide, category: category.title }))
                ).map((guide, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 h-full flex flex-col group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
                        {guide.category}
                      </span>
                      <div className="bg-gray-50 p-3 rounded-full text-gray-400 group-hover:bg-[#1E293B] group-hover:text-white transition-colors">
                         <Download className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <h3 className="font-serif text-2xl text-[#2D2D2D] mb-4 leading-tight group-hover:text-blue-700 transition-colors">
                      {guide.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-8 leading-relaxed flex-grow">
                      {guide.description}
                    </p>
                    
                    <Button
                      className="w-full bg-white text-[#1E293B] border-2 border-[#1E293B] hover:bg-[#1E293B] hover:text-white transition-all font-semibold py-6 mt-auto"
                    >
                      Download Guide
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>



        {/* Testimonials Section */}
        <section className="py-24 bg-[#1E293B] text-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl lg:text-4xl mb-4">
                What Our Community Says
              </h2>
              <div className="w-24 h-1 bg-blue-400 mx-auto rounded-full" />
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)] flex flex-col relative group hover:bg-white/10 transition-all duration-300"
                >
                  <Quote className="absolute top-6 right-6 w-10 h-10 text-blue-400/20 group-hover:text-blue-400/40 transition-colors" />
                  
                  <div className="flex gap-1 text-yellow-400 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-lg text-gray-200 mb-8 flex-grow leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-white tracking-wide">
                      {testimonial.name}
                    </span>
                  </div>
                </div>
              ))}
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
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
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
