-- Run this in Supabase SQL editor (or using supabase CLI) to promote the user to super_admin
-- Replace the email below if needed.

BEGIN;

UPDATE public.users
SET role = 'super_admin'
WHERE email = 'idthe3tree@gmail.com';

-- Verify
SELECT id, email, role, full_name FROM public.users WHERE email = 'idthe3tree@gmail.com';

COMMIT;

-- Notes:
-- 1) Open your Supabase project -> SQL Editor -> paste this file and run.
-- 2) Or run with supabase CLI:
--    supabase db query "UPDATE public.users SET role = 'super_admin' WHERE email = 'idthe3tree@gmail.com';"
-- 3) After running: sign out of the app and sign back in (or call the "Refresh profile" action in your app if available).
-- 4) If you still see Access Denied, open the browser devtools and confirm `window.__SUPABASE_CONTEXT__` or run a small script to print `auth user` role, or check the Supabase Dashboard -> Auth -> Users table.
