/**
 * LoadingSpinner - Reusable loading component with variants
 */

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    fullScreen?: boolean;
    overlay?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
};

export default function LoadingSpinner({
    size = 'md',
    text,
    fullScreen = false,
    overlay = false,
    className = ''
}: LoadingSpinnerProps) {
    const spinner = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Loader2 className={`${sizeClasses[size]} text-cyan-500 animate-spin`} />
            {text && (
                <p className="text-sm text-gray-500 animate-pulse">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
                {spinner}
            </div>
        );
    }

    if (overlay) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-40 rounded-inherit">
                {spinner}
            </div>
        );
    }

    return spinner;
}

/**
 * PageLoader - Full page loading state
 */
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-gray-500 animate-pulse">{text}</p>
            </div>
        </div>
    );
}

/**
 * CardSkeleton - Loading skeleton for cards
 */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
            <div className="space-y-3">
                {Array(lines).fill(0).map((_, i) => (
                    <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: `${100 - i * 15}%` }} />
                ))}
            </div>
        </div>
    );
}

/**
 * TableRowSkeleton - Loading skeleton for table rows
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <tr className="animate-pulse">
            {Array(columns).fill(0).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                </td>
            ))}
        </tr>
    );
}

/**
 * ButtonSpinner - Inline spinner for buttons
 */
export function ButtonSpinner({ className = '' }: { className?: string }) {
    return (
        <Loader2 className={`w-4 h-4 animate-spin ${className}`} />
    );
}
