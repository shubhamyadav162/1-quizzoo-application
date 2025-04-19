import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ozapkrljynijpffngjtt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96YXBrcmxqeW5panBmZm5nanR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MjA0OTcsImV4cCI6MjA1ODI5NjQ5N30.UADLNyKXipAgE5huKXYsaWXNpMePr9Q_lIWSz_rk-Ds';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 