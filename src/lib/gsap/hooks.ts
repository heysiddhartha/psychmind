import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    textReveal,
    sectionFade,
    cardHover,
    listReveal,
    scrollDefaults,
    getMotionPreference,
    TIMING,
    EASING
} from "./presets";

gsap.registerPlugin(ScrollTrigger);

/**
 * Text reveal animation for headings
 * Animates each word with stagger
 */
export function useTextReveal(
    ref: React.RefObject<HTMLElement>,
    options?: { delay?: number; stagger?: number }
) {
    useEffect(() => {
        if (!ref.current || getMotionPreference()) return;

        const words = ref.current.querySelectorAll(".word");
        if (words.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                words,
                textReveal.from,
                {
                    ...textReveal.to,
                    stagger: options?.stagger ?? textReveal.stagger,
                    delay: options?.delay ?? 0,
                }
            );
        }, ref);

        return () => ctx.revert();
    }, [ref, options?.delay, options?.stagger]);
}

/**
 * Section fade-in on scroll
 */
export function useSectionReveal(
    ref: React.RefObject<HTMLElement>,
    options?: { delay?: number; start?: string }
) {
    useEffect(() => {
        if (!ref.current || getMotionPreference()) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(ref.current, sectionFade.from, {
                ...sectionFade.to,
                delay: options?.delay ?? 0,
                scrollTrigger: {
                    trigger: ref.current,
                    start: options?.start ?? scrollDefaults.start,
                    toggleActions: scrollDefaults.toggleActions,
                },
            });
        }, ref);

        return () => ctx.revert();
    }, [ref, options?.delay, options?.start]);
}

/**
 * Staggered children reveal on scroll
 */
export function useStaggerReveal(
    ref: React.RefObject<HTMLElement>,
    selector: string,
    options?: { stagger?: number; delay?: number }
) {
    useEffect(() => {
        if (!ref.current || getMotionPreference()) return;

        const elements = ref.current.querySelectorAll(selector);
        if (elements.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                elements,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: TIMING.inhale,
                    ease: EASING.gentle,
                    stagger: options?.stagger ?? 0.1,
                    delay: options?.delay ?? 0,
                    scrollTrigger: {
                        trigger: ref.current,
                        start: scrollDefaults.start,
                        toggleActions: scrollDefaults.toggleActions,
                    },
                }
            );
        }, ref);

        return () => ctx.revert();
    }, [ref, selector, options?.stagger, options?.delay]);
}

/**
 * Card hover effect - subtle lift
 */
export function useCardHover(ref: React.RefObject<HTMLElement>) {
    useEffect(() => {
        if (!ref.current || getMotionPreference()) return;

        const card = ref.current;

        const handleEnter = () => {
            gsap.to(card, cardHover.lift);
        };

        const handleLeave = () => {
            gsap.to(card, cardHover.reset);
        };

        card.addEventListener("mouseenter", handleEnter);
        card.addEventListener("mouseleave", handleLeave);

        return () => {
            card.removeEventListener("mouseenter", handleEnter);
            card.removeEventListener("mouseleave", handleLeave);
        };
    }, [ref]);
}

/**
 * List items reveal with stagger
 */
export function useListReveal(
    ref: React.RefObject<HTMLElement>,
    itemSelector: string = "li"
) {
    useEffect(() => {
        if (!ref.current || getMotionPreference()) return;

        const items = ref.current.querySelectorAll(itemSelector);
        if (items.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(items, listReveal.from, {
                ...listReveal.to,
                scrollTrigger: {
                    trigger: ref.current,
                    start: scrollDefaults.start,
                    toggleActions: scrollDefaults.toggleActions,
                },
            });
        }, ref);

        return () => ctx.revert();
    }, [ref, itemSelector]);
}

/**
 * Parallax effect (subtle - only 10-20% movement)
 */
export function useParallax(
    ref: React.RefObject<HTMLElement>,
    speed: number = 0.1
) {
    useEffect(() => {
        if (!ref.current || getMotionPreference()) return;

        const ctx = gsap.context(() => {
            gsap.to(ref.current, {
                y: () => window.innerHeight * speed * -1,
                ease: "none",
                scrollTrigger: {
                    trigger: ref.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            });
        }, ref);

        return () => ctx.revert();
    }, [ref, speed]);
}

/**
 * Image reveal with mask effect
 */
export function useImageReveal(ref: React.RefObject<HTMLElement>) {
    useEffect(() => {
        if (!ref.current || getMotionPreference()) return;

        const mask = ref.current.querySelector(".image-mask");
        const image = ref.current.querySelector("img");

        if (!mask || !image) return;

        const ctx = gsap.context(() => {
            gsap.set(mask, { transformOrigin: "top" });
            gsap.set(image, { scale: 1.2 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: ref.current,
                    start: "top 80%",
                    toggleActions: "play none none none",
                },
            });

            tl.to(mask, { scaleY: 0, duration: TIMING.exhale, ease: EASING.soft })
                .to(image, { scale: 1, duration: TIMING.exhale * 1.2, ease: EASING.natural }, "<");
        }, ref);

        return () => ctx.revert();
    }, [ref]);
}

/**
 * Counter animation
 */
export function useCounter(
    ref: React.RefObject<HTMLElement>,
    endValue: number,
    options?: { duration?: number; suffix?: string }
) {
    useEffect(() => {
        if (!ref.current || getMotionPreference()) {
            if (ref.current) {
                ref.current.textContent = `${endValue}${options?.suffix ?? ""}`;
            }
            return;
        }

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ref.current,
                { textContent: 0 },
                {
                    textContent: endValue,
                    duration: options?.duration ?? 2,
                    ease: EASING.gentle,
                    snap: { textContent: 1 },
                    scrollTrigger: {
                        trigger: ref.current,
                        start: "top 90%",
                        toggleActions: "play none none none",
                    },
                    onUpdate: function () {
                        if (ref.current) {
                            ref.current.textContent =
                                Math.round(Number(ref.current.textContent)) + (options?.suffix ?? "");
                        }
                    },
                }
            );
        }, ref);

        return () => ctx.revert();
    }, [ref, endValue, options?.duration, options?.suffix]);
}

/**
 * Split text into words for animation
 */
export function splitIntoWords(text: string): string {
    return text
        .split(" ")
        .map((word) => `<span class="word inline-block">${word}</span>`)
        .join(" ");
}
