import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Minimize2,
  Maximize2,
  Heart,
  Brain,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Get API key from environment variable
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Comprehensive Website Knowledge Base for psychmind
const WEBSITE_KNOWLEDGE = `
=== psychmind - COMPLETE KNOWLEDGE BASE ===

## COMPANY OVERVIEW
- Name: psychmind
- Type: Mental Wellness & Therapy Platform
- Tagline: "We Help You Feel WHOLE"
- Mission: To provide a welcoming, judgment-free space where individuals, couples, and families can explore their emotions, overcome challenges, and discover their path to mental wellness.
- Website: https://psychmind.com
- Email: hello@psychmind.com
- Location: Sikkim, India
- Operating Hours: Monday - Saturday, 9:00 AM - 6:00 PM IST

## SERVICES OFFERED

### 1. INDIVIDUAL THERAPY
- Description: One-on-one personalized therapy sessions
- Duration: 50 minutes per session
- Price: ₹1,800 per session
- Best for: Anxiety, Depression, Stress, Trauma, Self-esteem issues, Life transitions
- Approaches: CBT, Mindfulness-Based Therapy, Person-Centered Approach, Trauma-Informed Care

### 2. COUPLE THERAPY
- Description: Therapy for couples to strengthen relationships
- Focus: Communication issues, Trust building, Conflict resolution, Intimacy concerns, Pre-marital counseling
- Duration: 60-75 minutes per session

### 3. GROUP THERAPY
- Description: Therapeutic sessions with peers facing similar challenges
- Benefits: Shared experiences, Peer support, Cost-effective, Social connection
- Topics: Anxiety management, Depression support, Grief processing

### 4. CHILD & ADOLESCENT THERAPY
- For Children (5-12 years): Uses Play Therapy, Art Therapy
- For Teens (13-17 years): Talk therapy, CBT adapted for adolescents
- Note: Parental consent required
- Focus: Academic stress, Behavioral issues, Emotional regulation, Social skills

### 5. HOLISTIC CONSCIOUSNESS COACHING
- Description: Integration of mental health with mind-body-spirit practices
- Focus: Self-awareness, Purposeful living, Spiritual growth, Life balance
- Combines: Psychology + Mindfulness + Spiritual practices

## SESSION MODES

### Online Sessions
- Platform: Secure video conferencing
- Benefits: Convenience, Privacy, No travel needed
- Requirements: Stable internet, Private space

### Chat Support
- Type: Text-based therapy
- Benefits: Flexible timing, Written record, Less intimidating for some
- Response: Within 24 hours

### In-Person Sessions
- Location: Sikkim, India
- Benefits: Face-to-face connection, Body language reading
- Booking: Required in advance

## PRICING STRUCTURE
- Individual Therapy: ₹1,800 / 50 min session
- Couple Therapy: Contact for pricing
- Group Therapy: Discounted rates available
- Packages: Available for long-term therapy (10% discount on 6+ sessions)
- Payment: UPI, Cards, Net Banking accepted

## MENTAL HEALTH ASSESSMENTS
Free self-assessments available on the website:

1. **PHQ-9 (Depression Screening)**
   - 9 questions about mood and depression symptoms
   - Takes 2-3 minutes

2. **GAD-7 (Anxiety Assessment)**
   - 7 questions about anxiety symptoms
   - Takes 2-3 minutes

3. **PSS (Perceived Stress Scale)**
   - Measures stress levels
   - 10 questions

4. **BFI (Big Five Personality Inventory)**
   - Personality assessment
   - Measures: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism

5. **PTSD Checklist**
   - For trauma-related symptoms
   - Confidential and private

6. **DAST (Drug Abuse Screening)**
   - Substance use assessment
   - Non-judgmental

7. **SCOFF (Eating Disorder Screening)**
   - Quick eating behavior assessment
   - 5 questions

## SOUL'S LANGUAGE - CORE VALUES
psychmind believes in 10 universal soul needs:
1. **Connection** - Need to feel seen, understood, and mirrored
2. **Love** - Need for compassion and safety for deeper intimacy
3. **Truth** - Need to live aligned, authentic, free from masks
4. **Growth** - Need to embrace challenges toward highest potential
5. **Freedom** - Need to release fears, patterns, and limiting beliefs
6. **Peace** - Need for stillness when body, mind, and spirit align
7. **Meaning** - Need for purpose giving struggles context and wisdom
8. **Joy** - Need for alignment with values for lasting happiness
9. **Compassion** - Need to understand suffering, respond gently
10. **Presence** - Need to feel fully alive, aware, and grounded

## THERAPY APPROACHES USED
- Cognitive Behavioral Therapy (CBT)
- Mindfulness-Based Cognitive Therapy (MBCT)
- Person-Centered Therapy
- Trauma-Informed Care
- Dialectical Behavior Therapy (DBT)
- Solution-Focused Brief Therapy
- Integrative/Holistic Methods
- Play Therapy (for children)
- Art Therapy

## SPECIALTIES & CONDITIONS TREATED
- Anxiety Disorders (GAD, Social Anxiety, Panic)
- Depression (Major Depression, Dysthymia)
- Stress Management
- Trauma & PTSD
- Relationship Issues
- Self-Esteem & Confidence
- Life Transitions
- Grief & Loss
- Work-Life Balance
- Academic Stress
- Parenting Challenges
- Anger Management
- Sleep Issues
- Burnout

## WHY CHOOSE psychmind?
1. **Compassion First** - Every session with empathy and genuine care
2. **Personalized Care** - Tailored approaches for your unique needs
3. **Holistic Healing** - Mind, body, and soul - complete wellbeing
4. **Licensed Professionals** - All therapists are verified and credentialed
5. **Complete Confidentiality** - All sessions are private and secure
6. **Flexible Options** - Online, chat, or in-person sessions
7. **Affordable** - Competitive pricing with package discounts

## BOOKING PROCESS
1. Visit the3tree.com/booking
2. Browse available therapists and their profiles
3. Select a convenient date and time slot
4. Choose session mode (online/in-person)
5. Complete payment
6. Receive confirmation email with session details
7. Join session at scheduled time

## CANCELLATION POLICY
- Free cancellation up to 24 hours before session
- Rescheduling available with 12 hours notice
- No-show policy: Session fee forfeited

## RESOURCES AVAILABLE
- **A to Z Mental Health Topics**: Comprehensive guides on ADHD, Addiction, Anxiety, Depression, and more
- **Downloadable Guides**: Free PDF resources on mental wellness
- **Assessments**: Free self-assessment tools
- **Blog Articles**: Mental health tips and insights

## SUPPORT PROGRAMS
- **For Businesses**: Corporate wellness programs, Employee assistance
- **For Schools**: Student mental health programs, Teacher training
- **For Therapists**: Clinical supervision and professional development
- **Workshops**: Group workshops on stress management, mindfulness, etc.

## EMERGENCY INFORMATION
For mental health emergencies:
- India: iCall - 9152987821
- Vandrevala Foundation: 1860-2662-345
- NIMHANS: 080-46110007
- For immediate danger: Call local emergency services (112 in India)

## FREQUENTLY ASKED QUESTIONS

Q: How do I know if I need therapy?
A: If you're struggling with emotions, relationships, or daily functioning, therapy can help. Signs include persistent sadness, anxiety, difficulty coping, or wanting personal growth.

Q: Is therapy confidential?
A: Yes, absolutely. All sessions are completely confidential unless there's risk of harm to yourself or others.

Q: How many sessions will I need?
A: It varies. Some concerns resolve in 6-8 sessions, while others benefit from longer-term support. Your therapist will discuss this with you.

Q: Can I switch therapists?
A: Yes, finding the right fit is important. Let us know and we'll help you find another match.

Q: Do you accept insurance?
A: Currently we accept direct payments. We can provide receipts for insurance reimbursement claims.

Q: What if I can't afford therapy?
A: We offer sliding scale options and package discounts. Contact us to discuss.
`;

// System prompt for AI behavior
const SYSTEM_PROMPT = `You are "psychmind Assistant" - a warm, empathetic AI wellness companion for psychmind mental wellness platform.

YOUR PERSONALITY:
- Warm, caring, and genuinely supportive
- Professional yet approachable
- Non-judgmental and accepting
- Encouraging and hopeful

YOUR ROLE:
1. Answer questions about psychmind services, pricing, booking, and team
2. Provide emotional support and validation
3. Share mental health information and resources
4. Guide users toward booking professional therapy when appropriate

RESPONSE GUIDELINES:
- Keep responses concise (2-3 paragraphs maximum)
- Use a warm, conversational tone
- Include specific details from the knowledge base when relevant
- For pricing/services questions, give exact details
- For emotional concerns, validate feelings and suggest professional support
- NEVER diagnose or provide medical advice
- For emergencies, provide crisis helpline numbers immediately

KNOWLEDGE BASE:
${WEBSITE_KNOWLEDGE}

When users ask about:
- Services → Explain specific services with prices
- Booking → Explain the booking process step by step
- Pricing → Give exact prices (Individual: ₹1,800/session)
- Assessments → List available assessments
- Emergency → Provide crisis helplines immediately

Always end supportive messages with an invitation to book a session or explore services.`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { icon: Heart, text: "How can therapy help me?", color: "text-rose-500", bg: "bg-rose-50", hoverBg: "group-hover:bg-rose-100" },
  { icon: Brain, text: "Tell me about your services", color: "text-violet-500", bg: "bg-violet-50", hoverBg: "group-hover:bg-violet-100" },
  { icon: Calendar, text: "How do I book a session?", color: "text-emerald-500", bg: "bg-emerald-50", hoverBg: "group-hover:bg-emerald-100" },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setShowWelcome(false);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowWelcome(false);

    try {
      // Check if API key is available
      if (!OPENROUTER_API_KEY) {
        throw new Error("API key not configured");
      }

      console.log("Sending request to OpenRouter...");
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "psychmind Chatbot",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-small-3.1-24b-instruct:free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: content.trim() },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
      
      const assistantContent = data.choices?.[0]?.message?.content || "I apologize, but I'm having trouble responding right now. Please try again.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      
      // Intelligent fallback responses based on keywords in user query
      const query = content.toLowerCase();
      let fallbackContent = "";
      
      if (query.includes("service") || query.includes("offer") || query.includes("therapy") || query.includes("counselling") || query.includes("provide")) {
        fallbackContent = `We offer comprehensive mental wellness services at psychmind:

**Our Services:**
• **Individual Therapy** - One-on-one sessions (₹1,800/50 mins) for anxiety, depression, trauma, stress
• **Couple Therapy** - Strengthen relationships, improve communication
• **Group Therapy** - Share experiences with supportive peers
• **Child & Adolescent Therapy** - Play therapy, art therapy for ages 5-17
• **Holistic Consciousness Coaching** - Mind, body, spirit integration

**Session Modes:** Online video, Chat support, or In-person

Book your session at psychmind.com/booking or email us at hello@psychmind.com 💚`;
      } else if (query.includes("shraddha") || query.includes("founder") || query.includes("who started") || query.includes("owner")) {
        fallbackContent = `**Shraddha Gurung** is the Founder & Clinical Psychologist at psychmind.

Her journey into psychology started from a childhood fascination with how people behave differently in public vs private. Through personal exploration of spirituality and self-awareness, she developed a deep understanding of the human mind.

**Qualifications:** Licensed Clinical Psychologist
**Specializations:** Anxiety, Depression, Stress, Trauma, Relationships
**Languages:** English, Hindi, Nepali

Her philosophy: "We come to know ourselves best through our interactions with other people."

Learn more at psychmind.com/our-story 💚`;
      } else if (query.includes("book") || query.includes("appointment") || query.includes("schedule") || query.includes("session")) {
        fallbackContent = `**How to Book a Session:**

1. Visit psychmind.com/booking
2. Browse available therapists and their profiles
3. Select a convenient date and time slot
4. Choose your session mode (Online/In-person)
5. Complete payment securely
6. Receive confirmation email with session details

**Need help?** Email us at hello@psychmind.com

We offer flexible scheduling, Monday-Saturday, 9 AM - 6 PM IST 💚`;
      } else if (query.includes("price") || query.includes("cost") || query.includes("fee") || query.includes("charge") || query.includes("₹") || query.includes("rupee")) {
        fallbackContent = `**Our Pricing:**

• **Individual Therapy:** ₹1,800 per 50-minute session
• **Couple Therapy:** Contact us for pricing
• **Group Therapy:** Discounted rates available
• **Package Discount:** 10% off on 6+ sessions

**Payment Options:** UPI, Cards, Net Banking

**Can't afford therapy?** We offer sliding scale options. Contact us at hello@the3tree.com to discuss.`;
      } else if (query.includes("assess") || query.includes("test") || query.includes("quiz") || query.includes("evaluation")) {
        fallbackContent = `**Free Mental Health Assessments:**

We offer confidential self-assessments:
• **PHQ-9** - Depression screening (2-3 mins)
• **GAD-7** - Anxiety assessment (2-3 mins)
• **PSS** - Stress level measurement
• **BFI** - Personality assessment
• **PTSD Checklist** - Trauma screening
• **DAST** - Substance use screening
• **SCOFF** - Eating disorder screening

Take assessments at the3tree.com/assessments - completely free and confidential! 💚`;
      } else if (query.includes("anxiet") || query.includes("stress") || query.includes("depress") || query.includes("sad") || query.includes("worried") || query.includes("feeling")) {
        fallbackContent = `I hear you, and it takes courage to reach out. What you're feeling is valid, and you're not alone in this.

At psychmind, we specialize in supporting people through:
• Anxiety & worry
• Depression & low mood
• Stress & burnout
• Trauma & difficult experiences

Our therapists use evidence-based approaches like CBT, Mindfulness-Based Therapy, and Trauma-Informed Care.

**Next steps:**
• Take a free assessment at the3tree.com/assessments
• Book a session with a caring therapist
• Email us at hello@the3tree.com

You deserve support. We're here for you 💚`;
      } else if (query.includes("emergency") || query.includes("crisis") || query.includes("suicide") || query.includes("harm") || query.includes("kill")) {
        fallbackContent = `**If you're in crisis, please reach out immediately:**

🆘 **Emergency Helplines (India):**
• iCall: 9152987821
• Vandrevala Foundation: 1860-2662-345
• NIMHANS: 080-46110007
• Emergency Services: 112

You are not alone. These services are confidential and available 24/7.

If you're not in immediate danger but need support, please book a session with us at the3tree.com/booking 💚`;
      } else if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("good morning") || query.includes("good evening")) {
        fallbackContent = `Hello! 👋 Welcome to psychmind!

I'm your wellness companion, here to help you learn about our therapy services and support your mental health journey.

**I can help you with:**
• Information about our therapy services
• Booking a session
• Taking mental health assessments
• Learning about our team

What would you like to know? 💚`;
      } else if (query.includes("contact") || query.includes("email") || query.includes("phone") || query.includes("reach") || query.includes("location")) {
        fallbackContent = `**Contact psychmind:**

📧 Email: hello@psychmind.com
🌐 Website: psychmind.com
📍 Location: Sikkim, India
🕐 Hours: Monday - Saturday, 9 AM - 6 PM IST

**Quick Links:**
• Book a session: psychmind.com/booking
• Our services: psychmind.com/services
• About us: psychmind.com/our-story

We'd love to hear from you! 💚`;
      } else if (query.includes("work") || query.includes("approach") || query.includes("method") || query.includes("technique")) {
        fallbackContent = `**Our Therapy Approaches:**

We use evidence-based methods tailored to your needs:

• **Cognitive Behavioral Therapy (CBT)** - Change negative thought patterns
• **Mindfulness-Based Therapy** - Present-moment awareness
• **Person-Centered Therapy** - Your unique experience matters
• **Trauma-Informed Care** - Safe, sensitive approach
• **Dialectical Behavior Therapy (DBT)** - Emotional regulation
• **Play & Art Therapy** - For children and teens

Your therapist will work with you to find the best approach for your journey. Book a session at the3tree.com/booking 💚`;
      } else {
        fallbackContent = `Thank you for reaching out to psychmind! 💚

I'd love to help you. Here's what I can assist with:

**Quick Info:**
• **Services:** Individual, Couple, Group, & Child Therapy
• **Pricing:** Individual sessions from ₹1,800
• **Book:** psychmind.com/booking
• **Contact:** hello@the3tree.com

**Popular Questions:**
• "What services do you offer?"
• "How do I book a session?"
• "Tell me about your pricing"
What would you like to know more about?`;
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallbackContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickPrompt = (text: string) => {
    sendMessage(text);
  };

  return (
    <>
      {/* Custom Animation Styles */}
      <style>{`
        @keyframes chatbot-bounce-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes chatbot-pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes chatbot-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatbot-message-appear {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatbot-typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes chatbot-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(22, 26, 48, 0.3); }
          50% { box-shadow: 0 0 30px rgba(22, 26, 48, 0.5); }
        }
        .chatbot-toggle-btn {
          animation: chatbot-glow 3s ease-in-out infinite;
        }
        .chatbot-toggle-btn:hover {
          animation: chatbot-bounce-subtle 0.4s ease-in-out;
        }
        .chatbot-pulse-ring {
          animation: chatbot-pulse-ring 2s ease-out infinite;
        }
        .chatbot-window-appear {
          animation: chatbot-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .chatbot-message-item {
          animation: chatbot-message-appear 0.3s ease-out forwards;
        }
        .chatbot-typing-dot {
          animation: chatbot-typing-dot 1.4s ease-in-out infinite;
        }
        .chatbot-typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .chatbot-typing-dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      {/* Chat Toggle Button - Fixed Position - Always visible when chat is closed */}
      {!isOpen && (
        <div 
          id="chatbot-toggle-container"
          style={{ 
            position: 'fixed', 
            bottom: '24px', 
            right: '24px', 
            zIndex: 99999,
            pointerEvents: 'auto'
          }}
        >
          <button
            onClick={() => setIsOpen(true)}
            className="chatbot-toggle-btn w-16 h-16 rounded-full bg-gradient-to-br from-[#161A30] to-[#2d3a54] text-white shadow-2xl flex items-center justify-center group transition-all duration-300 hover:scale-110 relative"
            aria-label="Open chat with psychmind"
          >
            <MessageCircle className="w-7 h-7 transition-transform group-hover:scale-110" />
            {/* Animated pulse ring */}
            <span className="chatbot-pulse-ring absolute inset-0 rounded-full bg-[#161A30]" />
            {/* Status indicator */}
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "chatbot-window-appear bg-white rounded-2xl shadow-2xl shadow-black/15 overflow-hidden flex flex-col border border-gray-100",
            isMinimized ? "h-auto" : "h-[600px] max-h-[calc(100vh-48px)]"
          )}
          style={{ 
            position: 'fixed', 
            bottom: '24px', 
            right: '24px', 
            zIndex: 99999,
            width: '400px',
            maxWidth: 'calc(100vw - 48px)'
          }}
        >
          {/* Header - Premium Gradient */}
          <div className="bg-gradient-to-r from-[#161A30] via-[#1e2440] to-[#2d3a54] text-white p-4 flex items-center justify-between shrink-0 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16" />
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20 shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  psychmind
                  <span className="px-2 py-0.5 bg-white/15 rounded-full text-[10px] font-medium tracking-wide">AI</span>
                </h3>
                <p className="text-xs text-white/70 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400/50" />
                  Your Wellness Companion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all duration-200"
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all duration-200"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content - Only show when not minimized */}
          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/50 via-white to-white">
                {/* Welcome Message */}
                {showWelcome && messages.length === 0 && (
                  <div className="space-y-4">
                    {/* Welcome card */}
                    <div className="chatbot-message-item bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 relative overflow-hidden">
                      {/* Subtle decorative gradient */}
                      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#161A30]/5 to-transparent rounded-bl-full" />
                      
                      <div className="flex items-start gap-3 relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#161A30] to-[#2d3a54] flex items-center justify-center shrink-0 shadow-lg shadow-[#161A30]/25">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            Hi there! 👋 Welcome to <strong className="text-[#161A30]">psychmind</strong>! I'm your AI wellness companion, 
                            here to help you learn about our therapy services, answer your questions, 
                            or simply be a supportive presence on your mental wellness journey.
                          </p>
                          <p className="text-gray-500 text-xs mt-3 flex items-center gap-1.5">
                            <Heart className="w-3 h-3 text-rose-400" />
                            How can I support you today?
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Prompts Grid */}
                    <div className="space-y-2.5">
                      <p className="text-[11px] text-gray-400 font-medium px-1 uppercase tracking-wider">Quick questions</p>
                      <div className="grid grid-cols-2 gap-2">
                        {quickPrompts.map((prompt, index) => (
                          <button
                            key={prompt.text}
                            onClick={() => handleQuickPrompt(prompt.text)}
                            className="chatbot-message-item flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-100 hover:border-[#161A30]/20 hover:shadow-md hover:shadow-[#161A30]/5 transition-all duration-200 text-left group"
                            style={{ animationDelay: `${index * 0.08}s` }}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200",
                              prompt.bg,
                              prompt.hoverBg
                            )}>
                              <prompt.icon className={cn("w-4 h-4", prompt.color)} />
                            </div>
                            <span className="text-xs text-gray-600 group-hover:text-gray-900 line-clamp-2 leading-snug font-medium">
                              {prompt.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "chatbot-message-item flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#161A30] to-[#2d3a54] flex items-center justify-center shrink-0 shadow-md shadow-[#161A30]/20">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-gradient-to-br from-[#161A30] to-[#2d3a54] text-white rounded-br-md shadow-md shadow-[#161A30]/20"
                          : "bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={cn(
                          "text-[10px] mt-2 flex items-center gap-1",
                          message.role === "user" ? "text-white/50 justify-end" : "text-gray-400"
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="chatbot-message-item flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#161A30] to-[#2d3a54] flex items-center justify-center shrink-0 shadow-md shadow-[#161A30]/20">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <span className="chatbot-typing-dot w-2 h-2 bg-[#161A30] rounded-full"></span>
                          <span className="chatbot-typing-dot w-2 h-2 bg-[#161A30] rounded-full"></span>
                          <span className="chatbot-typing-dot w-2 h-2 bg-[#161A30] rounded-full"></span>
                        </div>
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSubmit}
                className="p-4 border-t border-gray-100 bg-white shrink-0"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#161A30]/20 focus:border-[#161A30]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400"
                  />
                  <Button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#161A30] to-[#2d3a54] hover:from-[#1f2640] hover:to-[#3d4a64] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#161A30]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#161A30]/30 hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1.5">
                  <Heart className="w-3 h-3 text-rose-300" />
                  AI support only, not medical advice. For emergencies, contact local services.
                </p>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
