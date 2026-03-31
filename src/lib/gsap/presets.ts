/**
 * GSAP Animation Presets - Therapeutic Timing System
 * 
 * Philosophy: Animations should feel like breathing - 
 * gentle, rhythmic, calming. No jarring movements.
 * 
 * Every animation is designed to reduce cognitive load
 * and create emotional safety for therapy platform users.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// TIMING CONSTANTS
// ==========================================

export const TIMING = {
    // Core timing based on breathing rhythm (4-7-8 technique)
    breath: 1.0,        // Core timing unit
    inhale: 0.8,        // Slightly faster in (anticipation)
    exhale: 1.2,        // Slower out (release)
    hold: 0.4,          // Brief hold between actions
    pause: 0.3,         // Micro-pause
    stagger: 0.08,      // Between sequential elements
    staggerSlow: 0.12,  // Slower stagger for emphasis
    staggerFast: 0.05,  // Quick stagger for lists

    // Page transitions
    pageOut: 0.35,
    pageIn: 0.5,

    // Micro-interactions
    hover: 0.25,
    click: 0.15,
    focus: 0.2,
} as const;

// ==========================================
// EASING CURVES
// ==========================================

export const EASING = {
    // Primary easings (always soft, never jarring)
    gentle: 'power2.out',
    soft: 'power3.out',
    natural: 'sine.out',

    // Directional
    enter: 'power2.out',
    exit: 'power2.in',
    inOut: 'power2.inOut',

    // Special (use sparingly)
    subtle: 'sine.inOut',
    anticipate: 'power3.in',
    settle: 'back.out(1.2)',

    // NEVER use these for therapy platform
    // elastic: 'elastic.out(1, 0.3)', // Too bouncy
    // bounce: 'bounce.out', // Too playful
} as const;

// ==========================================
// TEXT ANIMATIONS
// ==========================================

export const textReveal = {
    from: {
        opacity: 0,
        y: 40,
        skewY: 2,
    },
    to: {
        opacity: 1,
        y: 0,
        skewY: 0,
        duration: TIMING.breath,
        ease: EASING.soft,
    },
    stagger: TIMING.stagger,
};

// Hero text - slower, more dramatic
export const heroTextReveal = {
    from: {
        opacity: 0,
        y: 60,
    },
    to: {
        opacity: 1,
        y: 0,
        duration: TIMING.exhale,
        ease: EASING.soft,
    },
    stagger: {
        amount: 0.6,
        from: 'start',
    },
};

// Subtitle/body text
export const subtitleReveal = {
    from: {
        opacity: 0,
        y: 20,
    },
    to: {
        opacity: 1,
        y: 0,
        duration: TIMING.inhale,
        ease: EASING.gentle,
        delay: 0.3,
    },
};

// Word-by-word reveal
export const wordReveal = {
    from: { opacity: 0, y: 30 },
    to: {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: EASING.soft,
    },
    stagger: 0.04,
};

// ==========================================
// SECTION ANIMATIONS
// ==========================================

export const sectionFade = {
    from: {
        opacity: 0,
        y: 30,
    },
    to: {
        opacity: 1,
        y: 0,
        duration: TIMING.inhale,
        ease: EASING.gentle,
    },
    scrollTrigger: {
        start: 'top 85%',
        toggleActions: 'play none none none',
    },
};

export const sectionSlideUp = {
    from: {
        opacity: 0,
        y: 50,
    },
    to: {
        opacity: 1,
        y: 0,
        duration: TIMING.breath,
        ease: EASING.soft,
    },
};

export const sectionSlideIn = {
    left: {
        from: { opacity: 0, x: -40 },
        to: { opacity: 1, x: 0, duration: TIMING.breath, ease: EASING.gentle },
    },
    right: {
        from: { opacity: 0, x: 40 },
        to: { opacity: 1, x: 0, duration: TIMING.breath, ease: EASING.gentle },
    },
};

// ==========================================
// CARD ANIMATIONS
// ==========================================

export const cardHover = {
    lift: {
        y: -6,
        duration: TIMING.hover,
        ease: EASING.gentle,
    },
    reset: {
        y: 0,
        duration: 0.4,
        ease: EASING.settle,
    },
    shadow: {
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.12)',
    },
};

export const cardReveal = {
    from: {
        opacity: 0,
        y: 30,
        scale: 0.98,
    },
    to: {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: TIMING.inhale,
        ease: EASING.gentle,
    },
    stagger: TIMING.staggerSlow,
};

// ==========================================
// IMAGE ANIMATIONS
// ==========================================

export const imageReveal = {
    mask: {
        from: { scaleY: 1 },
        to: { scaleY: 0, duration: TIMING.exhale, ease: EASING.soft },
    },
    image: {
        from: { scale: 1.2 },
        to: { scale: 1, duration: TIMING.exhale * 1.2, ease: EASING.natural },
    },
};

export const imageFade = {
    from: { opacity: 0, scale: 1.05 },
    to: {
        opacity: 1,
        scale: 1,
        duration: TIMING.breath,
        ease: EASING.gentle,
    },
};

// ==========================================
// BUTTON ANIMATIONS
// ==========================================

export const buttonHover = {
    scale: 1.02,
    duration: TIMING.hover,
    ease: EASING.gentle,
};

export const buttonPress = {
    scale: 0.98,
    duration: TIMING.click,
    ease: EASING.gentle,
};

export const buttonPulse = {
    scale: [1, 1.02, 1],
    duration: 2,
    repeat: -1,
    ease: EASING.subtle,
};

// ==========================================
// PAGE TRANSITIONS
// ==========================================

export const pageTransition = {
    exit: {
        opacity: 0,
        y: -15,
        duration: TIMING.pageOut,
        ease: EASING.exit,
    },
    enter: {
        opacity: 1,
        y: 0,
        duration: TIMING.pageIn,
        ease: EASING.enter,
        delay: 0.15,
    },
};

// ==========================================
// MODAL ANIMATIONS
// ==========================================

export const modalOverlay = {
    enter: {
        from: { opacity: 0 },
        to: { opacity: 1, duration: TIMING.inhale, ease: EASING.gentle },
    },
    exit: {
        to: { opacity: 0, duration: TIMING.pause, ease: EASING.exit },
    },
};

export const modalContent = {
    enter: {
        from: { opacity: 0, y: 30, scale: 0.95 },
        to: {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: TIMING.inhale,
            ease: EASING.settle,
        },
    },
    exit: {
        to: {
            opacity: 0,
            y: 20,
            scale: 0.98,
            duration: TIMING.pause,
            ease: EASING.exit,
        },
    },
};

// ==========================================
// LIST ANIMATIONS
// ==========================================

export const listReveal = {
    from: {
        opacity: 0,
        x: -20,
    },
    to: {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: EASING.gentle,
        stagger: 0.1,
    },
};

export const gridReveal = {
    from: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
    to: {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: TIMING.inhale,
        ease: EASING.gentle,
    },
    stagger: {
        amount: 0.4,
        grid: 'auto',
        from: 'start',
    },
};

// ==========================================
// NOTIFICATION ANIMATIONS
// ==========================================

export const toastEnter = {
    from: { opacity: 0, y: -20, scale: 0.9 },
    to: {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: TIMING.inhale,
        ease: EASING.settle,
    },
};

export const toastExit = {
    to: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: TIMING.pause,
        ease: EASING.exit,
    },
};

// ==========================================
// SCROLL TRIGGER DEFAULTS
// ==========================================

export const scrollDefaults = {
    start: 'top 85%',
    end: 'bottom 20%',
    toggleActions: 'play none none none',
    markers: false,
};

export const scrollParallax = {
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Check if user prefers reduced motion
 */
export const getMotionPreference = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation config respecting motion preferences
 */
export const getAnimationConfig = <T extends Record<string, unknown>>(
    config: T
): T | { duration: 0 } => {
    if (getMotionPreference()) {
        return { duration: 0 } as T;
    }
    return config;
};

/**
 * Wrap GSAP animation with reduced motion check
 */
export const safeAnimate = (
    target: gsap.TweenTarget,
    vars: gsap.TweenVars
): gsap.core.Tween | null => {
    if (getMotionPreference()) {
        gsap.set(target, { ...vars, duration: 0 });
        return null;
    }
    return gsap.to(target, vars);
};

/**
 * Create scroll-triggered animation with reduced motion support
 */
export const createScrollAnimation = (
    target: gsap.TweenTarget,
    fromVars: gsap.TweenVars,
    toVars: gsap.TweenVars,
    scrollConfig?: ScrollTrigger.Vars
): gsap.core.Tween | null => {
    if (getMotionPreference()) {
        gsap.set(target, toVars);
        return null;
    }

    return gsap.fromTo(target, fromVars, {
        ...toVars,
        scrollTrigger: {
            trigger: target as gsap.DOMTarget,
            ...scrollDefaults,
            ...scrollConfig,
        },
    });
};

/**
 * Stagger children with proper timing
 */
export const staggerChildren = (
    parent: string | Element,
    childSelector: string,
    animation: { from: gsap.TweenVars; to: gsap.TweenVars },
    staggerAmount: number = TIMING.stagger
): gsap.core.Tween | null => {
    if (getMotionPreference()) return null;

    return gsap.fromTo(
        `${parent} ${childSelector}`,
        animation.from,
        {
            ...animation.to,
            stagger: staggerAmount,
        }
    );
};

// ==========================================
// TIMELINE PRESETS
// ==========================================

/**
 * Create a therapeutic page entrance timeline
 */
export const createPageEntranceTimeline = (): gsap.core.Timeline => {
    const tl = gsap.timeline({ defaults: { ease: EASING.gentle } });

    if (getMotionPreference()) {
        return tl;
    }

    return tl;
};

/**
 * Create a section reveal timeline
 */
export const createSectionTimeline = (
    container: string | Element
): gsap.core.Timeline => {
    const tl = gsap.timeline({
        defaults: { ease: EASING.gentle },
        scrollTrigger: {
            trigger: container,
            ...scrollDefaults,
        },
    });

    if (getMotionPreference()) {
        return tl;
    }

    return tl;
};

export default {
    TIMING,
    EASING,
    textReveal,
    heroTextReveal,
    subtitleReveal,
    wordReveal,
    sectionFade,
    sectionSlideUp,
    sectionSlideIn,
    cardHover,
    cardReveal,
    imageReveal,
    imageFade,
    buttonHover,
    buttonPress,
    buttonPulse,
    pageTransition,
    modalOverlay,
    modalContent,
    listReveal,
    gridReveal,
    toastEnter,
    toastExit,
    scrollDefaults,
    scrollParallax,
    getMotionPreference,
    getAnimationConfig,
    safeAnimate,
    createScrollAnimation,
    staggerChildren,
    createPageEntranceTimeline,
    createSectionTimeline,
};
