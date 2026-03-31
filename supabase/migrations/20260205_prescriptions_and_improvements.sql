-- Migration: Add prescriptions table and improve session notes
-- Date: 2026-02-05
-- Description: Adds prescription system for therapists and improves data sync

-- ==========================================
-- PRESCRIPTIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Prescription details
    diagnosis TEXT NOT NULL,
    medicines JSONB NOT NULL DEFAULT '[]',
    advice TEXT,
    follow_up_date DATE,
    
    -- PDF storage (Cloudinary URL)
    pdf_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for prescriptions
CREATE INDEX IF NOT EXISTS idx_prescriptions_therapist ON public.prescriptions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_booking ON public.prescriptions(booking_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created ON public.prescriptions(created_at DESC);

-- RLS for prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Therapists can manage their own prescriptions
CREATE POLICY "Therapists manage own prescriptions" ON public.prescriptions
    FOR ALL
    USING (
        therapist_id IN (
            SELECT id FROM public.therapists WHERE user_id = auth.uid()
        )
    );

-- Patients can view their own prescriptions
CREATE POLICY "Patients view own prescriptions" ON public.prescriptions
    FOR SELECT
    USING (patient_id = auth.uid());

-- ==========================================
-- SESSION NOTES IMPROVEMENTS
-- ==========================================

-- Add session_notes table if not exists for detailed notes
CREATE TABLE IF NOT EXISTS public.session_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
    therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- SOAP notes format
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    
    -- Simple notes alternative
    simple_notes TEXT,
    notes_type VARCHAR(10) DEFAULT 'soap' CHECK (notes_type IN ('soap', 'simple')),
    
    -- Risk assessment
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'moderate', 'high', 'severe')),
    risk_notes TEXT,
    
    -- Follow-up
    follow_up_recommended BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for session_notes
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists manage own session notes" ON public.session_notes
    FOR ALL
    USING (
        therapist_id IN (
            SELECT id FROM public.therapists WHERE user_id = auth.uid()
        )
    );

-- ==========================================
-- MESSAGE ATTACHMENTS (for prescriptions, files)
-- ==========================================

-- Add file attachment columns to messages if not exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'file_url') THEN
        ALTER TABLE public.messages ADD COLUMN file_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'file_type') THEN
        ALTER TABLE public.messages ADD COLUMN file_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'file_name') THEN
        ALTER TABLE public.messages ADD COLUMN file_name TEXT;
    END IF;
END $$;

-- ==========================================
-- CLOUDINARY STORAGE CONFIG TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.storage_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL DEFAULT 'supabase',
    cloudinary_cloud_name TEXT,
    cloudinary_upload_preset TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default config
INSERT INTO public.storage_config (provider) 
VALUES ('supabase')
ON CONFLICT DO NOTHING;

-- ==========================================
-- REAL-TIME NOTIFICATIONS FOR MESSAGES
-- ==========================================

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for prescriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.prescriptions;

-- ==========================================
-- FUNCTIONS FOR UPDATED_AT TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON public.prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_notes_updated_at ON public.session_notes;
CREATE TRIGGER update_session_notes_updated_at
    BEFORE UPDATE ON public.session_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
