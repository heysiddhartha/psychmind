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
import { Mail, Lock, ArrowRight, Eye, EyeOff, Heart, Shield, Video, CheckCircle } from "lucide-react";

// Import illustration
import therapyIllustration from "@/assets/therapy-session.png";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const pageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Enhanced GSAP Animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Stagger animation for left content features
      gsap.fromTo(
        ".login-feature",
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

      // Form card animation with slight bounce
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: 50, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.4)", delay: 0.15 }
        );
      }

      // Floating shapes animation
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || loading) return;

    if (!formData.email.trim() || !formData.password.trim()) {
      toast({ title: "Missing fields", description: "Please enter email and password.", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    // Save email if remember me is checked
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email.trim());
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    console.log('📧 Login form submitted for:', formData.email.trim());
    setIsSubmitting(true);
    setLoading(true);
    try {
      const { error } = await signInWithEmail(formData.email.trim(), formData.password);

      if (error) {
        console.error('❌ Login error from form:', error);

        let errorMessage = error.message || "Invalid credentials. Please try again.";
        if (error.message?.toLowerCase().includes('invalid login')) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.message?.toLowerCase().includes('email not confirmed')) {
          errorMessage = "Please verify your email before signing in. Check your inbox.";
        } else if (error.message?.toLowerCase().includes('too many requests')) {
          errorMessage = "Too many login attempts. Please wait a moment and try again.";
        }

        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log('✅ Login successful from form, navigating to dashboard');
        toast({ title: "Welcome back!", description: "Login successful." });
        setTimeout(() => navigate("/dashboard"), 100);
      }
    } catch (err) {
      console.error('❌ Unexpected error in login form:', err);
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

  const handleGoogleLogin = async () => {
    if (isSubmitting || loading) return;

    console.log('🔐 Google login button clicked');
    setIsSubmitting(true);
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('❌ Google login error in form:', error);

        let errorMessage = error.message;
        if (error.message?.includes('popup')) {
          errorMessage = "Login popup was blocked or closed. Please try again.";
        } else if (error.message?.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        }

        toast({
          title: "Google Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsSubmitting(false);
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Unexpected Google login error:', err);
      toast({
        title: "Error",
        description: "Failed to connect with Google. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const features = [
    { icon: Heart, text: "Continue your healing journey", color: "bg-rose-500" },
    { icon: Video, text: "Join video sessions with your therapist", color: "bg-blue-500" },
    { icon: Shield, text: "Access your private, secure dashboard", color: "bg-emerald-500" },
  ];

  return (
    <>
      <Helmet>
        <title>Sign In | The 3 Tree - Mental Wellness</title>
        <meta name="description" content="Sign in to your The 3 Tree account to access therapy sessions, track progress, and connect with your therapist." />
      </Helmet>
      <Layout>
        <section ref={pageRef} className="min-h-screen auth-gradient-bg py-20 pt-28 flex items-center relative">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="floating-shape auth-blob-1 absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full" />
            <div className="floating-shape floating-shape-reverse auth-blob-2 absolute bottom-[15%] left-[5%] w-[400px] h-[400px] rounded-full" />
            <div className="floating-shape absolute top-[50%] left-[50%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
              {/* Left - Illustration & Features */}
              <div className="hidden lg:block">
                <div className="space-y-8">
                  {/* Illustration */}
                  <div ref={illustrationRef} className="auth-illustration">
                    <img
                      src={therapyIllustration}
                      alt="Professional therapy session"
                      className="w-full h-auto rounded-2xl"
                    />
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    {features.map((feature, i) => (
                      <div
                        key={i}
                        className="login-feature auth-feature-card"
                      >
                        <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <span className="text-gray-800 font-medium text-lg">{feature.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right - Form */}
              <div ref={formRef}>
                <div className="auth-card rounded-3xl p-8 lg:p-10 max-w-md mx-auto">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="font-serif text-3xl text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-gray-500">Sign in to continue your wellness journey</p>
                  </div>

                  {/* Google OAuth */}
                  <Button
                    type="button"
                    variant="outline"
                    className="social-login-btn w-full h-14 rounded-xl border-2 border-gray-200 hover:border-gray-300 mb-6"
                    onClick={handleGoogleLogin}
                    disabled={loading || isSubmitting}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="font-medium">Continue with Google</span>
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-400 font-medium">or continue with email</span>
                    </div>
                  </div>

                  {/* Email Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="email" className="auth-label block mb-2">
                        Email Address
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

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="password" className="auth-label">
                          Password
                        </Label>
                        <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
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
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="remember-me-checkbox"
                      />
                      <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
                        Remember my email
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="auth-btn-primary w-full h-14 text-white text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                      disabled={loading || isSubmitting}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Sign In
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </form>

                  {/* Footer */}
                  <p className="text-center text-sm text-gray-500 mt-8">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                      Create one
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
