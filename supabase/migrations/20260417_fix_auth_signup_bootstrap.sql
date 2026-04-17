-- Fix auth/signup bootstrap issues for hosted Supabase projects.
-- Safe to run multiple times.

-- 1) Ensure new auth users automatically get a public.users row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, phone, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
        phone = COALESCE(EXCLUDED.phone, public.users.phone),
        full_name = CASE
            WHEN COALESCE(public.users.full_name, '') = '' THEN EXCLUDED.full_name
            ELSE public.users.full_name
        END,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Backfill any auth users that were created without a matching public.users row.
INSERT INTO public.users (id, email, full_name, phone, avatar_url, role)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', ''),
    COALESCE(au.raw_user_meta_data->>'phone', NULL),
    COALESCE(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture', NULL),
    COALESCE((au.raw_user_meta_data->>'role')::user_role, 'client')
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3) Make sure signup/profile bootstrap writes are allowed by RLS.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patient_details TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.therapists TO authenticated;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Patients insert own details" ON public.patient_details;
CREATE POLICY "Patients insert own details" ON public.patient_details
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Therapists can insert own profile" ON public.therapists;
CREATE POLICY "Therapists can insert own profile" ON public.therapists
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
