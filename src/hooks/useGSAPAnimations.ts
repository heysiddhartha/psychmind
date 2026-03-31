import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Scroll-triggered reveal animation
export function useScrollReveal(options: {
    y?: number;
    x?: number;
    duration?: number;
    delay?: number;
    stagger?: number;
} = {}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const { y = 60, x = 0, duration = 1, delay = 0, stagger = 0.1 } = options;

        // Set initial state
        gsap.set(element.children.length > 0 ? element.children : element, {
            opacity: 0,
            y,
            x,
        });

        // Animate on scroll
        gsap.to(element.children.length > 0 ? element.children : element, {
            opacity: 1,
            y: 0,
            x: 0,
            duration,
            delay,
            stagger,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse',
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [options]);

    return ref;
}

// Text reveal animation (letter by letter)
export function useTextReveal() {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const text = element.textContent || '';
        element.innerHTML = text
            .split('')
            .map(char => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
            .join('');

        gsap.from(element.children, {
            opacity: 0,
            y: 50,
            rotateX: -90,
            stagger: 0.02,
            duration: 0.8,
            ease: 'back.out(2)',
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return ref;
}

// Parallax scrolling effect
export function useParallax(speed: number = 0.5) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        gsap.to(element, {
            yPercent: speed * 100,
            ease: 'none',
            scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [speed]);

    return ref;
}

// Counter animation
export function useCountUp(endValue: number, duration: number = 2) {
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || hasAnimated.current) return;

        const obj = { value: 0 };

        ScrollTrigger.create({
            trigger: element,
            start: 'top 80%',
            onEnter: () => {
                if (hasAnimated.current) return;
                hasAnimated.current = true;

                gsap.to(obj, {
                    value: endValue,
                    duration,
                    ease: 'power2.out',
                    onUpdate: () => {
                        element.textContent = Math.floor(obj.value).toLocaleString();
                    },
                });
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [endValue, duration]);

    return ref;
}

// Staggered list animation
export function useStaggeredList(options: {
    duration?: number;
    stagger?: number;
    y?: number;
} = {}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const { duration = 0.8, stagger = 0.15, y = 40 } = options;
        const children = element.children;

        gsap.set(children, { opacity: 0, y });

        ScrollTrigger.create({
            trigger: element,
            start: 'top 75%',
            onEnter: () => {
                gsap.to(children, {
                    opacity: 1,
                    y: 0,
                    duration,
                    stagger,
                    ease: 'power3.out',
                });
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [options]);

    return ref;
}

// Magnetic button effect
export function useMagneticEffect() {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(element, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const handleMouseLeave = () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)',
            });
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return ref;
}

// Floating animation
export function useFloatingAnimation(intensity: number = 20) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        gsap.to(element, {
            y: intensity,
            duration: 2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
        });

        return () => {
            gsap.killTweensOf(element);
        };
    }, [intensity]);

    return ref;
}

// Image reveal animation
export function useImageReveal() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const image = element.querySelector('img');
        if (!image) return;

        gsap.set(element, { overflow: 'hidden' });
        gsap.set(image, { scale: 1.3 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
            },
        });

        tl.from(element, {
            clipPath: 'inset(100% 0% 0% 0%)',
            duration: 1,
            ease: 'power4.out',
        }).to(image, {
            scale: 1,
            duration: 1.2,
            ease: 'power2.out',
        }, '-=0.8');

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return ref;
}

export { gsap, ScrollTrigger };
