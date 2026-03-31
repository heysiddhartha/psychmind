/**
 * E-Books Page - Affiliate Listings
 * Mental health and wellness books with external purchase links
 */

import { Helmet } from 'react-helmet-async';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Star, BookOpen, ShoppingBag, Heart, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { getMotionPreference } from '@/lib/gsap/presets';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// Types
// ==========================================

interface EBook {
    id: string;
    title: string;
    author: string;
    description: string;
    coverImage: string;
    rating: number;
    reviewCount: number;
    price: string;
    category: string;
    purchaseUrl: string;
    featured?: boolean;
}

// ==========================================
// Mock Data
// ==========================================

const ebooks: EBook[] = [
    {
        id: '1',
        title: 'The Body Keeps the Score',
        author: 'Bessel van der Kolk M.D.',
        description: 'Pioneering research on how trauma reshapes the body and brain, and innovative treatments that can help survivors reclaim their lives.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1594559067i/18693771.jpg',
        rating: 4.8,
        reviewCount: 89234,
        price: '$18.99',
        category: 'Trauma & PTSD',
        purchaseUrl: 'https://www.amazon.com/dp/0143127748',
        featured: true
    },
    {
        id: '2',
        title: 'Feeling Good: The New Mood Therapy',
        author: 'David D. Burns M.D.',
        description: 'The clinically proven drug-free treatment for depression. Learn CBT techniques used by therapists worldwide.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327627653i/46674.jpg',
        rating: 4.6,
        reviewCount: 12456,
        price: '$8.99',
        category: 'Depression',
        purchaseUrl: 'https://www.amazon.com/dp/0380810336'
    },
    {
        id: '3',
        title: 'The Anxiety and Phobia Workbook',
        author: 'Edmund J. Bourne Ph.D.',
        description: 'Comprehensive guide with step-by-step exercises to help overcome anxiety, panic attacks, and phobias.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347766466i/330024.jpg',
        rating: 4.5,
        reviewCount: 5678,
        price: '$24.95',
        category: 'Anxiety',
        purchaseUrl: 'https://www.amazon.com/dp/1572248912',
        featured: true
    },
    {
        id: '4',
        title: 'Attached: The New Science of Adult Attachment',
        author: 'Amir Levine & Rachel Heller',
        description: 'Understand your attachment style and learn how it affects your relationships and emotional well-being.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1545854312i/9547888.jpg',
        rating: 4.4,
        reviewCount: 34567,
        price: '$17.00',
        category: 'Relationships',
        purchaseUrl: 'https://www.amazon.com/dp/1585429139'
    },
    {
        id: '5',
        title: 'Mindfulness in Plain English',
        author: 'Bhante Henepola Gunaratana',
        description: 'A classic guide to meditation that has helped millions discover inner peace and clarity.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388292222i/64369.jpg',
        rating: 4.5,
        reviewCount: 8765,
        price: '$15.95',
        category: 'Mindfulness',
        purchaseUrl: 'https://www.amazon.com/dp/0861719069'
    },
    {
        id: '6',
        title: 'Complex PTSD: From Surviving to Thriving',
        author: 'Pete Walker',
        description: 'A groundbreaking book for survivors of complex trauma, offering tools for recovery and self-compassion.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1383944005i/20556323.jpg',
        rating: 4.7,
        reviewCount: 12345,
        price: '$16.95',
        category: 'Trauma & PTSD',
        purchaseUrl: 'https://www.amazon.com/dp/1492871842'
    },
    {
        id: '7',
        title: 'The Gifts of Imperfection',
        author: 'Brené Brown',
        description: 'Let go of who you think you\'re supposed to be and embrace who you are. A guide to wholehearted living.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1516911214i/7015403.jpg',
        rating: 4.5,
        reviewCount: 45678,
        price: '$9.99',
        category: 'Self-Worth',
        purchaseUrl: 'https://www.amazon.com/dp/159285849X'
    },
    {
        id: '8',
        title: 'Why We Sleep',
        author: 'Matthew Walker',
        description: 'Unlock the power of sleep and dreams. Essential reading for understanding mental and physical health.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1556604137i/34466963.jpg',
        rating: 4.6,
        reviewCount: 23456,
        price: '$18.00',
        category: 'Wellness',
        purchaseUrl: 'https://www.amazon.com/dp/1501144324'
    }
];

const categories = ['All', 'Trauma & PTSD', 'Depression', 'Anxiety', 'Relationships', 'Mindfulness', 'Self-Worth', 'Wellness'];

// ==========================================
// Component
// ==========================================

export default function EBooks() {
    const pageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (getMotionPreference()) return;

        const ctx = gsap.context(() => {
            // Header animation
            gsap.fromTo(
                '.ebook-header',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );

            // Category filters
            gsap.fromTo(
                '.category-btn',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.3 }
            );

            // Cards animation
            ScrollTrigger.batch('.ebook-card', {
                start: 'top 85%',
                onEnter: (elements) => {
                    gsap.fromTo(elements,
                        { opacity: 0, y: 40 },
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
                <title>E-Books & Mental Health Resources | 3-3.com</title>
                <meta name="description" content="Curated collection of mental health and wellness books recommended by therapists. Find resources for anxiety, depression, trauma recovery, and personal growth." />
            </Helmet>

            <div ref={pageRef} className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
                {/* Hero Section */}
                <section className="pt-24 pb-12 px-4 lg:px-8">
                    <div className="container mx-auto max-w-6xl">
                        <div className="ebook-header text-center max-w-2xl mx-auto mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-6">
                                <BookOpen className="w-4 h-4" />
                                Therapist Recommended
                            </div>
                            <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
                                Books for Your Journey
                            </h1>
                            <p className="text-lg text-gray-600">
                                Carefully curated mental health and wellness books. Each title is recommended by
                                licensed therapists for their evidence-based approach and therapeutic value.
                            </p>
                        </div>

                        {/* Category Filters */}
                        <div className="flex flex-wrap justify-center gap-2 mb-12">
                            {categories.map((category, idx) => (
                                <button
                                    key={category}
                                    className={`category-btn px-4 py-2 rounded-full text-sm font-medium transition-colors
                                        ${idx === 0
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Books */}
                <section className="pb-16 px-4 lg:px-8">
                    <div className="container mx-auto max-w-6xl">
                        <h2 className="text-2xl font-serif text-gray-900 mb-8 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" />
                            Staff Picks
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8 mb-16">
                            {ebooks.filter(b => b.featured).map(book => (
                                <div key={book.id} className="ebook-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow flex gap-6">
                                    <img
                                        src={book.coverImage}
                                        alt={book.title}
                                        className="w-32 h-48 object-cover rounded-lg shadow-md flex-shrink-0"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-primary mb-2">{book.category}</span>
                                        <h3 className="font-serif text-xl text-gray-900 mb-1">{book.title}</h3>
                                        <p className="text-sm text-gray-500 mb-2">by {book.author}</p>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(book.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500">({book.reviewCount.toLocaleString()})</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{book.description}</p>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-lg font-semibold text-gray-900">{book.price}</span>
                                            <Button
                                                asChild
                                                size="sm"
                                                className="btn-icy"
                                            >
                                                <a href={book.purchaseUrl} target="_blank" rel="noopener noreferrer">
                                                    View on Amazon
                                                    <ExternalLink className="w-3 h-3 ml-1" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* All Books Grid */}
                        <h2 className="text-2xl font-serif text-gray-900 mb-8 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-primary" />
                            All Recommendations
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {ebooks.map(book => (
                                <div key={book.id} className="ebook-card group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                                    <div className="relative aspect-[2/3] overflow-hidden">
                                        <img
                                            src={book.coverImage}
                                            alt={book.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="secondary"
                                                className="w-full"
                                            >
                                                <a href={book.purchaseUrl} target="_blank" rel="noopener noreferrer">
                                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                                    Buy Now
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <span className="text-xs font-medium text-primary">{book.category}</span>
                                        <h3 className="font-medium text-gray-900 mt-1 line-clamp-2">{book.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{book.author}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                <span className="text-sm font-medium">{book.rating}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">{book.price}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Disclaimer */}
                <section className="py-8 px-4 bg-gray-50 border-t border-gray-100">
                    <div className="container mx-auto max-w-4xl text-center">
                        <p className="text-sm text-gray-500">
                            <strong className="text-gray-600">Affiliate Disclosure:</strong> Some links on this page are affiliate links.
                            If you purchase through these links, we may earn a small commission at no extra cost to you.
                            All recommendations are based on therapeutic value, not commercial considerations.
                        </p>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
