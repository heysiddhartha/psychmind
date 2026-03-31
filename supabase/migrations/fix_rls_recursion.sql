-- Fix RLS policies to prevent infinite recursion
-- Run this SQL in your Supabase SQL Editor
-- Safe to run multiple times (idempotent)

-- Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Public can view basic user info" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;

-- Recreate policies without recursion
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow authenticated users to read basic public info (needed for therapist listings)
CREATE POLICY "Authenticated users can view users" ON public.users
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- System/service role can manage all users
CREATE POLICY "Service role full access" ON public.users
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
