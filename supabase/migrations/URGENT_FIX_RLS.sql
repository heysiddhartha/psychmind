-- 🚨 CRITICAL FIX FOR SIGNUP DATABASE ERROR
-- Copy this ENTIRE script and run it in Supabase SQL Editor

-- Step 1: Disable RLS temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing problematic policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.users';
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create working policies

-- Allow users to read their own data
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT TO authenticated
    USING (id = auth.uid());

-- Allow users to insert their own data (CRITICAL FOR SIGNUP!)
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

-- Allow users to update their own data
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Allow all authenticated users to read other users (for therapist listings)
CREATE POLICY "users_select_all" ON public.users
    FOR SELECT TO authenticated
    USING (true);

-- Service role gets full access
CREATE POLICY "users_service_role_all" ON public.users
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Step 5: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Step 6: Verify (should return 5 policies)
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
