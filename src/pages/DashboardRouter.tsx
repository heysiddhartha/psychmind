/**
 * DashboardRouter - Routes users to appropriate dashboard based on role
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Import all dashboard components
import PatientDashboard from './dashboard/PatientDashboard';
import TherapistDashboard from './dashboard/TherapistDashboardNew';
import AdminDashboard from './dashboard/AdminDashboard';
import SuperAdminDashboard from './dashboard/SuperAdminDashboard';

export default function DashboardRouter() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect to login
    }

    // Route based on user role
    switch (user.role) {
        case 'therapist':
            return <TherapistDashboard />;
        case 'admin':
            return <AdminDashboard />;
        case 'super_admin':
            // Redirect super admins to the dedicated super admin login/dashboard
            navigate('/super-admin', { replace: true });
            return null;
        case 'client':
        default:
            return <PatientDashboard />;
    }
}
