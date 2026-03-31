/**
 * Find a Therapist - Client-facing page to browse and select therapists
 * Premium UI with filtering, search, and therapist cards
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, Filter, Star, MapPin, Clock, Video, Phone, MessageSquare,
    ChevronRight, Heart, Award, Users, Calendar, X, SlidersHorizontal
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { fetchTherapists, TherapistWithDetails } from '@/lib/bookingService';

// Specialty options for filtering
const SPECIALTIES = [
    'Anxiety', 'Depression', 'Trauma & PTSD', 'Relationship Issues', 'Stress Management',
    'Grief & Loss', 'Self-Esteem', 'Career Counseling', 'Addiction', 'Family Conflict',
    'LGBTQ+ Issues', 'Life Transitions', 'OCD', 'Eating Disorders', 'Sleep Issues'
];

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi'];

export default function FindTherapist() {
    const navigate = useNavigate();
    const [therapists, setTherapists] = useState<TherapistWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'price_low' | 'price_high'>('rating');

    useEffect(() => {
        loadTherapists();
    }, []);

    const loadTherapists = async () => {
        setLoading(true);
        try {
            const data = await fetchTherapists();
            setTherapists(data);
        } catch (error) {
            console.error('Failed to load therapists:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSpecialty = (specialty: string) => {
        setSelectedSpecialties(prev =>
            prev.includes(specialty)
                ? prev.filter(s => s !== specialty)
                : [...prev, specialty]
        );
    };

    const toggleLanguage = (language: string) => {
        setSelectedLanguages(prev =>
            prev.includes(language)
                ? prev.filter(l => l !== language)
                : [...prev, language]
        );
    };

    const clearFilters = () => {
        setSelectedSpecialties([]);
        setSelectedLanguages([]);
        setPriceRange([0, 10000]);
        setSearchQuery('');
    };

    // Filter and sort therapists
    const filteredTherapists = therapists
        .filter(t => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = t.user?.full_name?.toLowerCase().includes(query);
                const matchesSpecialty = t.specialties?.some(s => s.toLowerCase().includes(query));
                const matchesBio = t.bio?.toLowerCase().includes(query);
                if (!matchesName && !matchesSpecialty && !matchesBio) return false;
            }

            // Specialty filter
            if (selectedSpecialties.length > 0) {
                const hasSpecialty = t.specialties?.some(s =>
                    selectedSpecialties.some(sel => s.toLowerCase().includes(sel.toLowerCase()))
                );
                if (!hasSpecialty) return false;
            }

            // Language filter
            if (selectedLanguages.length > 0) {
                const hasLanguage = t.languages?.some(l =>
                    selectedLanguages.includes(l)
                );
                if (!hasLanguage) return false;
            }

            // Price filter
            const rate = t.session_rate_individual || t.hourly_rate || 0;
            if (rate < priceRange[0] || rate > priceRange[1]) return false;

            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return (b.average_rating || b.rating || 0) - (a.average_rating || a.rating || 0);
                case 'experience':
                    return (b.total_sessions || 0) - (a.total_sessions || 0);
                case 'price_low':
                    return (a.session_rate_individual || a.hourly_rate || 0) - (b.session_rate_individual || b.hourly_rate || 0);
                case 'price_high':
                    return (b.session_rate_individual || b.hourly_rate || 0) - (a.session_rate_individual || a.hourly_rate || 0);
                default:
                    return 0;
            }
        });

    const activeFilterCount = selectedSpecialties.length + selectedLanguages.length + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

    return (
        <>
            <Helmet>
                <title>Find a Therapist | The 3 Tree</title>
                <meta name="description" content="Browse our team of licensed therapists and find the right match for your mental wellness journey." />
            </Helmet>

            <Layout>
                {/* Hero Section */}
                <section className="bg-[#F8FAFC] pt-28 pb-12">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-10">
                            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
                                Find Your <span className="text-[#161A30]">Perfect Match</span>
                            </h1>
                            <p className="text-lg text-gray-600">
                                Our carefully selected therapists are here to support your unique journey.
                                Find someone who understands you.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, specialty, or keyword..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#161A30] focus:ring-4 focus:ring-[#161A30]/10 text-lg outline-none transition-all shadow-sm"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full">
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters and Results */}
                <section className="py-12 bg-gray-50">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Sidebar Filters - Desktop */}
                            <aside className="hidden lg:block w-72 flex-shrink-0">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <SlidersHorizontal className="w-4 h-4" />
                                            Filters
                                        </h3>
                                        {activeFilterCount > 0 && (
                                            <button onClick={clearFilters} className="text-sm text-[#161A30] hover:underline">
                                                Clear all
                                            </button>
                                        )}
                                    </div>

                                    {/* Specialties */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Specialties</h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {SPECIALTIES.map(specialty => (
                                                <label key={specialty} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSpecialties.includes(specialty)}
                                                        onChange={() => toggleSpecialty(specialty)}
                                                        className="w-4 h-4 rounded border-gray-300 text-[#161A30] focus:ring-[#161A30]"
                                                    />
                                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">{specialty}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Languages */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Languages</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {LANGUAGES.map(language => (
                                                <button
                                                    key={language}
                                                    onClick={() => toggleLanguage(language)}
                                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedLanguages.includes(language)
                                                        ? 'bg-[#161A30] text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {language}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Session Rate</h4>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                                className="w-20 px-2 py-1 text-sm border rounded"
                                                placeholder="Min"
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input
                                                type="number"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                                                className="w-20 px-2 py-1 text-sm border rounded"
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            {/* Results */}
                            <div className="flex-1">
                                {/* Toolbar */}
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <p className="text-gray-600">
                                            <span className="font-semibold text-gray-900">{filteredTherapists.length}</span> therapists found
                                        </p>
                                        {activeFilterCount > 0 && (
                                            <span className="px-2 py-1 bg-[#161A30]/10 text-[#161A30] text-xs rounded-full">
                                                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Mobile Filter Button */}
                                        <Button
                                            variant="outline"
                                            className="lg:hidden"
                                            onClick={() => setShowFilters(true)}
                                        >
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filters
                                            {activeFilterCount > 0 && (
                                                <span className="ml-2 w-5 h-5 bg-[#161A30] text-white text-xs rounded-full flex items-center justify-center">
                                                    {activeFilterCount}
                                                </span>
                                            )}
                                        </Button>

                                        {/* Sort Dropdown */}
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as 'rating' | 'experience' | 'price_low' | 'price_high')}
                                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#161A30]"
                                        >
                                            <option value="rating">Highest Rated</option>
                                            <option value="experience">Most Experienced</option>
                                            <option value="price_low">Price: Low to High</option>
                                            <option value="price_high">Price: High to Low</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Therapist Grid */}
                                {loading ? (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                                <div className="flex gap-4">
                                                    <div className="w-20 h-20 bg-gray-200 rounded-full" />
                                                    <div className="flex-1">
                                                        <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredTherapists.length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-2xl">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No therapists found</h3>
                                        <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
                                        <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {filteredTherapists.map((therapist) => (
                                            <TherapistCard key={therapist.id} therapist={therapist} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-gradient-to-r from-[#161A30] to-[#2d3a54]">
                    <div className="container mx-auto px-4 lg:px-8 text-center">
                        <h2 className="text-3xl font-serif text-white mb-4">Not Sure Where to Start?</h2>
                        <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                            Book a free 15-minute consultation and we'll help match you with the right therapist.
                        </p>
                        <Button size="lg" className="bg-white text-[#161A30] hover:bg-gray-100">
                            Book Free Consultation
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </section>
            </Layout>

            {/* Mobile Filters Modal */}
            {showFilters && (
                <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowFilters(false)}>
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Filters</h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Specialties */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Specialties</h4>
                            <div className="flex flex-wrap gap-2">
                                {SPECIALTIES.map(specialty => (
                                    <button
                                        key={specialty}
                                        onClick={() => toggleSpecialty(specialty)}
                                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedSpecialties.includes(specialty)
                                            ? 'bg-[#161A30] text-white'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {specialty}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Languages</h4>
                            <div className="flex flex-wrap gap-2">
                                {LANGUAGES.map(language => (
                                    <button
                                        key={language}
                                        onClick={() => toggleLanguage(language)}
                                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedLanguages.includes(language)
                                            ? 'bg-[#161A30] text-white'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {language}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={clearFilters}>
                                Clear All
                            </Button>
                            <Button className="flex-1 btn-icy" onClick={() => setShowFilters(false)}>
                                Show {filteredTherapists.length} Results
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Therapist Card Component
function TherapistCard({ therapist }: { therapist: TherapistWithDetails }) {
    const rating = therapist.average_rating || therapist.rating || 4.8;
    const reviews = therapist.total_reviews || 0;
    const rate = therapist.session_rate_individual || therapist.hourly_rate || 3500;
    const sessions = therapist.total_sessions || 0;

    return (
        <Link to={`/therapist/${therapist.id}`} className="block group">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#161A30]/20 transition-all duration-300">
                <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        {therapist.user?.avatar_url ? (
                            <img
                                src={therapist.user.avatar_url}
                                alt={therapist.user.full_name}
                                className="w-20 h-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-[#161A30] to-[#2d3a54] rounded-full flex items-center justify-center text-white text-2xl font-medium">
                                {therapist.user?.full_name?.charAt(0) || 'T'}
                            </div>
                        )}
                        {therapist.is_verified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                <Award className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-[#161A30] transition-colors">
                            {therapist.user?.full_name || 'Therapist'}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                            {Array.isArray(therapist.credentials) ? therapist.credentials.join(', ') : therapist.credentials}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="font-medium">{rating.toFixed(1)}</span>
                                {reviews > 0 && <span className="text-gray-400">({reviews})</span>}
                            </span>
                            {sessions > 0 && (
                                <span className="text-sm text-gray-500">
                                    {sessions}+ sessions
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Specialties */}
                <div className="mt-4">
                    <div className="flex flex-wrap gap-1.5">
                        {therapist.specialties?.slice(0, 3).map((specialty, i) => (
                            <span key={i} className="px-2 py-0.5 bg-[#161A30]/10 text-[#161A30] text-xs rounded-full">
                                {specialty}
                            </span>
                        ))}
                        {therapist.specialties && therapist.specialties.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                +{therapist.specialties.length - 3} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Bio snippet */}
                {therapist.bio && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {therapist.bio}
                    </p>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <span className="text-lg font-bold text-gray-900">₹{rate.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">/session</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Video className="w-3 h-3" /> Video
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MessageSquare className="w-3 h-3" /> Chat
                        </span>
                    </div>
                </div>

                {/* Hover CTA */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button className="w-full btn-icy">
                        View Profile & Book
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        </Link>
    );
}
