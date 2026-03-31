/**
 * Assessment Take Page - Interactive Assessment with Questions
 */

import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import {
    ChevronRight,
    ChevronLeft,
    ArrowLeft,
    Check,
    AlertCircle,
    Download,
    MessageCircle,
    Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import {
    getAssessmentBySlug,
    calculateScore,
    submitAssessment,
    type Assessment,
    type AssessmentResult
} from '@/lib/services/assessmentService';
import { getMotionPreference } from '@/lib/gsap/presets';

// ==========================================
// Component
// ==========================================

export default function AssessmentTake() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const pageRef = useRef<HTMLDivElement>(null);

    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<AssessmentResult | null>(null);

    // Load assessment
    useEffect(() => {
        async function loadAssessment() {
            if (!slug) return;

            try {
                const data = await getAssessmentBySlug(slug);
                if (data) {
                    setAssessment(data);
                } else {
                    navigate('/assessments');
                }
            } catch (error) {
                console.error('Failed to load assessment:', error);
                navigate('/assessments');
            } finally {
                setIsLoading(false);
            }
        }
        loadAssessment();
    }, [slug, navigate]);

    // Animate question transitions
    useEffect(() => {
        if (getMotionPreference() || !assessment) return;

        gsap.fromTo(
            '.question-card',
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
        );
    }, [currentQuestion, assessment]);

    // Animate results
    useEffect(() => {
        if (getMotionPreference() || !result) return;

        gsap.fromTo(
            '.result-card',
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
        );

        gsap.fromTo(
            '.result-score',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: 'power2.out' }
        );

        gsap.fromTo(
            '.result-recommendations',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, delay: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
    }, [result]);

    const selectAnswer = (questionId: string, value: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleNext = () => {
        if (assessment && currentQuestion < assessment.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect');

    const handleSubmit = async () => {
        if (!assessment) return;

        setIsSubmitting(true);

        try {
            // Calculate result
            const calculatedResult = calculateScore(assessment, answers);

            // Submit if user is logged in
            if (user) {
                await submitAssessment(assessment.id, user.id, answers);
            }

            setResult(calculatedResult);

            if (redirectUrl) {
                setTimeout(() => {
                    navigate(redirectUrl);
                }, 3000);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit assessment. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            </Layout>
        );
    }

    if (!assessment) {
        return null;
    }

    const question = assessment.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;
    const allAnswered = assessment.questions.every(q => answers[q.id] !== undefined);
    const currentAnswered = answers[question.id] !== undefined;

    // Results View
    if (result) {
        return (
            <Layout>
                <Helmet>
                    <title>Your Results | {assessment.name} | 3-3.com</title>
                </Helmet>

                <div ref={pageRef} className="min-h-screen bg-gray-50 py-12 px-4">
                    <div className="container mx-auto max-w-2xl">
                        {/* Back Link */}
                        <Link
                            to="/assessments"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Assessments
                        </Link>

                        {/* Result Card */}
                        <div className="result-card bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Header */}
                            <div
                                className="p-8 text-center text-white"
                                style={{ backgroundColor: result.color }}
                            >
                                <h1 className="text-2xl font-serif mb-2">Your Results</h1>
                                <p className="text-white/80">{assessment.name}</p>
                            </div>

                            {/* Score */}
                            <div className="result-score p-8 text-center border-b border-gray-100">
                                <div className="mb-4">
                                    <span className="text-6xl font-bold text-gray-900">{result.score}</span>
                                    <span className="text-2xl text-gray-400">/{result.maxScore}</span>
                                </div>
                                <div
                                    className="inline-block px-4 py-2 rounded-full text-sm font-medium"
                                    style={{
                                        backgroundColor: `${result.color}20`,
                                        color: result.color
                                    }}
                                >
                                    {result.severity}
                                </div>
                            </div>

                            {/* Interpretation */}
                            <div className="p-8 border-b border-gray-100">
                                <h2 className="font-semibold text-gray-900 mb-3">What This Means</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {result.interpretation}
                                </p>
                            </div>

                            {/* Recommendations */}
                            <div className="p-8 bg-gray-50">
                                <h2 className="font-semibold text-gray-900 mb-4">Recommendations</h2>
                                <ul className="space-y-3">
                                    {result.recommendations.map((rec, idx) => (
                                        <li
                                            key={idx}
                                            className="result-recommendations flex items-start gap-3"
                                        >
                                            <Check
                                                className="w-5 h-5 mt-0.5 flex-shrink-0"
                                                style={{ color: result.color }}
                                            />
                                            <span className="text-gray-700">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="p-8 flex flex-col sm:flex-row gap-4">
                                <Button asChild className="btn-icy flex-1">
                                    <Link to="/booking">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Talk to a Therapist
                                    </Link>
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Results
                                </Button>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                This self-assessment is for educational purposes only and is not a clinical diagnosis.
                                Please consult a licensed mental health professional for proper evaluation.
                            </p>
                        </div>

                        {/* Retake Button */}
                        <div className="mt-6 text-center">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setResult(null);
                                    setAnswers({});
                                    setCurrentQuestion(0);
                                }}
                            >
                                Retake Assessment
                            </Button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Assessment Questions View
    return (
        <Layout>
            <Helmet>
                <title>{assessment.name} | 3-3.com</title>
            </Helmet>

            <div ref={pageRef} className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="container mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            to="/assessments"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Exit Assessment
                        </Link>
                        <h1 className="text-2xl font-serif text-gray-900">{assessment.name}</h1>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                            <span>Question {currentQuestion + 1} of {assessment.questions.length}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="question-card bg-white rounded-2xl p-8 shadow-sm mb-6">
                        <p className="text-lg text-gray-900 mb-6 leading-relaxed">
                            {question.text}
                        </p>

                        <p className="text-sm text-gray-500 mb-4">
                            Over the last 2 weeks, how often have you experienced this?
                        </p>

                        <div className="space-y-3">
                            {question.options?.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => selectAnswer(question.id, option.value)}
                                    className={`w-full p-4 rounded-xl border text-left transition-all
                                        ${answers[question.id] === option.value
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                            ${answers[question.id] === option.value
                                                ? 'border-primary bg-primary'
                                                : 'border-gray-300'
                                            }`}
                                        >
                                            {answers[question.id] === option.value && (
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <span className="text-gray-700">{option.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentQuestion === 0}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>

                        {currentQuestion === assessment.questions.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={!allAnswered || isSubmitting}
                                className="btn-icy"
                            >
                                {isSubmitting ? 'Processing...' : 'See Results'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={!currentAnswered}
                                className="btn-icy"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        )}
                    </div>

                    {/* Quick Jump */}
                    <div className="mt-8 flex flex-wrap justify-center gap-2">
                        {assessment.questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestion(idx)}
                                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors
                                    ${idx === currentQuestion
                                        ? 'bg-primary text-white'
                                        : answers[q.id] !== undefined
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
