import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, ChevronRight, Plus, Upload, CheckCircle, AlertCircle, Loader2, FileText, X } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const faqs = [
  {
    question: "Who can apply to join your team?",
    answer: "Licensed mental health professionals including psychologists, psychiatrists, licensed counselors (LMFT, LCSW, LPC), and certified therapists with at least 2 years of clinical experience."
  },
  {
    question: "What qualifications do I need?",
    answer: "A valid license to practice in your jurisdiction, minimum Master's degree in psychology or related field, malpractice insurance, and completion of required continuing education credits."
  },
  {
    question: "How do I apply?",
    answer: "Complete the application form on this page with your professional details, upload your license and qualifications, and we'll review your application within 5-7 business days."
  },
  {
    question: "Is this a full-time or part-time opportunity?",
    answer: "We offer flexible arrangements. You can set your own availability and work as few or as many hours as you prefer. Most therapists work 10-30 hours per week."
  },
  {
    question: "Can I work remotely?",
    answer: "Yes! All therapy sessions are conducted online through our secure video platform. You can work from anywhere with a stable internet connection and private space."
  },
  {
    question: "Do you provide training or onboarding?",
    answer: "Yes, we provide comprehensive onboarding including platform training, best practices for telehealth, and ongoing professional development resources."
  },
  {
    question: "How will I be compensated?",
    answer: "Therapists set their own rates and receive 80% of session fees. Payments are processed weekly via direct deposit. Top performers can earn ₹1-3 lakh per month."
  },
  {
    question: "Are there any fees to join your team?",
    answer: "No, there are absolutely no fees to join. We're invested in your success and never charge therapists to be part of our platform."
  },
  {
    question: "How long does the selection process take?",
    answer: "Initial review takes 5-7 business days. If selected, you'll have a brief video interview, and the entire process typically takes 2-3 weeks from application to approval."
  },
  {
    question: "What makes psychmind different for professionals?",
    answer: "We prioritize therapist wellbeing with reasonable caseloads, no administrative burden, fair compensation, and a supportive community of like-minded professionals."
  },
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  yearsExperience: string;
  specialties: string[];
  bio: string;
  hourlyRate: string;
  languages: string[];
  credentials: string;
  workExperience: string;
}

interface UploadedFile {
  name: string;
  url: string;
  type: 'license' | 'qualification' | 'identity';
}

export default function JoinTeam() {
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentUploadType, setCurrentUploadType] = useState<'license' | 'qualification' | 'identity'>('license');

  const [formData, setFormData] = useState<FormData>({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    licenseNumber: '',
    licenseExpiryDate: '',
    yearsExperience: '',
    specialties: [],
    bio: '',
    hourlyRate: '75',
    languages: ['English'],
    credentials: '',
    workExperience: '',
  });

  const specialtyOptions = [
    'Anxiety', 'Depression', 'Trauma', 'PTSD', 'Relationships', 'Marriage Counseling',
    'Family Therapy', 'Child Psychology', 'Adolescent Issues', 'ADHD', 'Addiction',
    'Grief', 'Stress Management', 'Self-Esteem', 'Life Transitions', 'Career Counseling',
    'OCD', 'Eating Disorders', 'Personality Disorders', 'Anger Management'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 5MB", variant: "destructive" });
      return;
    }

    setUploadingFile(currentUploadType);
    try {
      const fileName = `therapist-docs/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('therapist-documents')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('therapist-documents')
        .getPublicUrl(fileName);

      setUploadedFiles(prev => [
        ...prev.filter(f => f.type !== currentUploadType),
        { name: file.name, url: publicUrl.publicUrl, type: currentUploadType }
      ]);

      toast({ title: "File uploaded", description: `${file.name} uploaded successfully` });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast({ title: "Upload failed", description: errorMessage, variant: "destructive" });
    } finally {
      setUploadingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast({ title: "Terms required", description: "Please accept the terms and conditions", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let userId = user?.id;

      // If not logged in, create account first
      if (!userId) {
        const password = `Temp${Date.now()}!`; // Temporary password
        const { user: newUser, error: signUpError } = await signUp(formData.email, password, formData.fullName);
        if (signUpError || !newUser) throw new Error(signUpError || 'Failed to create account');
        userId = newUser.id;
      }

      // Update user to therapist role
      await supabase
        .from('users')
        .update({
          role: 'therapist',
          phone: formData.phone,
          full_name: formData.fullName
        })
        .eq('id', userId);

      // Create therapist profile
      const licenseDoc = uploadedFiles.find(f => f.type === 'license');
      const qualDoc = uploadedFiles.find(f => f.type === 'qualification');
      const idDoc = uploadedFiles.find(f => f.type === 'identity');

      const { error: therapistError } = await supabase
        .from('therapists')
        .insert({
          user_id: userId,
          license_number: formData.licenseNumber,
          license_expiry_date: formData.licenseExpiryDate || null,
          license_document_url: licenseDoc?.url || null,
          qualification_document_url: qualDoc?.url || null,
          identity_document_url: idDoc?.url || null,
          specialties: formData.specialties,
          bio: formData.bio,
          short_bio: formData.bio.substring(0, 150),
          credentials: formData.credentials.split(',').map(c => c.trim()),
          languages: formData.languages,
          years_experience: parseInt(formData.yearsExperience) || 0,
          hourly_rate: parseFloat(formData.hourlyRate) || 75,
          session_rate_individual: parseFloat(formData.hourlyRate) || 75,
          session_rate_couple: (parseFloat(formData.hourlyRate) || 75) * 1.5,
          session_rate_family: (parseFloat(formData.hourlyRate) || 75) * 2,
          is_verified: false,
          is_active: false,
          application_status: 'pending',
          accepts_new_clients: true,
        });

      if (therapistError) throw therapistError;

      // Create notification for admins
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .in('role', ['admin', 'super_admin']);

      if (admins) {
        await supabase.from('notifications').insert(
          admins.map(admin => ({
            user_id: admin.id,
            type: 'therapist_application',
            title: 'New Therapist Application',
            message: `${formData.fullName} has applied to join as a therapist`,
            data: { applicant_name: formData.fullName },
          }))
        );
      }

      toast({
        title: "Application Submitted! 🎉",
        description: "We'll review your application and get back to you within 5-7 business days."
      });

      // Show success step
      setCurrentStep(4);

    } catch (error: unknown) {
      console.error('Application error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Application failed';
      toast({ title: "Application failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.fullName && formData.email && formData.phone;
      case 2:
        return formData.licenseNumber && formData.specialties.length > 0 && formData.bio;
      case 3:
        return uploadedFiles.some(f => f.type === 'license') && termsAccepted;
      default:
        return false;
    }
  };

  return (
    <>
      <Helmet>
        <title>Join The Team | psychmind - Career Opportunities</title>
        <meta name="description" content="Join a compassionate, ethical team dedicated to meaningful mental health care, personal growth, and holistic well-being." />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl mb-6">Join Our Team</h1>
              <p className="text-lg lg:text-xl text-gray-300 mb-10 leading-relaxed">
                Join a compassionate, ethical team dedicated to meaningful mental health care,
                personal growth, and holistic well-being.
              </p>

              {/* Progress Steps */}
              {currentStep < 4 && (
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3].map(step => (
                    <div key={step} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep === step ? 'bg-cyan-500 text-white scale-110' :
                        currentStep > step ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60'
                        }`}>
                        {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                      </div>
                      {step < 3 && <div className={`w-12 h-1 mx-2 ${currentStep > step ? 'bg-green-500' : 'bg-white/20'}`} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto">
              {/* Success State */}
              {currentStep === 4 ? (
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for your interest in joining psychmind. Our team will review your application
                    and get back to you within 5-7 business days.
                  </p>
                  <Button onClick={() => navigate('/dashboard')} className="bg-slate-900">
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <Input name="fullName" value={formData.fullName} onChange={handleInputChange}
                          placeholder="Dr. John Doe" required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                          <Input name="email" type="email" value={formData.email} onChange={handleInputChange}
                            placeholder="doctor@email.com" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                          <Input name="phone" value={formData.phone} onChange={handleInputChange}
                            placeholder="+91 98765 43210" required />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <Input name="address" value={formData.address} onChange={handleInputChange}
                          placeholder="Street address" />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Mumbai" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                          <Input name="state" value={formData.state} onChange={handleInputChange} placeholder="Maharashtra" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                          <Input name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="400001" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                          <select name="country" value={formData.country} onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="India">India</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2: Professional Info */}
                  {currentStep === 2 && (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Details</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                          <Input name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange}
                            placeholder="RCI/PSY/12345" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">License Expiry Date</label>
                          <Input name="licenseExpiryDate" type="date" value={formData.licenseExpiryDate} onChange={handleInputChange} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                          <Input name="yearsExperience" type="number" value={formData.yearsExperience} onChange={handleInputChange}
                            placeholder="5" min="0" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (₹)</label>
                          <Input name="hourlyRate" type="number" value={formData.hourlyRate} onChange={handleInputChange}
                            placeholder="75" min="50" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Credentials (comma separated)</label>
                        <Input name="credentials" value={formData.credentials} onChange={handleInputChange}
                          placeholder="Ph.D., LMFT, Licensed Psychologist" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specialties * (select at least 3)</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {specialtyOptions.map(specialty => (
                            <button key={specialty} type="button" onClick={() => handleSpecialtyToggle(specialty)}
                              className={`px-3 py-1.5 rounded-full text-sm transition-all ${formData.specialties.includes(specialty)
                                ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}>
                              {specialty}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio *</label>
                        <Textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={5}
                          placeholder="Tell us about your approach to therapy, your experience, and what makes you passionate about mental health care..."
                          required />
                        <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                      </div>
                    </>
                  )}

                  {/* Step 3: Documents */}
                  {currentStep === 3 && (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h2>

                      <div className="space-y-4">
                        {[
                          { type: 'license' as const, label: 'License Certificate', required: true },
                          { type: 'qualification' as const, label: 'Qualification Certificates', required: false },
                          { type: 'identity' as const, label: 'Government ID', required: false },
                        ].map(doc => {
                          const uploaded = uploadedFiles.find(f => f.type === doc.type);
                          return (
                            <div key={doc.type} className={`p-4 rounded-lg border-2 ${uploaded ? 'border-green-300 bg-green-50' : 'border-dashed border-gray-300'}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText className={`w-5 h-5 ${uploaded ? 'text-green-500' : 'text-gray-400'}`} />
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {doc.label} {doc.required && <span className="text-red-500">*</span>}
                                    </p>
                                    {uploaded && <p className="text-sm text-green-600">{uploaded.name}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {uploaded && (
                                    <button type="button" onClick={() => setUploadedFiles(prev => prev.filter(f => f.type !== doc.type))}
                                      className="p-1 text-red-500 hover:bg-red-50 rounded">
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                  <Button type="button" variant="outline" size="sm"
                                    onClick={() => { setCurrentUploadType(doc.type); fileInputRef.current?.click(); }}
                                    disabled={uploadingFile === doc.type}>
                                    {uploadingFile === doc.type ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                                    {uploaded ? 'Replace' : 'Upload'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" />
                      <p className="text-xs text-gray-500">Accepted formats: PDF, JPG, PNG. Max size: 5MB</p>

                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800">
                            Your documents will be securely stored and reviewed by our verification team.
                            We may contact you for additional information if needed.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-1" />
                        <label htmlFor="terms" className="text-sm text-gray-700">
                          I confirm that all information provided is accurate and I agree to psychmind's
                          <a href="/terms" className="text-cyan-600 hover:underline"> Terms of Service</a> and
                          <a href="/privacy" className="text-cyan-600 hover:underline"> Privacy Policy</a>.
                        </label>
                      </div>
                    </>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-4 border-t">
                    {currentStep > 1 && (
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                        Back
                      </Button>
                    )}
                    <div className="ml-auto">
                      {currentStep < 3 ? (
                        <Button type="button" onClick={() => setCurrentStep(prev => prev + 1)} disabled={!isStepValid(currentStep)}
                          className="bg-slate-900">
                          Continue <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      ) : (
                        <Button type="submit" disabled={loading || !isStepValid(3)} className="bg-green-600 hover:bg-green-700">
                          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Submit Application
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl lg:text-4xl text-gray-900 mb-2">Frequently Asked Questions</h2>
              <div className="w-24 h-1 bg-cyan-500 mb-12" />

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className={`border rounded-lg overflow-hidden transition-all ${openFaqIndex === index ? "bg-slate-900 border-slate-900" : "bg-white border-gray-200 hover:border-gray-300"
                    }`}>
                    <button onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className={`w-full px-6 py-4 flex items-center justify-between ${openFaqIndex === index ? "text-white" : "text-gray-900"
                        }`}>
                      <span className="text-left font-medium">{faq.question}</span>
                      <Plus className={`w-5 h-5 flex-shrink-0 ml-4 transition-transform ${openFaqIndex === index ? "rotate-45 text-cyan-400" : "text-gray-400"
                        }`} />
                    </button>
                    {openFaqIndex === index && (
                      <div className="px-6 pb-4 text-gray-300">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
