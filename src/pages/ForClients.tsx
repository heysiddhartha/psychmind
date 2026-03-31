import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video, Headphones, ArrowRight } from "lucide-react";

const resources = [
  {
    icon: BookOpen,
    title: "A to Z Topics",
    description: "Comprehensive guides on various mental health topics from ADHD to Anxiety.",
    href: "/topics",
  },
  {
    icon: FileText,
    title: "Personal Stories",
    description: "Real stories from individuals who have walked the path of healing.",
    href: "/stories",
  },
  {
    icon: Video,
    title: "Video Resources",
    description: "Educational videos on mental health, wellness techniques, and more.",
    href: "/videos",
  },
  {
    icon: Headphones,
    title: "Guided Meditations",
    description: "Audio sessions for relaxation, mindfulness, and stress relief.",
    href: "/meditations",
  },
];

const articles = [
  {
    category: "WellBeing",
    title: "The Role of Gratitude in Mental Health and Wellbeing",
    excerpt: "Discover how practicing gratitude can transform your mental health and daily outlook.",
  },
  {
    category: "Stress",
    title: "Breathing Exercises to Reduce Stress and Increase Focus",
    excerpt: "Simple breathing techniques you can use anywhere to calm your mind.",
  },
  {
    category: "Anxiety",
    title: "Understanding Emotional Wellness: Tips for a Balanced Mind",
    excerpt: "Practical strategies for maintaining emotional balance in everyday life.",
  },
];

export default function ForClients() {
  return (
    <>
      <Helmet>
        <title>For Clients | psychmind - Client Resources & Support</title>
        <meta
          name="description"
          content="Resources for psychmind clients. Access articles, guides, videos, and tools to support your mental wellness journey between sessions."
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-accent font-sans tracking-widest text-sm mb-4">FOR CLIENTS</p>
              <h1 className="font-serif text-4xl md:text-6xl mb-6">Your Wellness Hub</h1>
              <p className="text-primary-foreground/70 text-lg leading-relaxed">
                Explore resources, articles, and tools designed to support your mental health journey.
              </p>
            </div>
          </div>
        </section>

        {/* Resource Categories */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                Explore Mental Health
              </h2>
              <p className="text-muted-foreground">
                Curated resources to deepen your understanding and support your growth.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource, index) => (
                <Link
                  key={resource.title}
                  to={resource.href}
                  className="card-elevated p-6 text-center hover:shadow-glow transition-all duration-300 group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                    <resource.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground text-sm">{resource.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-20 lg:py-28 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-accent font-sans tracking-widest text-sm mb-4">BLOG OF CLARITY</p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">Latest Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <article
                  key={article.title}
                  className="card-elevated p-6 hover:shadow-glow transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="aspect-video bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg mb-4" />
                  <span className="text-xs text-accent font-medium">{article.category}</span>
                  <h3 className="font-serif text-lg text-foreground mt-2 mb-2">{article.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{article.excerpt}</p>
                  <Button variant="link" className="p-0 h-auto text-accent">
                    Read More
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </article>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="outline" asChild>
                <Link to="/blog">
                  View All Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Downloads CTA */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
            <FileText className="h-12 w-12 text-accent mx-auto mb-6" />
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Free Downloadable Guides
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Access our library of worksheets, trackers, and guides to support your wellness journey.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/guides">
                Browse Guides
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </Layout>
    </>
  );
}
