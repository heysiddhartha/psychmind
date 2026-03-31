import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import ServicesCarousel from "@/components/home/ServicesCarousel";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>psychmind | Therapy & Mental Wellness - Feel Seen, Heard, Understood</title>
        <meta
          name="description"
          content="psychmind offers professional therapy and mental wellness services. Individual, couple, group therapy and holistic coaching. Book your session today."
        />
        <meta
          name="keywords"
          content="therapy, mental health, counselling, psychologist, wellness, individual therapy, couple therapy"
        />
        <link rel="canonical" href="https://psychmind.com" />
      </Helmet>
      <Layout>
        <Hero />
        <ServicesCarousel />
        <WhyChooseUs />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </Layout>
    </>
  );
}
