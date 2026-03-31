-- Migration: Add service questionnaire submissions table
-- This table stores intake questionnaire responses for each service type

CREATE TABLE IF NOT EXISTS service_questionnaire_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    questionnaire_id TEXT NOT NULL,
    service_type TEXT NOT NULL,
    data JSONB NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_questionnaire_submissions_user_id 
    ON service_questionnaire_submissions(user_id);
    
CREATE INDEX IF NOT EXISTS idx_questionnaire_submissions_service_type 
    ON service_questionnaire_submissions(service_type);
    
CREATE INDEX IF NOT EXISTS idx_questionnaire_submissions_questionnaire_id 
    ON service_questionnaire_submissions(questionnaire_id);

-- Create a composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_questionnaire_submissions_user_service 
    ON service_questionnaire_submissions(user_id, service_type);

-- Enable Row Level Security
ALTER TABLE service_questionnaire_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own questionnaire submissions
CREATE POLICY "Users can insert own questionnaire submissions" 
    ON service_questionnaire_submissions
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own questionnaire submissions
CREATE POLICY "Users can view own questionnaire submissions" 
    ON service_questionnaire_submissions
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Therapists can view questionnaire submissions for their patients
CREATE POLICY "Therapists can view patient questionnaire submissions" 
    ON service_questionnaire_submissions
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM therapists t
            WHERE t.user_id = auth.uid()
            AND t.is_approved = true
        )
        AND EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.patient_id = service_questionnaire_submissions.user_id
            AND b.therapist_id IN (
                SELECT id FROM therapists WHERE user_id = auth.uid()
            )
        )
    );

-- Policy: Admins can view all questionnaire submissions
CREATE POLICY "Admins can view all questionnaire submissions" 
    ON service_questionnaire_submissions
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'super_admin')
        )
    );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_questionnaire_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_questionnaire_submissions_updated_at
    BEFORE UPDATE ON service_questionnaire_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_questionnaire_submissions_updated_at();

-- Comments for documentation
COMMENT ON TABLE service_questionnaire_submissions IS 'Stores intake questionnaire responses based on selected service type';
COMMENT ON COLUMN service_questionnaire_submissions.questionnaire_id IS 'Identifier for the questionnaire type (e.g., individual-couples-intake, group-therapy-intake)';
COMMENT ON COLUMN service_questionnaire_submissions.service_type IS 'The service type selected (e.g., individual, couple, group, yoga)';
COMMENT ON COLUMN service_questionnaire_submissions.data IS 'JSON object containing all questionnaire responses';
