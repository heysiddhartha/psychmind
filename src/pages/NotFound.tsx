/**
 * NotFound - Premium 404 Page
 */

import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <Helmet>
        <title>Page Not Found | 3-3.com Counseling</title>
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          {/* 404 Graphic */}
          <div className="relative mb-8">
            <div className="text-[180px] md:text-[220px] font-bold text-gray-100 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#161A30] to-[#2d3a54] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Search className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off.
            Let's get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild className="btn-icy">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Popular Pages
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: 'Book a Session', href: '/booking' },
                { label: 'Our Therapists', href: '/team' },
                { label: 'Services', href: '/services' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-[#F8FAFC] hover:text-[#161A30] hover:border-[#161A30]/20 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
