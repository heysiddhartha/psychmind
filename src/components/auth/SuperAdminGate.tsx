/**
 * Super Admin PIN Gate - Security layer for super admin access
 * Requires authenticated super_admin user + correct PIN to access dashboard
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Secure PIN - In production, this should be stored in environment variable or database
const SUPER_ADMIN_PIN = '3tree@2026';
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes lockout

interface SuperAdminGateProps {
    children: React.ReactNode;
}

export default function SuperAdminGate({ children }: SuperAdminGateProps) {
    const { user, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [pinVerified, setPinVerified] = useState(false);
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [dynamicPin, setDynamicPin] = useState(SUPER_ADMIN_PIN);

    // Fetch dynamic PIN
    useEffect(() => {
        const fetchPin = async () => {
            try {
                const { data, error } = await supabase
                    .from('system_settings')
                    .select('value')
                    .eq('category', 'security')
                    .eq('key', 'super_admin_pin')
                    .single();

                if (error) {
                    console.warn('⚠️ Could not fetch PIN from database, using default:', error.message);
                    // If table doesn't exist or policy blocks it, use default PIN
                    setDynamicPin(SUPER_ADMIN_PIN);
                } else if (data?.value) {
                    // Remove quotes if they exist (JSON stored as string often has quotes)
                    const cleanPin = String(data.value).replace(/^"|"$/g, '');
                    setDynamicPin(cleanPin);
                    console.log('✅ Dynamic PIN loaded from database');
                } else {
                    setDynamicPin(SUPER_ADMIN_PIN);
                }
            } catch (error) {
                console.warn('⚠️ Error fetching PIN, using default');
                setDynamicPin(SUPER_ADMIN_PIN);
            }
        };

        if (user?.role === 'super_admin') {
            fetchPin();
        }
    }, [user]);

    // Check for existing lockout on mount
    useEffect(() => {
        const storedLockout = localStorage.getItem('superadmin_lockout');
        if (storedLockout) {
            const lockoutTime = new Date(storedLockout);
            if (lockoutTime > new Date()) {
                setLockoutUntil(lockoutTime);
            } else {
                localStorage.removeItem('superadmin_lockout');
            }
        }

        // Check for session pin verification
        const sessionVerified = sessionStorage.getItem('superadmin_verified');
        if (sessionVerified === 'true' && user?.role === 'super_admin') {
            setPinVerified(true);
        }
    }, [user]);

    // Redirect if not super admin
    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login', { replace: true });
            } else if (user.role !== 'super_admin') {
                toast({
                    title: 'Access Denied',
                    description: 'Super Admin privileges required',
                    variant: 'destructive'
                });
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, loading, navigate, toast]);

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (lockoutUntil && lockoutUntil > new Date()) {
            const remaining = Math.ceil((lockoutUntil.getTime() - Date.now()) / 60000);
            toast({
                title: 'Account Locked',
                description: `Too many failed attempts. Try again in ${remaining} minutes.`,
                variant: 'destructive'
            });
            return;
        }

        setVerifying(true);

        // Simulate verification delay for security
        await new Promise(resolve => setTimeout(resolve, 500));

        if (pin === dynamicPin) {
            setPinVerified(true);
            sessionStorage.setItem('superadmin_verified', 'true');
            setAttempts(0);
            toast({
                title: 'Access Granted',
                description: 'Welcome, Super Admin',
            });
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setPin('');

            if (newAttempts >= MAX_ATTEMPTS) {
                const lockout = new Date(Date.now() + LOCKOUT_DURATION);
                setLockoutUntil(lockout);
                localStorage.setItem('superadmin_lockout', lockout.toISOString());

                toast({
                    title: 'Account Locked',
                    description: 'Too many failed attempts. Locked for 30 minutes.',
                    variant: 'destructive'
                });
            } else {
                toast({
                    title: 'Invalid PIN',
                    description: `${MAX_ATTEMPTS - newAttempts} attempts remaining`,
                    variant: 'destructive'
                });
            }
        }

        setVerifying(false);
    };

    const handleSignOut = async () => {
        sessionStorage.removeItem('superadmin_verified');
        await signOut();
        navigate('/');
    };

    const getRemainingLockoutTime = () => {
        if (!lockoutUntil) return null;
        const remaining = Math.ceil((lockoutUntil.getTime() - Date.now()) / 60000);
        return remaining > 0 ? remaining : null;
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    // If not super_admin role, don't render anything (will be redirected)
    if (!user || user.role !== 'super_admin') {
        return null;
    }

    // If PIN not verified, show PIN entry screen
    if (!pinVerified) {
        const lockoutRemaining = getRemainingLockoutTime();

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="w-full max-w-md mx-4">
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-serif text-white mb-2">Super Admin Access</h1>
                            <p className="text-slate-400 text-sm">
                                Enter your security PIN to continue
                            </p>
                        </div>

                        {/* User Info */}
                        <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
                            <p className="text-slate-300 text-sm">Logged in as:</p>
                            <p className="text-white font-medium">{user.email}</p>
                            <p className="text-cyan-400 text-xs mt-1">Role: Super Admin</p>
                        </div>

                        {/* Lockout Warning */}
                        {lockoutRemaining && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <div>
                                    <p className="text-red-300 font-medium text-sm">Account Locked</p>
                                    <p className="text-red-400/80 text-xs">
                                        Try again in {lockoutRemaining} minute{lockoutRemaining > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* PIN Form */}
                        <form onSubmit={handlePinSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Security PIN</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showPin ? 'text' : 'password'}
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        disabled={!!lockoutRemaining || verifying}
                                        className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all disabled:opacity-50"
                                        placeholder="Enter PIN"
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPin(!showPin)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                    >
                                        {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {attempts > 0 && !lockoutRemaining && (
                                    <p className="text-red-400 text-xs mt-2">
                                        {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts > 1 ? 's' : ''} remaining
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={!pin || !!lockoutRemaining || verifying}
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-xl font-medium shadow-lg"
                            >
                                {verifying ? 'Verifying...' : 'Verify Access'}
                            </Button>
                        </form>

                        {/* Sign Out */}
                        <button
                            onClick={handleSignOut}
                            className="w-full mt-4 py-2 text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>

                    {/* Security Note */}
                    <p className="text-center text-slate-500 text-xs mt-4">
                        This area requires additional security verification
                    </p>
                </div>
            </div>
        );
    }

    // PIN verified - render children (the actual dashboard)
    return <>{children}</>;
}
