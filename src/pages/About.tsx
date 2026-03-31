import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Target, Compass } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us | psychmind - Our Story & Vision</title>
        <meta
          name="description"
          content="Learn about psychmind's mission to provide compassionate mental health support. Discover our story, vision, and commitment to your wellness journey."
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="relative py-20 lg:py-28 bg-primary text-primary-foreground">
          <div className="absolute top-6 left-4 lg:left-8">
            <BackButton to="/" label="Back to Home" className="text-white/80 hover:text-white hover:bg-white/10" />
          </div>
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-accent font-sans tracking-widest text-sm mb-4">ABOUT US</p>
              <h1 className="font-serif text-4xl md:text-6xl mb-6">Our Story & Vision</h1>
              <p className="text-primary-foreground/70 text-lg leading-relaxed">
                Behind every professional journey is a personal one. Ours was marked by moments of
                uncertainty, resilience, and profound self-discovery.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
                  Personal Story & Journey
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Through our own struggles, we learned that healing is not a straight line—it's a
                    winding path filled with courage, reflection, and small victories.
                  </p>
                  <p>
                    Every experience, both painful and beautiful, shaped our commitment to support
                    others on their journeys. We understand what it means to feel lost, overwhelmed,
                    or simply in need of someone who truly listens.
                  </p>
                  <p>
                    That's why psychmind was born—a sanctuary where you can explore your thoughts,
                    heal at your own pace, and feel genuinely understood.
                  </p>
                </div>
              </div>
              <div className="card-elevated p-8 bg-accent/5 border-accent/20">
                <div className="space-y-6">
                  {[
                    {
                      icon: Heart,
                      title: "Compassion First",
                      text: "We approach every session with empathy and genuine care.",
                    },
                    {
                      icon: Target,
                      title: "Personalized Care",
                      text: "Tailored therapeutic approaches for your unique needs.",
                    },
                    {
                      icon: Compass,
                      title: "Holistic Healing",
                      text: "Mind, body, and soul—we nurture your complete wellbeing.",
                    },
                  ].map((value) => (
                    <div key={value.title} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <value.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg text-foreground mb-1">{value.title}</h4>
                        <p className="text-muted-foreground text-sm">{value.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 lg:py-28 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              To provide a welcoming, judgment-free space where individuals, couples, and families
              can explore their emotions, overcome challenges, and discover their path to mental
              wellness and personal growth.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/team">
                Meet Our Team
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </Layout>
    </>
  );
}
