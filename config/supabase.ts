import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Use the correct working Supabase URL and key
const supabaseUrl = "https://ozapkrljynijpffngjtt.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96YXBrcmxqeW5panBmZm5nanR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MjA0OTcsImV4cCI6MjA1ODI5NjQ5N30.UADLNyKXipAgE5huKXYsaWXNpMePr9Q_lIWSz_rk-Ds"

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

// Add proper network error handling with timeouts and retries
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
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
    headers: {
      'X-Supabase-Client': 'quizzoo-app'
    }
  }
})

// Add a connection test function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.rpc('ping');
    return {
      success: !error,
      message: error ? error.message : 'Connection successful',
      data
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Unknown error',
      error: err
    };
  }
}; 