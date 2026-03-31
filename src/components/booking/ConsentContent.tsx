/**
 * ConsentContent Component
 * Displays consent text with dynamic sections based on selected services
 */

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  getRelevantSections,
  INTRO_SECTIONS,
  OUTRO_SECTIONS,
  getServiceSpecificSections,
} from '@/lib/consentContent';

interface ConsentContentProps {
  selectedServices: string[];
  onScrollComplete?: () => void;
}

export function ConsentContent({
  selectedServices,
  onScrollComplete,
}: ConsentContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = React.useState(false);

  const serviceSpecificSections = getServiceSpecificSections(selectedServices);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

      if (isAtBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);
        onScrollComplete?.();
      }
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [hasScrolledToBottom, onScrollComplete]);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">
          INFORMED CONSENT FORM
        </h2>
        <p className="text-sm text-blue-700">
          Please read the following information carefully before proceeding with your booking.
        </p>
      </div>

      <ScrollArea className="h-[500px] w-full rounded-md border p-6" ref={scrollRef}>
        <div className="space-y-6 pr-4">

          {/* 1. Intro Sections */}
          {INTRO_SECTIONS.map((section) => (
            <div key={section.id} className="rounded-lg p-4 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {section.title}
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}

          {/* 2. Services Selected Section */}
          {selectedServices.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                4. SERVICES SELECTED
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                (Please select all that apply)
              </p>
              <ul className="list-none space-y-1">
                {serviceSpecificSections.map((section) => (
                  <li key={section.id} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2">☑</span>
                    <span>{section.title.replace(/^\d+\.\s*CONSENT FOR\s*/i, '')}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-600 mt-3 italic">
                I understand that only the sections relevant to my selected services apply to me.
              </p>
            </div>
          )}

          {/* 3. Service Specific Consent Sections */}
          {serviceSpecificSections.map((section) => (
            <div
              key={section.id}
              className="rounded-lg p-4 transition-colors bg-yellow-50 border border-yellow-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {section.title}
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}

          {/* 4. Outro Sections */}
          {OUTRO_SECTIONS.map((section) => (
            <div key={section.id} className="rounded-lg p-4 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {section.title}
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}

          {/* Consent Declaration */}
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              17. CONSENT DECLARATION
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>By checking the box below, I confirm that:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>I have read and understood this informed consent</li>
                <li>I have had the opportunity to ask questions</li>
                <li>I voluntarily agree to receive services under the terms described above</li>
              </ul>
            </div>
          </div>
        </div>
      </ScrollArea>

      {selectedServices.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Please select at least one service above to see the relevant consent sections.
          </p>
        </div>
      )}
    </div>
  );
}
