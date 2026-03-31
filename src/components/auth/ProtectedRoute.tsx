/* eslint-disable react-refresh/only-export-components */
import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/supabase';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: UserRole[];
    requireAuth?: boolean;
    redirectTo?: string;
}

export default function ProtectedRoute({
    children,
    allowedRoles,
    requireAuth = true,
    redirectTo = '/login',
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (loading) return;

        // Check if authentication is required
        if (requireAuth && !user) {
            navigate(redirectTo, {
                replace: true,
                state: { from: location.pathname },
            });
            return;
        }

        // Check if user has allowed role
        if (user && allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(user.role)) {
                // Redirect to appropriate dashboard based on role
                const dashboardRoutes: Record<UserRole, string> = {
                    client: '/dashboard/patient',
                    therapist: '/dashboard/therapist',
                    admin: '/dashboard/admin',
                    super_admin: '/super-admin',
                };
                navigate(dashboardRoutes[user.role] || '/dashboard', { replace: true });
            }
        }
    }, [user, loading, allowedRoles, requireAuth, navigate, location, redirectTo]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Check access
    if (requireAuth && !user) {
        return null;
    }

    if (user && allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}

// Helper HOC for wrapping pages
export function withProtection<P extends object>(
    Component: React.ComponentType<P>,
    options: Omit<ProtectedRouteProps, 'children'>
) {
    return function ProtectedComponent(props: P) {
        return (
            <ProtectedRoute {...options}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
}
