import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, ChevronRight, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { gsap } from "gsap";
import NotificationBell from "@/components/ui/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Home", href: "/" },
  {
    name: "About",
    href: "/about",
    children: [
      { name: "Our Story & Vision", href: "/our-story" },
      { name: "Meet The Team", href: "/team" },
      { name: "Join The Team", href: "/join-team" },
      { name: "Contact Us", href: "/contact" },
    ],
  },
  {
    name: "Services",
    href: "/services",
    children: [
      { name: "Specialities", href: "/specialities" },
      { name: "Counselling Types", href: "/counselling-types" },
      { name: "Counselling Modes", href: "/counselling-modes" },
      {
        name: "Support We Offer",
        href: "/services",
        children: [
          { name: "Supervision For Therapists", href: "/supervision-therapists" },
          { name: "Support For Businesses", href: "/support-businesses" },
          { name: "Support For Schools & Institutions", href: "/support-schools" },
          { name: "Support Workshops", href: "/support-workshops" },
        ],
      },
    ],
  },
  {
    name: "Resources",
    href: "/resources",
    children: [
      { name: "Assessments", href: "/assessments" },
      { name: "Downloadable Guides", href: "/guides" },
    ],
  },
  { name: "Blogs", href: "/topics" },
  { name: "Shop", href: "/shop" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const { user, signOut, loading } = useAuth();

  const isActive = (href: string) => location.pathname === href;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ease-out ${scrolled
        ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/50 border-b border-gray-100/80"
        : "bg-white shadow-sm"
        }`}
    >
      <nav className="container mx-auto flex items-center justify-between py-3 px-4 lg:px-8">
        {/* Logo - Using actual logo file */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="The 3 Tree Logo"
            className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Fallback to tree emoji if image fails
              e.currentTarget.outerHTML = '<div class="w-12 h-12 flex items-center justify-center text-4xl">🌳</div>';
            }}
          />
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold text-[#161A30] tracking-tight group-hover:text-[#2d3a54] transition-colors">
              psychmind
            </span>
            <span className="text-[10px] text-gray-600 tracking-wider uppercase -mt-0.5 font-medium">
              Mental Wellness
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navigation.map((item) =>
            item.children ? (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`text-base font-medium gap-1 hover:text-primary hover:bg-primary/10 data-[state=open]:bg-primary/10 data-[state=open]:text-primary transition-all ${isActive(item.href) ? "text-primary" : "text-gray-700"
                      }`}
                  >
                    {item.name}
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-64 p-2 bg-white/95 backdrop-blur-xl shadow-xl border border-gray-100 rounded-2xl"
                  sideOffset={12}
                >
                  {item.children.map((child) =>
                    child.children ? (
                      <DropdownMenuSub key={child.name}>
                        <DropdownMenuSubTrigger
                          className="flex items-center justify-between w-full p-3 text-sm font-medium rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer data-[state=open]:bg-primary/10 data-[state=open]:text-primary"
                          onClick={(event) => {
                            event.preventDefault();
                            navigate(child.href);
                          }}
                        >
                          {child.name}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-64 p-2 bg-white/95 backdrop-blur-xl shadow-xl border border-gray-100 rounded-2xl">
                          {child.children.map((subChild) => (
                            <DropdownMenuItem key={subChild.name} asChild className="p-0 mb-1">
                              <Link
                                to={subChild.href}
                                className={`block p-3 text-sm font-medium rounded-xl hover:bg-primary/10 transition-colors hover:text-primary ${isActive(subChild.href) ? "text-primary bg-primary/10" : "text-gray-600"
                                  }`}
                              >
                                {subChild.name}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    ) : (
                      <DropdownMenuItem key={child.name} asChild className="p-0 mb-1">
                        <Link
                          to={child.href}
                          className={`block p-3 text-sm font-medium rounded-xl hover:bg-primary/5 transition-colors hover:text-primary ${isActive(child.href) ? "text-primary bg-primary/5" : "text-gray-600"
                            }`}
                        >
                          {child.name}
                        </Link>
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                key={item.name}
                variant="ghost"
                asChild
                className={`text-base font-medium hover:text-primary hover:bg-primary/5 transition-all ${isActive(item.href) ? "text-primary" : "text-gray-700"
                  }`}
              >
                <Link to={item.href}>{item.name}</Link>
              </Button>
            )
          )}
        </div>

        {/* Auth Buttons - Always Visible */}
        <div className="hidden lg:flex items-center gap-3">
          {loading ? (
            <div className="w-10 h-10 bg-gray-100 animate-pulse rounded-full" />
          ) : user ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <NotificationBell />

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-primary/5 border border-gray-100"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/logo.png';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#161A30] to-[#2d3a54] flex items-center justify-center text-white font-medium text-sm">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden xl:block">
                      {user.full_name?.split(' ')[0] || "User"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 bg-white shadow-xl rounded-2xl border border-gray-100">
                  <div className="px-3 py-2 border-b border-gray-100 mb-2">
                    <p className="font-medium text-gray-900 truncate">{user.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild className="p-0">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-primary/5 hover:text-primary"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="p-0">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-primary/5 hover:text-primary"
                    >
                      <User className="h-4 w-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-3 p-3 text-sm font-medium rounded-xl hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5"
              >
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild variant="premium" size="default" className="text-sm px-6">
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-primary/5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      <div className={`lg:hidden bg-white border-t border-gray-100 shadow-xl transition-all duration-400 ease-out overflow-hidden ${mobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="container mx-auto py-4 px-4 space-y-2 max-h-[80vh] overflow-y-auto">
          {navigation.map((item) => (
            <div key={item.name}>
              <Link
                to={item.href}
                className={`block py-3 px-4 text-base font-medium rounded-xl transition-colors ${isActive(item.href)
                  ? "text-primary bg-primary/5"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
              {item.children && (
                <div className="pl-4 space-y-1 mt-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      to={child.href}
                      className={`block py-2 px-4 text-sm rounded-lg ${isActive(child.href)
                        ? "text-primary bg-primary/5"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Mobile Auth */}
          <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 py-3 px-4 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full py-3 px-4 text-base font-medium text-red-600 rounded-xl hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-3 px-4 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block py-3 px-4 text-base font-medium text-white bg-gradient-icy rounded-xl text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
