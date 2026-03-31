import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/ui/BackButton";
import { submitContactForm } from "@/lib/services/contactService";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await submitContactForm(formData);

    if (result.success) {
      setSubmitted(true);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours."
      });
      // Reset form
      setFormData({ name: '', email: '', phone: '', message: '' });
    } else {
      toast({
        title: "Failed to send message",
        description: result.error || "Please try again.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const contactInfo = [
    { icon: MapPin, title: "Location", text: "Sikkim, India", color: "bg-amber-100 text-amber-600" },
    { icon: Phone, title: "Phone", text: "+91 1234567890", color: "bg-emerald-100 text-emerald-600" },
    { icon: Mail, title: "Email", text: "hello@psychmind.com", color: "bg-sky-100 text-sky-600" },
    { icon: Clock, title: "Hours", text: "Mon-Sat: 9AM - 6PM", color: "bg-violet-100 text-violet-600" },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us | psychmind - Get in Touch</title>
        <meta name="description" content="Contact psychmind for therapy inquiries. Book a session or ask questions about our mental health services." />
      </Helmet>
      <Layout>
        {/* Hero Section - Warm beige background like reference */}
        <section className="relative py-24 lg:py-32" style={{ backgroundColor: '#f5f0eb' }}>
          <div className="absolute top-6 left-4 lg:left-8 z-10">
            <BackButton to="/" label="Back to Home" className="text-gray-700 hover:text-gray-900 hover:bg-gray-200/50" />
          </div>
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
            <p className="text-amber-600 font-sans tracking-widest text-sm mb-4 uppercase">Get in Touch</p>
            <h1 className="font-serif text-4xl md:text-6xl text-gray-900 mb-6">
              We're Here to Help
            </h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Reach out to us with any questions about our therapy services. We're committed to supporting your mental wellness journey.
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
        </section>

        {/* Main Content Section */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

              {/* Contact Form - Takes 3 columns */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100">
                  <h2 className="font-serif text-2xl lg:text-3xl text-gray-900 mb-2">Send us a message</h2>
                  <p className="text-gray-500 mb-8">Fill out the form below and we'll get back to you soon.</p>

                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center animate-success-pop">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                      </div>
                      <h3 className="font-serif text-2xl text-gray-900 mb-3">Thank you!</h3>
                      <p className="text-gray-600 mb-6">Your message has been received. We'll respond within 24 hours.</p>
                      <Button
                        onClick={() => setSubmitted(false)}
                        className="rounded-full px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name" className="text-gray-700 font-medium">Full Name *</Label>
                          <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="mt-2 h-12 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 transition-all"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-gray-700 font-medium">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className="mt-2 h-12 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 9876543210"
                          className="mt-2 h-12 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 transition-all"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message" className="text-gray-700 font-medium">Your Message *</Label>
                        <Textarea
                          id="message"
                          rows={5}
                          required
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us how we can help you..."
                          className="mt-2 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 transition-all resize-none"
                        />
                      </div>

                      {/* Submit Button - Warm amber color like reference */}
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto rounded-full px-10 py-4 h-auto text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        style={{ backgroundColor: '#d4a574', color: 'white' }}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              {/* Contact Info - Takes 2 columns */}
              <div className="lg:col-span-2">
                <h2 className="font-serif text-2xl lg:text-3xl text-gray-900 mb-8">Contact Information</h2>

                <div className="space-y-6">
                  {contactInfo.map((item) => (
                    <div
                      key={item.title}
                      className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300 group"
                    >
                      <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-gray-600">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map or Image placeholder */}
                <div className="mt-10 rounded-3xl overflow-hidden h-64 relative" style={{ backgroundColor: '#f5f0eb' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-amber-600 animate-bounce-gentle" />
                      <p className="text-gray-600 font-medium">Sikkim, India</p>
                      <p className="text-gray-500 text-sm">Find us in the serene hills</p>
                    </div>
                  </div>
                </div>

                {/* Quick CTA */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                  <h3 className="font-serif text-xl text-gray-900 mb-2">Need immediate support?</h3>
                  <p className="text-gray-600 text-sm mb-4">Book a consultation call with one of our therapists.</p>
                  <Button
                    asChild
                    className="rounded-full px-6 bg-gray-900 text-white hover:bg-gray-800"
                  >
                    <a href="/booking">Book a Session</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
