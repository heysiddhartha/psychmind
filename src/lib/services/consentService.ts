/**
 * Consent Service - Informed Consent Management
 * Handles service-specific informed consent records
 */

import { supabase } from '../supabase';

// ==========================================
// Types
// ==========================================

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_version: string;
  selected_services: string[];
  agreed_at: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsentSubmission {
  user_id: string;
  consent_version: string;
  selected_services: string[];
  ip_address?: string;
  user_agent?: string;
}

export interface ConsentValidationResult {
  isValid: boolean;
  errors: string[];
}

// ==========================================
// Constants
// ==========================================

export const CONSENT_VERSION = '1.0';

export const SERVICE_TYPES = {
  PSYCHIATRIC: 'psychiatric-consultation',
  INDIVIDUAL_THERAPY: 'individual-therapy',
  GROUP_THERAPY: 'group-therapy',
  YOGA_WELLNESS: 'yoga-wellness',
  NUTRITION: 'nutrition-guidance',
  CHILD_ADOLESCENT: 'child-adolescent',
} as const;

// ==========================================
// Service Functions
// ==========================================

/**
 * Save user consent to database
 */
export async function saveConsent(
  submission: ConsentSubmission
): Promise<{ success: boolean; error?: string; record?: ConsentRecord }> {
  try {
    const { data, error } = await supabase
      .from('consent_records')
      .insert(submission)
      .select()
      .single();

    if (error) throw error;

    return { success: true, record: data as ConsentRecord };
  } catch (error) {
    console.error('Failed to save consent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save consent',
    };
  }
}

/**
 * Get user's most recent consent record
 */
export async function getUserConsent(
  userId: string
): Promise<ConsentRecord | null> {
  try {
    const { data, error } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', userId)
      .order('agreed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as ConsentRecord | null;
  } catch (error) {
    console.error('Failed to fetch consent:', error);
    return null;
  }
}

/**
 * Get all consent records for a user
 */
export async function getUserConsentHistory(
  userId: string
): Promise<ConsentRecord[]> {
  try {
    const { data, error } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', userId)
      .order('agreed_at', { ascending: false });

    if (error) throw error;
    return data as ConsentRecord[];
  } catch (error) {
    console.error('Failed to fetch consent history:', error);
    return [];
  }
}

/**
 * Check if user has valid consent for specific services
 */
export async function hasValidConsent(
  userId: string,
  requiredServices: string[],
  requiredVersion: string = CONSENT_VERSION
): Promise<boolean> {
  const consent = await getUserConsent(userId);

  if (!consent) return false;
  if (consent.consent_version !== requiredVersion) return false;

  // Check if all required services are in the consent record
  return requiredServices.every((service) =>
    consent.selected_services.includes(service)
  );
}

/**
 * Validate consent submission
 */
export function validateConsentSubmission(
  selectedServices: string[],
  agreementChecked: boolean
): ConsentValidationResult {
  const errors: string[] = [];

  if (selectedServices.length === 0) {
    errors.push('Please select at least one service');
  }

  if (!agreementChecked) {
    errors.push('Please check the agreement checkbox to proceed');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get client IP address (browser-side approximation)
 */
export async function getClientIP(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to fetch IP:', error);
    return undefined;
  }
}

/**
 * Get user agent string
 */
export function getUserAgent(): string {
  return navigator.userAgent;
}

/**
 * Create consent submission with audit trail
 */
export async function createConsentSubmission(
  userId: string,
  selectedServices: string[],
  consentVersion: string = CONSENT_VERSION
): Promise<ConsentSubmission> {
  const ip_address = await getClientIP();
  const user_agent = getUserAgent();

  return {
    user_id: userId,
    consent_version: consentVersion,
    selected_services: selectedServices,
    ip_address,
    user_agent,
  };
}

/**
 * Check if consent needs to be updated
 */
export async function needsConsentUpdate(
  userId: string,
  currentVersion: string = CONSENT_VERSION
): Promise<boolean> {
  const consent = await getUserConsent(userId);

  if (!consent) return true;
  if (consent.consent_version !== currentVersion) return true;

  return false;
}

export default {
  saveConsent,
  getUserConsent,
  getUserConsentHistory,
  hasValidConsent,
  validateConsentSubmission,
  getClientIP,
  getUserAgent,
  createConsentSubmission,
  needsConsentUpdate,
  CONSENT_VERSION,
  SERVICE_TYPES,
};
