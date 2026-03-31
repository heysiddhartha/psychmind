/**
 * Assessment Service - Psychometric Tests
 * Handles self-assessment tools, scoring, and recommendations
 */

import { supabase } from '../supabase';

// ==========================================
// Types
// ==========================================

export interface Assessment {
    id: string;
    name: string;
    slug: string;
    description: string;
    questions: AssessmentQuestion[];
    scoring_logic: ScoringLogic;
    question_count: number;
    estimated_minutes: number;
    is_clinical: boolean;
    is_active: boolean;
}

export interface AssessmentQuestion {
    id: string;
    text: string;
    type: 'likert' | 'yes_no' | 'multiple_choice' | 'text';
    options?: AnswerOption[];
    required: boolean;
    reverse_scored?: boolean;
}

export interface AnswerOption {
    value: number;
    label: string;
}

export interface ScoringLogic {
    type: 'sum' | 'average' | 'custom';
    ranges: ScoringRange[];
    factor?: number;
}

export interface ScoringRange {
    min: number;
    max: number;
    severity: string;
    interpretation: string;
    recommendations: string[];
    color: string;
}

export interface AssessmentSubmission {
    id: string;
    assessment_id: string;
    user_id: string;
    answers: Record<string, number | string>;
    score: number;
    severity: string;
    interpretation: string;
    recommendations: string[];
    pdf_url?: string;
    created_at: string;
}

export interface AssessmentResult {
    score: number;
    maxScore: number;
    percentage: number;
    severity: string;
    interpretation: string;
    recommendations: string[];
    color: string;
}

// ==========================================
// Assessment Definitions
// ==========================================

const PHQ9_ASSESSMENT: Assessment = {
    id: 'phq9',
    name: 'PHQ-9 Depression Screening',
    slug: 'phq-9',
    description: 'A 9-question tool used to screen for depression and assess its severity.',
    question_count: 9,
    estimated_minutes: 5,
    is_clinical: true,
    is_active: true,
    questions: ([
        { id: 'q1', text: 'Little interest or pleasure in doing things', type: 'likert' as const, required: true },
        { id: 'q2', text: 'Feeling down, depressed, or hopeless', type: 'likert' as const, required: true },
        { id: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much', type: 'likert' as const, required: true },
        { id: 'q4', text: 'Feeling tired or having little energy', type: 'likert' as const, required: true },
        { id: 'q5', text: 'Poor appetite or overeating', type: 'likert' as const, required: true },
        { id: 'q6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', type: 'likert' as const, required: true },
        { id: 'q7', text: 'Trouble concentrating on things, such as reading the newspaper or watching television', type: 'likert' as const, required: true },
        { id: 'q8', text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', type: 'likert' as const, required: true },
        { id: 'q9', text: 'Thoughts that you would be better off dead or of hurting yourself in some way', type: 'likert' as const, required: true },
    ]).map(q => ({
        ...q,
        options: [
            { value: 0, label: 'Not at all' },
            { value: 1, label: 'Several days' },
            { value: 2, label: 'More than half the days' },
            { value: 3, label: 'Nearly every day' }
        ]
    })),
    scoring_logic: {
        type: 'sum',
        ranges: [
            { min: 0, max: 4, severity: 'Minimal', interpretation: 'Your symptoms suggest minimal or no depression.', recommendations: ['Continue self-care practices', 'Monitor your mood'], color: '#22c55e' },
            { min: 5, max: 9, severity: 'Mild', interpretation: 'Your symptoms suggest mild depression.', recommendations: ['Consider speaking with a counselor', 'Practice daily self-care', 'Maintain social connections'], color: '#eab308' },
            { min: 10, max: 14, severity: 'Moderate', interpretation: 'Your symptoms suggest moderate depression.', recommendations: ['We recommend speaking with a mental health professional', 'Consider therapy options', 'Build a support network'], color: '#f97316' },
            { min: 15, max: 19, severity: 'Moderately Severe', interpretation: 'Your symptoms suggest moderately severe depression.', recommendations: ['Professional help is strongly recommended', 'Consider both therapy and medication evaluation', 'Reach out to a trusted person today'], color: '#ef4444' },
            { min: 20, max: 27, severity: 'Severe', interpretation: 'Your symptoms suggest severe depression.', recommendations: ['Please seek professional help immediately', 'Contact a crisis helpline if needed', 'Consider urgent care evaluation'], color: '#dc2626' }
        ]
    }
};

const GAD7_ASSESSMENT: Assessment = {
    id: 'gad7',
    name: 'GAD-7 Anxiety Screening',
    slug: 'gad-7',
    description: 'A 7-question tool used to screen for generalized anxiety disorder.',
    question_count: 7,
    estimated_minutes: 4,
    is_clinical: true,
    is_active: true,
    questions: ([
        { id: 'q1', text: 'Feeling nervous, anxious, or on edge', type: 'likert' as const, required: true },
        { id: 'q2', text: 'Not being able to stop or control worrying', type: 'likert' as const, required: true },
        { id: 'q3', text: 'Worrying too much about different things', type: 'likert' as const, required: true },
        { id: 'q4', text: 'Trouble relaxing', type: 'likert' as const, required: true },
        { id: 'q5', text: "Being so restless that it's hard to sit still", type: 'likert' as const, required: true },
        { id: 'q6', text: 'Becoming easily annoyed or irritable', type: 'likert' as const, required: true },
        { id: 'q7', text: 'Feeling afraid as if something awful might happen', type: 'likert' as const, required: true },
    ]).map(q => ({
        ...q,
        options: [
            { value: 0, label: 'Not at all' },
            { value: 1, label: 'Several days' },
            { value: 2, label: 'More than half the days' },
            { value: 3, label: 'Nearly every day' }
        ]
    })),
    scoring_logic: {
        type: 'sum',
        ranges: [
            { min: 0, max: 4, severity: 'Minimal', interpretation: 'Your symptoms suggest minimal anxiety.', recommendations: ['Continue healthy coping strategies', 'Practice relaxation techniques'], color: '#22c55e' },
            { min: 5, max: 9, severity: 'Mild', interpretation: 'Your symptoms suggest mild anxiety.', recommendations: ['Learn anxiety management techniques', 'Consider mindfulness practice', 'Monitor symptoms'], color: '#eab308' },
            { min: 10, max: 14, severity: 'Moderate', interpretation: 'Your symptoms suggest moderate anxiety.', recommendations: ['Speaking with a therapist is recommended', 'Learn coping strategies', 'Consider stress reduction'], color: '#f97316' },
            { min: 15, max: 21, severity: 'Severe', interpretation: 'Your symptoms suggest severe anxiety.', recommendations: ['Professional evaluation is recommended', 'Consider therapy and/or medication', 'Build a support system'], color: '#ef4444' }
        ]
    }
};

const PSS_ASSESSMENT: Assessment = {
    id: 'pss',
    name: 'Perceived Stress Scale',
    slug: 'pss',
    description: 'A 10-question tool to measure the perception of stress in your life.',
    question_count: 10,
    estimated_minutes: 5,
    is_clinical: false,
    is_active: true,
    questions: ([
        { id: 'q1', text: 'In the last month, how often have you been upset because of something that happened unexpectedly?', type: 'likert' as const, required: true },
        { id: 'q2', text: 'In the last month, how often have you felt that you were unable to control the important things in your life?', type: 'likert' as const, required: true },
        { id: 'q3', text: 'In the last month, how often have you felt nervous and stressed?', type: 'likert' as const, required: true },
        { id: 'q4', text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?', type: 'likert' as const, required: true, reverse_scored: true },
        { id: 'q5', text: 'In the last month, how often have you felt that things were going your way?', type: 'likert' as const, required: true, reverse_scored: true },
        { id: 'q6', text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?', type: 'likert' as const, required: true },
        { id: 'q7', text: 'In the last month, how often have you been able to control irritations in your life?', type: 'likert' as const, required: true, reverse_scored: true },
        { id: 'q8', text: 'In the last month, how often have you felt that you were on top of things?', type: 'likert' as const, required: true, reverse_scored: true },
        { id: 'q9', text: 'In the last month, how often have you been angered because of things that happened that were outside of your control?', type: 'likert' as const, required: true },
        { id: 'q10', text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?', type: 'likert' as const, required: true },
    ]).map(q => ({
        ...q,
        options: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Almost never' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Fairly often' },
            { value: 4, label: 'Very often' }
        ]
    })),
    scoring_logic: {
        type: 'sum',
        ranges: [
            { min: 0, max: 13, severity: 'Low', interpretation: 'Your stress levels appear to be low.', recommendations: ['Maintain current coping strategies', 'Continue self-care routines'], color: '#22c55e' },
            { min: 14, max: 26, severity: 'Moderate', interpretation: 'You\'re experiencing moderate stress levels.', recommendations: ['Practice stress management techniques', 'Consider lifestyle adjustments', 'Try relaxation exercises'], color: '#eab308' },
            { min: 27, max: 40, severity: 'High', interpretation: 'Your stress levels are elevated and may be affecting your well-being.', recommendations: ['Consider speaking with a professional', 'Prioritize stress reduction', 'Review work-life balance'], color: '#ef4444' }
        ]
    }
};

const availableAssessments = [PHQ9_ASSESSMENT, GAD7_ASSESSMENT, PSS_ASSESSMENT];

// ==========================================
// Assessment Service Functions
// ==========================================

/**
 * Fetch all active assessments
 */
export async function fetchAssessments(): Promise<Assessment[]> {
    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('is_active', true);

        if (error) throw error;
        if (data && data.length > 0) {
            return data as Assessment[];
        }
    } catch (error) {
        console.log('Using built-in assessments');
    }

    return availableAssessments;
}

/**
 * Get assessment by slug
 */
export async function getAssessmentBySlug(slug: string): Promise<Assessment | null> {
    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data as Assessment;
    } catch (error) {
        console.log('Using built-in assessment');
    }

    return availableAssessments.find(a => a.slug === slug) || null;
}

/**
 * Calculate assessment score
 */
export function calculateScore(
    assessment: Assessment,
    answers: Record<string, number>
): AssessmentResult {
    let totalScore = 0;
    const maxScore = assessment.questions.length * (assessment.questions[0].options?.length || 4) - 1;

    // Calculate score
    assessment.questions.forEach(question => {
        const answer = answers[question.id];
        if (answer !== undefined) {
            if (question.reverse_scored) {
                const maxOptionValue = Math.max(...(question.options?.map(o => o.value) || [4]));
                totalScore += maxOptionValue - answer;
            } else {
                totalScore += answer;
            }
        }
    });

    // Find severity range
    const range = assessment.scoring_logic.ranges.find(
        r => totalScore >= r.min && totalScore <= r.max
    ) || assessment.scoring_logic.ranges[assessment.scoring_logic.ranges.length - 1];

    return {
        score: totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100),
        severity: range.severity,
        interpretation: range.interpretation,
        recommendations: range.recommendations,
        color: range.color
    };
}

/**
 * Submit assessment and save results
 */
export async function submitAssessment(
    assessmentId: string,
    userId: string,
    answers: Record<string, number | string>
): Promise<{ submission: AssessmentSubmission | null; result: AssessmentResult | null; error: string | null }> {
    // Get assessment
    const assessment = availableAssessments.find(a => a.id === assessmentId);
    if (!assessment) {
        return { submission: null, result: null, error: 'Assessment not found' };
    }

    // Calculate score
    const numericAnswers = Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [k, typeof v === 'number' ? v : 0])
    );
    const result = calculateScore(assessment, numericAnswers);

    // Create submission
    const submissionData = {
        assessment_id: assessmentId,
        user_id: userId,
        answers,
        score: result.score,
        severity: result.severity,
        interpretation: result.interpretation,
        recommendations: result.recommendations
    };

    try {
        const { data, error } = await supabase
            .from('assessment_submissions')
            .insert(submissionData)
            .select()
            .single();

        if (error) throw error;
        return { submission: data as AssessmentSubmission, result, error: null };
    } catch (error) {
        // Return mock submission for development
        const mockSubmission: AssessmentSubmission = {
            id: `sub_${Date.now()}`,
            ...submissionData,
            created_at: new Date().toISOString()
        };
        return { submission: mockSubmission, result, error: null };
    }
}

/**
 * Get user's assessment history
 */
export async function getUserAssessments(userId: string): Promise<AssessmentSubmission[]> {
    try {
        const { data, error } = await supabase
            .from('assessment_submissions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as AssessmentSubmission[];
    } catch (error) {
        return [];
    }
}

/**
 * Get latest assessment result for a specific assessment
 */
export async function getLatestResult(
    userId: string,
    assessmentId: string
): Promise<AssessmentSubmission | null> {
    try {
        const { data, error } = await supabase
            .from('assessment_submissions')
            .select('*')
            .eq('user_id', userId)
            .eq('assessment_id', assessmentId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) throw error;
        return data as AssessmentSubmission;
    } catch (error) {
        return null;
    }
}

/**
 * Generate PDF report for assessment
 * In production, this would generate a proper PDF document
 */
export async function generatePDFReport(
    submission: AssessmentSubmission,
    assessment: Assessment
): Promise<{ url: string | null; error: string | null }> {
    // In production, this would:
    // 1. Generate PDF using a library like puppeteer or pdfkit
    // 2. Upload to Supabase Storage
    // 3. Return the public URL

    // For now, return null (PDF generation not implemented)
    return { url: null, error: 'PDF generation not yet implemented' };
}

/**
 * Get severity color for display
 */
export function getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
        'Minimal': '#22c55e',
        'Low': '#22c55e',
        'Mild': '#eab308',
        'Moderate': '#f97316',
        'Moderately Severe': '#ef4444',
        'Severe': '#dc2626',
        'High': '#ef4444'
    };
    return colors[severity] || '#6b7280';
}

/**
 * Get patient assessment summary for therapist preview
 */
export interface PatientAssessmentSummary {
    patient_id: string;
    patient_name: string;
    assessments: AssessmentSubmission[];
    latest_severity: string;
    risk_level: 'low' | 'moderate' | 'high' | 'severe';
    completed_count: number;
}

export async function getPatientAssessmentSummary(
    patientId: string
): Promise<{ data: PatientAssessmentSummary | null; error: Error | null }> {
    try {
        // Get patient info
        const { data: patient, error: patientError } = await supabase
            .from('users')
            .select('id, full_name')
            .eq('id', patientId)
            .single();

        if (patientError) {
            return { data: null, error: new Error(patientError.message) };
        }

        // Get assessments
        const assessments = await getUserAssessments(patientId);

        // Calculate risk level
        const riskLevel = calculateRiskLevel(assessments);
        const latestSeverity = assessments[0]?.severity || 'None';

        const summary: PatientAssessmentSummary = {
            patient_id: patientId,
            patient_name: patient.full_name,
            assessments,
            latest_severity: latestSeverity,
            risk_level: riskLevel,
            completed_count: assessments.length,
        };

        return { data: summary, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

/**
 * Calculate risk level based on assessment severities
 */
function calculateRiskLevel(assessments: AssessmentSubmission[]): 'low' | 'moderate' | 'high' | 'severe' {
    if (assessments.length === 0) return 'low';

    const severities = assessments.map(a => a.severity?.toLowerCase() || '');

    const severeKeywords = ['severe', 'critical', 'high risk', 'crisis'];
    const highKeywords = ['moderate to severe', 'moderately severe', 'high'];
    const moderateKeywords = ['moderate', 'mild to moderate'];

    for (const severity of severities) {
        if (severeKeywords.some(k => severity.includes(k))) return 'severe';
    }
    for (const severity of severities) {
        if (highKeywords.some(k => severity.includes(k))) return 'high';
    }
    for (const severity of severities) {
        if (moderateKeywords.some(k => severity.includes(k))) return 'moderate';
    }

    return 'low';
}

/**
 * Get risk level badge color
 */
export function getRiskLevelColor(level: 'low' | 'moderate' | 'high' | 'severe'): string {
    switch (level) {
        case 'severe': return 'bg-red-100 text-red-700 border-red-300';
        case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
        case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-300';
        default: return 'bg-green-100 text-green-700 border-green-300';
    }
}

/**
 * Format assessment name for display
 */
export function formatAssessmentName(slug: string): string {
    const names: Record<string, string> = {
        'phq-9': 'PHQ-9 (Depression)',
        'phq9': 'PHQ-9 (Depression)',
        'gad-7': 'GAD-7 (Anxiety)',
        'gad7': 'GAD-7 (Anxiety)',
        'pss': 'PSS (Stress)',
        'ptsd': 'PTSD Checklist',
        'bfi': 'Big Five Inventory',
        'dast': 'DAST (Drug Screening)',
        'scoff': 'SCOFF (Eating Disorders)',
    };
    return names[slug] || slug.toUpperCase();
}

/**
 * Questionnaire submission type for intake forms
 */
export interface QuestionnaireSubmission {
    id: string;
    user_id: string;
    questionnaire_id: string;
    service_type: string;
    data: Record<string, unknown>;
    submitted_at: string;
}

/**
 * Get patient's intake questionnaire responses for therapist preview
 */
export async function getPatientQuestionnaireResponses(
    patientId: string
): Promise<{ data: QuestionnaireSubmission[]; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('service_questionnaire_submissions')
            .select('*')
            .eq('user_id', patientId)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return { data: (data || []) as QuestionnaireSubmission[], error: null };
    } catch (error) {
        console.error('Error fetching questionnaire responses:', error);
        return { data: [], error: error as Error };
    }
}

export default {
    fetchAssessments,
    getAssessmentBySlug,
    calculateScore,
    submitAssessment,
    getUserAssessments,
    getLatestResult,
    generatePDFReport,
    getSeverityColor,
    getPatientAssessmentSummary,
    getRiskLevelColor,
    formatAssessmentName,
    getPatientQuestionnaireResponses
};
