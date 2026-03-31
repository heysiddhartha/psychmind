-- Slot Locks Table Migration
-- This enables real-time slot reservation/locking for the booking system
-- to prevent double-bookings and race conditions

-- Enable Realtime for bookings table if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'bookings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore if already exists or other issues
END $$;

-- Create slot_locks table for temporary slot reservations
CREATE TABLE IF NOT EXISTS slot_locks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
    slot_datetime TIMESTAMPTZ NOT NULL,
    locked_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate locks for the same slot
    UNIQUE(therapist_id, slot_datetime)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_slot_locks_therapist_datetime 
ON slot_locks(therapist_id, slot_datetime);

CREATE INDEX IF NOT EXISTS idx_slot_locks_expires 
ON slot_locks(expires_at);

CREATE INDEX IF NOT EXISTS idx_slot_locks_user 
ON slot_locks(locked_by);

-- Enable Row Level Security
ALTER TABLE slot_locks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for slot_locks

-- Users can read all locks (to see which slots are being booked)
CREATE POLICY "Anyone can view slot locks"
ON slot_locks FOR SELECT
USING (true);

-- Users can create locks for themselves
CREATE POLICY "Users can create their own locks"
ON slot_locks FOR INSERT
WITH CHECK (auth.uid() = locked_by);

-- Users can update their own locks (to extend them)
CREATE POLICY "Users can update their own locks"
ON slot_locks FOR UPDATE
USING (auth.uid() = locked_by);

-- Users can delete their own locks
CREATE POLICY "Users can delete their own locks"
ON slot_locks FOR DELETE
USING (auth.uid() = locked_by);

-- Service role can manage all locks (for cleanup)
CREATE POLICY "Service role can manage all locks"
ON slot_locks FOR ALL
USING (auth.role() = 'service_role');

-- Enable Realtime for slot_locks table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'slot_locks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE slot_locks;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Function to automatically cleanup expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_slot_locks()
RETURNS void AS $$
BEGIN
    DELETE FROM slot_locks WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to atomically lock a slot
CREATE OR REPLACE FUNCTION lock_slot(
    p_therapist_id UUID,
    p_slot_datetime TIMESTAMPTZ,
    p_user_id UUID,
    p_duration_minutes INT DEFAULT 5
)
RETURNS JSON AS $$
DECLARE
    v_existing_lock slot_locks%ROWTYPE;
    v_new_lock slot_locks%ROWTYPE;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- First cleanup expired locks
    PERFORM cleanup_expired_slot_locks();
    
    -- Check for existing confirmed booking
    IF EXISTS (
        SELECT 1 FROM bookings 
        WHERE therapist_id = p_therapist_id 
        AND scheduled_at = p_slot_datetime
        AND status NOT IN ('cancelled', 'no_show')
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Slot already booked');
    END IF;
    
    -- Try to get existing active lock
    SELECT * INTO v_existing_lock FROM slot_locks
    WHERE therapist_id = p_therapist_id 
    AND slot_datetime = p_slot_datetime
    AND expires_at > NOW()
    FOR UPDATE;
    
    v_expires_at := NOW() + (p_duration_minutes || ' minutes')::INTERVAL;
    
    IF v_existing_lock IS NOT NULL THEN
        IF v_existing_lock.locked_by = p_user_id THEN
            -- Extend existing lock
            UPDATE slot_locks 
            SET expires_at = v_expires_at
            WHERE id = v_existing_lock.id
            RETURNING * INTO v_new_lock;
            
            RETURN json_build_object('success', true, 'lock_id', v_new_lock.id);
        ELSE
            RETURN json_build_object('success', false, 'error', 'Slot is being booked by another user');
        END IF;
    END IF;
    
    -- Create new lock
    BEGIN
        INSERT INTO slot_locks (therapist_id, slot_datetime, locked_by, expires_at)
        VALUES (p_therapist_id, p_slot_datetime, p_user_id, v_expires_at)
        RETURNING * INTO v_new_lock;
        
        RETURN json_build_object('success', true, 'lock_id', v_new_lock.id);
    EXCEPTION WHEN unique_violation THEN
        RETURN json_build_object('success', false, 'error', 'Failed to acquire lock');
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to atomically create a booking with conflict detection
CREATE OR REPLACE FUNCTION create_booking_atomic(
    p_patient_id UUID,
    p_therapist_id UUID,
    p_scheduled_at TIMESTAMPTZ,
    p_duration_minutes INT,
    p_service_type TEXT,
    p_meeting_link TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_amount DECIMAL DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    v_booking bookings%ROWTYPE;
    v_end_time TIMESTAMPTZ;
BEGIN
    v_end_time := p_scheduled_at + (p_duration_minutes || ' minutes')::INTERVAL;
    
    -- Check for overlapping bookings
    IF EXISTS (
        SELECT 1 FROM bookings 
        WHERE therapist_id = p_therapist_id 
        AND status NOT IN ('cancelled', 'no_show')
        AND (
            (scheduled_at, scheduled_at + (duration_minutes || ' minutes')::INTERVAL) 
            OVERLAPS 
            (p_scheduled_at, v_end_time)
        )
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Time slot conflict detected');
    END IF;
    
    -- Create booking
    INSERT INTO bookings (
        patient_id, therapist_id, scheduled_at, duration_minutes,
        service_type, status, meeting_link, notes, amount, payment_status
    ) VALUES (
        p_patient_id, p_therapist_id, p_scheduled_at, p_duration_minutes,
        p_service_type, 'confirmed', p_meeting_link, p_notes, p_amount,
        CASE WHEN p_amount = 0 THEN 'paid' ELSE 'pending' END
    )
    RETURNING * INTO v_booking;
    
    -- Release any locks for this slot
    DELETE FROM slot_locks 
    WHERE therapist_id = p_therapist_id 
    AND slot_datetime = p_scheduled_at;
    
    RETURN json_build_object('success', true, 'booking_id', v_booking.id);
EXCEPTION WHEN unique_violation THEN
    RETURN json_build_object('success', false, 'error', 'Slot was just booked');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to cleanup expired locks (runs every minute)
-- Note: This requires pg_cron extension which may need to be enabled in Supabase
-- If pg_cron is not available, the cleanup happens on each lock attempt
DO $$
BEGIN
    -- Only attempt if pg_cron is available
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
            'cleanup-expired-slot-locks',
            '* * * * *', -- Every minute
            'SELECT cleanup_expired_slot_locks()'
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL; -- pg_cron not available, manual cleanup will occur
END $$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON slot_locks TO authenticated;
GRANT EXECUTE ON FUNCTION lock_slot TO authenticated;
GRANT EXECUTE ON FUNCTION create_booking_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_slot_locks TO authenticated;
