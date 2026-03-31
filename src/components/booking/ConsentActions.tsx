/**
 * ConsentActions Component
 * Action buttons for consent form (I Agree, Back)
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConsentActionsProps {
  onAgree: () => void;
  onBack?: () => void;
  disabled: boolean;
  loading: boolean;
}

export function ConsentActions({
  onAgree,
  onBack,
  disabled,
  loading,
}: ConsentActionsProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-4 border-t">
      {onBack ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="min-w-[120px]"
        >
          Back
        </Button>
      ) : (
        <div />
      )}

      <Button
        type="button"
        onClick={onAgree}
        disabled={disabled || loading}
        className="min-w-[120px]"
        aria-label="I agree to the informed consent"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'I Agree'
        )}
      </Button>
    </div>
  );
}
