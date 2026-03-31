import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart
} from "lucide-react";

const footerLinks = {
  services: [
    { name: "Individual Therapy", href: "/services#individual" },
    { name: "Couple Therapy", href: "/services#couple" },
    { name: "Group Therapy", href: "/services#group" },
    { name: "Psychiatric Care", href: "/services#psychiatric" },
    { name: "Holistic Coaching", href: "/services#holistic" },
  ],
  resources: [
    { name: "Assessments", href: "/assessments" },
    { name: "Mental Health A-Z", href: "/topics" },
    { name: "Downloadable Guides", href: "/guides" },
    { name: "Blog Articles", href: "/blogs" },
    { name: "FAQs", href: "/faqs" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Team", href: "/team" },
    { name: "Careers", href: "/join-team" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img
                src="/psychmind.png"
                alt="3-3.com Logo"
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              Your trusted partner in mental wellness. We provide compassionate,
              professional therapy services to help you live your best life.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:support@psychmind.com"
                className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
                support@psychmind.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors"
              >
                <Phone className="w-5 h-5" />
                +1 (234) 567-890
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>123 Wellness Street, Mental Health City, MH 12345</span>
              </div>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-semibold text-white mb-5">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-white mb-5">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-5">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-gray-500 text-sm flex items-center gap-1">
              © {new Date().getFullYear()} SiddharthaSarkar Made for
              for mental wellness.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gradient-to-br hover:from-cyan-500 hover:to-blue-600 hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Notice */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-400">
            <strong className="text-yellow-400">Crisis Support:</strong> If you're in immediate danger,
            please call emergency services or your local crisis hotline.
            <a href="tel:988" className="text-primary ml-1 hover:underline">
              National Suicide Prevention Lifeline: 988
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
