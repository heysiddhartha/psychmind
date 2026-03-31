/**
 * PasswordStrengthIndicator - Visual password strength feedback component
 */

import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
    password: string;
    showRequirements?: boolean;
}

interface PasswordRequirement {
    label: string;
    regex: RegExp;
    met: boolean;
}

export default function PasswordStrengthIndicator({
    password,
    showRequirements = true
}: PasswordStrengthIndicatorProps) {
    const requirements: PasswordRequirement[] = useMemo(() => [
        {
            label: 'At least 8 characters',
            regex: /.{8,}/,
            met: /.{8,}/.test(password)
        },
        {
            label: 'Contains uppercase letter',
            regex: /[A-Z]/,
            met: /[A-Z]/.test(password)
        },
        {
            label: 'Contains lowercase letter',
            regex: /[a-z]/,
            met: /[a-z]/.test(password)
        },
        {
            label: 'Contains a number',
            regex: /\d/,
            met: /\d/.test(password)
        },
        {
            label: 'Contains special character',
            regex: /[!@#$%^&*(),.?":{}|<>]/,
            met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        }
    ], [password]);

    const strength = useMemo(() => {
        const score = requirements.filter(r => r.met).length;
        if (score === 0) return { level: 0, label: '', color: '' };
        if (score <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
        if (score === 3) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
        if (score === 4) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
        return { level: 4, label: 'Strong', color: 'bg-green-500' };
    }, [requirements]);

    if (!password) return null;

    return (
        <div className="mt-3 space-y-3 animate-fade-in">
            {/* Strength Bars */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Password Strength</span>
                    {strength.label && (
                        <span className={`font-medium ${strength.level === 1 ? 'text-red-500' :
                                strength.level === 2 ? 'text-orange-500' :
                                    strength.level === 3 ? 'text-yellow-600' :
                                        'text-green-500'
                            }`}>
                            {strength.label}
                        </span>
                    )}
                </div>
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map(bar => (
                        <div
                            key={bar}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${bar <= strength.level
                                    ? strength.color
                                    : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Requirements Checklist */}
            {showRequirements && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
                    {requirements.map((req, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-2 transition-all duration-200 ${req.met ? 'text-green-600' : 'text-gray-400'
                                }`}
                        >
                            {req.met ? (
                                <Check className="w-4 h-4 flex-shrink-0" />
                            ) : (
                                <X className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="text-xs">{req.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
