import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast({
                title: "Email Required",
                description: "Please enter your email address.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                });
            } else {
                setEmailSent(true);
                toast({
                    title: "Check Your Email",
                    description: "We've sent you a password reset link.",
                });
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            toast({
                title: "Something went wrong",
                description: "Unable to send reset link. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Forgot Password | The 3 Tree - Mental Wellness</title>
                <meta name="description" content="Reset your password to regain access to your The 3 Tree account." />
            </Helmet>
            <Layout>
                <section className="min-h-screen bg-[#F8FAFC] py-20 pt-28 flex items-center">
                    <div className="container mx-auto px-4">
                        <div className="max-w-md mx-auto">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-10 shadow-xl border border-gray-100">
                                {!emailSent ? (
                                    <>
                                        <div className="text-center mb-8">
                                            <h1 className="font-serif text-3xl text-gray-900 mb-2">Forgot Password?</h1>
                                            <p className="text-gray-500">
                                                Enter your email and we'll send you a reset link
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div>
                                                <Label htmlFor="email" className="text-gray-700 font-medium">
                                                    Email Address
                                                </Label>
                                                <div className="relative mt-2">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="you@example.com"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-12 bg-[#1a2744] hover:bg-[#0f1a2e] text-white text-base font-semibold rounded-xl shadow-lg shadow-gray-900/10 transition-all"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Sending...
                                                    </span>
                                                ) : (
                                                    "Send Reset Link"
                                                )}
                                            </Button>
                                        </form>

                                        <div className="mt-6 text-center">
                                            <Link
                                                to="/login"
                                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back to Login
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h2 className="font-serif text-2xl text-gray-900 mb-2">Check Your Email</h2>
                                        <p className="text-gray-600 mb-6">
                                            We've sent a password reset link to <strong>{email}</strong>
                                        </p>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Didn't receive the email? Check your spam folder or try again.
                                        </p>
                                        <div className="space-y-3">
                                            <Button
                                                onClick={() => setEmailSent(false)}
                                                variant="outline"
                                                className="w-full h-11 rounded-xl"
                                            >
                                                Try Different Email
                                            </Button>
                                            <Link to="/login">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full h-11 rounded-xl"
                                                >
                                                    Back to Login
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </Layout>
        </>
    );
}
