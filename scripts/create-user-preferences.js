const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Hardcoded values from .env file
const supabaseUrl = 'https://ozapkrljynijpffngjtt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96YXBrcmxqeW5panBmZm5nanR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MjA0OTcsImV4cCI6MjA1ODI5NjQ5N30.UADLNyKXipAgE5huKXYsaWXNpMePr9Q_lIWSz_rk-Ds';

// Create Supabase client with Postgres extension
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' }
});

// SQL commands to create user_preferences table (split into multiple statements)
const sqlCommands = [
  `CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    language TEXT NOT NULL DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
  );`,
  
  `ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;`,
  
  `CREATE POLICY "Users can view their own preferences" 
    ON public.user_preferences FOR SELECT 
    USING (auth.uid() = user_id);`,
  
  `CREATE POLICY "Users can update their own preferences" 
    ON public.user_preferences FOR UPDATE 
    USING (auth.uid() = user_id);`,
  
  `CREATE POLICY "Users can insert their own preferences" 
    ON public.user_preferences FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);`,
  
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;`,
  
  `CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();`,
  
  `CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);`
];

// Execute the SQL commands one by one
async function createUserPreferencesTable() {
  console.log('Creating user_preferences table and related objects...');
  
  for (let i = 0; i < sqlCommands.length; i++) {
    try {
      const command = sqlCommands[i];
      console.log(`Executing command ${i + 1}/${sqlCommands.length}`);
      
      // Execute SQL using REST API since the JS client doesn't have direct SQL execution
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          command: 'sql',
          query: command
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error executing command ${i + 1}:`, errorData);
      } else {
        console.log(`Command ${i + 1} executed successfully`);
      }
    } catch (error) {
      console.error(`Error executing command ${i + 1}:`, error);
    }
  }
  
  console.log('Database setup completed.');
}

// Execute the function
createUserPreferencesTable(); 