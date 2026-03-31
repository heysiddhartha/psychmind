/**
 * Loading Skeleton Components
 * Consistent loading states across the application
 */

export function CardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
            </div>
        </div>
    );
}

export function TherapistCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
            <div className="flex flex-wrap gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-20" />
                <div className="h-6 bg-gray-200 rounded-full w-24" />
                <div className="h-6 bg-gray-200 rounded-full w-16" />
            </div>
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <tr className="animate-pulse">
            <td className="px-4 py-4">
                <div className="h-4 bg-gray-200 rounded w-32" />
            </td>
            <td className="px-4 py-4">
                <div className="h-4 bg-gray-200 rounded w-24" />
            </td>
            <td className="px-4 py-4">
                <div className="h-4 bg-gray-200 rounded w-40" />
            </td>
            <td className="px-4 py-4">
                <div className="h-4 bg-gray-200 rounded w-20" />
            </td>
        </tr>
    );
}

export function DashboardStatSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
    );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-100 p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function PageHeaderSkeleton() {
    return (
        <div className="animate-pulse mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                    <div className="h-12 bg-gray-200 rounded-xl w-full" />
                </div>
            ))}
            <div className="h-12 bg-gray-200 rounded-xl w-32" />
        </div>
    );
}

export function CalendarSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-6">
                <div className="h-6 bg-gray-200 rounded w-32" />
                <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
                ))}
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Avatar and name */}
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-48" />
                    <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
            </div>

            {/* Info cards */}
            <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                        <div className="h-5 bg-gray-200 rounded w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MessageListSkeleton() {
    return (
        <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-100 p-4 animate-pulse">
                    <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="h-4 bg-gray-200 rounded w-32" />
                                <div className="h-3 bg-gray-200 rounded w-16" />
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-5/6" />
                            <div className="h-3 bg-gray-200 rounded w-3/4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default {
    CardSkeleton,
    TherapistCardSkeleton,
    TableRowSkeleton,
    DashboardStatSkeleton,
    ListSkeleton,
    PageHeaderSkeleton,
    FormSkeleton,
    CalendarSkeleton,
    ProfileSkeleton,
    MessageListSkeleton,
};
