-- Basic setup without complex relationships or triggers
-- This should avoid most common errors

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Questions table - core functionality
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

-- Users table - only if auth.users exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
        CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            display_name TEXT,
            avatar_url TEXT,
            points INTEGER DEFAULT 0
        );
    ELSE
        -- Create users table without foreign key if auth.users doesn't exist
        CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            display_name TEXT,
            avatar_url TEXT,
            points INTEGER DEFAULT 0
        );
    END IF;
END $$;

-- User answers table
CREATE TABLE IF NOT EXISTS public.user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL,
    question_id UUID NOT NULL,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_earned INTEGER DEFAULT 0
);

-- Add foreign keys separately to handle errors gracefully
DO $$
BEGIN
    -- Try to add foreign key for user_id
    BEGIN
        ALTER TABLE public.user_answers
        ADD CONSTRAINT user_answers_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.users(id);
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not add foreign key user_answers_user_id_fkey: %', SQLERRM;
    END;

    -- Try to add foreign key for question_id
    BEGIN
        ALTER TABLE public.user_answers
        ADD CONSTRAINT user_answers_question_id_fkey
        FOREIGN KEY (question_id) REFERENCES public.questions(id);
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not add foreign key user_answers_question_id_fkey: %', SQLERRM;
    END;
END $$;

-- Create simple indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON public.user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON public.user_answers(question_id);

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
    'किस वर्ष भारत को आजादी मिली?',
    '["1945", "1947", "1950", "1942"]',
    '1947',
    'history',
    'easy',
    5
),
(
    'भारत का राष्ट्रीय खेल क्या है?',
    '["क्रिकेट", "हॉकी", "कबड्डी", "फुटबॉल"]',
    'हॉकी',
    'sports',
    'easy',
    5
); 