import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";

const specialties = [
  {
    title: "ADDICTION & DEPENDENCY",
    items: [
      "Alcohol Use Disorder",
      "Binge-Eating Disorder (Addictive Pattern)",
      "Cannabis Use Disorder",
      "Compulsive Sexual Behavior Disorder",
      "Dual Diagnosis (Addiction + Mood/Anxiety Disorders)",
      "Internet Gaming Disorder",
      "Nicotine / Vaping Use Disorder",
      "Relapse Risk & Dependence Severity",
      "Substance Use Disorder (SUD – General)",
    ],
  },
  {
    title: "BEHAVIOURAL & SELF-CONTROL ISSUES",
    items: [
      "Anger Management",
      "Emotional Eating",
      "Impulse Control Issues",
      "Perfectionism",
      "People-Pleasing Behaviour",
      "Procrastination & Motivation Issues",
      "Risk-Taking Behaviour",
      "Self-Sabotaging Patterns",
      "Social Media & Screen Addiction (Non-Clinical)",
    ],
  },
  {
    title: "CAREER, WORK & ACADEMIC CONCERNS",
    items: [
      "Academic Pressure",
      "Burnout Syndrome",
      "Career Confusion & Transitions",
      "Failure & Imposter Syndrome",
      "Performance Anxiety",
      "Student Stress & Exam Anxiety",
      "Study Skills & Focus",
      "Work Stress & Burnout",
      "Workplace Toxicity",
    ],
  },
  {
    title: "DEPRESSIVE DISORDERS",
    items: [
      "Depressive Disorder Due to Another Medical Condition",
      "Disruptive Mood Dysregulation Disorder (DMDD – Children & Adolescents)",
      "Major Depressive Disorder (MDD)",
      "Other Specified Depressive Disorder",
      "Persistent Depressive Disorder (Dysthymia)",
      "Premenstrual Dysphoric Disorder (PMDD)",
      "Substance / Medication-Induced Depressive Disorder",
      "Unspecified Depressive Disorder",
    ],
  },
  {
    title: "EMOTIONAL & MENTAL WELLBEING",
    items: [
      "Burnout & Compassion Fatigue",
      "Emotional Regulation",
      "Existential Crisis & Life Purpose",
      "Loneliness & Emotional Isolation",
      "Low Self-Esteem & Confidence Issues",
      "Overthinking & Rumination",
      "Stress Management",
    ],
  },
  {
    title: "FAMILY & PARENTING",
    items: [
      "Caregiver Burnout",
      "Divorce & Separation Adjustment",
      "Emotional Neglect",
      "Family Communication Issues",
      "Generational Trauma",
      "High Parental Control",
      "Parent-Child Conflicts",
      "Parenting Stress",
      "Single Parenting Stress",
    ],
  },
  {
    title: "GENDER, SEXUALITY & IDENTITY",
    items: [
      "Gender Identity Concerns",
      "LGBTQ+ Affirmative Counselling",
      "Relationship & Identity Integration",
      "Sexual Orientation Confusion",
      "Shame Around Sexual Curiosity",
    ],
  },
  {
    title: "HIGH-RISK PSYCHOLOGICAL CONCERNS",
    items: [
      "Eating Distress",
      "Self-Harm Urges",
      "Substance Curiosity & Experimentation",
      "Suicidal Thoughts",
    ],
  },
  {
    title: "INNER CHILD & DEVELOPMENTAL TRAUMA",
    items: [
      "Abandonment & Rejection Wounds",
      "Attachment Wound Healing",
      "Boundary Formation",
      "Childhood Trauma Processing",
      "Emotional Neglect Recovery",
      "Re-parenting & Self-Soothing Skills",
      "Safety & Trust Restoration",
      "Self-Compassion Development",
      "Shame & Core Belief Healing",
    ],
  },
  {
    title: "MIND-BODY CONCERNS",
    items: [
      "Eating Distress (Medical + Emotional Intersection)",
      "Health Anxiety",
      "Psychosomatic Symptoms",
      "Sleep Issues & Insomnia",
    ],
  },
  {
    title: "OBSESSIVE-COMPULSIVE & RELATED DISORDERS",
    items: [
      "Body Dysmorphic Disorder",
      "Excoriation (Skin-Picking Disorder)",
      "Hoarding Disorder",
      "Obsessive-Compulsive Disorder (OCD)",
      "Trichotillomania (Hair-Pulling Disorder)",
    ],
  },
  {
    title: "PARENT-RELATED TRAUMA & FAMILY SYSTEMS",
    items: [
      "Childhood Emotional Neglect",
      "Emotionally Immature Parent Recovery",
      "Fear-Based Parenting Impact",
      "Guilt, Obligation & People-Pleasing Patterns",
      "Intergenerational Trauma Work",
      "Narcissistic Parent Impact Work",
      "Over-Control & Enmeshment Healing",
      "Parentification Recovery",
      "Parent-Child Conflict Resolution",
      "Unmet Childhood Needs Processing",
    ],
  },
  {
    title: "RELATIONSHIPS & INTERPERSONAL CONCERNS",
    items: [
      "Attachment Issues",
      "Breakups & Heartbreak Recovery",
      "Codependency",
      "Communication Problems",
      "Infidelity & Betrayal Trauma",
      "Interpersonal Boundaries",
      "Marital & Pre-Marital Counselling",
      "Relationship Conflicts",
      "Toxic Relationships",
      "Trust Issues & Insecurity",
    ],
  },
  {
    title: "TRAUMA & STRESSOR-RELATED DISORDERS",
    items: [
      "Abandonment Wounds",
      "Childhood Trauma",
      "Emotional Abuse",
      "Grief & Loss",
      "Physical Abuse Trauma",
      "Post-Traumatic Stress Disorder (PTSD)",
      "Sexual Trauma",
    ],
  },
  {
    title: "YOGA, MINDFULNESS & HOLISTIC WELLBEING",
    items: [
      "Breathwork & Nervous System Regulation",
      "Conscious Living & Awareness",
      "Emotional Deep Practice",
      "Life Clarity & Decision-Making",
      "Mindfulness-Based Healing",
      "Self-Worth & Self-Respect Building",
      "Stress Reset Programs",
      "Yoga-Integrated Mental Health",
    ],
  },
];

export default function Specialities() {
  return (
    <>
      <Helmet>
        <title>Clinical Expertise & Specialties | The 3 Tree</title>
        <meta
          name="description"
          content="Explore our comprehensive range of clinical expertise including addiction, depression, trauma, relationships, family therapy, and holistic wellbeing."
        />
        <meta
          name="keywords"
          content="therapy specialties, mental health expertise, clinical psychology, addiction treatment, trauma therapy, relationship counseling"
        />
      </Helmet>
      <Layout>
        <section className="pt-24 pb-16 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl lg:text-5xl text-[#2D2D2D] mb-4">
                Clinical Expertise & Specialties
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive support across a wide range of mental health concerns, 
                from trauma and relationships to holistic wellbeing.
              </p>
            </div>

            {/* Grid of specialty cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {specialties.map((specialty, index) => (
                <div
                  key={index}
                  className={`p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    index % 2 === 0
                      ? "bg-[#1E293B] text-white shadow-lg"
                      : "bg-white border-2 border-[#1E293B] text-[#2D2D2D] shadow-md"
                  }`}
                >
                  <h2 className={`font-serif text-xl lg:text-2xl mb-6 leading-tight border-b pb-4 ${
                    index % 2 === 0 ? "border-white/20" : "border-gray-200"
                  }`}>
                    {specialty.title}
                  </h2>
                  <ul className="space-y-3">
                    {specialty.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className={`text-sm leading-relaxed flex items-start ${
                          index % 2 === 0 ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        <span className={`mr-3 mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full ${
                          index % 2 === 0 ? "bg-blue-400" : "bg-[#8BA888]"
                        }`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
