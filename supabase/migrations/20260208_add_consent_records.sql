-- Migration: Add consent_records table for informed consent tracking
-- Date: 2026-02-08
-- Description: Adds consent records system for service-specific informed consent

-- ==========================================
-- CONSENT RECORDS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Consent details
    consent_version VARCHAR(10) NOT NULL,
    selected_services TEXT[] NOT NULL,
    
    -- Audit trail
    agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON public.consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_agreed_at ON public.consent_records(agreed_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_records_version ON public.consent_records(consent_version);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own consent records
CREATE POLICY "Users can view their own consent records"
    ON public.consent_records
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own consent records
CREATE POLICY "Users can insert their own consent records"
    ON public.consent_records
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- UPDATED_AT TRIGGER
-- ==========================================

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_consent_records_updated_at ON public.consent_records;
CREATE TRIGGER update_consent_records_updated_at
    BEFORE UPDATE ON public.consent_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ENABLE REALTIME (Optional)
-- ==========================================

-- Enable realtime for consent_records if needed for admin monitoring
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.consent_records;
