-- Add language support to the questions table

-- Rename the existing question column to question_english
ALTER TABLE public.questions RENAME COLUMN question TO question_english;

-- Add new column for Hindi questions
ALTER TABLE public.questions ADD COLUMN question_hindi TEXT;

-- Modify the options structure to include both languages
-- First, create a backup of the existing data
ALTER TABLE public.questions ADD COLUMN options_backup JSONB;
UPDATE public.questions SET options_backup = options;

-- Update the options to include both languages
-- This is a complex operation that depends on the structure of your options
-- Here's a template for how it might work
CREATE OR REPLACE FUNCTION update_options_with_hindi() RETURNS void AS $$
DECLARE
    q RECORD;
    old_options JSONB;
    new_options JSONB;
    i INTEGER;
    option_text TEXT;
BEGIN
    FOR q IN SELECT id, options_backup FROM public.questions LOOP
        old_options := q.options_backup;
        new_options := '[]'::JSONB;
        
        -- Assuming options is a JSON array of strings
        FOR i IN 0..jsonb_array_length(old_options) - 1 LOOP
            option_text := old_options->i;
            -- Add both English and Hindi versions
            new_options := new_options || jsonb_build_object(
                'text', option_text,
                'text_hindi', NULL  -- Initially set to NULL, to be filled in later
            );
        END LOOP;
        
        -- Update the question with the new options format
        UPDATE public.questions SET options = new_options WHERE id = q.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update options
SELECT update_options_with_hindi();

-- Drop the function and backup column when done
DROP FUNCTION update_options_with_hindi();
ALTER TABLE public.questions DROP COLUMN options_backup;

-- Add column for correct answer in Hindi
ALTER TABLE public.questions ADD COLUMN correct_answer_hindi TEXT;

-- Update sample data with Hindi translations
UPDATE public.questions
SET 
    question_hindi = question_english,  -- Initially set to same as English
    correct_answer_hindi = correct_answer  -- Initially set to same as English
WHERE question_hindi IS NULL;

-- Create a new table for user language preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    language TEXT NOT NULL DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Add policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
    ON public.user_preferences FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
    ON public.user_preferences FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
    ON public.user_preferences FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Add function to get questions in user's preferred language
CREATE OR REPLACE FUNCTION get_questions_in_language(user_lang TEXT)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    question TEXT,
    options JSONB,
    correct_answer TEXT,
    category TEXT,
    difficulty TEXT,
    points INTEGER
) AS $$
BEGIN
    IF user_lang = 'hindi' THEN
        RETURN QUERY
        SELECT 
            q.id, 
            q.created_at, 
            COALESCE(q.question_hindi, q.question_english) AS question, 
            q.options, -- Frontend will handle extracting the right language version
            COALESCE(q.correct_answer_hindi, q.correct_answer) AS correct_answer,
            q.category,
            q.difficulty,
            q.points
        FROM 
            public.questions q;
    ELSE
        RETURN QUERY
        SELECT 
            q.id, 
            q.created_at, 
            q.question_english AS question, 
            q.options,
            q.correct_answer,
            q.category,
            q.difficulty,
            q.points
        FROM 
            public.questions q;
    END IF;
END;
$$ LANGUAGE plpgsql; 