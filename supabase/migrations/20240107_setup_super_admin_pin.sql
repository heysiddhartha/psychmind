-- Migration: Ensure Super Admin and System Settings for PIN
-- 1. Ensure system_settings table exists
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(category, key)
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 2. Insert or Update the Super Admin PIN
INSERT INTO system_settings (category, key, value, description, is_public)
VALUES (
    'security', 
    'super_admin_pin', 
    '"3tree@2026"', 
    'Secure PIN for Super Admin Access', 
    false
)
ON CONFLICT (category, key) 
DO UPDATE SET value = '"3tree@2026"';

-- 3. Promote 'idthe3tree@gmail.com' to super_admin if they exist
-- Note: This only works if the user has already signed up. 
-- If not, they will become super_admin automatically upon signup if we had a trigger, 
-- but simpler to just run this content manually or rely on manual promotion.
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'idthe3tree@gmail.com';

-- 4. Create policy for super_admin to read/write settings
create policy "Super admins can manage settings"
on system_settings for all
to authenticated
using (
  exists (select 1 from users where id = auth.uid() and role = 'super_admin')
)
with check (
  exists (select 1 from users where id = auth.uid() and role = 'super_admin')
);

-- 5. Allow read access to security settings for authenticated users (needed for gate check? 
-- Actually no, we should protect the PIN value. The server should verify it or we fetch it securely?
-- Current Logic: Client-side check requires fetching the PIN. 
-- Ideally we verify server-side, but for now we'll fetch it.
-- Let's make sure only super_admins can read specific security keys.
