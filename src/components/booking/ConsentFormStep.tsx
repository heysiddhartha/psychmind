/**
 * ConsentFormStep Component
 * Main container for the consent form step in booking flow
 * Service is pre-selected from the previous step
 */

import React, { useState, useEffect } from 'react';
import { ConsentContent } from './ConsentContent';
import { ConsentAgreement } from './ConsentAgreement';
import { ConsentActions } from './ConsentActions';
import {
  validateConsentSubmission,
  createConsentSubmission,
  saveConsent,
  SERVICE_TYPES,
  type ConsentSubmission,
} from '@/lib/services/consentService';
import { useToast } from '@/hooks/use-toast';

// Map booking service IDs to consent service IDs
const BOOKING_TO_CONSENT_MAP: Record<string, string> = {
  'individual': SERVICE_TYPES.INDIVIDUAL_THERAPY,
  'couple': SERVICE_TYPES.INDIVIDUAL_THERAPY,
  'child_adolescent': SERVICE_TYPES.CHILD_ADOLESCENT,
  'group': SERVICE_TYPES.GROUP_THERAPY,
  'consultation': SERVICE_TYPES.PSYCHIATRIC,
  'crisis': SERVICE_TYPES.INDIVIDUAL_THERAPY,
  'yoga': SERVICE_TYPES.YOGA_WELLNESS,
  'nutrition': SERVICE_TYPES.NUTRITION,
};

interface ConsentFormStepProps {
  onComplete: (consentData: ConsentSubmission) => void;
  onSkip?: () => void;
  userId: string;
  selectedBookingService?: string | null;
}

export function ConsentFormStep({
  onComplete,
  onSkip,
  userId,
  selectedBookingService,
}: ConsentFormStepProps) {
  const { toast } = useToast();
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    agreement?: string;
  }>({});

  // Auto-map the selected booking service to consent service IDs
  const selectedServices: string[] = selectedBookingService
    ? [BOOKING_TO_CONSENT_MAP[selectedBookingService] || SERVICE_TYPES.INDIVIDUAL_THERAPY]
    : [];

  const handleSubmit = async () => {
    if (!agreementChecked) {
      setValidationErrors({ agreement: 'Please check the agreement checkbox to proceed.' });
      toast({
        title: 'Agreement Required',
        description: 'Please check the agreement checkbox to proceed.',
        variant: 'destructive',
      });
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);

    try {
      const submission = await createConsentSubmission(userId, selectedServices);

      // Try to save to database, but don't block if it fails
      try {
        const result = await saveConsent(submission);
        if (result.success) {
          toast({
            title: 'Consent Recorded',
            description: 'Thank you for reviewing and accepting the terms.',
          });
        }
      } catch (dbError) {
        // Database save failed — consent still accepted locally
        console.warn('Could not save consent to database, proceeding anyway:', dbError);
      }

      // Always proceed — consent was accepted by the user
      onComplete(submission);
    } catch (error) {
      console.error('Consent submission error:', error);
      
      // Even if createConsentSubmission fails, build a local submission and proceed
      const fallbackSubmission: ConsentSubmission = {
        user_id: userId,
        consent_version: '1.0',
        selected_services: selectedServices,
      };
      onComplete(fallbackSubmission);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgreementChange = (checked: boolean) => {
    setAgreementChecked(checked);
    if (checked && validationErrors.agreement) {
      setValidationErrors({});
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Informed Consent</h1>
        <p className="text-gray-600">
          Please review and accept the informed consent before proceeding with your booking.
        </p>
      </div>

      {/* Consent Content */}
      <ConsentContent selectedServices={selectedServices} />

      {/* Agreement Checkbox */}
      <ConsentAgreement
        checked={agreementChecked}
        onChange={handleAgreementChange}
        disabled={isSubmitting}
        error={validationErrors.agreement}
      />

      {/* Action Buttons */}
      <ConsentActions
        onAgree={handleSubmit}
        onBack={onSkip}
        disabled={!agreementChecked}
        loading={isSubmitting}
      />
    </div>
  );
}
