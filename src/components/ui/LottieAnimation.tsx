/**
 * Lottie Animation Component
 * Provides reusable Lottie animations for various UI elements across the website
 */

import { useEffect, useRef, useState } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

// Common mental wellness themed animation URLs from LottieFiles
export const ANIMATION_URLS = {
    meditation: 'https://lottie.host/6c9e8978-ce48-4c4a-8e3f-ec26b1c3f02c/SgPH4Qkw2Z.json',
    wellness: 'https://lottie.host/6d4fc0f3-e2f6-4a8a-8f9c-c8b9c3c7d2e1/meditation.json',
    loading: 'https://lottie.host/embed/a4b4c0d0-1234-5678-abcd-ef1234567890/loading.json',
    success: 'https://lottie.host/embed/e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b/success.json',
    heartbeat: 'https://lottie.host/embed/1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d/heartbeat.json',
    brain: 'https://lottie.host/embed/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e/brain.json',
};

interface LottieAnimationProps {
    src?: string;
    animationData?: object;
    loop?: boolean;
    autoplay?: boolean;
    className?: string;
    style?: React.CSSProperties;
    speed?: number;
    onComplete?: () => void;
    onLoopComplete?: () => void;
}

// Fallback animation data for when URL fails
const fallbackAnimation = {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    assets: [],
    layers: [{
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
            o: { a: 0, k: 100 },
            p: { a: 0, k: [50, 50] },
            s: {
                a: 1,
                k: [
                    { t: 0, s: [80, 80], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
                    { t: 30, s: [100, 100], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
                    { t: 60, s: [80, 80] }
                ]
            }
        },
        shapes: [{
            ty: "el",
            s: { a: 0, k: [40, 40] },
            p: { a: 0, k: [0, 0] }
        }, {
            ty: "fl",
            c: { a: 0, k: [0.086, 0.102, 0.188, 1] }
        }]
    }]
};

export default function LottieAnimation({
    src,
    animationData,
    loop = true,
    autoplay = true,
    className = '',
    style,
    speed = 1,
    onComplete,
    onLoopComplete,
}: LottieAnimationProps) {
    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const [data, setData] = useState<object | null>(animationData || null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (src && !animationData) {
            fetch(src)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to load animation');
                    return res.json();
                })
                .then(json => setData(json))
                .catch(() => {
                    setError(true);
                    setData(fallbackAnimation);
                });
        }
    }, [src, animationData]);

    useEffect(() => {
        if (lottieRef.current) {
            lottieRef.current.setSpeed(speed);
        }
    }, [speed]);

    if (!data) {
        return (
            <div className={`flex items-center justify-center ${className}`} style={style}>
                <div className="w-8 h-8 border-2 border-[#161A30] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <Lottie
            lottieRef={lottieRef}
            animationData={data}
            loop={loop}
            autoplay={autoplay}
            className={className}
            style={style}
            onComplete={onComplete}
            onLoopComplete={onLoopComplete}
        />
    );
}

// Pre-built animated icons for common use cases
export function LoadingAnimation({ className = '', size = 48 }: { className?: string; size?: number }) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className="relative"
                style={{ width: size, height: size }}
            >
                {/* Animated pulse rings */}
                <div className="absolute inset-0 bg-[#161A30]/10 rounded-full animate-ping" />
                <div className="absolute inset-2 bg-[#161A30]/20 rounded-full animate-pulse" />
                <div className="absolute inset-4 bg-[#161A30] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    );
}

export function SuccessAnimation({ className = '', size = 64 }: { className?: string; size?: number }) {
    return (
        <div
            className={`flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            <svg viewBox="0 0 52 52" className="w-full h-full">
                <circle
                    className="fill-none stroke-[#161A30] stroke-[3]"
                    cx="26"
                    cy="26"
                    r="24"
                    strokeDasharray="150"
                    strokeDashoffset="0"
                    style={{
                        animation: 'drawCircle 0.6s ease-out forwards'
                    }}
                />
                <path
                    className="fill-none stroke-[#161A30] stroke-[3]"
                    d="M14 27l8 8 16-16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="50"
                    strokeDashoffset="50"
                    style={{
                        animation: 'drawCheck 0.4s 0.3s ease-out forwards'
                    }}
                />
                <style>{`
          @keyframes drawCircle {
            from { stroke-dashoffset: 150; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes drawCheck {
            from { stroke-dashoffset: 50; }
            to { stroke-dashoffset: 0; }
          }
        `}</style>
            </svg>
        </div>
    );
}

export function PulseAnimation({ className = '', color = '#161A30' }: { className?: string; color?: string }) {
    return (
        <div className={`relative ${className}`}>
            <div
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: color }}
            />
            <div
                className="relative w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
            />
        </div>
    );
}

// Floating Animation Wrapper
export function FloatingElement({
    children,
    className = '',
    delay = 0,
    duration = 3
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
}) {
    return (
        <div
            className={className}
            style={{
                animation: `float ${duration}s ease-in-out infinite`,
                animationDelay: `${delay}s`
            }}
        >
            {children}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
        </div>
    );
}
