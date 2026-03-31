/**
 * ConsentAgreement Component
 * Checkbox and agreement text for consent form
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConsentAgreementProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
}

export function ConsentAgreement({
  checked,
  onChange,
  disabled = false,
  error,
}: ConsentAgreementProps) {
  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex items-start space-x-3 rounded-lg border p-4 transition-colors',
          error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Checkbox
          id="consent-agreement"
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? 'consent-error' : undefined}
          className={cn(
            'mt-1',
            error && 'border-red-500 data-[state=checked]:bg-red-600'
          )}
        />
        <div className="flex-1">
          <Label
            htmlFor="consent-agreement"
            className={cn(
              'text-sm font-medium leading-relaxed cursor-pointer',
              error ? 'text-red-900' : 'text-gray-900',
              disabled && 'cursor-not-allowed'
            )}
          >
            I agree to the Informed Consent & Service Disclosure
          </Label>
          <p className="text-xs text-gray-600 mt-1">
            By checking this box, you confirm that you have read, understood, and agree to all the terms outlined in the informed consent form above.
          </p>
        </div>
      </div>

      {error && (
        <p
          id="consent-error"
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <span className="font-medium">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
