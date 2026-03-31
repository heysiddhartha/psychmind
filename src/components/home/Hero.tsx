import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Calendar, Sparkles, Heart } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lottie from 'lottie-react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero Section - Premium Design with Full-Screen Video Background
 * Video plays behind the content with overlay for readability
 */

const emotionalWords = [
  "SEEN...",
  "HEARD...",
  "UNDERSTOOD...",
  "EMPOWERED...",
  "WHOLE...",
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayWord, setDisplayWord] = useState(emotionalWords[0]);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Word rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % emotionalWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Smooth fade transition for word change
  useEffect(() => {
    const wordEl = document.querySelector(".emotional-word");
    if (!wordEl) return;

    gsap.to(wordEl, {
      opacity: 0,
      y: -15,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setDisplayWord(emotionalWords[wordIndex]);
        gsap.fromTo(wordEl,
          { opacity: 0, y: 20, scale: 1.05 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
        );
      },
    });
  }, [wordIndex]);

  // Handle video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        video.muted = true; // Ensure muted for autoplay
        await video.play();
        setVideoLoaded(true);
      } catch {
        console.log("Video autoplay blocked");
        setVideoError(true);
      }
    };

    // Attempt to play when video is ready
    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
      video.addEventListener('loadeddata', () => setVideoLoaded(true), { once: true });
    }

    return () => {
      video.removeEventListener('canplay', playVideo);
    };
  }, []);

  // Initial animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Initial reveal sequence
      tl.fromTo(
        ".hero-badge",
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7 }
      )
        .fromTo(
          ".hero-title-line",
          { opacity: 0, y: 50, rotateX: -15 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.15 },
          "-=0.4"
        )
        .fromTo(
          ".hero-subtitle",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 25, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.12 },
          "-=0.3"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Full-Screen Video Background */}
      <div className="absolute inset-0 z-0">
        {/* Video Element */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => setVideoError(true)}
          poster="/images/hero-poster.jpg"
        >
          <source src="/video.mp4" type="video/mp4" />
          <source src="/video.webm" type="video/webm" />
        </video>

        {/* Fallback Background if Video Fails or Loading */}
        <div className={`absolute inset-0 bg-gradient-to-br from-[#161A30] via-[#1f2640] to-[#0f1419] transition-opacity duration-1000 ${videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'}`}>
          {/* Animated gradient orbs for visual interest when video doesn't load */}
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#2d3a54]/30 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#3d4a64]/25 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Additional gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </div>

      {/* Content Container - Centered */}
      <div className="relative z-20 container mx-auto px-4 lg:px-8 h-full flex flex-col items-center justify-center text-center">

        {/* Floating Animation Badge */}
        <div className="absolute top-20 right-20 hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 animate-pulse">
          <Heart className="w-4 h-4 text-pink-400 fill-pink-400 animate-bounce" />
          <span className="text-white text-sm font-medium">Mental Wellness</span>
        </div>
        {/* Badge with sparkle */}
        <div className="hero-badge mb-6">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium text-white shadow-lg">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Now accepting new clients
          </span>
        </div>

        {/* Main Heading with Animated Word */}
        <div className="space-y-2 mb-6">
          <h1 className="font-serif text-[2.5rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl leading-[1.08] tracking-tight text-white drop-shadow-lg">
            <span className="hero-title-line block">We Help You Feel</span>
            <span className="emotional-word hero-title-line block mt-1 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent font-bold">
              {displayWord}
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className="hero-subtitle space-y-3 mb-8">
          <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
            A welcoming space to explore your thoughts, heal at your
            pace, and feel truly heard.
          </p>
          <p className="text-lg font-medium text-gray-300 italic drop-shadow-md">
            "Self Care isn't selfish"
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="hero-cta group h-14 px-8 text-base font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl hover:shadow-emerald-500/50 border-0 rounded-full transition-all duration-300"
          >
            <Link to="/booking" className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Book a Session
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            size="lg"
            asChild
            className="hero-cta h-14 px-6 text-base font-medium bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 hover:border-white/50 rounded-full transition-all duration-300"
          >
            <a href="tel:+1234567890" className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-white" />
              Speak to Someone
            </a>
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce">
          <div className="w-6 h-10 mx-auto border-2 border-white/30 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
