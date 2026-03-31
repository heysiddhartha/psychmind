import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ShoppingBag, ExternalLink } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Shop & E-Books Preview
 */

const ebooks = [
    {
        title: "Mindfulness for Beginners",
        author: "Dr. Sarah Chen",
        price: 14.99,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=280&fit=crop",
        slug: "mindfulness-beginners",
    },
    {
        title: "Overcoming Anxiety",
        author: "Dr. Michael Ross",
        price: 12.99,
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=280&fit=crop",
        slug: "overcoming-anxiety",
    },
    {
        title: "Building Resilience",
        author: "Dr. Emma Wilson",
        price: 16.99,
        image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=280&fit=crop",
        slug: "building-resilience",
    },
];

const shopItems = [
    {
        title: "Wellness Journal",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=200&h=200&fit=crop",
    },
    {
        title: "Meditation Candle Set",
        price: 34.99,
        image: "https://images.unsplash.com/photo-1602607413529-cc7c13951251?w=200&h=200&fit=crop",
    },
];

export default function ShopPreview() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".shop-header",
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: { trigger: ".shop-header", start: "top 85%" },
                }
            );

            gsap.fromTo(
                ".ebook-card",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: { trigger: ".ebooks-grid", start: "top 85%" },
                }
            );

            gsap.fromTo(
                ".product-card",
                { opacity: 0, scale: 0.95 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.5)",
                    scrollTrigger: { trigger: ".products-grid", start: "top 85%" },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-24 lg:py-32 bg-white">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="shop-header text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
                        Shop & E-Books
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight">
                        Resources to support your
                        <span className="text-gradient-icy"> journey</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Explore our curated collection of e-books and wellness products
                        selected by our therapists.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* E-Books Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-gray-900">Featured E-Books</h3>
                        </div>
                        <div className="ebooks-grid grid sm:grid-cols-3 gap-4">
                            {ebooks.map((book) => (
                                <Link
                                    key={book.slug}
                                    to={`/ebooks/${book.slug}`}
                                    className="ebook-card group block bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                                >
                                    <div className="aspect-[3/4] overflow-hidden">
                                        <img
                                            src={book.image}
                                            alt={book.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-primary transition-colors">
                                            {book.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mb-2">{book.author}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-primary">${book.price}</span>
                                            <ExternalLink className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Link
                            to="/ebooks"
                            className="inline-flex items-center gap-2 text-primary font-semibold mt-6 hover:gap-3 transition-all"
                        >
                            Browse All E-Books
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Shop Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-gray-900">Wellness Shop</h3>
                        </div>
                        <div className="products-grid space-y-4">
                            {shopItems.map((item) => (
                                <div
                                    key={item.title}
                                    className="product-card group flex items-center gap-4 bg-gray-50 rounded-xl p-3 hover:bg-white hover:shadow-md transition-all"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 text-sm group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="font-bold text-primary text-sm">${item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-primary font-semibold mt-6 hover:gap-3 transition-all"
                        >
                            Visit Shop
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
