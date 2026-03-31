/**
 * TEMPORARY TEST FILE
 * This file just imports the Lottie component to ensure it compiles
 */

import LottieAnimation, { LoadingAnimation } from '@/components/ui/LottieAnimation';

export function TestLottie() {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Lottie Animation Test</h2>
            <LoadingAnimation size={100} />
        </div>
    );
}
