/**
 * ChildConsentForm — Informed Parental Consent & Adolescent Assent
 * For clients below 18 years of age selecting Child & Adolescent Online Services.
 *
 * Two checkboxes:
 *  1. Parent / Legal Guardian consent (required)
 *  2. Teen Assent (Ages 13–17) (optional but encouraged)
 */

import React, { useState } from 'react';
import { Shield, Baby, HeartHandshake, AlertTriangle, Lock, Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChildConsentFormProps {
  onComplete: (data: { parentConsent: boolean; teenAssent: boolean }) => void;
  onBack?: () => void;
  loading?: boolean;
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ icon, title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50/70 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
          {icon}
        </div>
        <span className="flex-1 font-semibold text-gray-800 text-sm md:text-base">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-5 py-4 text-sm text-gray-700 leading-relaxed space-y-2 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ChildConsentForm({ onComplete, onBack, loading }: ChildConsentFormProps) {
  const [parentConsent, setParentConsent] = useState(false);
  const [teenAssent, setTeenAssent] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = () => {
    if (!parentConsent) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onComplete({ parentConsent, teenAssent });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 mx-auto">
          <Baby className="w-8 h-8 text-cyan-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Child &amp; Adolescent Online Services
        </h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto">
          Informed Parental Consent &amp; Adolescent Assent
        </p>
        <div className="inline-block bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
          For Clients Below 18 Years of Age
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>Please read carefully before proceeding.</strong> This consent applies to children
          and adolescents below 18 years receiving online mental health and wellness services
          through The3tree. All services are provided with the child's best interests, safety,
          dignity, and developmental needs as the primary consideration, in accordance with Indian
          law and accepted ethical practice.
        </p>
      </div>

      {/* Consent Sections */}
      <div className="space-y-3">
        <CollapsibleSection
          icon={<Shield className="w-4 h-4 text-cyan-600" />}
          title="Parent / Legal Guardian Authorization"
        >
          <p>
            The parent or legal guardian confirms that they have the <strong>legal authority</strong>{' '}
            to provide consent on behalf of the child/adolescent and that all information shared is
            accurate.
          </p>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<HeartHandshake className="w-4 h-4 text-cyan-600" />}
          title="Child / Adolescent Assent"
        >
          <p>
            The child/adolescent will be informed about the services in an{' '}
            <strong>age-appropriate and understandable manner</strong>, and their willing
            participation (assent) will be respected wherever possible.
          </p>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<Baby className="w-4 h-4 text-cyan-600" />}
          title="Nature of Services"
        >
          <p>
            Services may include psychiatric consultation, individual psychological
            therapy/counselling, yoga &amp; mind–body wellness services, and nutrition &amp;
            lifestyle guidance, as selected.
          </p>
          <p className="mt-2">It is understood that:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Psychiatric services may involve medical assessment and medication</li>
            <li>
              Therapy, yoga, and nutrition services are non-emergency and non-medical, unless
              explicitly stated
            </li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<Lock className="w-4 h-4 text-cyan-600" />}
          title="Online Service Delivery"
        >
          <p>
            Services are provided online (video or audio). Online services may involve technical
            limitations, physical emergency intervention is not possible, and absolute digital
            confidentiality cannot be guaranteed despite reasonable safeguards.
          </p>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<Shield className="w-4 h-4 text-cyan-600" />}
          title="Confidentiality & Its Limits"
        >
          <p>
            Information shared during sessions is treated as <strong>confidential</strong>.
            Confidentiality may be limited if there is:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Risk of harm</li>
            <li>Suspected abuse or neglect</li>
            <li>Legal requirements</li>
            <li>Concerns related to the child's safety or wellbeing</li>
          </ul>
          <p className="mt-2">
            Caregivers may receive relevant feedback while respecting the child's privacy.
          </p>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<AlertTriangle className="w-4 h-4 text-cyan-600" />}
          title="Emergency Disclaimer"
        >
          <p>
            The3tree is <strong>not</strong> an emergency or crisis service. In case of immediate
            risk, local emergency services, hospitals, or child protection services must be
            contacted.
          </p>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<HeartHandshake className="w-4 h-4 text-cyan-600" />}
          title="Voluntary Participation"
          defaultOpen={false}
        >
          <p>
            Participation in services is voluntary. Consent may be withdrawn at any time. No
            specific outcomes or improvements are guaranteed.
          </p>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<Lock className="w-4 h-4 text-cyan-600" />}
          title="Data Protection"
          defaultOpen={false}
        >
          <p>
            Personal and clinical information is collected and stored securely, accessed only by
            authorised professionals, and handled in accordance with applicable Indian
            data-protection laws.
          </p>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<Scale className="w-4 h-4 text-cyan-600" />}
          title="Governing Law"
          defaultOpen={false}
        >
          <p>
            This consent is governed by the laws of India, and disputes are subject to Indian
            jurisdiction.
          </p>
        </CollapsibleSection>
      </div>

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* Checkboxes */}
      <div className="space-y-5">
        {/* Parent / Legal Guardian Consent */}
        <label
          className={`flex items-start gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${
            parentConsent
              ? 'border-cyan-500 bg-cyan-50/50 shadow-sm'
              : showError
              ? 'border-red-400 bg-red-50/30'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <input
            type="checkbox"
            checked={parentConsent}
            onChange={(e) => {
              setParentConsent(e.target.checked);
              if (e.target.checked) setShowError(false);
            }}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
          />
          <div className="flex-1">
            <p className="text-sm md:text-base text-gray-800 leading-relaxed">
              <strong>Parent / Legal Guardian Consent</strong> — I confirm that I am the parent or
              legal guardian of the child/adolescent below 18 years. I have read and understood the
              above information and voluntarily consent to the selected online services for my
              child/adolescent. I also understand the limits of confidentiality, the non-emergency
              nature of services, and the conditions of online delivery.
            </p>
            <span className="inline-block mt-2 text-xs font-medium text-red-500">* Required</span>
          </div>
        </label>

        {/* Teen Assent (Ages 13–17) */}
        <label
          className={`flex items-start gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${
            teenAssent
              ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <input
            type="checkbox"
            checked={teenAssent}
            onChange={(e) => setTeenAssent(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
          />
          <div className="flex-1">
            <p className="text-sm md:text-base text-gray-800 leading-relaxed">
              <strong>Teen Assent (Ages 13–17)</strong> — I understand what these sessions are about
              and I agree to take part.
            </p>
            <span className="inline-block mt-2 text-xs font-medium text-gray-400">Optional</span>
          </div>
        </label>

        {showError && (
          <p className="text-red-500 text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Please provide parent / legal guardian consent to continue.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        {onBack && (
          <Button variant="outline" onClick={onBack} disabled={loading}>
            Back
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={loading || !parentConsent}
          className="btn-icy ml-auto px-10 py-3 text-base"
        >
          {loading ? 'Processing…' : 'Accept & Continue'}
        </Button>
      </div>
    </div>
  );
}
