-- Quizzoo App - Hybrid Storage Model Schema
-- Based on gfile.md recommendations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users and Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wallets
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    balance DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    amount DECIMAL(12, 2) NOT NULL,
    transaction_type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'contest_entry', 'contest_winning'
    reference_id UUID, -- Contest ID or withdrawal request ID
    payment_method TEXT, -- 'upi', 'gateway', 'wallet', 'prize'
    transaction_status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb -- For payment gateway data, UPI details, etc.
);

-- Question Reference (Hybrid Model) - Only metadata stored in DB
CREATE TABLE IF NOT EXISTS public.question_reference (
    question_id TEXT PRIMARY KEY, -- This will match the ID in the app's JSON
    category_id TEXT NOT NULL,
    difficulty_level TEXT NOT NULL, -- 'easy', 'medium', 'hard'
    language TEXT DEFAULT 'hindi',
    correct_answer_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT '{}'
);

-- Contests
CREATE TABLE IF NOT EXISTS public.contests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    entry_fee DECIMAL(10, 2) NOT NULL,
    prize_pool DECIMAL(12, 2) NOT NULL,
    status TEXT NOT NULL, -- 'upcoming', 'active', 'completed', 'cancelled'
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_private BOOLEAN DEFAULT false,
    private_code TEXT UNIQUE,
    banner_url TEXT
);

-- Contest Settings
CREATE TABLE IF NOT EXISTS public.contest_settings (
    contest_id UUID PRIMARY KEY REFERENCES public.contests(id) ON DELETE CASCADE,
    question_count INTEGER NOT NULL DEFAULT 10,
    time_limit_seconds INTEGER NOT NULL DEFAULT 6,
    categories TEXT[] DEFAULT '{}',
    difficulty_levels TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contest Questions
CREATE TABLE IF NOT EXISTS public.contest_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES public.question_reference(question_id),
    sequence_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contest_id, question_id),
    UNIQUE(contest_id, sequence_number)
);

-- Participations
CREATE TABLE IF NOT EXISTS public.participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned'
    final_score INTEGER DEFAULT 0,
    UNIQUE(user_id, contest_id)
);

-- User Responses
CREATE TABLE IF NOT EXISTS public.user_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participation_id UUID NOT NULL REFERENCES public.participations(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES public.question_reference(question_id),
    selected_answer_index INTEGER,
    is_correct BOOLEAN,
    response_time_ms INTEGER, -- Time taken to answer in milliseconds
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    score INTEGER NOT NULL DEFAULT 0,
    rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contest_id, user_id)
);

-- Withdrawal Requests
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL, -- 'upi', 'bank_transfer'
    payment_details JSONB NOT NULL, -- UPI ID or bank account details
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'processed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(transaction_status);
CREATE INDEX IF NOT EXISTS idx_question_reference_category ON public.question_reference(category_id);
CREATE INDEX IF NOT EXISTS idx_question_reference_difficulty ON public.question_reference(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_contests_status ON public.contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_start_time ON public.contests(start_time);
CREATE INDEX IF NOT EXISTS idx_contest_questions_contest_id ON public.contest_questions(contest_id);
CREATE INDEX IF NOT EXISTS idx_participations_contest_id ON public.participations(contest_id);
CREATE INDEX IF NOT EXISTS idx_participations_user_id ON public.participations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_participation_id ON public.user_responses(participation_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_contest_id ON public.leaderboards(contest_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON public.leaderboards(score DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- Row Level Security (RLS) policies
-- Will be implemented in a separate file to ensure proper testing 