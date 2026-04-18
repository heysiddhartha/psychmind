import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Phone, Calendar, ArrowRight, User, Sparkles, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/lib/data/countries";

export default function CompleteProfile() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user, completeProfile, loading: authLoading, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [countryCode, setCountryCode] = useState('+91'); // Default to India
    const [formData, setFormData] = useState({
        phone: "",
        dateOfBirth: "",
        gender: "" as "" | "male" | "female" | "other" | "prefer_not_to_say",
    });
    const isTherapist = user?.role === 'therapist';

    useEffect(() => {
        // Clients should not revisit this page once complete, but therapists
        // still use it as part of their onboarding/setup flow.
        if (user?.is_profile_complete && user.role !== 'therapist' && !authLoading) {
            navigate(user.role === 'therapist' ? "/dashboard/therapist" : "/dashboard");
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login");
        }
    }, [authLoading, user, navigate]);

    // Wait for auth to load
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If no user, redirect to login
    if (!user) {
        return null;
    }

    const formatPhoneNumber = (value: string) => {
        const digits = value.replace(/\D/g, '');
        return digits.slice(0, 15);
    };

    const validateForm = () => {
        if (!formData.phone.trim() || formData.phone.length < 7) {
            toast({
                title: "Phone Required",
                description: "Please enter a valid phone number (at least 7 digits).",
                variant: "destructive"
            });
            return false;
        }

        if (!formData.dateOfBirth) {
            toast({
                title: "Date of Birth Required",
                description: "Please enter your date of birth.",
                variant: "destructive"
            });
            return false;
        }

        // Validate age
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 13) {
            toast({
                title: "Age Requirement",
                description: "You must be at least 13 years old to use this service.",
                variant: "destructive"
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        // Combine country code with phone number
        const fullPhoneNumber = `${countryCode}${formData.phone}`;

        const { error } = await completeProfile({
            phone: fullPhoneNumber,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender || undefined,
        });

        if (error) {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Profile Complete!",
                description: isTherapist
                    ? "Your therapist profile is set up. You can now access your dashboard while verification is pending."
                    : "Your profile has been updated successfully.",
            });
            await refreshUser();
            navigate(user.role === 'therapist' ? "/dashboard/therapist" : "/dashboard");
        }

        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>{isTherapist ? "Complete Therapist Profile" : "Complete Your Profile"} | psychmind</title>
                <meta
                    name="description"
                    content={isTherapist
                        ? "Complete your therapist profile to access your dashboard and prepare for verification."
                        : "Complete your profile to start booking therapy sessions."}
                />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 flex items-center justify-center p-4">
                {/* Background decorations */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-100/30 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[20%] left-[15%] w-[300px] h-[300px] bg-teal-50/40 rounded-full blur-[80px]" />
                </div>

                <div className="w-full max-w-md">
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-100/50">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1a2744] to-[#2a3854] text-white rounded-full text-sm font-medium mb-4 shadow-lg">
                                <Sparkles className="w-4 h-4" />
                                Almost There!
                            </div>
                            <h1 className="font-serif text-3xl text-gray-900 mb-2">Complete Your Profile</h1>
                            <p className="text-gray-600">
                                {isTherapist
                                    ? "We need a few more details to activate your therapist dashboard and verification flow"
                                    : "We need a few more details to personalize your experience"}
                            </p>
                        </div>

                        {/* User Info Preview */}
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-cyan-50/30 rounded-2xl mb-6 border border-gray-100">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a2744] to-cyan-600 flex items-center justify-center shadow-lg">
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.full_name}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-7 h-7 text-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{user.full_name || "Welcome!"}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <Check className="w-5 h-5 text-green-500" />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Phone Number with Country Code */}
                            <div>
                                <Label htmlFor="phone" className="text-gray-700 font-medium text-sm mb-2 block">
                                    Phone Number <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2">
                                    {/* Country Code Selector */}
                                    <Select value={countryCode} onValueChange={setCountryCode}>
                                        <SelectTrigger className="w-[140px] h-12 rounded-xl border-gray-200 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {countries.map((country) => (
                                                <SelectItem key={country.code} value={country.dialCode}>
                                                    <span className="flex items-center gap-2">
                                                        <span className="text-lg">{country.flag}</span>
                                                        <span className="font-medium">{country.dialCode}</span>
                                                        <span className="text-gray-500 text-sm hidden sm:inline">
                                                            {country.code}
                                                        </span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Phone Input */}
                                    <div className="relative flex-1">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="9876543210"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                                            className="pl-12 h-12 rounded-xl border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 ml-1">
                                    📱 For appointment reminders and therapist contact
                                </p>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <Label htmlFor="dateOfBirth" className="text-gray-700 font-medium text-sm mb-2 block">
                                    Date of Birth <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        required
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="pl-12 h-12 rounded-xl border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <Label htmlFor="gender" className="text-gray-700 font-medium text-sm mb-2 block">
                                    Gender <span className="text-gray-400 text-xs font-normal">(optional)</span>
                                </Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => setFormData({ ...formData, gender: value as typeof formData.gender })}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-white">
                                        <SelectValue placeholder="Select your gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-13 bg-gradient-to-r from-[#1a2744] to-[#2a3854] hover:from-[#0f1a2e] hover:to-[#1a2744] text-white text-base font-semibold rounded-xl shadow-xl shadow-gray-900/20 transition-all duration-300 mt-8"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Complete Profile
                                        <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        {/* Privacy Note */}
                        <p className="text-center text-xs text-gray-500 mt-6">
                            🔒 Your information is kept private and secure. Read our{" "}
                            <a href="/privacy" className="text-cyan-600 hover:underline font-medium">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
