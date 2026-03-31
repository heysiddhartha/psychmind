import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getBlogPosts, getBlogCategories, BlogPost, BlogCategory } from "@/lib/services/cmsService";

export default function BlogsPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);

        const [postsResult, categoriesResult] = await Promise.all([
            getBlogPosts({ published: true }),
            getBlogCategories(),
        ]);

        if (!postsResult.error) setPosts(postsResult.data);
        if (!categoriesResult.error) setCategories(categoriesResult.data);

        setLoading(false);
    };

    const filteredPosts = posts.filter(post => {
        const matchesCategory = activeCategory === "All" || post.category === activeCategory.toLowerCase().replace(/\s+/g, '-');
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const allCategories = ["All", ...categories.map(c => c.name)];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <>
            <Helmet>
                <title>Blog | psychmind Mental Wellness</title>
                <meta name="description" content="Read our latest articles on mental health, wellness, relationships, and self-care." />
            </Helmet>
            <Layout>
                <section className="min-h-screen bg-gradient-subtle py-20 pt-28">
                    <div className="container mx-auto px-4 lg:px-8">
                        {/* Header */}
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                                Our Blog
                            </span>
                            <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
                                Mental Health Insights
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Expert articles, tips, and resources for your mental wellness journey.
                            </p>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
                            <div className="flex gap-2 flex-wrap justify-center">
                                {allCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                            ? "bg-primary text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredPosts.length === 0 && (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                                <p className="text-gray-500">
                                    {searchQuery
                                        ? "Try a different search term or category"
                                        : "We're working on new content. Check back soon!"}
                                </p>
                            </div>
                        )}

                        {/* Blog Grid */}
                        {!loading && filteredPosts.length > 0 && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPosts.map((post) => (
                                    <article
                                        key={post.id}
                                        className="card-elevated overflow-hidden group hover:shadow-lg transition-all"
                                    >
                                        <div className="aspect-video overflow-hidden bg-gray-100">
                                            {post.cover_image ? (
                                                <img
                                                    src={post.cover_image}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                                    <span className="text-4xl">📝</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-3">
                                                {post.category && (
                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
                                                        {post.category.replace(/-/g, ' ')}
                                                    </span>
                                                )}
                                                <span className="text-gray-400 text-xs">
                                                    {formatDate(post.published_at || post.created_at)}
                                                </span>
                                            </div>
                                            <h2 className="font-serif text-xl text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                {post.title}
                                            </h2>
                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400">{post.read_time_minutes} min read</span>
                                                <Link
                                                    to={`/blogs/${post.slug}`}
                                                    className="inline-flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all"
                                                >
                                                    Read More
                                                    <ArrowRight className="w-4 h-4 ml-1" />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </Layout>
        </>
    );
}
