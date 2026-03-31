-- COMPREHENSIVE FIX for RLS Infinite Recursion
-- Run this in Supabase SQL Editor
-- This drops ALL policies and creates new simplified ones

-- ==================================
-- STEP 1: DISABLE RLS temporarily
-- ==================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ==================================
-- STEP 2: DROP ALL EXISTING POLICIES
-- ==================================
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.users';
    END LOOP;
END $$;

-- ==================================
-- STEP 3: RE-ENABLE RLS
-- ==================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ==================================
-- STEP 4: CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ==================================

-- Policy 1: Users can select their own row
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Policy 2: Users can update their own row
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Policy 3: Allow service role full access
CREATE POLICY "users_service_role_all" ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy 4: Authenticated users can read other users (for therapist listings, etc.)
-- This is a SELECT-only policy that doesn't create recursion
CREATE POLICY "users_select_authenticated" ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

-- ==================================
-- STEP 5: GRANT NECESSARY PERMISSIONS
-- ==================================
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- ==================================
-- VERIFICATION
-- ==================================
-- Run this to verify policies were created:
-- SELECT * FROM pg_policies WHERE tablename = 'users';
