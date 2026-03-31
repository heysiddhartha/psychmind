/**
 * ServiceQuestionnaire Component
 * Renders service-specific intake questionnaire in the booking flow
 * Multi-section form with validation and progress tracking
 */

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    User,
    Heart,
    Shield,
    Users,
    FileText,
    History,
    ClipboardCheck,
    Sparkles,
    Activity,
    Apple,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    type ServiceQuestionnaire as QuestionnaireType,
    type QuestionnaireSection,
    type Question,
    validateQuestionnaireData,
} from '@/lib/services/serviceQuestionnaireService';

// ==========================================
// Icon Map
// ==========================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    User,
    Heart,
    Shield,
    Users,
    FileText,
    History,
    ClipboardCheck,
    Sparkles,
    Activity,
    Apple,
};

// ==========================================
// Field Components
// ==========================================

interface FieldProps {
    question: Question;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string;
}

function TextField({ question, value, onChange, error }: FieldProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {question.label}
                {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type={question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : question.type === 'number' ? 'number' : 'text'}
                value={(value as string | number) ?? ''}
                onChange={(e) => onChange(question.type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={question.placeholder}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors outline-none
                    ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {question.helpText && <p className="text-xs text-gray-500">{question.helpText}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function TextareaField({ question, value, onChange, error }: FieldProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {question.label}
                {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
                value={(value as string) || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={question.placeholder}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors resize-none outline-none
                    ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function RadioField({ question, value, onChange, error }: FieldProps) {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                {question.label}
                {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={`space-y-2 ${error ? 'p-3 border-2 border-red-300 rounded-xl bg-red-50/30' : ''}`}>
                {question.options?.map(option => (
                    <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200
                            ${value === option.value
                                ? 'border-cyan-500 bg-cyan-50 shadow-sm'
                                : error 
                                    ? 'border-red-200 hover:border-red-300 bg-white'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <input
                            type="radio"
                            name={question.name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
    );
}

function CheckboxField({ question, value, onChange, error }: FieldProps) {
    return (
        <div className="space-y-2">
            <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200
                ${value ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
                <input
                    type="checkbox"
                    checked={value as boolean || false}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-cyan-600 focus:ring-cyan-500 rounded"
                />
                <div>
                    <span className="text-sm text-gray-700 leading-relaxed">{question.label}</span>
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                </div>
            </label>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function CheckboxGroupField({ question, value, onChange, error }: FieldProps) {
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
                {question.label}
                {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="grid sm:grid-cols-2 gap-2">
                {question.options?.map(option => (
                    <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200
                            ${selectedValues.includes(option.value)
                                ? 'border-cyan-500 bg-cyan-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <input
                            type="checkbox"
                            checked={selectedValues.includes(option.value)}
                            onChange={() => toggleValue(option.value)}
                            className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 rounded"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
    );
}

function renderField(question: Question, value: unknown, onChange: (value: unknown) => void, error?: string) {
    switch (question.type) {
        case 'text':
        case 'email':
        case 'phone':
        case 'number':
            return <TextField question={question} value={value} onChange={onChange} error={error} />;
        case 'textarea':
            return <TextareaField question={question} value={value} onChange={onChange} error={error} />;
        case 'radio':
        case 'select':
            return <RadioField question={question} value={value} onChange={onChange} error={error} />;
        case 'checkbox':
            return <CheckboxField question={question} value={value} onChange={onChange} error={error} />;
        case 'checkboxGroup':
            return <CheckboxGroupField question={question} value={value} onChange={onChange} error={error} />;
        default:
            return <TextField question={question} value={value} onChange={onChange} error={error} />;
    }
}

// ==========================================
// Main Component
// ==========================================

interface ServiceQuestionnaireProps {
    questionnaire: QuestionnaireType;
    onComplete: (data: Record<string, unknown>) => void;
    onSkip?: () => void;
    onBack: () => void;
}

export default function ServiceQuestionnaire({
    questionnaire,
    onComplete,
    onSkip,
    onBack,
}: ServiceQuestionnaireProps) {
    const [currentSection, setCurrentSection] = useState(0);
    const [formData, setFormData] = useState<Record<string, unknown>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const sections = questionnaire.sections;
    const totalSections = sections.length;
    const currentSectionData = sections[currentSection];
    const progress = ((currentSection + 1) / totalSections) * 100;

    // Animate section transitions
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion || !sectionRef.current) return;

        gsap.fromTo(
            sectionRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
        );
    }, [currentSection]);

    const updateField = (fieldName: string, value: unknown) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const isFieldVisible = (question: Question): boolean => {
        if (!question.conditional) return true;
        
        const conditionValue = formData[question.conditional.field];
        const expectedValues = Array.isArray(question.conditional.value)
            ? question.conditional.value
            : [question.conditional.value];
        
        return expectedValues.includes(conditionValue as string);
    };

    const validateCurrentSection = (): boolean => {
        const newErrors: Record<string, string> = {};

        for (const question of currentSectionData.questions) {
            if (!isFieldVisible(question)) continue;

            if (question.required) {
                const value = formData[question.name];
                if (
                    value === undefined ||
                    value === null ||
                    value === '' ||
                    (Array.isArray(value) && value.length === 0)
                ) {
                    newErrors[question.name] = `${question.label} is required`;
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (isSubmitting) return; // Prevent double submission
        
        if (!validateCurrentSection()) {
            // Scroll to first error
            toast({
                title: 'Required Fields Missing',
                description: 'Please fill in all required fields before proceeding.',
                variant: 'destructive',
            });
            setTimeout(() => {
                const firstErrorField = document.querySelector('.text-red-500');
                firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            return;
        }

        if (currentSection < totalSections - 1) {
            setCurrentSection(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Last section - validate all and complete
            setIsSubmitting(true);
            
            console.log('Form Data:', formData);
            const allErrors = validateQuestionnaireData(questionnaire, formData);
            console.log('Validation Errors:', allErrors);
            
            if (Object.keys(allErrors).length === 0) {
                onComplete(formData);
            } else {
                setIsSubmitting(false);
                // If there are errors from previous sections, go back to first section with errors
                setErrors(allErrors);
                
                // Find first section with errors
                for (let i = 0; i < sections.length; i++) {
                    const sectionHasError = sections[i].questions.some(q => allErrors[q.name]);
                    if (sectionHasError) {
                        const errorCount = sections[i].questions.filter(q => allErrors[q.name]).length;
                        toast({
                            title: 'Required Fields Missing',
                            description: `Please complete ${errorCount} required field${errorCount > 1 ? 's' : ''} in section: ${sections[i].title}`,
                            variant: 'destructive',
                        });
                        setCurrentSection(i);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setTimeout(() => {
                            const firstErrorField = document.querySelector('.text-red-500');
                            firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                        break;
                    }
                }
            }
        }
    };

    const handlePrev = () => {
        if (currentSection > 0) {
            setCurrentSection(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            onBack();
        }
    };

    const IconComponent = iconMap[currentSectionData.icon || 'FileText'] || FileText;

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-semibold mb-4 tracking-wide uppercase">
                    Section {currentSection + 1} of {totalSections}
                </span>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {questionnaire.title}
                </h2>
                <p className="text-gray-500 text-sm max-w-lg mx-auto">
                    {questionnaire.description}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-cyan-600">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Section Navigation Pills */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
                {sections.map((section, idx) => {
                    const SectionIcon = iconMap[section.icon || 'FileText'] || FileText;
                    const isCompleted = idx < currentSection;
                    const isCurrent = idx === currentSection;
                    
                    return (
                        <button
                            key={section.id}
                            onClick={() => idx <= currentSection && setCurrentSection(idx)}
                            disabled={idx > currentSection}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                                ${isCurrent
                                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                                    : isCompleted
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isCompleted ? (
                                <Check className="w-3 h-3" />
                            ) : (
                                <SectionIcon className="w-3 h-3" />
                            )}
                            <span className="hidden sm:inline">{section.title}</span>
                            <span className="sm:hidden">{idx + 1}</span>
                        </button>
                    );
                })}
            </div>

            {/* Section Content */}
            <div
                ref={sectionRef}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
                {/* Section Header */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-cyan-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{currentSectionData.title}</h3>
                            {currentSectionData.description && (
                                <p className="text-sm text-gray-500">{currentSectionData.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="p-6 space-y-6">
                    {currentSectionData.questions.map(question => {
                        if (!isFieldVisible(question)) return null;
                        
                        return (
                            <div key={question.id} className="question-field">
                                {renderField(
                                    question,
                                    formData[question.name],
                                    (value) => updateField(question.name, value),
                                    errors[question.name]
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Safety Notice for Safety Sections */}
                {currentSectionData.id.includes('safety') && (
                    <div className="mx-6 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <p className="font-medium mb-1">Your safety is our priority</p>
                                <p>If you are currently in crisis or experiencing thoughts of self-harm, please reach out to a crisis helpline immediately. Your therapist will review this information confidentially.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        className="px-6"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {currentSection === 0 ? 'Back' : 'Previous'}
                    </Button>

                    <div className="flex gap-3">
                        {onSkip && currentSection === 0 && (
                            <Button
                                variant="ghost"
                                onClick={onSkip}
                                className="text-gray-500"
                                disabled={isSubmitting}
                            >
                                Skip for now
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            className="btn-icy px-8"
                            disabled={isSubmitting}
                        >
                            {currentSection === totalSections - 1 ? (
                                <>
                                    {isSubmitting ? 'Submitting...' : 'Complete'}
                                    <Check className="w-4 h-4 ml-1" />
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Privacy Note */}
            <div className="mt-6 text-center">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" />
                    Your responses are confidential and shared only with your assigned therapist.
                </p>
            </div>
        </div>
    );
}
