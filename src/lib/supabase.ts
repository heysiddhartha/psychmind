// Supabase Configuration
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Validate Supabase configuration in development
if (import.meta.env.DEV) {
  if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
    console.error('❌ VITE_SUPABASE_URL is not configured. Please check your .env file.');
  }
  if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
    console.error('❌ VITE_SUPABASE_ANON_KEY is not configured. Please check your .env file.');
  }
  if (supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co') {
    console.log('✅ Supabase URL configured:', supabaseUrl);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE for better security
    storage: window.localStorage,
    storageKey: '3tree-auth',
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// ==========================================
// Database Types
// ==========================================

export type UserRole = 'client' | 'therapist' | 'admin' | 'super_admin';
export type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type SessionMode = 'video' | 'audio' | 'chat' | 'in_person';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type CallStatus = 'waiting' | 'ringing' | 'active' | 'ended' | 'missed' | 'declined';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  date_of_birth?: string | null;
  gender?: GenderType | null;
  timezone?: string;
  is_active?: boolean;
  is_profile_complete?: boolean;
  last_seen_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientDetails {
  id: string;
  user_id: string;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
  medical_history?: unknown[] | null;
  current_medications?: string | null;
  allergies?: string | null;
  insurance_provider?: string | null;
  insurance_policy_number?: string | null;
  consent_signed_at?: string | null;
  created_at: string;
  updated_at: string;
}





export interface SessionNote {
  id: string;
  booking_id: string;
  therapist_id: string;
  patient_id: string;
  soap_subjective?: string | null;
  soap_objective?: string | null;
  soap_assessment?: string | null;
  soap_plan?: string | null;
  diagnosis_codes?: string[];
  treatment_progress?: string | null;
  homework_assigned?: string | null;
  is_signed: boolean;
  signed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TherapistAvailability {
  id: string;
  therapist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface Therapist {
  id: string;
  user_id: string;
  title?: string | null;
  credentials: string[];
  license_number?: string | null;
  license_state?: string | null;
  bio?: string | null;
  short_bio?: string | null;
  specialties: string[];
  languages: string[];
  years_experience?: number | null;
  session_rate_individual: number;
  session_rate_couple: number;
  session_rate_family: number;
  accepts_new_clients: boolean;
  is_verified: boolean;
  is_active: boolean;
  photo_url?: string | null;
  video_intro_url?: string | null;
  average_rating: number;
  total_reviews: number;
  total_sessions: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: User;
}

export interface Booking {
  id: string;
  client_id: string;
  therapist_id: string;
  service_category_id?: string | null;
  package_id?: string | null;
  session_number: number;
  total_sessions: number;
  session_mode: SessionMode;
  scheduled_at: string;
  duration_minutes: number;
  status: BookingStatus;
  meeting_url?: string | null;
  room_id?: string | null;
  client_timezone?: string | null;
  notes_client?: string | null;
  notes_therapist?: string | null;
  intake_form_completed: boolean;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  client?: User;
  therapist?: Therapist;
}

export interface VideoCallSession {
  id: string;
  room_id: string;
  booking_id?: string | null;
  initiator_id: string;
  receiver_id: string;
  status: CallStatus;
  session_mode: SessionMode;
  offer_sdp?: string | null;
  answer_sdp?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  duration_seconds?: number | null;
  quality_rating?: number | null;
  created_at: string;
}

export interface IceCandidate {
  id: string;
  session_id: string;
  sender_id: string;
  candidate: RTCIceCandidateInit;
  created_at: string;
}

export interface Conversation {
  id: string;
  booking_id?: string | null;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at?: string | null;
  last_message_preview?: string | null;
  is_active: boolean;
  created_at: string;
  // Joined fields
  participant_1?: User;
  participant_2?: User;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id?: string | null;
  content?: string | null;
  file_url?: string | null;
  file_type?: string | null;
  file_name?: string | null;
  is_read: boolean;
  read_at?: string | null;
  is_deleted: boolean;
  created_at: string;
  // Joined fields
  sender?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  image_url?: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface SessionPackage {
  id: string;
  name: string;
  session_count: number;
  discount_percent: number;
  description?: string | null;
  is_active: boolean;
}

// ==========================================
// Realtime Helpers
// ==========================================

export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
): RealtimeChannel {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => callback(payload.new as Message)
    )
    .subscribe();
}

export function subscribeToVideoSession(
  roomId: string,
  callbacks: {
    onSessionUpdate?: (session: VideoCallSession) => void;
    onIceCandidate?: (candidate: IceCandidate) => void;
  }
): RealtimeChannel {
  const channel = supabase.channel(`video:${roomId}`);

  if (callbacks.onSessionUpdate) {
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'video_call_sessions',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => callbacks.onSessionUpdate!(payload.new as VideoCallSession)
    );
  }

  if (callbacks.onIceCandidate) {
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'call_ice_candidates',
        filter: `session_id=eq.${roomId}`
      },
      (payload) => callbacks.onIceCandidate!(payload.new as IceCandidate)
    );
  }

  return channel.subscribe();
}

export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
): RealtimeChannel {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => callback(payload.new as Notification)
    )
    .subscribe();
}

// ==========================================
// Utility Functions
// ==========================================

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function generateRoomId(): string {
  return `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
