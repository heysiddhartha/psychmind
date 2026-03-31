-- ==========================================
-- COMPREHENSIVE PLATFORM ENHANCEMENTS
-- Run this in Supabase SQL Editor
-- ==========================================

-- ==========================================
-- 1. THERAPIST TABLE ENHANCEMENTS
-- ==========================================

-- Add verification tracking columns
ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS application_status TEXT DEFAULT 'pending' CHECK (application_status IN ('pending', 'under_review', 'approved', 'rejected', 'suspended')),
ADD COLUMN IF NOT EXISTS license_document_url TEXT,
ADD COLUMN IF NOT EXISTS qualification_document_url TEXT,
ADD COLUMN IF NOT EXISTS identity_document_url TEXT,
ADD COLUMN IF NOT EXISTS license_expiry_date DATE,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 75.00,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;

-- ==========================================
-- 2. AUDIT LOGS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'user_created', 'user_updated', 'user_deleted', 'user_role_changed',
        'therapist_verified', 'therapist_rejected', 'therapist_suspended',
        'booking_created', 'booking_updated', 'booking_cancelled',
        'payment_received', 'payment_refunded',
        'settings_updated', 'content_created', 'content_updated', 'content_deleted',
        'login_success', 'login_failed', 'logout'
    )),
    target_type TEXT NOT NULL CHECK (target_type IN (
        'user', 'therapist', 'booking', 'payment', 'settings', 'blog', 'resource', 'testimonial', 'session'
    )),
    target_id TEXT,
    description TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ==========================================
-- 3. SYSTEM SETTINGS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN ('general', 'booking', 'payment', 'email', 'notifications', 'security')),
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.users(id),
    UNIQUE(category, key)
);

-- Insert default system settings
INSERT INTO public.system_settings (category, key, value, description, is_public) VALUES
    ('general', 'platform_name', '"The 3 Tree"', 'Platform display name', true),
    ('general', 'platform_tagline', '"We Help You Feel"', 'Platform tagline', true),
    ('general', 'support_email', '"support@the3tree.com"', 'Support email address', true),
    ('general', 'support_phone', '"+91 98765 43210"', 'Support phone number', true),
    ('booking', 'min_booking_notice_hours', '24', 'Minimum hours before booking', false),
    ('booking', 'max_booking_advance_days', '60', 'Maximum days in advance for booking', false),
    ('booking', 'default_session_duration', '50', 'Default session duration in minutes', false),
    ('booking', 'buffer_between_sessions', '10', 'Buffer minutes between sessions', false),
    ('booking', 'cancellation_policy_hours', '24', 'Hours before session for free cancellation', false),
    ('payment', 'currency', '"INR"', 'Default currency', false),
    ('payment', 'tax_percentage', '18', 'Tax percentage (GST)', false),
    ('payment', 'platform_fee_percentage', '10', 'Platform fee percentage', false),
    ('email', 'from_name', '"The 3 Tree"', 'Email sender name', false),
    ('email', 'from_email', '"noreply@the3tree.com"', 'Email sender address', false),
    ('email', 'send_booking_confirmation', 'true', 'Send booking confirmation emails', false),
    ('email', 'send_booking_reminder', 'true', 'Send booking reminder emails', false),
    ('email', 'reminder_hours_before', '24', 'Hours before session to send reminder', false),
    ('notifications', 'enable_push', 'false', 'Enable push notifications', false),
    ('notifications', 'enable_sms', 'false', 'Enable SMS notifications', false),
    ('security', 'max_login_attempts', '5', 'Max login attempts before lockout', false),
    ('security', 'session_timeout_minutes', '60', 'Session timeout in minutes', false)
ON CONFLICT (category, key) DO NOTHING;

-- ==========================================
-- 4. ENHANCED RLS POLICIES
-- ==========================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Super admins have full access to users" ON public.users;
DROP POLICY IF EXISTS "Super admins have full access to therapists" ON public.therapists;
DROP POLICY IF EXISTS "Super admins have full access to bookings" ON public.bookings;

-- Helper function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Users table - Super admin full access
CREATE POLICY "Super admins full access on users" ON public.users
    FOR ALL USING (public.is_super_admin());

-- Therapists table - Super admin full access
CREATE POLICY "Super admins full access on therapists" ON public.therapists
    FOR ALL USING (public.is_super_admin());

-- Allow therapists to insert their own profile
DROP POLICY IF EXISTS "Therapists can insert own profile" ON public.therapists;
CREATE POLICY "Therapists can insert own profile" ON public.therapists
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Bookings - Super admin full access
CREATE POLICY "Super admins full access on bookings" ON public.bookings
    FOR ALL USING (public.is_super_admin());

-- Audit logs - Only super admins can view
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_super_admin());

CREATE POLICY "System insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- System settings - Super admins manage, public can read public settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads public settings" ON public.system_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Super admins manage all settings" ON public.system_settings
    FOR ALL USING (public.is_super_admin());

-- ==========================================
-- 5. NOTIFICATION ENHANCEMENTS
-- ==========================================

-- Add email tracking columns
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_error TEXT,
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- ==========================================
-- 6. BOOKING AMOUNT COLUMN
-- ==========================================

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS service_type TEXT;

-- ==========================================
-- 7. HELPER FUNCTIONS
-- ==========================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_action_type TEXT,
    p_target_type TEXT,
    p_target_id TEXT,
    p_description TEXT,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id, action_type, target_type, target_id, 
        description, old_values, new_values
    ) VALUES (
        auth.uid(), p_action_type, p_target_type, p_target_id,
        p_description, p_old_values, p_new_values
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_action_url TEXT DEFAULT NULL,
    p_priority TEXT DEFAULT 'normal'
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id, type, title, message, action_url, priority, data
    ) VALUES (
        p_user_id, p_type, p_title, p_message, p_action_url, p_priority, '{}'::jsonb
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 8. STORAGE BUCKETS
-- ==========================================

-- Note: Run these in Supabase Dashboard > Storage
-- Create buckets for:
-- - therapist-documents (private)
-- - avatars (public)
-- - message-attachments (private)

-- ==========================================
-- 9. CREATE SUPER ADMIN
-- ==========================================

-- Update the specified email to super_admin role
UPDATE public.users 
SET role = 'super_admin', 
    is_active = true,
    updated_at = NOW()
WHERE email = 'idthe3tree@gmail.com';

-- Verify the update
SELECT id, email, role, full_name, is_active 
FROM public.users 
WHERE email = 'idthe3tree@gmail.com';

-- ==========================================
-- 10. REALTIME SUBSCRIPTIONS
-- ==========================================

-- Enable realtime for audit logs (admin monitoring)
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
