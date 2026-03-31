import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Calendar, Edit2, Save, X, LogOut } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/ui/BackButton";

export default function Profile() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user, completeProfile, signOut, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        dateOfBirth: "",
        gender: "" as "" | "male" | "female" | "other" | "prefer_not_to_say",
    });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login");
        }

        if (user) {
            setFormData({
                fullName: user.full_name || "",
                phone: user.phone || "",
                dateOfBirth: user.date_of_birth || "",
                gender: (user.gender as typeof formData.gender) || "",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);

        const { error } = await completeProfile({
            phone: formData.phone,
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
                title: "Profile Updated!",
                description: "Your profile has been updated successfully.",
            });
            setIsEditing(false);
        }

        setLoading(false);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    const formatPhoneNumber = (value: string) => {
        const digits = value.replace(/\D/g, '');
        return digits.slice(0, 15);
    };

    return (
        <>
            <Helmet>
                <title>My Profile | The 3 Tree</title>
                <meta name="description" content="Manage your profile and account settings." />
            </Helmet>

            <div className="min-h-screen bg-[#F8FAFC]">
                <Header />

                <div className="container max-w-4xl mx-auto px-4 py-12">
                    {/* Back Button */}
                    <BackButton to="/dashboard" label="Back to Dashboard" />
                    <div className="mb-8">
                        <h1 className="font-serif text-4xl text-gray-900 mb-2">My Profile</h1>
                        <p className="text-gray-600">Manage your account information and preferences</p>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-[#1a2744] to-[#0f1a2e] p-8 text-white">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20">
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.full_name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold mb-1">{user.full_name || "User"}</h2>
                                    <p className="text-white/80 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {user.email}
                                    </p>
                                    <div className="mt-2">
                                        <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm capitalize">
                                            {user.role || "Client"}
                                        </span>
                                    </div>
                                </div>
                                {!isEditing && (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outline"
                                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="p-8">
                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Full Name */}
                                    <div>
                                        <Label htmlFor="fullName" className="text-gray-700 font-medium">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="fullName"
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="mt-1.5 h-12 rounded-xl"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <Label htmlFor="phone" className="text-gray-700 font-medium">
                                            Phone Number
                                        </Label>
                                        <div className="relative mt-1.5">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                                                className="pl-12 h-12 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                        <Label htmlFor="dateOfBirth" className="text-gray-700 font-medium">
                                            Date of Birth
                                        </Label>
                                        <div className="relative mt-1.5">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                            <Input
                                                id="dateOfBirth"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                                className="pl-12 h-12 rounded-xl"
                                                max={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <Label htmlFor="gender" className="text-gray-700 font-medium">
                                            Gender
                                        </Label>
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(value) => setFormData({ ...formData, gender: value as typeof formData.gender })}
                                        >
                                            <SelectTrigger className="mt-1.5 h-12 rounded-xl">
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

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            className="flex-1 h-12 bg-[#1a2744] hover:bg-[#0f1a2e] text-white rounded-xl"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Saving...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Save className="w-4 h-4" />
                                                    Save Changes
                                                </span>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    fullName: user.full_name || "",
                                                    phone: user.phone || "",
                                                    dateOfBirth: user.date_of_birth || "",
                                                    gender: (user.gender as typeof formData.gender) || "",
                                                });
                                            }}
                                            variant="outline"
                                            className="h-12 rounded-xl"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    {/* Display Mode */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label className="text-gray-500 text-sm">Full Name</Label>
                                            <p className="mt-1 text-gray-900 font-medium">{user.full_name || "Not provided"}</p>
                                        </div>
                                        <div>
                                            <Label className="text-gray-500 text-sm">Email</Label>
                                            <p className="mt-1 text-gray-900 font-medium">{user.email}</p>
                                        </div>
                                        <div>
                                            <Label className="text-gray-500 text-sm">Phone Number</Label>
                                            <p className="mt-1 text-gray-900 font-medium">{user.phone || "Not provided"}</p>
                                        </div>
                                        <div>
                                            <Label className="text-gray-500 text-sm">Date of Birth</Label>
                                            <p className="mt-1 text-gray-900 font-medium">
                                                {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : "Not provided"}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-gray-500 text-sm">Gender</Label>
                                            <p className="mt-1 text-gray-900 font-medium capitalize">
                                                {user.gender ? user.gender.replace('_', ' ') : "Not provided"}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-gray-500 text-sm">Account Status</Label>
                                            <p className="mt-1">
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sign Out Button */}
                                    <div className="pt-6 border-t">
                                        <Button
                                            onClick={handleSignOut}
                                            variant="outline"
                                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Sign Out
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            onClick={() => navigate('/dashboard')}
                            variant="outline"
                            className="h-auto p-6 flex-col items-start hover:border-primary"
                        >
                            <h3 className="font-semibold text-gray-900 mb-1">Dashboard</h3>
                            <p className="text-sm text-gray-500 text-left">View your sessions and progress</p>
                        </Button>
                        <Button
                            onClick={() => navigate('/booking')}
                            variant="outline"
                            className="h-auto p-6 flex-col items-start hover:border-primary"
                        >
                            <h3 className="font-semibold text-gray-900 mb-1">Book a Session</h3>
                            <p className="text-sm text-gray-500 text-left">Schedule a new therapy session</p>
                        </Button>
                        <Button
                            onClick={() => navigate('/messages')}
                            variant="outline"
                            className="h-auto p-6 flex-col items-start hover:border-primary"
                        >
                            <h3 className="font-semibold text-gray-900 mb-1">Messages</h3>
                            <p className="text-sm text-gray-500 text-left">Chat with your therapist</p>
                        </Button>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
