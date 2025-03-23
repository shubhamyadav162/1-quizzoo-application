import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import 'react-native-url-polyfill/auto';

// Use these specific Supabase URL and anon key for the app
const supabaseUrl = 'https://pkryfgfnykkolmcdcvza.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcnlmZ2ZueWtrb2xtY2RjdnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjEyMjgsImV4cCI6MjA1NjMzNzIyOH0.Uj8k-F2E90qq0b5QmbA1msCHM2RatZMlOWvZSgBKsH0';

// Create CustomAsyncStorage with debug logging
const customStorage = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      console.log(`[Storage] Retrieved ${key.substring(0, 20)}...`);
      return value;
    } catch (error) {
      console.error(`[Storage] Error getting ${key}:`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      console.log(`[Storage] Saved ${key.substring(0, 20)}...`);
    } catch (error) {
      console.error(`[Storage] Error setting ${key}:`, error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`[Storage] Removed ${key.substring(0, 20)}...`);
    } catch (error) {
      console.error(`[Storage] Error removing ${key}:`, error);
    }
  }
};

// Create the Supabase client with proper configuration for mobile
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // We will handle session manually
    flowType: 'implicit', // Simpler flow that works better on mobile
    debug: true, // Enable debug mode
  },
  global: {
    // Add fetch override with better timeout handling for mobile networks
    fetch: async (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('[Supabase Fetch] Error:', error);
        throw error;
      }
    },
  },
});

// Log initialization
console.log('[Supabase] Client initialized with URL:', supabaseUrl);

// Helper to manually store session to ensure it persists
export const storeSession = async (session: any) => {
  try {
    if (!session) return;
    
    // Store the access token in AsyncStorage directly as a backup
    await AsyncStorage.setItem('supabase-access-token', session.access_token);
    await AsyncStorage.setItem('supabase-refresh-token', session.refresh_token || '');
    console.log('[Storage] Successfully stored tokens as backup');
  } catch (error) {
    console.error('[Storage] Error storing backup tokens:', error);
  }
};

// Auth state helpers with better error handling
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('[Auth] Error getting user:', error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('[Auth] Unexpected error getting user:', error);
    return null;
  }
};

export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[Auth] Error getting session:', error);
      return null;
    }
    
    // If we have a session, store it as backup
    if (data.session) {
      await storeSession(data.session);
    }
    
    return data.session;
  } catch (error) {
    console.error('[Auth] Unexpected error getting session:', error);
    return null;
  }
};

export const signOut = async () => {
  try {
    // Clear backup tokens
    await AsyncStorage.removeItem('supabase-access-token');
    await AsyncStorage.removeItem('supabase-refresh-token');
    
    // Sign out from Supabase
    return await supabase.auth.signOut();
  } catch (error) {
    console.error('[Auth] Error during sign out:', error);
    throw error;
  }
}; 