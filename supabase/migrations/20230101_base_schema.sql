-- ==========================================
-- psychmind COUNSELING PLATFORM DATABASE SCHEMA
-- Production-Ready with WebRTC Support
-- Run this in Supabase SQL Editor
-- ==========================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
SET search_path = public, extensions;

-- ==========================================
-- ENUM TYPES
-- ==========================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'therapist', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE session_mode AS ENUM ('video', 'audio', 'chat', 'in_person');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE call_status AS ENUM ('waiting', 'ringing', 'active', 'ended', 'missed', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==========================================
-- USERS (Main Profile Table)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'client',
    date_of_birth DATE,
    gender gender_type,
    address JSONB DEFAULT '{}',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    is_active BOOLEAN DEFAULT true,
    is_profile_complete BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, phone, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
    )
    ON CONFLICT (id) DO UPDATE SET
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
        full_name = CASE 
            WHEN public.users.full_name = '' THEN EXCLUDED.full_name 
            ELSE public.users.full_name 
        END,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- PATIENT DETAILS (Extended Profile)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.patient_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    medical_history_consent BOOLEAN DEFAULT false,
    consent_signed_at TIMESTAMPTZ,
    preferred_therapist_gender gender_type,
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- THERAPISTS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.therapists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    credentials TEXT[],
    license_number TEXT,
    license_state TEXT,
    bio TEXT,
    short_bio TEXT,
    specialties TEXT[],
    languages TEXT[] DEFAULT ARRAY['English'],
    years_experience INTEGER,
    session_rate_individual DECIMAL(10,2) DEFAULT 75.00,
    session_rate_couple DECIMAL(10,2) DEFAULT 100.00,
    session_rate_family DECIMAL(10,2) DEFAULT 120.00,
    accepts_new_clients BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    photo_url TEXT,
    video_intro_url TEXT,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SERVICE CATEGORIES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- ==========================================
-- SESSION PACKAGES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.session_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    session_count INTEGER NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- ==========================================
-- THERAPIST AVAILABILITY
-- ==========================================

CREATE TABLE IF NOT EXISTS public.therapist_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    UNIQUE(therapist_id, day_of_week, start_time)
);

CREATE TABLE IF NOT EXISTS public.therapist_blocked_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    reason TEXT
);

-- ==========================================
-- BOOKINGS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.users(id),
    therapist_id UUID REFERENCES public.therapists(id),
    service_category_id UUID REFERENCES public.service_categories(id),
    package_id UUID REFERENCES public.session_packages(id),
    session_number INTEGER DEFAULT 1,
    total_sessions INTEGER DEFAULT 1,
    session_mode session_mode DEFAULT 'video',
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 50,
    status booking_status DEFAULT 'pending',
    meeting_url TEXT,
    room_id TEXT,
    client_timezone TEXT,
    notes_client TEXT,
    notes_therapist TEXT,
    intake_form_completed BOOLEAN DEFAULT false,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PAYMENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id),
    client_id UUID REFERENCES public.users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status payment_status DEFAULT 'pending',
    provider TEXT,
    provider_payment_id TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- VIDEO CALL SESSIONS (WebRTC Signaling)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.video_call_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT UNIQUE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    initiator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status call_status DEFAULT 'waiting',
    session_mode session_mode DEFAULT 'video',
    offer_sdp TEXT,
    answer_sdp TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ICE Candidates for WebRTC
CREATE TABLE IF NOT EXISTS public.call_ice_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.video_call_sessions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    candidate JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CONVERSATIONS & MESSAGES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id),
    participant_1_id UUID REFERENCES public.users(id),
    participant_2_id UUID REFERENCES public.users(id),
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_1_id, participant_2_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id),
    content TEXT,
    file_url TEXT,
    file_type TEXT,
    file_name TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update conversation on new message
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100)
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_message();

-- ==========================================
-- ASSESSMENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    questions JSONB NOT NULL,
    scoring_logic JSONB,
    question_count INTEGER,
    estimated_minutes INTEGER,
    is_clinical BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.assessment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES public.assessments(id),
    user_id UUID REFERENCES public.users(id),
    answers JSONB NOT NULL,
    score INTEGER,
    severity TEXT,
    interpretation TEXT,
    recommendations TEXT[],
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- FORMS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT,
    schema JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES public.forms(id),
    user_id UUID REFERENCES public.users(id),
    booking_id UUID REFERENCES public.bookings(id),
    data JSONB NOT NULL,
    version INTEGER,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CONTENT TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    cover_image TEXT,
    author_id UUID REFERENCES public.users(id),
    category TEXT,
    tags TEXT[],
    read_time_minutes INTEGER DEFAULT 5,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Categories for filtering
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Site Settings for dynamic content
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.users(id)
);

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
    ('hero_tagline', '"We Help You Feel"', 'Main hero heading'),
    ('hero_subtitle', '"A welcoming space to explore your thoughts, heal at your pace, and feel truly heard."', 'Hero section subtitle'),
    ('hero_quote', '"Self Care isn''t selfish"', 'Inspirational quote on hero'),
    ('hero_badge', '"Now accepting new clients"', 'Badge text on hero'),
    ('contact_email', '"hello@psychmind.com"', 'Contact email'),
    ('contact_phone', '"+91 7047731824"', 'Contact phone'),
    ('social_instagram', '"https://instagram.com/psychmind"', 'Instagram URL'),
    ('social_facebook', '"https://facebook.com/psychmind"', 'Facebook URL'),
    ('social_linkedin', '"https://linkedin.com/company/psychmind"', 'LinkedIn URL'),
    ('footer_tagline', '"Your journey to wellness starts here"', 'Footer tagline')
ON CONFLICT (key) DO NOTHING;

-- Insert default blog categories
INSERT INTO public.blog_categories (name, slug, sort_order) VALUES
    ('Mental Health', 'mental-health', 1),
    ('Wellness', 'wellness', 2),
    ('Relationships', 'relationships', 3),
    ('Anxiety', 'anxiety', 4),
    ('Depression', 'depression', 5),
    ('Self-Care', 'self-care', 6)
ON CONFLICT (slug) DO NOTHING;

-- RLS for site_settings (admins can update, public can read)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads site_settings" ON public.site_settings;
CREATE POLICY "Public reads site_settings" ON public.site_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins update site_settings" ON public.site_settings;
CREATE POLICY "Admins update site_settings" ON public.site_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

DROP POLICY IF EXISTS "Public reads blog_categories" ON public.blog_categories;
CREATE POLICY "Public reads blog_categories" ON public.blog_categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage blog_categories" ON public.blog_categories;
CREATE POLICY "Admins manage blog_categories" ON public.blog_categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Admins can manage blogs
DROP POLICY IF EXISTS "Admins manage blogs" ON public.blogs;
CREATE POLICY "Admins manage blogs" ON public.blogs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initials TEXT NOT NULL,
    content TEXT NOT NULL,
    service_type TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    photo_url TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT,
    excerpt TEXT,
    content TEXT,
    file_url TEXT,
    cover_image TEXT,
    category TEXT,
    download_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    letter CHAR(1),
    description TEXT,
    content TEXT,
    is_published BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    type TEXT,
    image_url TEXT,
    external_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_therapists_active ON public.therapists(is_active, is_verified);
CREATE INDEX IF NOT EXISTS idx_therapists_specialties ON public.therapists USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist ON public.bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON public.bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON public.bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_video_sessions_room ON public.video_call_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_video_sessions_status ON public.video_call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ice_candidates_session ON public.call_ice_candidates(session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1_id, participant_2_id);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_ice_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view basic user info" ON public.users;
CREATE POLICY "Public can view basic user info" ON public.users
    FOR SELECT USING (true);

-- Patient Details
DROP POLICY IF EXISTS "Patients view own details" ON public.patient_details;
CREATE POLICY "Patients view own details" ON public.patient_details
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Patients update own details" ON public.patient_details;
CREATE POLICY "Patients update own details" ON public.patient_details
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Patients insert own details" ON public.patient_details;
CREATE POLICY "Patients insert own details" ON public.patient_details
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Therapists (public read for verified)
DROP POLICY IF EXISTS "Public can view verified therapists" ON public.therapists;
CREATE POLICY "Public can view verified therapists" ON public.therapists
    FOR SELECT USING (is_active = true AND is_verified = true);

DROP POLICY IF EXISTS "Therapists can view own profile" ON public.therapists;
CREATE POLICY "Therapists can view own profile" ON public.therapists
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Therapists can update own profile" ON public.therapists;
CREATE POLICY "Therapists can update own profile" ON public.therapists
    FOR UPDATE USING (user_id = auth.uid());

-- Bookings
DROP POLICY IF EXISTS "Clients view own bookings" ON public.bookings;
CREATE POLICY "Clients view own bookings" ON public.bookings
    FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Therapists view assigned bookings" ON public.bookings;
CREATE POLICY "Therapists view assigned bookings" ON public.bookings
    FOR SELECT USING (
        therapist_id IN (SELECT id FROM public.therapists WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Clients can create bookings" ON public.bookings;
CREATE POLICY "Clients can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Clients can update own bookings" ON public.bookings;
CREATE POLICY "Clients can update own bookings" ON public.bookings
    FOR UPDATE USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Therapists can update assigned bookings" ON public.bookings;
CREATE POLICY "Therapists can update assigned bookings" ON public.bookings
    FOR UPDATE USING (
        therapist_id IN (SELECT id FROM public.therapists WHERE user_id = auth.uid())
    );

-- Video Call Sessions
DROP POLICY IF EXISTS "Participants view own sessions" ON public.video_call_sessions;
CREATE POLICY "Participants view own sessions" ON public.video_call_sessions
    FOR SELECT USING (initiator_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users can create sessions" ON public.video_call_sessions;
CREATE POLICY "Users can create sessions" ON public.video_call_sessions
    FOR INSERT WITH CHECK (initiator_id = auth.uid());

DROP POLICY IF EXISTS "Participants can update sessions" ON public.video_call_sessions;
CREATE POLICY "Participants can update sessions" ON public.video_call_sessions
    FOR UPDATE USING (initiator_id = auth.uid() OR receiver_id = auth.uid());

-- ICE Candidates
DROP POLICY IF EXISTS "Session participants view candidates" ON public.call_ice_candidates;
CREATE POLICY "Session participants view candidates" ON public.call_ice_candidates
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.video_call_sessions 
            WHERE initiator_id = auth.uid() OR receiver_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users insert own candidates" ON public.call_ice_candidates;
CREATE POLICY "Users insert own candidates" ON public.call_ice_candidates
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Conversations & Messages
DROP POLICY IF EXISTS "Participants view conversations" ON public.conversations;
CREATE POLICY "Participants view conversations" ON public.conversations
    FOR SELECT USING (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

DROP POLICY IF EXISTS "Participants view messages" ON public.messages;
CREATE POLICY "Participants view messages" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM public.conversations
            WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Participants send messages" ON public.messages;
CREATE POLICY "Participants send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Participants update messages" ON public.messages;
CREATE POLICY "Participants update messages" ON public.messages
    FOR UPDATE USING (
        conversation_id IN (
            SELECT id FROM public.conversations
            WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
        )
    );

-- Notifications
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Assessment Submissions
DROP POLICY IF EXISTS "Users view own assessments" ON public.assessment_submissions;
CREATE POLICY "Users view own assessments" ON public.assessment_submissions
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users create own assessments" ON public.assessment_submissions;
CREATE POLICY "Users create own assessments" ON public.assessment_submissions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Form Submissions
DROP POLICY IF EXISTS "Users view own forms" ON public.form_submissions;
CREATE POLICY "Users view own forms" ON public.form_submissions
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users submit forms" ON public.form_submissions;
CREATE POLICY "Users submit forms" ON public.form_submissions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Public read policies for content
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads services" ON public.service_categories;
CREATE POLICY "Public reads services" ON public.service_categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public reads packages" ON public.session_packages;
CREATE POLICY "Public reads packages" ON public.session_packages
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public reads blogs" ON public.blogs;
CREATE POLICY "Public reads blogs" ON public.blogs
    FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public reads testimonials" ON public.testimonials;
CREATE POLICY "Public reads testimonials" ON public.testimonials
    FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Public reads resources" ON public.resources;
CREATE POLICY "Public reads resources" ON public.resources
    FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public reads products" ON public.products;
CREATE POLICY "Public reads products" ON public.products
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public reads assessments" ON public.assessments;
CREATE POLICY "Public reads assessments" ON public.assessments
    FOR SELECT USING (is_active = true);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- booking_confirmed, booking_cancelled, booking_reminder, new_message, call_incoming, session_note, payment_received, system
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own notifications" ON public.notifications;
CREATE POLICY "Users delete own notifications" ON public.notifications
    FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System creates notifications" ON public.notifications;
CREATE POLICY "System creates notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- ==========================================
-- SESSION NOTES (Therapist Documentation)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.session_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    therapist_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    -- SOAP Format
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
    -- Metadata
    is_signed BOOLEAN DEFAULT false,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_notes_therapist ON public.session_notes(therapist_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_patient ON public.session_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_booking ON public.session_notes(booking_id);

ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Therapists manage own notes" ON public.session_notes;
CREATE POLICY "Therapists manage own notes" ON public.session_notes
    FOR ALL USING (therapist_id = auth.uid());

DROP POLICY IF EXISTS "Patients view signed notes" ON public.session_notes;
CREATE POLICY "Patients view signed notes" ON public.session_notes
    FOR SELECT USING (patient_id = auth.uid() AND is_signed = true);

-- ==========================================
-- REALTIME SUBSCRIPTIONS
-- ===========================================

-- Enable realtime for messaging and video calls
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_call_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_ice_candidates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ==========================================
-- SEED DATA
-- ==========================================

-- Default service categories
INSERT INTO public.service_categories (name, slug, description, sort_order) VALUES
    ('Individual Therapy', 'individual', 'One-on-one sessions tailored to your personal journey', 1),
    ('Couple Therapy', 'couple', 'Strengthen your relationship through guided understanding', 2),
    ('Family Counseling', 'family', 'Navigate family dynamics and build stronger bonds', 3),
    ('Group Sessions', 'group', 'Connect with others facing similar challenges', 4),
    ('Child & Teen', 'youth', 'Age-appropriate support for young minds', 5)
ON CONFLICT (slug) DO NOTHING;

-- Default packages
INSERT INTO public.session_packages (name, session_count, discount_percent, description) VALUES
    ('Single Session', 1, 0, 'Try a session with no commitment'),
    ('3-Session Package', 3, 5, 'Begin your journey with a short series'),
    ('6-Session Package', 6, 10, 'Deeper exploration and progress'),
    ('10-Session Package', 10, 15, 'Comprehensive therapeutic journey')
ON CONFLICT DO NOTHING;
