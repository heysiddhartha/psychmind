-- ==================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO CREATE SUPER ADMIN
-- ==================================================

-- Make your current user a super_admin
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'idthe3tree@gmail.com';

-- Verify the update
SELECT id, email, role, full_name FROM users WHERE email = 'idthe3tree@gmail.com';

-- If you want to keep therapist role and create a separate super_admin:
-- INSERT INTO users (id, email, full_name, role, is_active)
-- VALUES (gen_random_uuid(), 'admin@the3tree.com', 'Super Admin', 'super_admin', true);
