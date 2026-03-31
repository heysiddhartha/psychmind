/**
 * Super Admin Login Page - Dedicated login for super admin access
 * Provides email/password login + PIN verification in a single flow
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, Mail, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Secure PIN - In production, store in environment variable or database
const SUPER_ADMIN_PIN = '3tree@2026';
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

type Step = 'login' | 'pin';

export default function SuperAdminLogin() {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Step management
    const [step, setStep] = useState<Step>('login');

    // Login form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    // PIN form
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [pinLoading, setPinLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);

    // Dynamic PIN from database
    const [dynamicPin, setDynamicPin] = useState(SUPER_ADMIN_PIN);

    // Authenticated user data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);

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

        // Check if already verified this session
        const sessionVerified = sessionStorage.getItem('superadmin_verified');
        if (sessionVerified === 'true') {
            // Redirect to dashboard
            navigate('/super-admin/dashboard', { replace: true });
        }
    }, [navigate]);

    // Fetch dynamic PIN when user is authenticated
    useEffect(() => {
        const fetchPin = async () => {
            try {
                const { data, error } = await supabase
                    .from('system_settings')
                    .select('value')
                    .eq('category', 'security')
                    .eq('key', 'super_admin_pin')
                    .single();

                if (!error && data?.value) {
                    const cleanPin = String(data.value).replace(/^"|"$/g, '');
                    setDynamicPin(cleanPin);
                }
            } catch (error) {
                console.warn('Using default PIN');
            }
        };

        if (authenticatedUser) {
            fetchPin();
        }
    }, [authenticatedUser]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password) {
            toast({
                title: 'Missing Fields',
                description: 'Please enter email and password',
                variant: 'destructive'
            });
            return;
        }

        setLoginLoading(true);

        try {
            // Sign in with Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password
            });

            if (authError) {
                toast({
                    title: 'Login Failed',
                    description: authError.message,
                    variant: 'destructive'
                });
                setLoginLoading(false);
                return;
            }

            if (!authData.user) {
                toast({
                    title: 'Login Failed',
                    description: 'No user found',
                    variant: 'destructive'
                });
                setLoginLoading(false);
                return;
            }

            // Check user role in database
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role, full_name, email')
                .eq('id', authData.user.id)
                .single();

            if (userError || !userData) {
                toast({
                    title: 'Access Denied',
                    description: 'Could not verify user permissions',
                    variant: 'destructive'
                });
                await supabase.auth.signOut();
                setLoginLoading(false);
                return;
            }

            if (userData.role !== 'super_admin') {
                toast({
                    title: 'Access Denied',
                    description: 'Super Admin privileges required. Your role: ' + userData.role,
                    variant: 'destructive'
                });
                await supabase.auth.signOut();
                setLoginLoading(false);
                return;
            }

            // User is super_admin, proceed to PIN step
            setAuthenticatedUser({ ...authData.user, ...userData });
            setStep('pin');
            toast({
                title: 'Login Successful',
                description: 'Please enter your security PIN',
            });

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setLoginLoading(false);
        }
    };

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

        setPinLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (pin === dynamicPin) {
            sessionStorage.setItem('superadmin_verified', 'true');
            setAttempts(0);
            toast({
                title: 'Access Granted',
                description: 'Welcome, Super Admin',
            });
            // Redirect to actual dashboard
            navigate('/super-admin/dashboard', { replace: true });
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setPin('');

            if (newAttempts >= MAX_ATTEMPTS) {
                const lockout = new Date(Date.now() + LOCKOUT_DURATION);
                setLockoutUntil(lockout);
                localStorage.setItem('superadmin_lockout', lockout.toISOString());
                await supabase.auth.signOut();

                toast({
                    title: 'Account Locked',
                    description: 'Too many failed attempts. Locked for 30 minutes.',
                    variant: 'destructive'
                });
                setStep('login');
                setAuthenticatedUser(null);
            } else {
                toast({
                    title: 'Invalid PIN',
                    description: `${MAX_ATTEMPTS - newAttempts} attempts remaining`,
                    variant: 'destructive'
                });
            }
        }

        setPinLoading(false);
    };

    const handleBack = async () => {
        await supabase.auth.signOut();
        setStep('login');
        setAuthenticatedUser(null);
        setPin('');
        setPassword('');
    };

    const getRemainingLockoutTime = () => {
        if (!lockoutUntil) return null;
        const remaining = Math.ceil((lockoutUntil.getTime() - Date.now()) / 60000);
        return remaining > 0 ? remaining : null;
    };

    const lockoutRemaining = getRemainingLockoutTime();

    return (
        <>
            <Helmet><title>Super Admin Login | The 3 Tree</title></Helmet>

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-serif text-white mb-2">Super Admin Access</h1>
                            <p className="text-slate-400 text-sm">
                                {step === 'login'
                                    ? 'Sign in with your admin credentials'
                                    : 'Enter your security PIN to continue'
                                }
                            </p>
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

                        {/* Step 1: Login Form */}
                        {step === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loginLoading || !!lockoutRemaining}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all disabled:opacity-50"
                                            placeholder="admin@example.com"
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Password</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loginLoading || !!lockoutRemaining}
                                            className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all disabled:opacity-50"
                                            placeholder="Enter password"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!email || !password || loginLoading || !!lockoutRemaining}
                                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/20 mt-6"
                                >
                                    {loginLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Signing In...</>
                                    ) : (
                                        <>Continue <ArrowRight className="w-5 h-5 ml-2" /></>
                                    )}
                                </Button>
                            </form>
                        )}

                        {/* Step 2: PIN Form */}
                        {step === 'pin' && (
                            <>
                                {/* User Info */}
                                <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
                                    <p className="text-slate-300 text-sm">Logged in as:</p>
                                    <p className="text-white font-medium">{authenticatedUser?.email}</p>
                                    <p className="text-cyan-400 text-xs mt-1">Role: Super Admin</p>
                                </div>

                                <form onSubmit={handlePinSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Security PIN</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input
                                                type={showPin ? 'text' : 'password'}
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value)}
                                                disabled={pinLoading || !!lockoutRemaining}
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
                                        disabled={!pin || pinLoading || !!lockoutRemaining}
                                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/20"
                                    >
                                        {pinLoading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Verifying...</>
                                        ) : (
                                            'Verify Access'
                                        )}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors"
                                    >
                                        ← Back to Login
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Security Note */}
                    <p className="text-center text-slate-500 text-xs mt-4">
                        This area requires administrator credentials
                    </p>
                </div>
            </div>
        </>
    );
}
