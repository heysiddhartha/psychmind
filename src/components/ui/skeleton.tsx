// Skeleton Loaders - Loading state placeholders
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-pulse bg-gray-200 rounded", className)} {...props} />
  );
}

// Card skeleton
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full mb-2" />
      ))}
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Dashboard stats skeleton
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
          <Skeleton className="w-10 h-10 rounded-lg mb-3" />
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// List item skeleton
export function ListItemSkeleton() {
  return (
    <div className="p-4 border-b flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-16 h-6 rounded-full" />
    </div>
  );
}

// Avatar skeleton
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  return <Skeleton className={`${sizes[size]} rounded-full`} />;
}

// Text skeleton
export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 mb-2 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

// Chat message skeleton
export function MessageSkeleton({ align = 'left' }: { align?: 'left' | 'right' }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'} mb-4`}>
      {align === 'left' && <Skeleton className="w-8 h-8 rounded-full mr-2" />}
      <div className={`max-w-[60%] ${align === 'right' ? 'bg-cyan-100' : 'bg-gray-100'} rounded-2xl p-3`}>
        <Skeleton className="h-3 w-32 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
      {align === 'right' && <Skeleton className="w-8 h-8 rounded-full ml-2" />}
    </div>
  );
}

// Session card skeleton
export function SessionCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-20 h-6 rounded-full" />
        <Skeleton className="w-16 h-5" />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
    </div>
  );
}

// Full page loading skeleton
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>

      {/* Stats */}
      <StatsSkeleton />

      {/* Content */}
      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CardSkeleton lines={5} />
        </div>
        <div>
          <CardSkeleton lines={3} />
        </div>
      </div>
    </div>
  );
}

export default {
  Skeleton,
  CardSkeleton,
  TableRowSkeleton,
  StatsSkeleton,
  ListItemSkeleton,
  AvatarSkeleton,
  TextSkeleton,
  MessageSkeleton,
  SessionCardSkeleton,
  PageSkeleton
};
