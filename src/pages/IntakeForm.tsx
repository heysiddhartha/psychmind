/**
 * Intake Form Page - Dynamic Intake Form for New Clients
 */

import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import {
    ChevronRight,
    ChevronLeft,
    Check,
    Shield,
    Lock,
    AlertCircle,
    User,
    Phone,
    Heart,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { getFormBySlug, submitForm, validateFormData, type FormSchema, type FormField } from '@/lib/services/formService';
import { getMotionPreference } from '@/lib/gsap/presets';

// ==========================================
// Field Components
// ==========================================

interface FieldProps {
    field: FormField;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string;
}

function TextField({ field, value, onChange, error }: FieldProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                value={(value as string) || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors
                    ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function TextareaField({ field, value, onChange, error }: FieldProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
                value={(value as string) || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none
                    ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {field.validation?.minLength && (
                <p className="text-xs text-gray-500">
                    Minimum {field.validation.minLength} characters
                </p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function RadioField({ field, value, onChange, error }: FieldProps) {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
                {field.options?.map(option => (
                    <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors
                            ${value === option.value
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <input
                            type="radio"
                            name={field.name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <span className="text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function CheckboxField({ field, value, onChange, error }: FieldProps) {
    return (
        <div className="space-y-2">
            <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors
                ${value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
            >
                <input
                    type="checkbox"
                    checked={value as boolean || false}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-primary focus:ring-primary rounded"
                />
                <span className="text-sm text-gray-700 leading-relaxed">{field.label}</span>
            </label>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function CheckboxGroupField({ field, value, onChange, error }: FieldProps) {
    const selectedValues = (value as string[]) || [];

    const toggleValue = (optionValue: string) => {
        if (selectedValues.includes(optionValue)) {
            onChange(selectedValues.filter(v => v !== optionValue));
        } else {
            onChange([...selectedValues, optionValue]);
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="grid sm:grid-cols-2 gap-2">
                {field.options?.map(option => (
                    <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors
                            ${selectedValues.includes(option.value)
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <input
                            type="checkbox"
                            checked={selectedValues.includes(option.value)}
                            onChange={() => toggleValue(option.value)}
                            className="w-4 h-4 text-primary focus:ring-primary rounded"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function DateField({ field, value, onChange, error }: FieldProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type="date"
                value={(value as string) || ''}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors
                    ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function renderField(field: FormField, value: unknown, onChange: (value: unknown) => void, error?: string) {
    switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
            return <TextField field={field} value={value} onChange={onChange} error={error} />;
        case 'textarea':
            return <TextareaField field={field} value={value} onChange={onChange} error={error} />;
        case 'radio':
            return <RadioField field={field} value={value} onChange={onChange} error={error} />;
        case 'checkbox':
            return <CheckboxField field={field} value={value} onChange={onChange} error={error} />;
        case 'checkboxGroup':
            return <CheckboxGroupField field={field} value={value} onChange={onChange} error={error} />;
        case 'date':
            return <DateField field={field} value={value} onChange={onChange} error={error} />;
        default:
            return <TextField field={field} value={value} onChange={onChange} error={error} />;
    }
}

// ==========================================
// Main Component
// ==========================================

const sectionIcons: Record<string, React.ReactNode> = {
    personal: <User className="w-5 h-5" />,
    emergency: <Phone className="w-5 h-5" />,
    reason: <Heart className="w-5 h-5" />,
    history: <FileText className="w-5 h-5" />,
    safety: <AlertCircle className="w-5 h-5" />,
};

export default function IntakeForm() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const pageRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState<FormSchema | null>(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [formData, setFormData] = useState<Record<string, unknown>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Load form schema
    useEffect(() => {
        async function loadForm() {
            const intakeForm = await getFormBySlug('intake');
            setForm(intakeForm);
        }
        loadForm();
    }, []);

    // Animations
    useEffect(() => {
        if (getMotionPreference() || !pageRef.current) return;

        gsap.fromTo(
            '.form-header',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
    }, []);

    // Animate section transitions
    useEffect(() => {
        if (getMotionPreference()) return;

        gsap.fromTo(
            '.form-section',
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
        );
    }, [currentSection]);

    const updateField = (fieldName: string, value: unknown) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        // Clear error when field is updated
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const validateCurrentSection = (): boolean => {
        if (!form) return true;

        const section = form.sections[currentSection];
        const newErrors: Record<string, string> = {};

        for (const field of section.fields) {
            // Check conditional fields
            if (field.conditional) {
                const conditionValue = formData[field.conditional.field];
                if (conditionValue !== field.conditional.value) {
                    continue; // Skip validation for hidden fields
                }
            }

            if (field.required) {
                const value = formData[field.name];
                if (value === undefined || value === null || value === '' ||
                    (Array.isArray(value) && value.length === 0)) {
                    newErrors[field.name] = `${field.label} is required`;
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateCurrentSection() && form) {
            if (currentSection < form.sections.length - 1) {
                setCurrentSection(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const handlePrev = () => {
        if (currentSection > 0) {
            setCurrentSection(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect');

    const handleSubmit = async () => {
        if (!validateCurrentSection() || !form || !user) return;

        setIsSubmitting(true);

        try {
            const result = await submitForm(form.id, user.id, formData);

            if (result.error) {
                throw new Error(result.error);
            }

            setIsComplete(true);
            toast({
                title: 'Form Submitted',
                description: 'Thank you for completing the intake form.',
            });

            // Redirect if specialized
            if (redirectUrl) {
                setTimeout(() => {
                    navigate(redirectUrl);
                }, 2000);
            }
        } catch (error) {
            toast({
                title: 'Submission Failed',
                description: 'Please try again or contact support.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!form) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            </Layout>
        );
    }

    if (isComplete) {
        return (
            <Layout>
                <Helmet>
                    <title>Form Complete | 3-3.com</title>
                </Helmet>
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="max-w-md text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-serif text-gray-900 mb-4">
                            Thank You
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Your intake form has been submitted successfully. Your therapist will review
                            the information before your first session.
                        </p>
                        <Button asChild className="btn-icy">
                            <a href="/dashboard">Go to Dashboard</a>
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    const currentSectionData = form.sections[currentSection];
    const progress = ((currentSection + 1) / form.sections.length) * 100;

    return (
        <Layout>
            <Helmet>
                <title>Intake Form | 3-3.com</title>
            </Helmet>

            <div ref={pageRef} className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="container mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="form-header text-center mb-8">
                        <h1 className="text-3xl font-serif text-gray-900 mb-2">{form.name}</h1>
                        <p className="text-gray-600">{form.description}</p>
                    </div>

                    {/* Progress */}
                    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                            <span>Section {currentSection + 1} of {form.sections.length}</span>
                            <span>{Math.round(progress)}% complete</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Section Navigation */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {form.sections.map((section, idx) => (
                            <button
                                key={section.id}
                                onClick={() => idx <= currentSection && setCurrentSection(idx)}
                                disabled={idx > currentSection}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                    ${idx === currentSection
                                        ? 'bg-primary text-white'
                                        : idx < currentSection
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-400'
                                    }`}
                            >
                                {idx < currentSection ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    sectionIcons[section.id] || <span className="w-4">{idx + 1}</span>
                                )}
                                {section.title}
                            </button>
                        ))}
                    </div>

                    {/* Form Section */}
                    <div className="form-section bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-xl font-serif text-gray-900 mb-1">
                                {currentSectionData.title}
                            </h2>
                            {currentSectionData.description && (
                                <p className="text-sm text-gray-500">
                                    {currentSectionData.description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-6">
                            {currentSectionData.fields.map(field => {
                                // Check conditional visibility
                                if (field.conditional) {
                                    const conditionValue = formData[field.conditional.field];
                                    if (conditionValue !== field.conditional.value) {
                                        return null;
                                    }
                                }

                                return (
                                    <div key={field.id}>
                                        {renderField(
                                            field,
                                            formData[field.name],
                                            (value) => updateField(field.name, value),
                                            errors[field.name]
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                            <Button
                                variant="outline"
                                onClick={handlePrev}
                                disabled={currentSection === 0}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </Button>

                            {currentSection === form.sections.length - 1 ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="btn-icy"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Form'}
                                </Button>
                            ) : (
                                <Button onClick={handleNext} className="btn-icy">
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Trust Badge */}
                    <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                            <Lock className="w-4 h-4" />
                            Encrypted
                        </span>
                        <span className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            HIPAA Compliant
                        </span>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
