-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
    id text PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    questions jsonb NOT NULL,
    scoring_logic jsonb NOT NULL,
    question_count integer NOT NULL,
    estimated_minutes integer NOT NULL,
    is_clinical boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create assessment_submissions table
CREATE TABLE IF NOT EXISTS public.assessment_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id text REFERENCES public.assessments(id),
    user_id uuid REFERENCES auth.users(id),
    answers jsonb NOT NULL,
    score integer NOT NULL,
    severity text,
    interpretation text,
    recommendations text[],
    pdf_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;

-- Assessments policies
CREATE POLICY "Assessments are viewable by everyone" 
ON public.assessments FOR SELECT 
USING (true);

-- Assessment submissions policies
CREATE POLICY "Users can view their own submissions" 
ON public.assessment_submissions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions" 
ON public.assessment_submissions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Therapists can view patient submissions" 
ON public.assessment_submissions FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.therapists 
        WHERE user_id = auth.uid()
    )
    OR 
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('provider', 'admin', 'super_admin')
    )
);

-- Insert default assessments (PHQ-9, GAD-7, PSS)
INSERT INTO public.assessments (id, name, slug, description, questions, scoring_logic, question_count, estimated_minutes, is_clinical, is_active)
VALUES 
(
    'phq9',
    'PHQ-9 Depression Screening',
    'phq-9',
    'A 9-question tool used to screen for depression and assess its severity.',
    '[
        {"id": "q1", "text": "Little interest or pleasure in doing things", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q2", "text": "Feeling down, depressed, or hopeless", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q3", "text": "Trouble falling or staying asleep, or sleeping too much", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q4", "text": "Feeling tired or having little energy", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q5", "text": "Poor appetite or overeating", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q6", "text": "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q7", "text": "Trouble concentrating on things, such as reading the newspaper or watching television", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q8", "text": "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q9", "text": "Thoughts that you would be better off dead or of hurting yourself in some way", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]}
    ]'::jsonb,
    '{
        "type": "sum",
        "ranges": [
            {"min": 0, "max": 4, "severity": "Minimal", "interpretation": "Your symptoms suggest minimal or no depression.", "recommendations": ["Continue self-care practices", "Monitor your mood"], "color": "#22c55e"},
            {"min": 5, "max": 9, "severity": "Mild", "interpretation": "Your symptoms suggest mild depression.", "recommendations": ["Consider speaking with a counselor", "Practice daily self-care", "Maintain social connections"], "color": "#eab308"},
            {"min": 10, "max": 14, "severity": "Moderate", "interpretation": "Your symptoms suggest moderate depression.", "recommendations": ["We recommend speaking with a mental health professional", "Consider therapy options", "Build a support network"], "color": "#f97316"},
            {"min": 15, "max": 19, "severity": "Moderately Severe", "interpretation": "Your symptoms suggest moderately severe depression.", "recommendations": ["Professional help is strongly recommended", "Consider both therapy and medication evaluation", "Reach out to a trusted person today"], "color": "#ef4444"},
            {"min": 20, "max": 27, "severity": "Severe", "interpretation": "Your symptoms suggest severe depression.", "recommendations": ["Please seek professional help immediately", "Contact a crisis helpline if needed", "Consider urgent care evaluation"], "color": "#dc2626"}
        ]
    }'::jsonb,
    9,
    5,
    true,
    true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assessments (id, name, slug, description, questions, scoring_logic, question_count, estimated_minutes, is_clinical, is_active)
VALUES 
(
    'gad7',
    'GAD-7 Anxiety Screening',
    'gad-7',
    'A 7-question tool used to screen for generalized anxiety disorder.',
    '[
        {"id": "q1", "text": "Feeling nervous, anxious, or on edge", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q2", "text": "Not being able to stop or control worrying", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q3", "text": "Worrying too much about different things", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q4", "text": "Trouble relaxing", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q5", "text": "Being so restless that it''s hard to sit still", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q6", "text": "Becoming easily annoyed or irritable", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
        {"id": "q7", "text": "Feeling afraid as if something awful might happen", "type": "likert", "required": true, "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]}
    ]'::jsonb,
    '{
        "type": "sum",
        "ranges": [
            {"min": 0, "max": 4, "severity": "Minimal", "interpretation": "Your symptoms suggest minimal anxiety.", "recommendations": ["Continue healthy coping strategies", "Practice relaxation techniques"], "color": "#22c55e"},
            {"min": 5, "max": 9, "severity": "Mild", "interpretation": "Your symptoms suggest mild anxiety.", "recommendations": ["Learn anxiety management techniques", "Consider mindfulness practice", "Monitor symptoms"], "color": "#eab308"},
            {"min": 10, "max": 14, "severity": "Moderate", "interpretation": "Your symptoms suggest moderate anxiety.", "recommendations": ["Speaking with a therapist is recommended", "Learn coping strategies", "Consider stress reduction"], "color": "#f97316"},
            {"min": 15, "max": 21, "severity": "Severe", "interpretation": "Your symptoms suggest severe anxiety.", "recommendations": ["Professional evaluation is recommended", "Consider therapy and/or medication", "Build a support system"], "color": "#ef4444"}
        ]
    }'::jsonb,
    7,
    4,
    true,
    true
)
ON CONFLICT (id) DO NOTHING;
