-- ==========================================
-- FIX: Add missing INSERT policy for users table
-- Also add missing tables for full functionality
-- ==========================================

-- Add INSERT policy for users table (allows users to create their own profile)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure therapist_blocked_times table exists
CREATE TABLE IF NOT EXISTS public.therapist_blocked_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on therapist_blocked_times if not already
ALTER TABLE public.therapist_blocked_times ENABLE ROW LEVEL SECURITY;

-- Allow therapists to manage their blocked times
DROP POLICY IF EXISTS "Therapists can view own blocked times" ON public.therapist_blocked_times;
CREATE POLICY "Therapists can view own blocked times" ON public.therapist_blocked_times
    FOR SELECT USING (
        therapist_id IN (SELECT id FROM public.therapists WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Therapists can insert own blocked times" ON public.therapist_blocked_times;
CREATE POLICY "Therapists can insert own blocked times" ON public.therapist_blocked_times
    FOR INSERT WITH CHECK (
        therapist_id IN (SELECT id FROM public.therapists WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Therapists can update own blocked times" ON public.therapist_blocked_times;
CREATE POLICY "Therapists can update own blocked times" ON public.therapist_blocked_times
    FOR UPDATE USING (
        therapist_id IN (SELECT id FROM public.therapists WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Therapists can delete own blocked times" ON public.therapist_blocked_times;
CREATE POLICY "Therapists can delete own blocked times" ON public.therapist_blocked_times
    FOR DELETE USING (
        therapist_id IN (SELECT id FROM public.therapists WHERE user_id = auth.uid())
    );

-- Allow public read of blocked times (for booking system)
DROP POLICY IF EXISTS "Public can view blocked times for booking" ON public.therapist_blocked_times;
CREATE POLICY "Public can view blocked times for booking" ON public.therapist_blocked_times
    FOR SELECT USING (true);

-- Ensure therapist_availability table has proper policies
DROP POLICY IF EXISTS "Public can view therapist availability" ON public.therapist_availability;
CREATE POLICY "Public can view therapist availability" ON public.therapist_availability
    FOR SELECT USING (true);

-- Grant permissions to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.therapist_blocked_times TO authenticated;
GRANT ALL ON public.therapist_availability TO authenticated;

-- Grant select to anon users for public data
GRANT SELECT ON public.therapists TO anon;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.therapist_availability TO anon;
