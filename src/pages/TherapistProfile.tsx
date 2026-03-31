/**
 * Therapist Profile Page - Individual Therapist Details
 */

import { Helmet } from 'react-helmet-async';
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
    ArrowLeft,
    Calendar,
    MessageCircle,
    Star,
    Clock,
    MapPin,
    Globe,
    Award,
    Heart,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { fetchTherapistById, getAvailableDates, type TherapistProfile } from '@/lib/services/therapistService';
import { getMotionPreference } from '@/lib/gsap/presets';

// ==========================================
// Component
// ==========================================

export default function TherapistProfilePage() {
    const { id } = useParams<{ id: string }>();
    const pageRef = useRef<HTMLDivElement>(null);

    const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'about' | 'availability'>('about');

    useEffect(() => {
        async function loadTherapist() {
            if (!id) return;

            try {
                const data = await fetchTherapistById(id);
                setTherapist(data);

                if (data) {
                    const dates = await getAvailableDates(data.id);
                    setAvailableDates(dates.slice(0, 14)); // Next 2 weeks
                }
            } catch (error) {
                console.error('Failed to load therapist:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadTherapist();
    }, [id]);

    useEffect(() => {
        if (getMotionPreference() || isLoading || !therapist) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.profile-header',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );

            gsap.fromTo(
                '.profile-content',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power2.out' }
            );
        }, pageRef);

        return () => ctx.revert();
    }, [isLoading, therapist]);

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            </Layout>
        );
    }

    if (!therapist) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-serif text-gray-900 mb-4">Therapist Not Found</h1>
                        <Button asChild>
                            <Link to="/team">View All Therapists</Link>
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <Layout>
            <Helmet>
                <title>{therapist.profile?.full_name || 'Therapist'} | 3-3.com</title>
                <meta name="description" content={therapist.short_bio} />
            </Helmet>

            <div ref={pageRef} className="min-h-screen bg-gray-50">
                {/* Header */}
                <section className="profile-header bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 pb-32 px-4">
                    <div className="container mx-auto max-w-5xl">
                        <Link
                            to="/team"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Team
                        </Link>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Photo */}
                            <div className="relative">
                                <img
                                    src={therapist.photo_url || therapist.profile?.avatar_url}
                                    alt={therapist.profile?.full_name}
                                    className="w-40 h-40 rounded-2xl object-cover shadow-xl"
                                />
                                {therapist.is_verified && (
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-serif">{therapist.profile?.full_name}</h1>
                                    {therapist.accepts_new_clients && (
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                                            Accepting New Clients
                                        </span>
                                    )}
                                </div>
                                <p className="text-lg text-gray-300 mb-4">{therapist.title}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {therapist.years_experience}+ years experience
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {therapist.profile?.timezone?.replace(/_/g, ' ')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Globe className="w-4 h-4" />
                                        {therapist.languages.join(', ')}
                                    </span>
                                </div>

                                {/* Credentials */}
                                <div className="flex flex-wrap gap-2">
                                    {therapist.credentials.map((cred, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-white/10 rounded-full text-sm"
                                        >
                                            {cred}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 w-full md:w-auto">
                                <Button asChild size="lg" className="btn-icy">
                                    <Link to={`/booking/${therapist.id}`}>
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Book Session
                                    </Link>
                                </Button>
                                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Send Message
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="profile-content -mt-16 pb-16 px-4">
                    <div className="container mx-auto max-w-5xl">
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Left Column - Main Info */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Tabs */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <div className="flex border-b border-gray-100">
                                        <button
                                            onClick={() => setActiveTab('about')}
                                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors
                                                ${activeTab === 'about'
                                                    ? 'text-primary border-b-2 border-primary'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            About
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('availability')}
                                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors
                                                ${activeTab === 'availability'
                                                    ? 'text-primary border-b-2 border-primary'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            Availability
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        {activeTab === 'about' ? (
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3">About Me</h3>
                                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                                        {therapist.bio}
                                                    </p>
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3">Specialties</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {therapist.specialties.map((specialty, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                                                            >
                                                                {specialty}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3">Credentials & Training</h3>
                                                    <ul className="space-y-2">
                                                        {therapist.credentials.map((cred, idx) => (
                                                            <li key={idx} className="flex items-center gap-2 text-gray-600">
                                                                <Award className="w-4 h-4 text-primary" />
                                                                {cred}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-4">Available Dates</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {availableDates.map((date, idx) => (
                                                        <Link
                                                            key={idx}
                                                            to={`/booking/${therapist.id}?date=${date.toISOString().split('T')[0]}`}
                                                            className="block p-3 border border-gray-200 rounded-lg text-center hover:border-primary hover:bg-primary/5 transition-colors"
                                                        >
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {formatDate(date)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">Available</p>
                                                        </Link>
                                                    ))}
                                                </div>
                                                <Button asChild className="w-full mt-4" variant="outline">
                                                    <Link to={`/booking/${therapist.id}`}>
                                                        View Full Calendar
                                                        <ChevronRight className="w-4 h-4 ml-1" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Pricing */}
                            <div className="space-y-6">
                                {/* Pricing Card */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Session Rates</h3>
                                    <div className="space-y-4">
                                        {therapist.session_rate_individual > 0 && (
                                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                                <span className="text-gray-600">Individual Therapy</span>
                                                <span className="font-semibold text-gray-900">
                                                    ${therapist.session_rate_individual}/session
                                                </span>
                                            </div>
                                        )}
                                        {therapist.session_rate_couple > 0 && (
                                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                                <span className="text-gray-600">Couples Therapy</span>
                                                <span className="font-semibold text-gray-900">
                                                    ${therapist.session_rate_couple}/session
                                                </span>
                                            </div>
                                        )}
                                        {therapist.session_rate_family > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Family Therapy</span>
                                                <span className="font-semibold text-gray-900">
                                                    ${therapist.session_rate_family}/session
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500 mt-4">
                                        Session packages available with discounts. 50-minute sessions.
                                    </p>
                                </div>

                                {/* Quick Book */}
                                <div className="bg-gradient-to-br from-primary to-cyan-600 rounded-xl p-6 text-white">
                                    <Heart className="w-8 h-8 mb-4" />
                                    <h3 className="font-semibold text-lg mb-2">Ready to Start?</h3>
                                    <p className="text-sm text-white/80 mb-4">
                                        Take the first step toward feeling better. Book your initial consultation today.
                                    </p>
                                    <Button asChild variant="secondary" className="w-full">
                                        <Link to={`/booking/${therapist.id}`}>
                                            Schedule Now
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
