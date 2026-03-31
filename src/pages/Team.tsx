import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Plus, Filter } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "@/components/ui/BackButton";
import { supabase } from "@/lib/supabase";
import TherapistFilter, {
  TherapistFilters,
  defaultFilters,
  SPECIALIZATIONS,
  LANGUAGES,
} from "@/components/booking/TherapistFilter";


interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  expertise: string[];
  languages: string[];
  price: string;
  duration: string;
}

// Static team member for founder
const staticMembers: TeamMember[] = [
  {
    id: 'founder',
    name: "Siddhartha Sankar Sarkar",
    role: "Founder",
    image: "/sid5.jpeg",
    expertise: ["Anxiety", "Depression", "Stress", "Trauma", "Relationships"],
    languages: ["English", "Hindi", "Nepali"],
    price: "₹1,800",
    duration: "50 mins",
  }
];

const faqs = [
  { question: "How do you select psychologists to join your team?", answer: "We carefully vet all therapists for proper credentials, experience, and alignment with our holistic approach to mental wellness." },
  { question: "Can I learn about each psychologist's expertise and specialization?", answer: "Yes, each therapist's profile includes their specializations, credentials, languages spoken, and session modes." },
  { question: "Do your psychologists follow a particular therapy approach?", answer: "Our therapists use evidence-based approaches including CBT, DBT, mindfulness, and integrative methods tailored to your needs." },
  { question: "Are the psychologists licensed and certified?", answer: "Yes, all our therapists are licensed professionals with verified credentials from recognized institutions." },
  { question: "Can I switch to a different psychologist if I feel the need?", answer: "Absolutely. We believe in finding the right fit, and you can request a different therapist at any time." },
  { question: "Is what I share kept confidential?", answer: "Yes, all sessions are completely confidential and HIPAA-compliant. Your privacy is our priority." },
];

export default function Team() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(staticMembers);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<TherapistFilters>(defaultFilters);
  const navigate = useNavigate();

  // Count active filters
  const activeFilterCount =
    filters.specializations.length +
    filters.languages.length +
    filters.serviceTypes.length +
    filters.counsellingModes.length +
    filters.sessionTimes.length +
    (filters.onlineOnly ? 1 : 0) +
    (filters.nextAvailable ? 1 : 0);

  // Filter team members based on selected filters
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      // Specialization filter
      if (filters.specializations.length > 0) {
        const hasSpecialization = filters.specializations.some(spec =>
          member.expertise?.some(e =>
            e.toLowerCase().includes(spec.toLowerCase())
          )
        );
        if (!hasSpecialization) return false;
      }

      // Languages filter
      if (filters.languages.length > 0) {
        const hasLanguage = filters.languages.some(lang =>
          member.languages?.some(l =>
            l.toLowerCase() === lang.toLowerCase()
          )
        );
        if (!hasLanguage) return false;
      }

      return true;
    });
  }, [teamMembers, filters]);


  // Load therapists from database
  useEffect(() => {
    const loadTherapists = async () => {
      try {
        const { data: therapists } = await supabase
          .from('therapists')
          .select(`
                        id,
                        specialties,
                        languages,
                        hourly_rate,
                        user:users!inner(full_name, avatar_url, role)
                    `)
          .eq('is_approved', true)
          .eq('is_active', true)
          .eq('user.role', 'therapist');

        if (therapists && therapists.length > 0) {
          // Additional client-side filter to ensure only therapists are shown
          const validTherapists = therapists.filter((t: any) => 
            t.user?.role === 'therapist' || t.user?.role === 'admin'
          );
          
          const dbMembers: TeamMember[] = validTherapists.map((t: any) => ({
            id: t.id,
            name: t.user?.full_name || 'Therapist',
            role: 'Licensed Therapist',
            image: t.user?.avatar_url,
            expertise: t.specialties || [],
            languages: t.languages || ['English'],
            price: `₹${t.hourly_rate || 1500}`,
            duration: '50 mins',
          }));
          setTeamMembers([...staticMembers, ...dbMembers]);
        }
      } catch (error) {
        console.error('Error loading therapists:', error);
      }
    };

    loadTherapists();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, teamMembers.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, teamMembers.length - 2)) % Math.max(1, teamMembers.length - 2));
  };

  const visibleMembers = filteredMembers.slice(currentIndex, currentIndex + 3);

  return (
    <>
      <Helmet>
        <title>Meet The Team | The 3 Tree - Mental Wellness Professionals</title>
        <meta
          name="description"
          content="Meet our team of licensed psychologists and therapists dedicated to your mental wellness journey."
        />
      </Helmet>
      <Layout>
        {/* Hero Section - Clean */}
        <section className="pt-24 pb-8 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Back Button */}
            <div className="mb-8">
              <BackButton to="/" label="Back to Home" />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="font-serif text-4xl lg:text-5xl text-gray-900 mb-4">
                  Your Circle of Care
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Meet our team of compassionate professionals who are dedicated to
                  supporting your journey towards mental wellness and personal growth.
                </p>
              </div>

              {/* Filter Button */}
              <div className="flex-shrink-0">
                <Button
                  onClick={() => setShowFilter(!showFilter)}
                  variant={showFilter ? "default" : "outline"}
                  className={`gap-2 rounded-full px-6 ${showFilter
                    ? "bg-primary text-white"
                    : "border-primary text-primary hover:bg-primary/10"
                    }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-white text-primary text-xs font-bold rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Panel */}
        {showFilter && (
          <section className="bg-white border-b border-gray-100">
            <div className="container mx-auto px-4 lg:px-8 py-6">
              <TherapistFilter
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilter(false)}
              />
            </div>
          </section>
        )}

        {/* Team Members - Circular Photos Style */}
        <section className="py-16 bg-[#faf9f7]">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Navigation Arrows */}
            <div className="flex justify-end gap-2 mb-8">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={teamMembers.length <= 3}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={teamMembers.length <= 3}
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {visibleMembers.map((member) => (
                <div key={member.id} className="text-center group">
                  {/* Circular Photo with Border */}
                  <div className="relative mx-auto w-48 h-48 lg:w-56 lg:h-56 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 group-hover:border-primary/40 transition-colors" />
                    <div className="absolute inset-2 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.classList.add('hidden');
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-serif">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name & Role */}
                  <h3 className="font-serif text-xl lg:text-2xl text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {member.role}
                  </p>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/therapist/${member.id}`)}
                      className="text-sm text-primary hover:underline"
                    >
                      View Profile
                    </button>
                    <Button
                      onClick={() => navigate(`/booking/${member.id}`)}
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-full"
                    >
                      Book Appointment
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results / Empty State */}
            {filteredMembers.length === 0 && activeFilterCount > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No therapists match your selected filters.</p>
                <Button
                  variant="outline"
                  onClick={() => setFilters(defaultFilters)}
                  className="rounded-full"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* More Therapists Loading */}
            {filteredMembers.length === 0 && activeFilterCount === 0 && teamMembers.length <= 1 && (
              <div className="text-center mt-12 text-gray-500">
                <p>More therapists joining soon...</p>
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl text-center text-gray-900 mb-12">
                Why Choose Our Team
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: "🎓", title: "Licensed Professionals", desc: "All therapists are verified and licensed with years of experience." },
                  { icon: "🔒", title: "100% Confidential", desc: "Your conversations and records remain completely private." },
                  { icon: "📱", title: "Flexible Sessions", desc: "Book sessions that fit your lifestyle - video, audio, or chat." },
                  { icon: "🌍", title: "Connect From Anywhere", desc: "Access therapy from home, office, or wherever you feel comfortable." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-xl bg-gray-50">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-[#faf9f7]">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-serif text-3xl text-center text-gray-900 mb-10">
                Frequently Asked Questions
              </h2>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-left text-gray-900 font-medium">
                        {faq.question}
                      </span>
                      <Plus
                        className={`w-5 h-5 text-gray-600 transition-transform flex-shrink-0 ml-4 ${openFaqIndex === index ? "rotate-45" : ""
                          }`}
                      />
                    </button>
                    {openFaqIndex === index && (
                      <div className="px-6 pb-4 text-gray-600">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#1a2744] text-white">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="font-serif text-3xl mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto">
              Take the first step towards mental wellness. Book a session with one of our experienced therapists today.
            </p>
            <Link to="/booking">
              <Button size="lg" className="bg-white text-[#1a2744] hover:bg-gray-100 rounded-full px-8">
                Book Your First Session
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </Layout>
    </>
  );
}
