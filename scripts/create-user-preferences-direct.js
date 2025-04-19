// This file contains the SQL that needs to be run in your Supabase SQL editor
// Copy this entire content and paste it in the SQL editor in the Supabase dashboard

/*
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

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
*/

console.log(`
=====================================
INSTRUCTIONS
=====================================

The error is because the 'user_preferences' table does not exist in your Supabase database.

To fix this, you need to:

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project (with URL: https://ozapkrljynijpffngjtt.supabase.co)
3. Go to the SQL Editor section 
4. Create a new query
5. Copy and paste the SQL commands above (remove the /* and */ comment marks)
6. Run the query

This will create the missing 'user_preferences' table that your app is trying to access.

After running this SQL, restart your app and the error should be resolved.
`); 