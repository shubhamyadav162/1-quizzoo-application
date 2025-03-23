import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || "https://pkryfgfnykkolmcdcvza.supabase.co"
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcnlmZ2ZueWtrb2xtY2RjdnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjEyMjgsImV4cCI6MjA1NjMzNzIyOH0.Uj8k-F2E90qq0b5QmbA1msCHM2RatZMlOWvZSgBKsH0"

// Add auth options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: false, // Important for mobile
    persistSession: true
  },
  db: {
    schema: 'public',
  },
  global: {
    fetch: fetch, // Use the fetch API for requests
    headers: {
      'X-Supabase-Client': 'quizzoo-app'
    }
  }
}) 