import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface DotLottieAnimationProps {
    src: string;
    className?: string;
    loop?: boolean;
    autoplay?: boolean;
    speed?: number;
    style?: React.CSSProperties;
}

export default function DotLottieAnimation({
    src,
    className = '',
    loop = true,
    autoplay = true,
    speed = 1,
    style
}: DotLottieAnimationProps) {
    return (
        <div className={className} style={style}>
            <DotLottieReact
                src={src}
                loop={loop}
                autoplay={autoplay}
                speed={speed}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}
