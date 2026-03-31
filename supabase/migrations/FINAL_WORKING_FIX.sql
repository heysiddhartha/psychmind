-- ============================================
-- FINAL ABSOLUTE FIX - Handles Existing Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Disable RLS on all tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL existing policies (no matter what they're named)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all policies on users
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.users CASCADE';
    END LOOP;
    
    -- Drop all policies on patient_details
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'patient_details' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.patient_details CASCADE';
    END LOOP;
    
    -- Drop all policies on therapists
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'therapists' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.therapists CASCADE';
    END LOOP;
END $$;

-- STEP 3: Grant FULL permissions
GRANT ALL PRIVILEGES ON public.users TO anon;
GRANT ALL PRIVILEGES ON public.users TO authenticated;
GRANT ALL PRIVILEGES ON public.users TO service_role;

GRANT ALL PRIVILEGES ON public.patient_details TO anon;
GRANT ALL PRIVILEGES ON public.patient_details TO authenticated;
GRANT ALL PRIVILEGES ON public.patient_details TO service_role;

GRANT ALL PRIVILEGES ON public.therapists TO anon;
GRANT ALL PRIVILEGES ON public.therapists TO authenticated;
GRANT ALL PRIVILEGES ON public.therapists TO service_role;

-- STEP 4: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create super-permissive policies (fresh, no duplicates)
CREATE POLICY "allow_all_users_auth" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_users_service" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_insert_users_anon" ON public.users FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow_all_patients_auth" ON public.patient_details FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_patients_service" ON public.patient_details FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_therapists_auth" ON public.therapists FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_therapists_service" ON public.therapists FOR ALL TO service_role USING (true) WITH CHECK (true);

-- STEP 6: Verify (should show 7 policies)
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'patient_details', 'therapists')
ORDER BY tablename, policyname;
