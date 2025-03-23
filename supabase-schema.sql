-- Create tables for the quiz application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    points INTEGER DEFAULT 10
);

-- Users table 
-- NOTE: This is just for custom user data, auth users are managed by Supabase Auth
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    display_name TEXT,
    avatar_url TEXT,
    points INTEGER DEFAULT 0
);

-- User answers table
CREATE TABLE IF NOT EXISTS public.user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL REFERENCES public.users(id),
    question_id UUID NOT NULL REFERENCES public.questions(id),
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_earned INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON public.user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON public.user_answers(question_id);

-- Set up Row Level Security (RLS)

-- Enable row level security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

-- Question policies
CREATE POLICY "Questions are viewable by everyone" 
    ON public.questions FOR SELECT 
    USING (true);

CREATE POLICY "Questions are insertable by authenticated users" 
    ON public.questions FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- User policies
CREATE POLICY "Users can view their own data" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- User answers policies
CREATE POLICY "Users can view their own answers" 
    ON public.user_answers FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own answers" 
    ON public.user_answers FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

-- Sample data for questions
INSERT INTO public.questions (question, options, correct_answer, category, difficulty, points)
VALUES
(
    'भारत का राष्ट्रीय पक्षी कौन सा है?',
    '["मोर", "कबूतर", "बुलबुल", "तोता"]',
    'मोर',
    'general',
    'easy',
    5
),
(
    'निम्न में से कौन सा देश दक्षिण एशिया में नहीं है?',
    '["भारत", "जापान", "नेपाल", "बांग्लादेश"]',
    'जापान',
    'geography',
    'medium',
    10
),
(
    'किस वर्ष भारत को आजादी मिली?',
    '["1945", "1947", "1950", "1942"]',
    '1947',
    'history',
    'easy',
    5
),
(
    'पृथ्वी से सबसे निकट तारा कौन सा है?',
    '["प्रॉक्सिमा सेंटौरी", "सूरज", "सिरियस", "अल्फा सेंटौरी"]',
    'सूरज',
    'science',
    'medium',
    10
),
(
    'किस वैज्ञानिक ने गुरुत्वाकर्षण के नियम की खोज की?',
    '["आइजैक न्यूटन", "अल्बर्ट आइंस्टाइन", "गैलीलियो गैलिली", "निकोला टेस्ला"]',
    'आइजैक न्यूटन',
    'science',
    'medium',
    10
); 