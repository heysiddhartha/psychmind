import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetSuccess, setResetSuccess] = useState(false);
    const [validSession, setValidSession] = useState(false);

    useEffect(() => {
        // Check if we have a valid recovery session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setValidSession(true);
            } else {
                toast({
                    title: "Invalid Reset Link",
                    description: "This password reset link has expired or is invalid.",
                    variant: "destructive",
                });
                setTimeout(() => navigate("/forgot-password"), 3000);
            }
        });
    }, [navigate, toast]);

    const validatePassword = () => {
        if (password.length < 8) {
            toast({
                title: "Password Too Short",
                description: "Password must be at least 8 characters long.",
                variant: "destructive",
            });
            return false;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Passwords Don't Match",
                description: "Please make sure your passwords match.",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePassword()) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                });
            } else {
                setResetSuccess(true);
                toast({
                    title: "Password Reset Successful",
                    description: "Your password has been updated. Redirecting to login...",
                });
                setTimeout(() => navigate("/login"), 3000);
            }
        } catch (err) {
            console.error("Reset password error:", err);
            toast({
                title: "Reset Failed",
                description: "Unable to update password. Please try again or request a new link.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!validSession) {
        return (
            <>
                <Helmet>
                    <title>Reset Password | psychmind</title>
                </Helmet>
                <Layout>
                    <section className="min-h-screen bg-[#F8FAFC] py-20 pt-28 flex items-center">
                        <div className="container mx-auto px-4">
                            <div className="max-w-md mx-auto">
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100 text-center">
                                    <p className="text-gray-600">Validating reset link...</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </Layout>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Reset Password | psychmind - Mental Wellness</title>
                <meta name="description" content="Create a new password for your psychmind account." />
            </Helmet>
            <Layout>
                <section className="min-h-screen bg-[#F8FAFC] py-20 pt-28 flex items-center">
                    <div className="container mx-auto px-4">
                        <div className="max-w-md mx-auto">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-10 shadow-xl border border-gray-100">
                                {!resetSuccess ? (
                                    <>
                                        <div className="text-center mb-8">
                                            <h1 className="font-serif text-3xl text-gray-900 mb-2">Reset Password</h1>
                                            <p className="text-gray-500">
                                                Enter your new password below
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div>
                                                <Label htmlFor="password" className="text-gray-700 font-medium">
                                                    New Password
                                                </Label>
                                                <div className="relative mt-2">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        required
                                                        minLength={8}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                                            </div>

                                            <div>
                                                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                                                    Confirm New Password
                                                </Label>
                                                <div className="relative mt-2">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        id="confirmPassword"
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        required
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                                        Resetting Password...
                                                    </span>
                                                ) : (
                                                    "Reset Password"
                                                )}
                                            </Button>
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h2 className="font-serif text-2xl text-gray-900 mb-2">Password Reset!</h2>
                                        <p className="text-gray-600 mb-4">
                                            Your password has been successfully updated.
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Redirecting you to login...
                                        </p>
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
