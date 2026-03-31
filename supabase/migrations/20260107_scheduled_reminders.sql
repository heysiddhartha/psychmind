-- ==========================================
-- SCHEDULED REMINDERS TABLE
-- For automated booking reminders
-- ==========================================

CREATE TABLE IF NOT EXISTS public.scheduled_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
    reminder_type TEXT NOT NULL, -- '24h', '1h', '15m', 'custom'
    send_at TIMESTAMPTZ NOT NULL,
    message TEXT,
    include_meeting_link BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    channels TEXT[] DEFAULT ARRAY['notification'], -- 'notification', 'email', 'sms'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_reminders_send_at ON public.scheduled_reminders(send_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reminders_booking ON public.scheduled_reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.scheduled_reminders(status);

-- RLS policies
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System manages reminders" ON public.scheduled_reminders
    FOR ALL USING (true);

-- ==========================================
-- BOOKING CANCELLATION TRACKING
-- ==========================================

-- Add cancellation fields to bookings if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'cancellation_reason') THEN
        ALTER TABLE public.bookings ADD COLUMN cancellation_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'cancelled_by') THEN
        ALTER TABLE public.bookings ADD COLUMN cancelled_by TEXT; -- 'client', 'therapist', 'admin'
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'cancelled_at') THEN
        ALTER TABLE public.bookings ADD COLUMN cancelled_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'rescheduled_from') THEN
        ALTER TABLE public.bookings ADD COLUMN rescheduled_from TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'amount') THEN
        ALTER TABLE public.bookings ADD COLUMN amount DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'currency') THEN
        ALTER TABLE public.bookings ADD COLUMN currency TEXT DEFAULT 'INR';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'payment_status') THEN
        ALTER TABLE public.bookings ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- ==========================================
-- FUNCTION: Cancel expired pending reminders
-- ==========================================

CREATE OR REPLACE FUNCTION cancel_expired_reminders()
RETURNS void AS $$
BEGIN
    UPDATE public.scheduled_reminders
    SET status = 'cancelled', updated_at = NOW()
    WHERE status = 'pending' 
    AND send_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- FUNCTION: Auto-cancel booking reminders when booking cancelled
-- ==========================================

CREATE OR REPLACE FUNCTION cancel_booking_reminders()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE public.scheduled_reminders
        SET status = 'cancelled', updated_at = NOW()
        WHERE booking_id = NEW.id AND status = 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_booking_cancelled ON public.bookings;
CREATE TRIGGER on_booking_cancelled
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    WHEN (NEW.status = 'cancelled')
    EXECUTE FUNCTION cancel_booking_reminders();

-- ==========================================
-- THERAPIST AVAILABILITY ENHANCEMENTS
-- ==========================================

-- Add accepts_new_clients if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'therapists' AND column_name = 'accepts_new_clients') THEN
        ALTER TABLE public.therapists ADD COLUMN accepts_new_clients BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'therapists' AND column_name = 'availability') THEN
        ALTER TABLE public.therapists ADD COLUMN availability JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'therapists' AND column_name = 'is_approved') THEN
        ALTER TABLE public.therapists ADD COLUMN is_approved BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Enable realtime for reminders
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_reminders;
