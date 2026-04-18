/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, User, PatientDetails } from '@/lib/supabase';
import { Session, AuthError, User as SupabaseAuthUser } from '@supabase/supabase-js';

interface SignUpData {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    role: 'client' | 'therapist';
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUpWithEmail: (data: SignUpData) => Promise<{ error: AuthError | Error | null; requiresEmailConfirmation?: boolean }>;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>;
    updatePatientDetails: (data: Partial<PatientDetails>) => Promise<{ error: Error | null }>;
    completeProfile: (data: { phone: string; dateOfBirth: string; gender?: string }) => Promise<{ error: Error | null }>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ensure a row exists in the public "users" table for the authenticated user
// IMPORTANT: Only inserts if profile doesn't exist. Never overwrites existing data.
const ensureUserProfileExists = async (authUser: SupabaseAuthUser | null) => {
    if (!authUser) {
        console.warn('⚠️ ensureUserProfileExists called with null user');
        return;
    }

    console.log('🔧 Ensuring user profile exists for:', authUser.id);

    // First check if profile already exists — don't overwrite existing data
    const { data: existingProfile } = await supabase
        .from('users')
        .select('id, is_profile_complete')
        .eq('id', authUser.id)
        .maybeSingle();

    if (existingProfile) {
        console.log('✅ User profile already exists, skipping upsert');
        return;
    }

    // Profile doesn't exist — create it
    const metadata = authUser.user_metadata || {};
    const defaultName = metadata.full_name || metadata.name || authUser.email?.split('@')[0] || 'User';
    const defaultRole = (metadata.role as User['role']) || 'client';

    const { error } = await supabase
        .from('users')
        .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: defaultName,
            avatar_url: metadata.avatar_url || metadata.picture || null,
            phone: metadata.phone || null,
            role: defaultRole,
            is_active: true,
            is_profile_complete: false,
        });

    if (error) {
        console.error('❌ Error creating user profile:', error);
    } else {
        console.log('✅ User profile created for:', authUser.id);
    }
};

// Therapists also need a row in the public "therapists" table before their
// dashboard can load. Keep this payload compatible with the base schema.
const ensureTherapistProfileExists = async (userId: string | undefined | null) => {
    if (!userId) {
        return;
    }

    const { data: existingTherapist } = await supabase
        .from('therapists')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

    if (existingTherapist) {
        return;
    }

    const { error } = await supabase
        .from('therapists')
        .insert({
            user_id: userId,
            bio: '',
            specialties: [],
            languages: ['English'],
            years_experience: 0,
            session_rate_individual: 75.0,
            session_rate_couple: 100.0,
            session_rate_family: 120.0,
            accepts_new_clients: true,
            is_verified: false,
            is_active: false,
        });

    if (error) {
        console.warn('⚠️ Could not create therapist profile row:', error);
    } else {
        console.log('✅ Therapist profile created for:', userId);
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                console.log('📱 Initial session found, loading profile...');
                // Load profile data in background
                fetchUserProfile(session.user.id).catch(err => {
                    console.warn('⚠️ Could not load profile on init, user can still use app:', err);
                    // Set minimal user so app works
                    setUser({
                        id: session.user.id,
                        email: session.user.email || 'user@example.com',
                        full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
                        role: (session.user.user_metadata?.role as User['role']) || 'client',
                        is_active: true,
                        is_profile_complete: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    } as User);
                });
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);
            setSession(session);
            if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
                console.log('Active session found for user:', session.user.id);
                fetchUserProfile(session.user.id).catch(err => {
                    console.warn('Could not load profile from auth state change, using fallback profile:', err);
                    setUser({
                        id: session.user.id,
                        email: session.user.email || 'user@example.com',
                        full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
                        role: (session.user.user_metadata?.role as User['role']) || 'client',
                        is_active: true,
                        is_profile_complete: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    } as User);
                    setLoading(false);
                });
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setLoading(false);
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                console.log('Token refreshed - user already loaded, skipping profile re-fetch');
            } else if (!session) {
                setUser(null);
                setLoading(false);
            }
        });

        // Safety timeout to prevent infinite loading state (raised to 20 s)
        const loadingTimeout = setTimeout(() => {
            if (loading) {
                console.warn('⚠️ Auth loading timeout reached, forcing loading to false');
                setLoading(false);
            }
        }, 20000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(loadingTimeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUserProfile = async (userId: string) => {
        try {
            console.log('👤 Fetching user profile for:', userId);

            // Create a timeout promise — 15 s so slow connections / cold starts succeed
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Profile fetch timeout')), 15000);
            });

            // First attempt to fetch the profile with timeout
            const fetchPromise = supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            let data: any = null;
            let error: any = null;

            try {
                const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
                data = result.data;
                error = result.error;
                console.log('📊 Profile query result:', { hasData: !!data, error: error?.message });
            } catch (timeoutError: any) {
                console.warn('⚠️ Profile fetch timed out, trying to create profile...');

                // Try to create profile on timeout
                const { data: authUserData } = await supabase.auth.getUser();
                await ensureUserProfileExists(authUserData.user);

                // Quick retry with generous timeout
                const retry = await Promise.race([
                    supabase.from('users').select('*').eq('id', userId).single(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Retry timeout')), 10000))
                ]) as any;

                data = retry.data;
                error = retry.error;
            }

            // If missing, try creating from auth user metadata then refetch
            if ((error && error.code === 'PGRST116') || !data) {
                console.log('⚠️ Profile not found, creating from auth metadata...');
                const { data: authUserData } = await supabase.auth.getUser();
                await ensureUserProfileExists(authUserData.user);

                // Retry after brief delay
                await new Promise(resolve => setTimeout(resolve, 300));
                const retry = await Promise.race([
                    supabase.from('users').select('*').eq('id', userId).single(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 15000))
                ]) as any;

                data = retry.data;
                error = retry.error;
            }

            if (error && error.code !== 'PGRST116') {
                console.error('❌ Error fetching user profile:', error);
            }


            if (data) {
                if (data.role === 'therapist') {
                    await ensureTherapistProfileExists(data.id);
                }

                // Update last_seen_at (don't wait for it)
                (async () => {
                    try {
                        await supabase
                            .from('users')
                            .update({ last_seen_at: new Date().toISOString() })
                            .eq('id', userId);
                        console.log('✅ Last seen updated');
                    } catch (err) {
                        console.warn('⚠️ Could not update last_seen:', err);
                    }
                })();

                console.log('✅ User profile loaded:', data.email);
                setUser(data);
            } else {
                console.error('❌ Could not load user profile, using minimal profile');
                // Get auth user data for fallback
                const { data: authData } = await supabase.auth.getUser();
                const authUser = authData.user;

                // Set a minimal user object with auth data
                // IMPORTANCE: Default is_profile_complete to TRUE to avoid loop
                setUser({
                    id: userId,
                    email: authUser?.email || 'user@example.com',
                    full_name: authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || 'User',
                    role: (authUser?.user_metadata?.role as User['role']) || 'client',
                    is_active: true,
                    is_profile_complete: true, // Optimistically assume complete to avoid loop
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                } as any);
            }
        } catch (error) {
            console.error('❌ Error fetching user profile:', error);
            // Get auth user for fallback
            const { data: authData } = await supabase.auth.getUser();
            const authUser = authData.user;

            // Set minimal user to prevent complete failure
            setUser({
                id: userId,
                email: authUser?.email || 'user@example.com',
                full_name: authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || 'User',
                role: (authUser?.user_metadata?.role as User['role']) || 'client',
                is_active: true,
                is_profile_complete: true, // Optimistically assume complete to avoid loop
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } as any);
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        if (session?.user) {
            console.log('🔄 Manually refreshing user profile...');
            await fetchUserProfile(session.user.id);
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            setLoading(true);
            console.log('🔐 Attempting login for:', email.trim().toLowerCase());

            // Validate input
            if (!email || !email.trim()) {
                setLoading(false);
                console.error('❌ Login failed: Email is required');
                return { error: { message: 'Email is required' } as AuthError };
            }

            if (!password || password.length < 6) {
                setLoading(false);
                console.error('❌ Login failed: Password must be at least 6 characters');
                return { error: { message: 'Password must be at least 6 characters' } as AuthError };
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password
            });

            if (error) {
                setLoading(false);
                console.error('❌ Supabase login error:', error);

                // Provide user-friendly error messages
                let errorMessage = error.message;
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = 'Invalid email or password. Please check your credentials and try again.';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = 'Please verify your email address before signing in. Check your inbox for the verification link.';
                } else if (error.message.includes('User not found')) {
                    errorMessage = 'No account found with this email. Please sign up first.';
                }
                return { error: { ...error, message: errorMessage } as AuthError };
            }

            console.log('✅ Login successful, processing user profile...');

            // Ensure profile exists and refresh cached user
            const authUser = data?.user ?? data?.session?.user ?? null;
            if (authUser) {
                try {
                    await ensureUserProfileExists(authUser);

                    // Fetch profile with timeout - don't let it block indefinitely
                    const profilePromise = supabase
                        .from('users')
                        .select('*')
                        .eq('id', authUser.id)
                        .single();

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Profile fetch timeout')), 15000)
                    );

                    try {
                        const result = await Promise.race([profilePromise, timeoutPromise]) as any;
                        if (result.data) {
                            console.log('✅ User profile loaded:', result.data.email);
                            setUser(result.data);
                        } else {
                            // Fallback to basic profile from auth
                            console.warn('⚠️ Using fallback profile from auth data');
                            setUser({
                                id: authUser.id,
                                email: authUser.email || 'user@example.com',
                                full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User',
                                role: (authUser.user_metadata?.role as User['role']) || 'client',
                                is_active: true,
                                is_profile_complete: false,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            } as User);
                        }
                    } catch (fetchError) {
                        console.warn('⚠️ Profile fetch failed/timeout, using auth data:', fetchError);
                        setUser({
                            id: authUser.id,
                            email: authUser.email || 'user@example.com',
                            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User',
                            role: (authUser.user_metadata?.role as User['role']) || 'client',
                            is_active: true,
                            is_profile_complete: false,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        } as User);
                    }

                    console.log('✅ User profile loaded successfully');
                } catch (profileError) {
                    console.error('⚠️ Profile setup error:', profileError);
                    // Still set a minimal user so the app works
                    setUser({
                        id: authUser.id,
                        email: authUser.email || 'user@example.com',
                        full_name: authUser.user_metadata?.full_name || 'User',
                        role: (authUser.user_metadata?.role as User['role']) || 'client',
                        is_active: true,
                        is_profile_complete: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    } as User);
                }
            } else {
                console.error('❌ No user found in session data');
                setLoading(false);
                return { error: { message: 'Failed to retrieve user session' } as AuthError };
            }

            // Always ensure loading is set to false
            setLoading(false);
            return { error: null };
        } catch (error) {
            console.error('❌ Unexpected login error:', error);
            setLoading(false);
            return { error: { message: 'An unexpected error occurred. Please try again.' } as AuthError };
        }
    };

    const signUpWithEmail = async (data: SignUpData) => {
        try {
            setLoading(true);
            console.log('Signup started');
            console.log('Email:', data.email);
            console.log('Role:', data.role);

            const trimmedEmail = data.email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmedEmail)) {
                setLoading(false);
                return { error: new Error('Please enter a valid email (e.g., user@example.com)'), requiresEmailConfirmation: false };
            }

            if (data.password.length < 6) {
                setLoading(false);
                return { error: new Error('Password must be at least 6 characters'), requiresEmailConfirmation: false };
            }

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: trimmedEmail,
                password: data.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        full_name: data.fullName,
                        phone: data.phone,
                        role: data.role,
                    }
                }
            });

            if (authError) {
                setLoading(false);
                console.error('Supabase auth signup error:', authError);

                let errorMessage = authError.message;
                if (authError.message.toLowerCase().includes('user already registered') ||
                    authError.message.toLowerCase().includes('already exists')) {
                    errorMessage = 'This email is already registered. Please try logging in instead.';
                } else if (authError.status === 422 || authError.status === 400) {
                    errorMessage = `Signup failed: ${authError.message}. Try a different email or contact support.`;
                } else if (authError.message.toLowerCase().includes('email')) {
                    errorMessage = `Email issue: ${authError.message}`;
                } else if (authError.message.toLowerCase().includes('password')) {
                    errorMessage = 'Password is too weak. Use at least 6 characters with letters and numbers.';
                }

                return { error: new Error(errorMessage), requiresEmailConfirmation: false };
            }

            if (!authData.user) {
                setLoading(false);
                return { error: new Error('Signup failed - no user created. Please try again.'), requiresEmailConfirmation: false };
            }

            const requiresEmailConfirmation = !authData.session;

            try {
                if (!requiresEmailConfirmation) {
                    const upsertPromise = supabase
                        .from('users')
                        .upsert({
                            id: authData.user.id,
                            email: trimmedEmail,
                            full_name: data.fullName,
                            phone: data.phone,
                            role: data.role,
                            date_of_birth: data.dateOfBirth || null,
                            gender: data.gender || null,
                            is_profile_complete: !!(data.phone && data.dateOfBirth),
                            is_active: true,
                        }, { onConflict: 'id' });

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Profile creation timeout - database may be slow')), 10000)
                    );

                    const result = await Promise.race([upsertPromise, timeoutPromise]) as any;
                    const profileError = result?.error;

                    if (profileError) {
                        console.error('Profile creation error:', profileError);
                        console.warn('User created in auth but profile failed. Continuing with signup.');
                    }

                    if (data.role === 'client') {
                        const { error: patientError } = await supabase
                            .from('patient_details')
                            .upsert({ user_id: authData.user.id }, { onConflict: 'user_id' });

                        if (patientError) {
                            console.warn('Patient details creation failed:', patientError);
                        }
                    }

                    if (data.role === 'therapist') {
                        try {
                            const therapistPromise = ensureTherapistProfileExists(authData.user.id);
                            const therapistTimeout = new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Therapist profile timeout')), 8000)
                            );
                            await Promise.race([therapistPromise, therapistTimeout]);
                        } catch (tErr) {
                            console.warn('Therapist profile creation timed out or failed:', tErr);
                        }
                    }
                }
            } catch (dbError: any) {
                console.error('Database operation failed:', dbError);
                console.warn('Continuing signup because auth account was created and profile can be repaired later.');
            }

            setLoading(false);
            return { error: null, requiresEmailConfirmation };

        } catch (error: any) {
            console.error('Unexpected error during signup:', error);
            setLoading(false);
            return { error: new Error('Unexpected error: ' + error.message), requiresEmailConfirmation: false };
        }
    };

    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            console.log('🔐 Initiating Google OAuth login...');
            console.log('📍 Redirect URL will be:', `${window.location.origin}/auth/callback`);

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) {
                console.error('❌ Google OAuth error:', error);
                setLoading(false);
                return { error };
            }

            console.log('✅ Google OAuth initiated, redirecting...');
            // Don't set loading to false - user will be redirected
            return { error: null, requiresEmailConfirmation };
        } catch (error) {
            console.error('❌ Unexpected Google OAuth error:', error);
            setLoading(false);
            return { error: error as AuthError };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setLoading(false);
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return { error: new Error('No user logged in') };

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    ...data,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (!error) {
                setUser({ ...user, ...data });
            }

            return { error: error as Error | null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const updatePatientDetails = async (data: Partial<PatientDetails>) => {
        if (!user) return { error: new Error('No user logged in') };

        try {
            const { error } = await supabase
                .from('patient_details')
                .upsert({
                    user_id: user.id,
                    ...data,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });

            return { error: error as Error | null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const completeProfile = async (data: { phone: string; dateOfBirth: string; gender?: string }) => {
        if (!user) return { error: new Error('No user logged in') };

        try {
            console.log('📝 Completing user profile...');
            console.log('📊 Profile data to save:', { phone: data.phone, dateOfBirth: data.dateOfBirth, gender: data.gender });

            // Update with timeout protection
            const updatePromise = supabase
                .from('users')
                .update({
                    phone: data.phone,
                    date_of_birth: data.dateOfBirth,
                    gender: data.gender || null,
                    is_profile_complete: true,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            const { error } = await Promise.race([
                updatePromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Profile update timeout')), 5000))
            ]) as any;

            if (error) {
                console.error('❌ Failed to update profile:', error);
                return { error: error as Error | null };
            }

            console.log('✅ Profile updated successfully in database');

            if (user.role === 'therapist') {
                await ensureTherapistProfileExists(user.id);
            }

            // Update local user state immediately
            const updatedUser = {
                ...user,
                phone: data.phone,
                date_of_birth: data.dateOfBirth,
                gender: data.gender as User['gender'],
                is_profile_complete: true,
            };

            setUser(updatedUser);
            console.log('✅ Local user state updated');

            return { error: null };
        } catch (error) {
            console.error('❌ Error completing profile:', error);
            return { error: error as Error };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signInWithEmail,
            signUpWithEmail,
            signInWithGoogle,
            signOut,
            updateProfile,
            updatePatientDetails,
            completeProfile,
            refreshUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}


