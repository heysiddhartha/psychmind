/**
 * Personal Stories Page - Client Reviews & Recovery Stories
 * Authentic testimonials and moderated recovery journeys
 */

import { Helmet } from 'react-helmet-async';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote, Heart, MessageCircle, Share2, ChevronRight, PenLine, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { getMotionPreference } from '@/lib/gsap/presets';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// Types
// ==========================================

interface Story {
    id: string;
    initials: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    readTime: number;
    likes: number;
    featured?: boolean;
}

interface Review {
    id: string;
    initials: string;
    name?: string;
    content: string;
    rating: number;
    serviceType: string;
    therapistName?: string;
    date: string;
    verified: boolean;
}

// ==========================================
// Mock Data
// ==========================================

const stories: Story[] = [
    {
        id: '1',
        initials: 'SK',
        title: 'Finding Light After Years of Darkness',
        excerpt: 'I never thought I would be able to talk about my depression. For years, I hid it from everyone...',
        content: 'Full story content here...',
        category: 'Depression',
        readTime: 5,
        likes: 234,
        featured: true
    },
    {
        id: '2',
        initials: 'MR',
        title: 'My Journey Through Anxiety',
        excerpt: 'Panic attacks controlled my life for two years. I missed work, avoided friends, and felt like a prisoner...',
        content: 'Full story content here...',
        category: 'Anxiety',
        readTime: 7,
        likes: 189,
        featured: true
    },
    {
        id: '3',
        initials: 'JL',
        title: 'Rebuilding After Trauma',
        excerpt: 'EMDR therapy changed my life. After years of nightmares and flashbacks, I finally found peace...',
        content: 'Full story content here...',
        category: 'Trauma/PTSD',
        readTime: 8,
        likes: 312
    },
    {
        id: '4',
        initials: 'AK',
        title: 'Saving Our Marriage Together',
        excerpt: 'We were on the brink of divorce when we decided to try couples therapy as a last resort...',
        content: 'Full story content here...',
        category: 'Relationships',
        readTime: 6,
        likes: 156
    },
    {
        id: '5',
        initials: 'TC',
        title: 'Breaking the Cycle of Addiction',
        excerpt: 'Recovery is not a straight line. I relapsed twice before things finally clicked...',
        content: 'Full story content here...',
        category: 'Addiction',
        readTime: 6,
        likes: 287
    }
];

const reviews: Review[] = [
    {
        id: 'r1',
        initials: 'EM',
        name: 'Emily M.',
        content: 'Dr. Chen has been incredible. She creates such a safe, non-judgmental space. For the first time in years, I feel hopeful about my future.',
        rating: 5,
        serviceType: 'Individual Therapy',
        therapistName: 'Dr. Sarah Chen',
        date: '2 weeks ago',
        verified: true
    },
    {
        id: 'r2',
        initials: 'JP',
        name: 'James P.',
        content: 'The couples therapy sessions transformed our communication. We went from constant arguments to actually understanding each other.',
        rating: 5,
        serviceType: 'Couples Therapy',
        therapistName: 'Dr. Michael Brooks',
        date: '1 month ago',
        verified: true
    },
    {
        id: 'r3',
        initials: 'RW',
        content: 'As someone who was skeptical about therapy, I\'m so glad I gave it a chance. The anxiety tools I\'ve learned are life-changing.',
        rating: 5,
        serviceType: 'Individual Therapy',
        date: '3 weeks ago',
        verified: true
    },
    {
        id: 'r4',
        initials: 'LH',
        name: 'Lisa H.',
        content: 'The trauma-informed approach made all the difference. I finally feel safe enough to process things I\'ve carried for years.',
        rating: 5,
        serviceType: 'Trauma Therapy',
        therapistName: 'Maya Roberts',
        date: '2 months ago',
        verified: true
    }
];

const categories = ['All', 'Depression', 'Anxiety', 'Trauma/PTSD', 'Relationships', 'Addiction', 'Grief'];

// ==========================================
// Component
// ==========================================

export default function Stories() {
    const pageRef = useRef<HTMLDivElement>(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

    const filteredStories = stories.filter(s =>
        selectedCategory === 'All' || s.category === selectedCategory
    );

    const toggleLike = (storyId: string) => {
        setLikedStories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(storyId)) {
                newSet.delete(storyId);
            } else {
                newSet.add(storyId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        if (getMotionPreference()) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.stories-header',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );

            ScrollTrigger.batch('.story-card, .review-card', {
                start: 'top 85%',
                onEnter: (elements) => {
                    gsap.fromTo(elements,
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
                    );
                }
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    return (
        <Layout>
            <Helmet>
                <title>Personal Stories & Reviews | 3-3.com</title>
                <meta name="description" content="Read authentic recovery stories and client reviews. Real experiences from people who have walked their own mental health journey." />
            </Helmet>

            <div ref={pageRef} className="min-h-screen bg-white">
                {/* Hero */}
                <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-gray-50 to-white">
                    <div className="container mx-auto max-w-4xl text-center stories-header">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-medium mb-6">
                            <Heart className="w-4 h-4" />
                            Real Stories, Real Healing
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
                            Stories of Hope
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                            Every journey is unique, yet we share common threads of struggle and resilience.
                            These are real stories from people who found their way forward.
                        </p>

                        <Button asChild size="lg" variant="outline" className="group">
                            <Link to="/share-story">
                                <PenLine className="w-4 h-4 mr-2" />
                                Share Your Story
                                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>
                </section>

                {/* Featured Stories */}
                <section className="py-12 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <h2 className="text-2xl font-serif text-gray-900 mb-8">Featured Stories</h2>
                        <div className="grid md:grid-cols-2 gap-8 mb-16">
                            {stories.filter(s => s.featured).map(story => (
                                <div key={story.id} className="story-card bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow group">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white font-semibold text-lg">
                                            {story.initials}
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-primary">{story.category}</span>
                                            <p className="text-sm text-gray-500">{story.readTime} min read</p>
                                        </div>
                                    </div>

                                    <Quote className="w-8 h-8 text-gray-200 mb-4" />

                                    <h3 className="text-xl font-serif text-gray-900 mb-3 group-hover:text-primary transition-colors">
                                        {story.title}
                                    </h3>
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        {story.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => toggleLike(story.id)}
                                                className={`flex items-center gap-1.5 text-sm ${likedStories.has(story.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                                                    } transition-colors`}
                                            >
                                                <Heart className={`w-4 h-4 ${likedStories.has(story.id) ? 'fill-current' : ''}`} />
                                                {story.likes + (likedStories.has(story.id) ? 1 : 0)}
                                            </button>
                                            <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600">
                                                <Share2 className="w-4 h-4" />
                                                Share
                                            </button>
                                        </div>
                                        <Link
                                            to={`/stories/${story.id}`}
                                            className="text-primary font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
                                        >
                                            Read Full Story
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                                        ${selectedCategory === category
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* All Stories Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                            {filteredStories.map(story => (
                                <div key={story.id} className="story-card bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm">
                                            {story.initials}
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-primary">{story.category}</span>
                                            <p className="text-xs text-gray-400">{story.readTime} min</p>
                                        </div>
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{story.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{story.excerpt}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400 flex items-center gap-1">
                                            <Heart className="w-3.5 h-3.5" />
                                            {story.likes}
                                        </span>
                                        <Link to={`/stories/${story.id}`} className="text-primary font-medium">
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Client Reviews */}
                        <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-serif text-gray-900">Client Reviews</h2>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    Verified Reviews
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {reviews.map(review => (
                                    <div key={review.id} className="review-card bg-white rounded-xl p-6 shadow-sm">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                                                {review.initials}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        {review.name || 'Anonymous'}
                                                    </span>
                                                    {review.verified && (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">{review.serviceType}</p>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-4 leading-relaxed">
                                            "{review.content}"
                                        </p>

                                        <div className="flex items-center justify-between text-sm text-gray-400">
                                            {review.therapistName && (
                                                <span>with {review.therapistName}</span>
                                            )}
                                            <span>{review.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 px-4 bg-gradient-to-r from-primary to-cyan-600 text-white">
                    <div className="container mx-auto max-w-4xl text-center">
                        <h2 className="font-serif text-3xl md:text-4xl mb-4">
                            Your Story Matters
                        </h2>
                        <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                            Sharing your experience can help others feel less alone.
                            All submissions are reviewed and kept confidential.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" variant="secondary">
                                <Link to="/share-story">
                                    <PenLine className="w-4 h-4 mr-2" />
                                    Submit Your Story
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                                <Link to="/contact">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Contact Us
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
