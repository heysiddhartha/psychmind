-- ============================================================
-- 3TREE COUNSELING - CONSOLIDATED MIGRATION
-- ============================================================
-- Run this ENTIRE script in Supabase SQL Editor (one go):
--   1. Go to https://supabase.com/dashboard
--   2. Select your project
--   3. Click "SQL Editor" in the left sidebar
--   4. Paste this ENTIRE script
--   5. Click "Run" (or Ctrl+Enter)
-- ============================================================

-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PRESCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL DEFAULT '',
    medicines JSONB NOT NULL DEFAULT '[]',
    advice TEXT,
    follow_up_date DATE,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_therapist ON public.prescriptions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_booking ON public.prescriptions(booking_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created ON public.prescriptions(created_at DESC);

-- RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Therapists manage own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Patients view own prescriptions" ON public.prescriptions;

CREATE POLICY "Therapists manage own prescriptions" ON public.prescriptions
    FOR ALL USING (
        therapist_id IN (SELECT id FROM public.therapists WHERE user_id = auth.uid())
    );

CREATE POLICY "Patients view own prescriptions" ON public.prescriptions
    FOR SELECT USING (patient_id = auth.uid());

-- ============================================================
-- 2. SESSION NOTES TABLE
-- ============================================================
-- Note: session_notes.therapist_id points to therapists.id (the therapist record),
-- NOT to users.id. The sessionNotesService looks up the therapist record by user_id.
CREATE TABLE IF NOT EXISTS public.session_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- SOAP notes
    subjective TEXT DEFAULT '',
    objective TEXT DEFAULT '',
    assessment TEXT DEFAULT '',
    plan TEXT DEFAULT '',
    
    -- Additional fields
    session_goals TEXT,
    interventions TEXT[],
    progress_notes TEXT,
    homework_assigned TEXT,
    risk_assessment TEXT,
    simple_notes TEXT,
    notes_type VARCHAR(10) DEFAULT 'soap',
    risk_level VARCHAR(20) DEFAULT 'low',
    risk_notes TEXT,
    follow_up_recommended BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    
    -- Signing
    is_signed BOOLEAN DEFAULT false,
    signed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_session_notes_booking ON public.session_notes(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_therapist ON public.session_notes(therapist_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_patient ON public.session_notes(patient_id);

-- RLS
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Therapists manage own session notes" ON public.session_notes;
DROP POLICY IF EXISTS "Therapists can manage own notes" ON public.session_notes;
DROP POLICY IF EXISTS "Users can view own session notes" ON public.session_notes;

CREATE POLICY "Therapists manage own session notes" ON public.session_notes
    FOR ALL USING (
        therapist_id IN (SELECT id FROM public.therapists WHERE user_id = auth.uid())
    );

CREATE POLICY "Patients view own session notes" ON public.session_notes
    FOR SELECT USING (patient_id = auth.uid());

-- ============================================================
-- 3. CONSENT RECORDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_version VARCHAR(10) NOT NULL,
    selected_services TEXT[] DEFAULT '{}',
    agreed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user ON public.consent_records(user_id);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own consent records" ON public.consent_records;
DROP POLICY IF EXISTS "Users can insert their own consent records" ON public.consent_records;

CREATE POLICY "Users can view their own consent records" ON public.consent_records
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own consent records" ON public.consent_records
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 4. SLOT LOCKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.slot_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
    slot_datetime TIMESTAMPTZ NOT NULL,
    locked_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    locked_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes'),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    UNIQUE(therapist_id, slot_datetime)
);

CREATE INDEX IF NOT EXISTS idx_slot_locks_therapist ON public.slot_locks(therapist_id);
CREATE INDEX IF NOT EXISTS idx_slot_locks_expires ON public.slot_locks(expires_at);

ALTER TABLE public.slot_locks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view slot locks" ON public.slot_locks;
DROP POLICY IF EXISTS "Users can create their own locks" ON public.slot_locks;
DROP POLICY IF EXISTS "Users can update their own locks" ON public.slot_locks;
DROP POLICY IF EXISTS "Users can delete their own locks" ON public.slot_locks;

CREATE POLICY "Anyone can view slot locks" ON public.slot_locks FOR SELECT USING (true);
CREATE POLICY "Users can create their own locks" ON public.slot_locks FOR INSERT WITH CHECK (locked_by = auth.uid());
CREATE POLICY "Users can update their own locks" ON public.slot_locks FOR UPDATE USING (locked_by = auth.uid());
CREATE POLICY "Users can delete their own locks" ON public.slot_locks FOR DELETE USING (locked_by = auth.uid());

-- ============================================================
-- 5. SERVICE QUESTIONNAIRE SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.service_questionnaire_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    questionnaire_id TEXT NOT NULL,
    service_type TEXT,
    data JSONB NOT NULL DEFAULT '{}',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sqs_user ON public.service_questionnaire_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_sqs_service ON public.service_questionnaire_submissions(service_type);

ALTER TABLE public.service_questionnaire_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own questionnaire submissions" ON public.service_questionnaire_submissions;
DROP POLICY IF EXISTS "Users can view own questionnaire submissions" ON public.service_questionnaire_submissions;

CREATE POLICY "Users can insert own questionnaire submissions" ON public.service_questionnaire_submissions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own questionnaire submissions" ON public.service_questionnaire_submissions
    FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- 6. SCHEDULED REMINDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scheduled_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
    reminder_type TEXT NOT NULL DEFAULT 'email',
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_booking ON public.scheduled_reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON public.scheduled_reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.scheduled_reminders(status);

ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System manages reminders" ON public.scheduled_reminders;
CREATE POLICY "System manages reminders" ON public.scheduled_reminders FOR ALL USING (true);

-- ============================================================
-- 7. ADD MISSING COLUMNS TO EXISTING TABLES (safe - IF NOT EXISTS)
-- ============================================================

-- Add columns to bookings table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bookings' AND column_name='cancellation_reason') THEN
        ALTER TABLE public.bookings ADD COLUMN cancellation_reason TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bookings' AND column_name='cancelled_by') THEN
        ALTER TABLE public.bookings ADD COLUMN cancelled_by TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bookings' AND column_name='cancelled_at') THEN
        ALTER TABLE public.bookings ADD COLUMN cancelled_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bookings' AND column_name='rescheduled_from') THEN
        ALTER TABLE public.bookings ADD COLUMN rescheduled_from TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bookings' AND column_name='amount') THEN
        ALTER TABLE public.bookings ADD COLUMN amount DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bookings' AND column_name='currency') THEN
        ALTER TABLE public.bookings ADD COLUMN currency TEXT DEFAULT 'INR';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bookings' AND column_name='completed_at') THEN
        ALTER TABLE public.bookings ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add columns to therapists table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='therapists' AND column_name='accepts_new_clients') THEN
        ALTER TABLE public.therapists ADD COLUMN accepts_new_clients BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='therapists' AND column_name='is_approved') THEN
        ALTER TABLE public.therapists ADD COLUMN is_approved BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add file columns to messages table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='file_url') THEN
        ALTER TABLE public.messages ADD COLUMN file_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='file_type') THEN
        ALTER TABLE public.messages ADD COLUMN file_type VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='file_name') THEN
        ALTER TABLE public.messages ADD COLUMN file_name TEXT;
    END IF;
END $$;

-- ============================================================
-- 8. HELPER FUNCTIONS
-- ============================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON public.prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_notes_updated_at ON public.session_notes;
CREATE TRIGGER update_session_notes_updated_at
    BEFORE UPDATE ON public.session_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consent_records_updated_at ON public.consent_records;
CREATE TRIGGER update_consent_records_updated_at
    BEFORE UPDATE ON public.consent_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cleanup expired slot locks
CREATE OR REPLACE FUNCTION cleanup_expired_slot_locks()
RETURNS void AS $$
BEGIN
    DELETE FROM public.slot_locks WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. ENABLE REALTIME (safe to re-run)
-- ============================================================
DO $$
BEGIN
    -- Try adding tables to realtime publication (ignore errors if already added)
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.prescriptions;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.slot_locks;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;

-- ============================================================
-- 10. GRANT ACCESS TO AUTHENTICATED USERS
-- ============================================================
GRANT ALL ON public.prescriptions TO authenticated;
GRANT ALL ON public.session_notes TO authenticated;
GRANT ALL ON public.consent_records TO authenticated;
GRANT ALL ON public.slot_locks TO authenticated;
GRANT ALL ON public.service_questionnaire_submissions TO authenticated;
GRANT ALL ON public.scheduled_reminders TO authenticated;

GRANT SELECT ON public.prescriptions TO anon;
GRANT SELECT ON public.slot_locks TO anon;

-- ============================================================
-- DONE! ✅
-- ============================================================
-- All tables, policies, indexes, and triggers have been created.
-- You can verify by checking the "Table Editor" in your Supabase dashboard.
