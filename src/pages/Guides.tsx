import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, FileText, BookOpen, Heart, ArrowRight } from "lucide-react";

const guides = [
  {
    title: "Feeling Wheel Guide",
    description: "Learn to identify and name your emotions with this comprehensive emotional vocabulary tool.",
    category: "Emotional Awareness",
    icon: Heart,
  },
  {
    title: "Cognitive Restructuring Worksheet",
    description: "Challenge negative thought patterns and develop healthier ways of thinking.",
    category: "CBT Tools",
    icon: FileText,
  },
  {
    title: "Mental Health Planner",
    description: "Plan your emotional goals and track your mental wellness journey week by week.",
    category: "Planning",
    icon: BookOpen,
  },
  {
    title: "Wellness Tracker",
    description: "A simple but powerful daily tracker to monitor your mood, sleep, and self-care habits.",
    category: "Daily Practice",
    icon: FileText,
  },
  {
    title: "Anxiety Management Toolkit",
    description: "Practical techniques and exercises to manage anxiety in everyday situations.",
    category: "Anxiety",
    icon: Heart,
  },
  {
    title: "Mindfulness Meditation Guide",
    description: "Step-by-step instructions for beginning your mindfulness meditation practice.",
    category: "Mindfulness",
    icon: BookOpen,
  },
];

export default function Guides() {
  return (
    <>
      <Helmet>
        <title>Downloadable Guides | psychmind - Mental Health Resources</title>
        <meta
          name="description"
          content="Download free mental health guides and worksheets. Feeling Wheel, CBT worksheets, wellness trackers, and more resources for your wellbeing journey."
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-accent font-sans tracking-widest text-sm mb-4">RESOURCES</p>
              <h1 className="font-serif text-4xl md:text-6xl mb-6">Downloadable Guides</h1>
              <p className="text-primary-foreground/70 text-lg leading-relaxed">
                Free tools and worksheets to support your mental wellness journey between sessions.
              </p>
            </div>
          </div>
        </section>

        {/* Guides Grid */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide, index) => (
                <div
                  key={guide.title}
                  className="card-elevated p-6 hover:shadow-glow transition-all duration-300 animate-fade-in-up group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <guide.icon className="h-6 w-6 text-accent" />
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {guide.category}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-2">{guide.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {guide.description}
                  </p>
                  <Button variant="outline" size="sm" className="w-full group-hover:border-accent group-hover:text-accent">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* E-Courses CTA */}
        <section className="py-20 lg:py-28 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="card-elevated p-10 lg:p-16 text-center max-w-3xl mx-auto">
              <BookOpen className="h-12 w-12 text-accent mx-auto mb-6" />
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                E-Books & Self-Paced Courses
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Looking for more in-depth resources? Explore our collection of e-books and courses designed to guide you through specific mental wellness topics.
              </p>
              <Button variant="accent" size="lg" asChild>
                <Link to="/for-clients">
                  Explore Resources
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
