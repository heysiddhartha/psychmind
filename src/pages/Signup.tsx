import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { gsap } from "gsap";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Shield, Calendar, MessageCircle, Phone, Sparkles, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/lib/data/countries";
import PasswordStrengthIndicator from "@/components/auth/PasswordStrengthIndicator";

// Import illustration
import wellnessIllustration from "@/assets/wellness-journey.png";

export default function Signup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<"client" | "therapist">("client");
  const [countryCode, setCountryCode] = useState('+1');
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "" as "" | "male" | "female" | "other" | "prefer_not_to_say",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const pageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      if (!user.is_profile_complete) {
        navigate("/complete-profile");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, authLoading, navigate]);

  // Enhanced GSAP Animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Features animation
      gsap.fromTo(
        ".signup-feature",
        { opacity: 0, x: -40, y: 20 },
        { opacity: 1, x: 0, y: 0, duration: 0.7, stagger: 0.15, ease: "power3.out", delay: 0.3 }
      );

      // Illustration animation
      if (illustrationRef.current) {
        gsap.fromTo(
          illustrationRef.current,
          { opacity: 0, scale: 0.95, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.2 }
        );
      }

      // Form card animation
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: 50, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.4)", delay: 0.15 }
        );
      }

      // Floating shapes
      gsap.to(".floating-shape", {
        y: -15,
        rotation: 5,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.5 }
      });

    }, pageRef);

    return () => ctx.revert();
  }, []);

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast({ title: "Name Required", description: "Please enter your full name.", variant: "destructive" });
      return false;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ title: "Valid Email Required", description: "Please enter a valid email address.", variant: "destructive" });
      return false;
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast({ title: "Phone Required", description: "Please enter a valid phone number (at least 10 digits).", variant: "destructive" });
      return false;
    }

    if (!formData.dateOfBirth) {
      toast({ title: "Date of Birth Required", description: "Please enter your date of birth.", variant: "destructive" });
      return false;
    }

    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 13) {
      toast({ title: "Age Requirement", description: "You must be at least 13 years old to register.", variant: "destructive" });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure your passwords match.", variant: "destructive" });
      return false;
    }

    if (formData.password.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters.", variant: "destructive" });
      return false;
    }

    if (!formData.agreeTerms) {
      toast({ title: "Terms Required", description: "Please agree to the terms and conditions.", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || loading) return;

    if (!validateForm()) return;

    console.log('📝 Signup form submitted for:', formData.email.trim());
    setIsSubmitting(true);
    setLoading(true);
    try {
      const { error } = await signUpWithEmail({
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: `${countryCode}${formData.phone}`,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender || undefined,
        role: role,
      });

      if (error) {
        console.error('❌ Signup error from form:', error);

        if (error.message.includes("already registered") || error.message.includes("unique constraint")) {
          toast({
            title: "Account Already Exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-black hover:bg-gray-100 border-0"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            ),
            duration: 6000,
          });
        } else {
          toast({
            title: "Signup Failed",
            description: error.message || "An error occurred. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        console.log('✅ Signup successful, redirecting...');
        toast({
          title: "Account Created!",
          description: role === 'therapist'
            ? "Welcome! Please complete your therapist profile for verification."
            : "Welcome to The 3 Tree! You can now book sessions.",
        });
        navigate(role === 'therapist' ? '/complete-profile' : '/dashboard');
      }
    } catch (err) {
      console.error('❌ Unexpected error in signup form:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (isSubmitting || loading) return;

    console.log('🔐 Google signup button clicked');
    setIsSubmitting(true);
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('❌ Google signup error in form:', error);

        let errorMessage = error.message;
        if (error.message?.includes('popup')) {
          errorMessage = "Signup popup was blocked or closed. Please try again.";
        } else if (error.message?.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        }

        toast({
          title: "Google Signup Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsSubmitting(false);
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Unexpected Google signup error:', err);
      toast({
        title: "Error",
        description: "Failed to connect with Google. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Calendar, text: "Book sessions with certified therapists", color: "bg-blue-500" },
    { icon: Shield, text: "Your data is secure & confidential", color: "bg-emerald-500" },
    { icon: MessageCircle, text: "24/7 messaging with your therapist", color: "bg-purple-500" },
  ];

  return (
    <>
      <Helmet>
        <title>Create Account | The 3 Tree - Mental Wellness</title>
        <meta name="description" content="Join The 3 Tree and start your mental wellness journey. Create an account to book therapy sessions and connect with compassionate therapists." />
      </Helmet>
      <Layout>
        <section ref={pageRef} className="min-h-screen auth-gradient-bg py-20 pt-28 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="floating-shape auth-blob-1 absolute top-[5%] right-[10%] w-[500px] h-[500px] rounded-full" />
            <div className="floating-shape floating-shape-reverse auth-blob-2 absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full" />
            <div className="floating-shape absolute top-[40%] left-[45%] w-[250px] h-[250px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
              {/* Left - Illustration & Benefits */}
              <div className="hidden lg:block sticky top-28">
                <div className="space-y-8">
                  {/* Illustration */}
                  <div ref={illustrationRef} className="auth-illustration">
                    <img
                      src={wellnessIllustration}
                      alt="Start your wellness journey"
                      className="w-full h-auto rounded-2xl"
                    />
                  </div>

                  {/* Benefits */}
                  <div className="space-y-4">
                    {benefits.map((benefit, i) => (
                      <div
                        key={i}
                        className="signup-feature auth-feature-card"
                      >
                        <div className={`w-12 h-12 ${benefit.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <benefit.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-gray-800 font-medium text-lg">{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right - Form */}
              <div ref={formRef}>
                <div className="auth-card rounded-3xl p-8 lg:p-10 max-w-md mx-auto">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                      <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="font-serif text-3xl text-gray-900 mb-2">Create Account</h2>
                    <p className="text-gray-500">Join our wellness community</p>
                  </div>

                  {/* Role Selection */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setRole("client")}
                      className={`role-card ${role === "client" ? "selected" : "border-gray-200"}`}
                    >
                      <User className={`w-6 h-6 mx-auto mb-2 ${role === "client" ? "text-primary" : "text-gray-400"}`} />
                      <p className={`font-medium ${role === "client" ? "text-primary" : "text-gray-600"}`}>
                        I'm a Client
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Seeking therapy</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("therapist")}
                      className={`role-card ${role === "therapist" ? "selected" : "border-gray-200"}`}
                    >
                      <Shield className={`w-6 h-6 mx-auto mb-2 ${role === "therapist" ? "text-primary" : "text-gray-400"}`} />
                      <p className={`font-medium ${role === "therapist" ? "text-primary" : "text-gray-600"}`}>
                        I'm a Therapist
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Provide services</p>
                    </button>
                  </div>

                  {/* Google OAuth */}
                  <Button
                    type="button"
                    variant="outline"
                    className="social-login-btn w-full h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 mb-4"
                    onClick={handleGoogleSignup}
                    disabled={loading || isSubmitting}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-400 font-medium">or register with email</span>
                    </div>
                  </div>

                  {/* Email Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <Label htmlFor="fullName" className="auth-label block mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="auth-input"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="auth-label block mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="auth-input"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <Label htmlFor="phone" className="auth-label block mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-[130px] h-12 rounded-xl border-2 border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.dialCode}>
                                <span className="flex items-center gap-2">
                                  <span className="text-lg">{country.flag}</span>
                                  <span className="font-medium">{country.dialCode}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="relative flex-1">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="9876543210"
                            required
                            value={formData.phone}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
                              setFormData({ ...formData, phone: digits });
                            }}
                            className="auth-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date of Birth & Gender */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="dateOfBirth" className="auth-label block mb-1.5">
                          Date of Birth <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          <Input
                            id="dateOfBirth"
                            type="date"
                            required
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className="auth-input"
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="gender" className="auth-label block mb-1.5">
                          Gender
                        </Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => setFormData({ ...formData, gender: value as typeof formData.gender })}
                        >
                          <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <Label htmlFor="password" className="auth-label block mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          minLength={8}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="auth-input pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {/* Password Strength Indicator */}
                      <PasswordStrengthIndicator password={formData.password} />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <Label htmlFor="confirmPassword" className="auth-label block mb-1.5">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="auth-input"
                        />
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1.5 animate-fade-in">
                          Passwords do not match
                        </p>
                      )}
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                        className="remember-me-checkbox mt-0.5"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary hover:underline font-medium">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-primary hover:underline font-medium">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>

                    <Button
                      type="submit"
                      className="auth-btn-primary w-full h-14 text-white text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                      disabled={loading || isSubmitting}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Create Account
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </form>

                  {/* Footer */}
                  <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
