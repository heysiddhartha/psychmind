import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const faqs = [
  {
    question: "How can I book a session with a psychologist?",
    answer:
      "You can easily book a session through our website by signing up as a patient, browsing available psychologists, and choosing a convenient time slot. Alternatively, you can contact us directly and we'll help you schedule your first appointment.",
  },
  {
    question: "Are my sessions completely confidential?",
    answer:
      "Yes, all consultations are strictly confidential. We follow standard privacy guidelines to ensure your personal information and session details remain secure. What you share with your therapist stays between you and your therapist.",
  },
  {
    question: "Do you offer customized solutions?",
    answer:
      "Yes, we tailor our services according to your unique requirements to ensure the best results. Every individual's journey is different, and we create personalized treatment plans that address your specific needs and goals.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We currently operate in Sikkim/Majitar and offer online services wherever possible. Our virtual therapy sessions allow us to support clients regardless of their location.",
  },
  {
    question: "What qualifications do your psychologists have?",
    answer:
      "All our psychologists are licensed professionals with relevant degrees, training, and certifications in mental health and counseling. They undergo regular professional development to stay updated with the latest therapeutic approaches.",
  },
  {
    question: "How do I prepare for my first session?",
    answer:
      "Simply find a quiet, comfortable space, make a note of your concerns, and ensure a stable internet connection for online sessions. There's no need to prepare anything specific—just come as you are. Your therapist will guide the conversation.",
  },
  {
    question: "How are payments and packages managed?",
    answer:
      "You can pay per session or choose from available packages for long-term support. All payments are securely processed online. We also offer flexible payment options to ensure therapy is accessible.",
  },
  {
    question: "Can I reschedule or cancel my appointment?",
    answer:
      "Yes, appointments can be rescheduled or canceled within the allowed timeframe mentioned in our policy. We ask for at least 24 hours notice for cancellations to allow us to offer the slot to other clients.",
  },
  {
    question: "Do you provide emergency or crisis support?",
    answer:
      "We do not provide emergency crisis support. If you or someone you know is in immediate danger, please contact your local emergency helpline. For non-emergency concerns, we're here to support you through scheduled sessions.",
  },
  {
    question: "What therapy approaches do you use?",
    answer:
      "Our therapists are trained in various evidence-based approaches including Cognitive Behavioral Therapy (CBT), Mindfulness-Based Therapy, Person-Centered Therapy, and Trauma-Informed Care. We choose the approach that best suits your needs.",
  },
];

export default function FAQs() {
  return (
    <>
      <Helmet>
        <title>FAQs | The 3 Tree - Frequently Asked Questions</title>
        <meta
          name="description"
          content="Find answers to common questions about The 3 Tree's therapy services, booking, confidentiality, and more. Learn everything you need to know before your first session."
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-accent font-sans tracking-widest text-sm mb-4">FAQS</p>
              <h1 className="font-serif text-4xl md:text-6xl mb-6">Find Your Answers Here</h1>
              <p className="text-primary-foreground/70 text-lg leading-relaxed">
                Common questions about our services, process, and what to expect.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="card-elevated px-6 border-none"
                >
                  <AccordionTrigger className="text-left font-serif text-lg hover:no-underline hover:text-accent py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Still have questions */}
        <section className="py-20 lg:py-28 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
              Still have questions?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              We're here to help. Reach out to us and we'll be happy to answer any questions you might have.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </Layout>
    </>
  );
}
