/**
 * Service-Specific Questionnaire Service
 * Provides intake questionnaires based on selected service type
 * Each questionnaire is tailored to the therapy type
 */

import { supabase } from '../supabase';

// ==========================================
// Types
// ==========================================

export type QuestionType =
    | 'text'
    | 'textarea'
    | 'email'
    | 'phone'
    | 'number'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'checkboxGroup';

export interface QuestionOption {
    value: string;
    label: string;
}

export interface Question {
    id: string;
    name: string;
    label: string;
    type: QuestionType;
    placeholder?: string;
    required: boolean;
    options?: QuestionOption[];
    helpText?: string;
    conditional?: {
        field: string;
        value: string | string[];
    };
}

export interface QuestionnaireSection {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    questions: Question[];
}

export interface ServiceQuestionnaire {
    id: string;
    serviceId: string;
    serviceName: string;
    title: string;
    description: string;
    sections: QuestionnaireSection[];
}

// ==========================================
// Sexual Orientation Options (Shared)
// ==========================================

const SEXUAL_ORIENTATION_OPTIONS: QuestionOption[] = [
    { value: 'heterosexual', label: 'Heterosexual / Straight' },
    { value: 'gay', label: 'Gay' },
    { value: 'lesbian', label: 'Lesbian' },
    { value: 'bisexual', label: 'Bisexual' },
    { value: 'pansexual', label: 'Pansexual' },
    { value: 'asexual', label: 'Asexual' },
    { value: 'queer', label: 'Queer' },
    { value: 'questioning', label: 'Questioning / Unsure' },
    { value: 'self-describe', label: 'Prefer to self-describe' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const GENDER_OPTIONS: QuestionOption[] = [
    { value: 'man', label: 'Man' },
    { value: 'woman', label: 'Woman' },
    { value: 'others', label: 'Others' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const SELF_HARM_OPTIONS: QuestionOption[] = [
    { value: 'no', label: 'No' },
    { value: 'yes-past', label: 'Yes, in the past' },
    { value: 'yes-currently', label: 'Yes, currently' },
];

const YES_NO_OPTIONS: QuestionOption[] = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
];

// ==========================================
// Individual & Couples Therapy Questionnaire
// ==========================================

const INDIVIDUAL_COUPLES_QUESTIONNAIRE: ServiceQuestionnaire = {
    id: 'individual-couples-intake',
    serviceId: 'individual',
    serviceName: 'Individual & Couples Therapy',
    title: 'Individual & Couples Therapy Intake',
    description: 'Please answer these questions to help us understand your needs and provide the best care.',
    sections: [
        {
            id: 'personal-info',
            title: 'Personal Information',
            icon: 'User',
            questions: [
                { id: 'full_name', name: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name' },
                { id: 'age', name: 'age', label: 'Age', type: 'number', required: true, placeholder: 'Your age' },
                { id: 'country', name: 'country', label: 'Country of Residence', type: 'text', required: true, placeholder: 'Your country' },
                { id: 'gender', name: 'gender', label: 'Gender Identity', type: 'radio', required: true, options: GENDER_OPTIONS },
                { id: 'sexual_orientation', name: 'sexual_orientation', label: 'Sexual Orientation (optional)', type: 'radio', required: false, options: SEXUAL_ORIENTATION_OPTIONS },
                { id: 'sexual_orientation_other', name: 'sexual_orientation_other', label: 'If self-describing, please specify', type: 'text', required: false, placeholder: 'Your description', conditional: { field: 'sexual_orientation', value: 'self-describe' } },
                { id: 'relationship_status', name: 'relationship_status', label: 'Relationship Status', type: 'text', required: true, placeholder: 'e.g., Single, Married, In a relationship' },
                { id: 'occupation', name: 'occupation', label: 'Occupation', type: 'text', required: false, placeholder: 'Your occupation' },
            ],
        },
        {
            id: 'therapy-background',
            title: 'Therapy Preferences & Background',
            icon: 'Heart',
            questions: [
                { id: 'previous_therapy', name: 'previous_therapy', label: 'Have you previously been in therapy or counselling?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'previous_therapy_details', name: 'previous_therapy_details', label: 'If yes, for how long and for what concerns?', type: 'textarea', required: false, placeholder: 'Describe your previous therapy experience', conditional: { field: 'previous_therapy', value: 'yes' } },
                { id: 'preferred_therapist_gender', name: 'preferred_therapist_gender', label: 'Preferred gender of therapist (if any)', type: 'text', required: false, placeholder: 'Any preference' },
                { id: 'preferred_language', name: 'preferred_language', label: 'Language you are most comfortable expressing yourself in', type: 'text', required: true, placeholder: 'Your preferred language' },
            ],
        },
        {
            id: 'medical-concerns',
            title: 'Medical & Presenting Concerns',
            icon: 'FileText',
            questions: [
                { id: 'mental_health_diagnosis', name: 'mental_health_diagnosis', label: 'Do you have any current or past mental health diagnoses? (optional)', type: 'textarea', required: false, placeholder: 'Any diagnosed conditions' },
                { id: 'current_medications', name: 'current_medications', label: 'Are you currently taking any psychiatric or long-term medications? (optional)', type: 'textarea', required: false, placeholder: 'List any medications' },
                { id: 'relevant_medical_history', name: 'relevant_medical_history', label: 'Any relevant medical history we should be aware of? (optional)', type: 'textarea', required: false, placeholder: 'Medical history' },
                { id: 'reason_for_therapy', name: 'reason_for_therapy', label: 'What brings you to therapy at this time?', type: 'textarea', required: true, placeholder: 'Please describe what brings you here' },
            ],
        },
        {
            id: 'safety-assessment',
            title: 'Safety & Risk Assessment',
            description: 'Your safety is our priority. Please answer honestly so we can provide the best support.',
            icon: 'Shield',
            questions: [
                { id: 'self_harm_thoughts', name: 'self_harm_thoughts', label: 'Have you ever had thoughts about harming yourself or ending your life?', type: 'radio', required: true, options: SELF_HARM_OPTIONS },
                { id: 'suicide_attempt', name: 'suicide_attempt', label: 'If yes, have you ever acted on these thoughts or made a suicide attempt?', type: 'radio', required: false, options: [
                    { value: 'no', label: 'No' },
                    { value: 'yes', label: 'Yes' },
                ], conditional: { field: 'self_harm_thoughts', value: ['yes-past', 'yes-currently'] } },
                { id: 'suicide_attempt_details', name: 'suicide_attempt_details', label: 'If comfortable, please share when', type: 'textarea', required: false, placeholder: 'Optional details', conditional: { field: 'suicide_attempt', value: 'yes' } },
                { id: 'currently_unsafe', name: 'currently_unsafe', label: 'Are you currently feeling unsafe or at risk of harming yourself right now?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'support_person', name: 'support_person', label: 'Do you have someone you can reach out to for support when things feel overwhelming?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'safety_info', name: 'safety_info', label: 'Is there anything related to your safety that you think is important for your therapist to know before beginning therapy? (optional)', type: 'textarea', required: false, placeholder: 'Any additional safety information' },
            ],
        },
    ],
};

// ==========================================
// Group Therapy Questionnaire
// ==========================================

const GROUP_THERAPY_QUESTIONNAIRE: ServiceQuestionnaire = {
    id: 'group-therapy-intake',
    serviceId: 'group',
    serviceName: 'Group Therapy',
    title: 'Group Therapy Intake',
    description: 'Help us understand your readiness and goals for group therapy participation.',
    sections: [
        {
            id: 'basic-info',
            title: 'Basic Information',
            icon: 'User',
            questions: [
                { id: 'full_name', name: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name' },
                { id: 'age', name: 'age', label: 'Age', type: 'number', required: true, placeholder: 'Your age' },
                { id: 'country', name: 'country', label: 'Country of Residence', type: 'text', required: true, placeholder: 'Your country' },
                { id: 'gender', name: 'gender', label: 'Gender Identity', type: 'radio', required: true, options: GENDER_OPTIONS },
                { id: 'sexual_orientation', name: 'sexual_orientation', label: 'Sexual Orientation (optional)', type: 'radio', required: false, options: SEXUAL_ORIENTATION_OPTIONS },
                { id: 'sexual_orientation_other', name: 'sexual_orientation_other', label: 'If self-describing, please specify', type: 'text', required: false, placeholder: 'Your description', conditional: { field: 'sexual_orientation', value: 'self-describe' } },
                { id: 'preferred_language', name: 'preferred_language', label: 'Preferred Language for Group Sessions', type: 'text', required: true, placeholder: 'Your preferred language' },
            ],
        },
        {
            id: 'therapy-background',
            title: 'Therapy Background',
            icon: 'History',
            questions: [
                { id: 'previous_therapy', name: 'previous_therapy', label: 'Have you participated in therapy or counselling before?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'therapy_type', name: 'therapy_type', label: 'If yes, was it individual, group, or both? (optional)', type: 'radio', required: false, options: [
                    { value: 'individual', label: 'Individual' },
                    { value: 'group', label: 'Group' },
                    { value: 'both', label: 'Both' },
                ], conditional: { field: 'previous_therapy', value: 'yes' } },
                { id: 'current_individual_therapy', name: 'current_individual_therapy', label: 'Are you currently in individual therapy?', type: 'radio', required: true, options: YES_NO_OPTIONS },
            ],
        },
        {
            id: 'group-readiness',
            title: 'Group Therapy Readiness',
            icon: 'Users',
            questions: [
                { id: 'motivation', name: 'motivation', label: 'What motivates you to join a group therapy program at this time?', type: 'textarea', required: true, placeholder: 'Describe your motivation' },
                { id: 'goals', name: 'goals', label: 'What are you hoping to gain from participating in group therapy?', type: 'textarea', required: true, placeholder: 'Your goals for group therapy' },
                { id: 'comfort_sharing', name: 'comfort_sharing', label: 'How comfortable do you feel sharing personal experiences in a group setting?', type: 'radio', required: true, options: [
                    { value: 'very-comfortable', label: 'Very comfortable' },
                    { value: 'somewhat-comfortable', label: 'Somewhat comfortable' },
                    { value: 'not-comfortable-willing', label: 'Not comfortable but willing to try' },
                ]},
            ],
        },
        {
            id: 'interpersonal-functioning',
            title: 'Interpersonal & Emotional Functioning',
            icon: 'Heart',
            questions: [
                { id: 'areas_relate', name: 'areas_relate', label: 'Which areas do you most relate to? (tick all that apply)', type: 'checkboxGroup', required: true, options: [
                    { value: 'anxiety', label: 'Anxiety' },
                    { value: 'depression', label: 'Low mood / depression' },
                    { value: 'relationships', label: 'Relationship difficulties' },
                    { value: 'self-esteem', label: 'Self-esteem concerns' },
                    { value: 'stress-burnout', label: 'Stress / burnout' },
                    { value: 'emotional-regulation', label: 'Emotional regulation' },
                ]},
                { id: 'trust_difficulty', name: 'trust_difficulty', label: 'Do you find it difficult to trust others or open up emotionally?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'conflict_response', name: 'conflict_response', label: 'How do you usually respond to conflict or disagreement?', type: 'radio', required: true, options: [
                    { value: 'avoid', label: 'Avoid it' },
                    { value: 'anxious', label: 'Get anxious' },
                    { value: 'angry', label: 'Get angry' },
                    { value: 'communicate-calmly', label: 'Try to communicate calmly' },
                ]},
            ],
        },
        {
            id: 'safety-support',
            title: 'Safety & Emotional Support',
            icon: 'Shield',
            questions: [
                { id: 'self_harm_thoughts', name: 'self_harm_thoughts', label: 'Have you ever had thoughts about harming yourself or ending your life?', type: 'radio', required: true, options: SELF_HARM_OPTIONS },
                { id: 'self_harm_behavior', name: 'self_harm_behavior', label: 'Have you ever engaged in self-harm or made a suicide attempt?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'currently_unsafe', name: 'currently_unsafe', label: 'Are you currently feeling unsafe or at risk of harming yourself?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'external_support', name: 'external_support', label: 'Do you have support outside the group you can reach out to if needed?', type: 'radio', required: true, options: YES_NO_OPTIONS },
            ],
        },
        {
            id: 'practical-guidelines',
            title: 'Practical & Group Guidelines',
            icon: 'ClipboardCheck',
            questions: [
                { id: 'commitment', name: 'commitment', label: 'Are you able to commit to attending sessions regularly and on time?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'confidentiality_agreement', name: 'confidentiality_agreement', label: 'Do you understand and agree to maintain confidentiality of group members?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'additional_info', name: 'additional_info', label: 'Is there anything important you would like the facilitator to know before the group begins? (optional)', type: 'textarea', required: false, placeholder: 'Any additional information' },
            ],
        },
    ],
};

// ==========================================
// Child & Adolescent Therapy Questionnaire
// ==========================================

const CHILD_ADOLESCENT_QUESTIONNAIRE: ServiceQuestionnaire = {
    id: 'child-adolescent-intake',
    serviceId: 'family',
    serviceName: 'Child & Adolescent Therapy',
    title: 'Child & Adolescent Therapy Intake',
    description: 'This questionnaire helps us understand your child/teen\'s needs. To be filled by parent/caregiver.',
    sections: [
        {
            id: 'child-info',
            title: 'Child/Teen Basic Information',
            icon: 'User',
            questions: [
                { id: 'child_full_name', name: 'child_full_name', label: 'Child / Teen\'s Full Name', type: 'text', required: true, placeholder: 'Child\'s full name' },
                { id: 'child_age', name: 'child_age', label: 'Age', type: 'number', required: true, placeholder: 'Child\'s age' },
                { id: 'child_gender', name: 'child_gender', label: 'Gender Identity', type: 'radio', required: true, options: GENDER_OPTIONS },
                { id: 'child_sexual_orientation', name: 'child_sexual_orientation', label: 'Sexual Orientation (optional, for teens)', type: 'radio', required: false, options: SEXUAL_ORIENTATION_OPTIONS },
                { id: 'country', name: 'country', label: 'Country of Residence', type: 'text', required: true, placeholder: 'Your country' },
            ],
        },
        {
            id: 'parent-info',
            title: 'Parent / Caregiver Details',
            icon: 'Users',
            questions: [
                { id: 'parent_name', name: 'parent_name', label: 'Parent / Caregiver Name', type: 'text', required: true, placeholder: 'Your full name' },
                { id: 'relationship_to_child', name: 'relationship_to_child', label: 'Relationship to Child', type: 'text', required: true, placeholder: 'e.g., Mother, Father, Guardian' },
                { id: 'parent_contact', name: 'parent_contact', label: 'Contact Number or Email', type: 'text', required: true, placeholder: 'Phone or email' },
            ],
        },
        {
            id: 'presenting-concerns',
            title: 'Presenting Concerns',
            icon: 'FileText',
            questions: [
                { id: 'main_reason', name: 'main_reason', label: 'What is the main reason you are seeking therapy at this time?', type: 'textarea', required: true, placeholder: 'Describe the main concerns' },
                { id: 'concerns_duration', name: 'concerns_duration', label: 'How long have these concerns been present?', type: 'radio', required: true, options: [
                    { value: 'less-3-months', label: 'Less than 3 months' },
                    { value: '3-6-months', label: '3–6 months' },
                    { value: 'more-6-months', label: 'More than 6 months' },
                ]},
                { id: 'previous_therapy', name: 'previous_therapy', label: 'Has the child/teen received therapy or counselling before?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'affecting_life', name: 'affecting_life', label: 'Are these concerns affecting school, friendships, or family life?', type: 'radio', required: true, options: YES_NO_OPTIONS },
            ],
        },
        {
            id: 'emotional-wellbeing',
            title: 'Emotional & Behavioural Well-being',
            icon: 'Heart',
            questions: [
                { id: 'child_mood', name: 'child_mood', label: 'How would you describe the child/teen\'s mood most days?', type: 'radio', required: true, options: [
                    { value: 'stable', label: 'Generally stable' },
                    { value: 'sad-withdrawn', label: 'Sad or withdrawn' },
                    { value: 'anxious-worried', label: 'Anxious or worried' },
                    { value: 'irritable-angry', label: 'Irritable or angry' },
                ]},
                { id: 'sleep_appetite_changes', name: 'sleep_appetite_changes', label: 'Have you noticed changes in sleep, appetite, or energy levels?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'behavior_changes', name: 'behavior_changes', label: 'Have there been changes in behaviour (withdrawal, anger, risk-taking, excessive screen use)?', type: 'radio', required: true, options: YES_NO_OPTIONS },
            ],
        },
        {
            id: 'safety-screening',
            title: 'Safety & Support Screening',
            icon: 'Shield',
            questions: [
                { id: 'self_harm_talk', name: 'self_harm_talk', label: 'Has the child/teen ever talked about wanting to hurt themselves or not wanting to live?', type: 'radio', required: true, options: SELF_HARM_OPTIONS },
                { id: 'self_harm_history', name: 'self_harm_history', label: 'Has there been any self-harm behaviour or suicide attempt in the past?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'currently_at_risk', name: 'currently_at_risk', label: 'Is the child/teen currently at risk of harming themselves?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'trusted_adult', name: 'trusted_adult', label: 'Does the child/teen have at least one trusted adult they feel safe talking to?', type: 'radio', required: true, options: YES_NO_OPTIONS },
            ],
        },
        {
            id: 'medical-practical',
            title: 'Medical & Practical Considerations',
            icon: 'FileText',
            questions: [
                { id: 'current_medication', name: 'current_medication', label: 'Is the child/teen currently taking any medication or receiving medical treatment?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'medication_details', name: 'medication_details', label: 'If yes, please provide details (optional)', type: 'textarea', required: false, placeholder: 'Medication details', conditional: { field: 'current_medication', value: 'yes' } },
                { id: 'therapy_goals', name: 'therapy_goals', label: 'What are your goals or hopes from therapy?', type: 'textarea', required: true, placeholder: 'Your goals for your child\'s therapy' },
            ],
        },
    ],
};

// ==========================================
// Holistic Wellbeing (Yoga & Nutrition) Questionnaire
// ==========================================

const HOLISTIC_WELLBEING_QUESTIONNAIRE: ServiceQuestionnaire = {
    id: 'holistic-wellbeing-intake',
    serviceId: 'yoga',
    serviceName: 'Holistic Wellbeing (Yoga & Nutrition)',
    title: 'Holistic Wellbeing Intake',
    description: 'Help us understand your wellness goals and create a personalized program for you.',
    sections: [
        {
            id: 'personal-info',
            title: 'Personal Information',
            icon: 'User',
            questions: [
                { id: 'full_name', name: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name' },
                { id: 'age', name: 'age', label: 'Age', type: 'number', required: true, placeholder: 'Your age' },
                { id: 'country', name: 'country', label: 'Country of Residence', type: 'text', required: true, placeholder: 'Your country' },
                { id: 'gender', name: 'gender', label: 'Gender Identity', type: 'radio', required: true, options: GENDER_OPTIONS },
                { id: 'sexual_orientation', name: 'sexual_orientation', label: 'Sexual Orientation (optional)', type: 'radio', required: false, options: SEXUAL_ORIENTATION_OPTIONS },
                { id: 'occupation', name: 'occupation', label: 'Occupation', type: 'text', required: false, placeholder: 'Your occupation' },
            ],
        },
        {
            id: 'lifestyle-background',
            title: 'Lifestyle & Wellbeing Background',
            icon: 'Sparkles',
            questions: [
                { id: 'wellness_goals', name: 'wellness_goals', label: 'What are your primary goals for holistic wellbeing?', type: 'checkboxGroup', required: true, options: [
                    { value: 'physical-health', label: 'Physical health' },
                    { value: 'mental-wellbeing', label: 'Mental wellbeing' },
                    { value: 'stress-management', label: 'Stress management' },
                    { value: 'weight-management', label: 'Weight management' },
                    { value: 'energy-vitality', label: 'Energy & vitality' },
                    { value: 'overall-balance', label: 'Overall balance' },
                ]},
                { id: 'previous_yoga', name: 'previous_yoga', label: 'Have you previously practiced yoga or any mind–body practices?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'yoga_details', name: 'yoga_details', label: 'If yes, please specify the type and duration (optional)', type: 'textarea', required: false, placeholder: 'e.g., Hatha yoga for 2 years', conditional: { field: 'previous_yoga', value: 'yes' } },
            ],
        },
        {
            id: 'physical-health',
            title: 'Physical Health & Medical Background',
            icon: 'Activity',
            questions: [
                { id: 'medical_conditions', name: 'medical_conditions', label: 'Do you have any diagnosed medical conditions or physical concerns? (optional)', type: 'textarea', required: false, placeholder: 'Any medical conditions' },
                { id: 'medications_supplements', name: 'medications_supplements', label: 'Are you currently taking any medications or supplements? (optional)', type: 'textarea', required: false, placeholder: 'List medications/supplements' },
                { id: 'regular_symptoms', name: 'regular_symptoms', label: 'Do you experience any of the following regularly? (tick all that apply)', type: 'checkboxGroup', required: false, options: [
                    { value: 'back-joint-pain', label: 'Back or joint pain' },
                    { value: 'fatigue', label: 'Fatigue / low energy' },
                    { value: 'digestive-issues', label: 'Digestive issues' },
                    { value: 'hormonal-concerns', label: 'Hormonal concerns' },
                    { value: 'sleep-difficulties', label: 'Sleep difficulties' },
                ]},
            ],
        },
        {
            id: 'nutrition-patterns',
            title: 'Nutrition & Eating Patterns',
            icon: 'Apple',
            questions: [
                { id: 'eating_habits', name: 'eating_habits', label: 'How would you describe your current eating habits?', type: 'radio', required: true, options: [
                    { value: 'regular-balanced', label: 'Regular and balanced' },
                    { value: 'irregular-timing', label: 'Irregular meal timings' },
                    { value: 'emotional-eating', label: 'Emotional or stress eating' },
                    { value: 'restrictive', label: 'Restrictive dieting' },
                    { value: 'overeating', label: 'Overeating' },
                ]},
                { id: 'dietary_pattern', name: 'dietary_pattern', label: 'Do you follow any specific dietary pattern?', type: 'radio', required: true, options: [
                    { value: 'vegetarian', label: 'Vegetarian' },
                    { value: 'vegan', label: 'Vegan' },
                    { value: 'non-vegetarian', label: 'Non-vegetarian' },
                    { value: 'eggetarian', label: 'Eggetarian' },
                    { value: 'other', label: 'Other' },
                ]},
                { id: 'dietary_other', name: 'dietary_other', label: 'If other, please specify', type: 'text', required: false, placeholder: 'Your dietary pattern', conditional: { field: 'dietary_pattern', value: 'other' } },
                { id: 'food_allergies', name: 'food_allergies', label: 'Are there any food allergies, intolerances, or dietary restrictions we should know about?', type: 'textarea', required: false, placeholder: 'List any allergies or restrictions' },
            ],
        },
        {
            id: 'movement-stress',
            title: 'Movement, Stress & Emotional Wellbeing',
            icon: 'Heart',
            questions: [
                { id: 'activity_level', name: 'activity_level', label: 'How active are you currently?', type: 'radio', required: true, options: [
                    { value: 'very-active', label: 'Very active' },
                    { value: 'moderately-active', label: 'Moderately active' },
                    { value: 'minimally-active', label: 'Minimally active' },
                    { value: 'mostly-sedentary', label: 'Mostly sedentary' },
                ]},
                { id: 'stress_level', name: 'stress_level', label: 'How would you rate your current stress levels?', type: 'radio', required: true, options: [
                    { value: 'low', label: 'Low' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'high', label: 'High' },
                ]},
                { id: 'emotional_symptoms', name: 'emotional_symptoms', label: 'Do you experience symptoms such as anxiety, low mood, or emotional overwhelm?', type: 'radio', required: true, options: [
                    { value: 'no', label: 'No' },
                    { value: 'occasionally', label: 'Occasionally' },
                    { value: 'frequently', label: 'Frequently' },
                ]},
            ],
        },
        {
            id: 'readiness-safety',
            title: 'Readiness & Safety',
            icon: 'Shield',
            questions: [
                { id: 'physical_limitations', name: 'physical_limitations', label: 'Are there any physical limitations, injuries, or conditions that may affect yoga practice?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'limitations_details', name: 'limitations_details', label: 'If yes, please provide details (optional)', type: 'textarea', required: false, placeholder: 'Describe any limitations', conditional: { field: 'physical_limitations', value: 'yes' } },
                { id: 'support_system', name: 'support_system', label: 'Do you have a support system or lifestyle structure that supports your wellbeing journey?', type: 'radio', required: true, options: YES_NO_OPTIONS },
                { id: 'additional_info', name: 'additional_info', label: 'Is there anything important you would like your yoga instructor or nutritionist to know before beginning this programme? (optional)', type: 'textarea', required: false, placeholder: 'Any additional information' },
            ],
        },
    ],
};

// ==========================================
// Service to Questionnaire Mapping
// ==========================================

const SERVICE_QUESTIONNAIRE_MAP: Record<string, ServiceQuestionnaire> = {
    'individual': INDIVIDUAL_COUPLES_QUESTIONNAIRE,
    'couple': INDIVIDUAL_COUPLES_QUESTIONNAIRE,
    'family': CHILD_ADOLESCENT_QUESTIONNAIRE,
    'group': GROUP_THERAPY_QUESTIONNAIRE,
    'yoga': HOLISTIC_WELLBEING_QUESTIONNAIRE,
    'nutrition': HOLISTIC_WELLBEING_QUESTIONNAIRE,
    // 'consultation' and 'crisis' can use individual questionnaire or skip
    'consultation': INDIVIDUAL_COUPLES_QUESTIONNAIRE,
    'crisis': INDIVIDUAL_COUPLES_QUESTIONNAIRE,
};

// ==========================================
// Service Functions
// ==========================================

/**
 * Get questionnaire for a specific service type
 */
export function getQuestionnaireForService(serviceId: string): ServiceQuestionnaire | null {
    return SERVICE_QUESTIONNAIRE_MAP[serviceId] || null;
}

/**
 * Get all available questionnaires
 */
export function getAllQuestionnaires(): ServiceQuestionnaire[] {
    return [
        INDIVIDUAL_COUPLES_QUESTIONNAIRE,
        GROUP_THERAPY_QUESTIONNAIRE,
        CHILD_ADOLESCENT_QUESTIONNAIRE,
        HOLISTIC_WELLBEING_QUESTIONNAIRE,
    ];
}

/**
 * Validate questionnaire data
 */
export function validateQuestionnaireData(
    questionnaire: ServiceQuestionnaire,
    data: Record<string, unknown>
): Record<string, string> {
    const errors: Record<string, string> = {};

    for (const section of questionnaire.sections) {
        for (const question of section.questions) {
            // Check conditional visibility
            if (question.conditional) {
                const conditionValue = data[question.conditional.field];
                const expectedValues = Array.isArray(question.conditional.value)
                    ? question.conditional.value
                    : [question.conditional.value];
                
                if (!expectedValues.includes(conditionValue as string)) {
                    continue; // Skip validation for hidden fields
                }
            }

            if (question.required) {
                const value = data[question.name];
                if (
                    value === undefined ||
                    value === null ||
                    value === '' ||
                    (Array.isArray(value) && value.length === 0)
                ) {
                    errors[question.name] = `${question.label} is required`;
                }
            }
        }
    }

    return errors;
}

/**
 * Save questionnaire submission
 */
export async function saveQuestionnaireSubmission(
    userId: string,
    questionnaireId: string,
    serviceId: string,
    data: Record<string, unknown>
): Promise<{ success: boolean; error?: string; submissionId?: string }> {
    try {
        const { data: submission, error } = await supabase
            .from('service_questionnaire_submissions')
            .insert({
                user_id: userId,
                questionnaire_id: questionnaireId,
                service_type: serviceId,
                data: data,
                submitted_at: new Date().toISOString(),
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error saving questionnaire:', error);
            // If table doesn't exist, store in local storage as fallback
            const localKey = `questionnaire_${questionnaireId}_${userId}`;
            localStorage.setItem(localKey, JSON.stringify({
                data,
                submitted_at: new Date().toISOString(),
            }));
            return { success: true, submissionId: localKey };
        }

        return { success: true, submissionId: submission.id };
    } catch (error) {
        console.error('Error saving questionnaire:', error);
        // Fallback to local storage
        const localKey = `questionnaire_${questionnaireId}_${userId}`;
        localStorage.setItem(localKey, JSON.stringify({
            data,
            submitted_at: new Date().toISOString(),
        }));
        return { success: true, submissionId: localKey };
    }
}

/**
 * Check if user has completed questionnaire for a service
 */
export async function hasCompletedQuestionnaire(
    userId: string,
    serviceId: string
): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('service_questionnaire_submissions')
            .select('id')
            .eq('user_id', userId)
            .eq('service_type', serviceId)
            .limit(1);

        if (error) {
            // Check local storage fallback
            const questionnaire = getQuestionnaireForService(serviceId);
            if (questionnaire) {
                const localKey = `questionnaire_${questionnaire.id}_${userId}`;
                return localStorage.getItem(localKey) !== null;
            }
            return false;
        }

        return (data?.length || 0) > 0;
    } catch {
        return false;
    }
}
