import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, User } from '@/lib/supabase';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string>('');
    const timeoutRef = useRef<number | undefined>(undefined);

    const ensureUserProfileExists = async (authUserId: string) => {
        const { data: authUserData } = await supabase.auth.getUser();
        const metadata = authUserData.user?.user_metadata || {};
        const defaultName = metadata.full_name || metadata.name || authUserData.user?.email?.split('@')[0] || 'User';
        const defaultRole = (metadata.role as User['role']) || 'client';

        const { error: upsertError } = await supabase
            .from('users')
            .upsert({
                id: authUserId,
                email: authUserData.user?.email,
                full_name: defaultName,
                avatar_url: metadata.avatar_url || metadata.picture || null,
                phone: metadata.phone || null,
                role: defaultRole,
                is_active: true,
                is_profile_complete: false,
            }, { onConflict: 'id' });

        if (upsertError) {
            console.error('Auth callback profile upsert error:', upsertError);
        }
    };

    const handleCallback = useCallback(async () => {
        setStatus('loading');
        setError(null);

        try {
            const currentUrl = window.location.href;
            console.log('🔄 Auth callback processing URL:', currentUrl);
            setDebugInfo(`Processing authentication...`);

            // Check for error in URL params first
            const errorParam = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');
            if (errorParam) {
                console.error('❌ Auth error in URL:', errorParam, errorDescription);
                throw new Error(errorDescription || errorParam);
            }

            // First check if we already have a session
            console.log('🔍 Checking for existing session...');
            const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('⚠️ Session check error:', sessionError);
                // Don't throw yet, continue to try other methods
            }

            // If we have a valid session, use it immediately
            if (existingSession?.user) {
                console.log('✅ Found existing session for user:', existingSession.user.id);
                await processAuthenticatedUser(existingSession.user.id);
                return;
            }

            // If no session, check for code parameter
            const code = searchParams.get('code');
            if (code) {
                console.log('🔑 Found auth code, exchanging for session...');
                setDebugInfo('Exchanging authentication code...');

                const { data: { session: newSession }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

                if (exchangeError) {
                    console.error('❌ Code exchange error:', exchangeError);

                    // Check if session was created despite error
                    const { data: { session: retrySession } } = await supabase.auth.getSession();
                    if (retrySession?.user) {
                        console.log('✅ Session found despite exchange error');
                        await processAuthenticatedUser(retrySession.user.id);
                        return;
                    }

                    throw new Error(exchangeError.message);
                }

                if (newSession?.user) {
                    console.log('✅ Session created from code exchange');
                    await processAuthenticatedUser(newSession.user.id);
                    return;
                }
            }

            // If still no session, wait for auth state change
            console.log('⏳ Waiting for auth state change...');
            setDebugInfo('Waiting for authentication to complete...');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let authSubscription: any = null;
            let resolved = false;

            const authPromise = new Promise<void>((resolve, reject) => {
                authSubscription = supabase.auth.onAuthStateChange(async (event, newSession) => {
                    console.log('📢 Auth state change:', event);

                    if (resolved) return; // Already handled

                    if (event === 'SIGNED_IN' && newSession?.user) {
                        resolved = true;
                        authSubscription?.data?.subscription?.unsubscribe();
                        try {
                            await processAuthenticatedUser(newSession.user.id);
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    }
                });

                // Extended timeout - 15 seconds instead of 6
                setTimeout(async () => {
                    if (resolved) return;
                    resolved = true;
                    authSubscription?.data?.subscription?.unsubscribe();

                    // Final check for session
                    const { data: { session: finalSession } } = await supabase.auth.getSession();
                    if (finalSession?.user) {
                        console.log('✅ Session found in final check');
                        processAuthenticatedUser(finalSession.user.id).then(resolve).catch(reject);
                    } else {
                        reject(new Error('Authentication timed out. Please try logging in again.'));
                    }
                }, 15000);
            });

            await authPromise;

        } catch (err) {
            console.error('❌ Auth callback error:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            setStatus('error');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const processAuthenticatedUser = async (userId: string) => {
        try {
            console.log('👤 Processing authenticated user:', userId);
            setDebugInfo('Setting up your account...');

            // Get auth user data
            const { data: authData } = await supabase.auth.getUser();
            const authUser = authData.user;

            if (!authUser) {
                throw new Error('No auth user found');
            }

            console.log('✅ Auth user confirmed:', authUser.email);

            // Try to create/update profile with timeout
            console.log('📝 Ensuring profile exists in database...');
            try {
                await Promise.race([
                    ensureUserProfileExists(authUser.id),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Profile creation timeout')), 3000))
                ]);
                console.log('✅ Profile operation completed');
            } catch (err) {
                console.warn('⚠️ Profile creation timed out, will try to continue:', err);
            }

            // Small delay to let database write complete
            await new Promise(resolve => setTimeout(resolve, 500));

            // Now check if profile is complete by querying database
            console.log('🔍 Checking if profile is complete...');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let profileData: any = null;

            try {
                const { data, error } = await Promise.race([
                    supabase
                        .from('users')
                        .select('is_profile_complete, phone, date_of_birth, role, full_name')
                        .eq('id', userId)
                        .single(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Profile check timeout')), 3000))
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ]) as any;

                if (!error && data) {
                    profileData = data;
                    console.log('📊 Profile data:', profileData);
                }
            } catch (err) {
                console.warn('⚠️ Could not fetch profile data, using metadata:', err);
            }

            // Determine if profile needs completion
            const needsProfileCompletion = !profileData ||
                !profileData.is_profile_complete ||
                !profileData.phone ||
                !profileData.date_of_birth;

            setStatus('success');

            let destination: string;

            if (needsProfileCompletion) {
                console.log('📝 Profile incomplete, redirecting to complete-profile');
                setDebugInfo('Please complete your profile...');
                destination = '/complete-profile';
            } else {
                console.log('✅ Profile complete, determining dashboard...');
                setDebugInfo('Redirecting to your dashboard...');

                // Use database role if available, otherwise metadata
                const role = profileData?.role || authUser.user_metadata?.role || 'client';
                console.log('🎯 User role:', role);

                destination = role === 'therapist'
                    ? '/dashboard/therapist'
                    : role === 'admin'
                        ? '/dashboard/admin'
                        : role === 'super_admin'
                            ? '/super-admin'
                            : '/dashboard';
            }

            await new Promise(resolve => setTimeout(resolve, 100));

            console.log('🎯 Redirecting to:', destination);
            navigate(destination, { replace: true });

        } catch (err) {
            console.error('❌ Error processing user:', err);
            setError(err instanceof Error ? err.message : 'Failed to complete authentication');
            setStatus('error');
        }
    };

    useEffect(() => {
        handleCallback();

        // Cleanup on unmount
        return () => {
            // Cleanup any subscriptions if needed
        };
    }, [handleCallback]);

    const handleRetry = () => {
        setStatus('loading');
        setError(null);
        handleCallback();
    };

    const handleGoToLogin = () => {
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
            <div className="text-center max-w-md mx-auto p-8">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing sign in...</h2>
                        <p className="text-gray-500">Please wait while we set up your account</p>
                        {debugInfo && (
                            <p className="text-xs text-gray-400 mt-4 font-mono">{debugInfo}</p>
                        )}
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">✓</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Success!</h2>
                        <p className="text-gray-500">Redirecting to your dashboard...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <div className="flex flex-col gap-3">
                            <Button onClick={handleRetry} className="w-full">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Button variant="outline" onClick={handleGoToLogin} className="w-full">
                                Back to Login
                            </Button>
                        </div>
                        {debugInfo && (
                            <p className="text-xs text-gray-400 mt-6 font-mono">{debugInfo}</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
