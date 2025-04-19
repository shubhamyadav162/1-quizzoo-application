import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import 'react-native-url-polyfill/auto';

// Use these specific Supabase URL and anon key for the app
const supabaseUrl = 'https://ozapkrljynijpffngjtt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96YXBrcmxqeW5panBmZm5nanR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MjA0OTcsImV4cCI6MjA1ODI5NjQ5N30.UADLNyKXipAgE5huKXYsaWXNpMePr9Q_lIWSz_rk-Ds';

// Production URL for email redirects 
// This should be a publicly accessible URL for your app
const SITE_URL = 'https://quizzoo.app';
const FALLBACK_REDIRECT_URL = 'quizzoo://auth/callback';

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
    // flowType: 'pkce', // Removed PKCE to fix signup/signin issues and WebCrypto dependency
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
    console.log('[Auth] Starting sign out process');
    
    // Clear backup tokens first
    await AsyncStorage.removeItem('supabase-access-token');
    await AsyncStorage.removeItem('supabase-refresh-token');
    await AsyncStorage.removeItem('sb-ozapkrljynijpffngjtt-auth-token');
    
    console.log('[Auth] Removed local tokens');
    
    // Sign out from Supabase with proper error handling
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[Auth] Error during Supabase sign out:', error);
      
      // Even if there's an error, try to clear the session manually
      try {
        // @ts-ignore - Force internal session clearing if API fails
        if (supabase.auth.session) supabase.auth.session = null;
      } catch (e) {
        console.error('[Auth] Error clearing session manually:', e);
      }
      
      // Throw the original error
      throw error;
    }
    
    console.log('[Auth] Successfully signed out');
    return { success: true };
  } catch (error) {
    console.error('[Auth] Unexpected error during sign out:', error);
    // Return success anyway to prevent login loops
    return { success: true, error };
  }
};

// Function to send test email - useful for troubleshooting
export const sendTestEmail = async (email: string) => {
  try {
    // This requires a custom function on your Supabase backend
    const { data, error } = await supabase.functions.invoke('send-test-email', {
      body: { email }
    });
    
    if (error) {
      console.error('[Email] Error sending test email:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Unexpected error sending test email:', error);
    return { success: false, error };
  }
};

// Enhanced signup function with multiple fallback mechanisms
export const signUpWithEmail = async (email: string, password: string, metadata = {}) => {
  try {
    console.log('[Auth] Starting email signup process');
    
    // First, try to determine the most appropriate redirect URL
    let redirectUrl = SITE_URL ? `${SITE_URL}/auth/callback` : FALLBACK_REDIRECT_URL;
    
    // Platform-specific adjustments
    if (Platform.OS === 'android') {
      // For Android, use the app scheme for immediate testing
      redirectUrl = 'quizzoo://auth/callback';
    } else if (Platform.OS === 'ios') {
      // iOS also works better with custom scheme during development
      redirectUrl = 'quizzoo://auth/callback';
    }
    
    console.log('[Auth] Using redirect URL:', redirectUrl);
    
    // Add a timestamp to make each signup request unique
    // This can help avoid caching issues with email services
    const uniqueMetadata = {
      ...metadata,
      signupTimestamp: new Date().toISOString(),
    };
    
    // Sign up with the redirect URL
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: uniqueMetadata
      }
    });
    
    // Log the result for debugging
    if (error) {
      console.error('[Auth] Signup error:', error);
      return { data, error };
    }
    
    console.log('[Auth] Signup API call successful');
    
    // Check if the user was created but needs email confirmation
    if (data?.user && !data.user.email_confirmed_at) {
      console.log('[Auth] User created but email not confirmed yet');
      
      // Store email in AsyncStorage for later verification checks
      await AsyncStorage.setItem('pending-verification-email', email);
      
      // Log the confirmation URL format that should be received
      console.log('[Auth] Email confirmation should be sent to:', email);
      console.log('[Auth] Expected callback format:', `${redirectUrl}?type=signup&token=[TOKEN]`);
      
      // Explicitly request email verification resend if needed (uncomment if needed)
      /*
      try {
        await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: redirectUrl,
          }
        });
        console.log('[Auth] Verification email resent');
      } catch (resendError) {
        console.error('[Auth] Error resending verification:', resendError);
      }
      */
    } else if (data?.user?.email_confirmed_at) {
      // If email was already confirmed (rare case)
      console.log('[Auth] User email already confirmed');
    }
    
    return { data, error };
  } catch (error) {
    console.error('[Auth] Unexpected error during signup:', error);
    throw error;
  }
};

// Manual email verification check - can be used for polling
export const checkEmailVerification = async (email: string) => {
  try {
    // Simulate signin to check if email has been verified
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'VERIFICATION_CHECK_ONLY', // This will fail but tells us if email is verified
    });
    
    if (error) {
      // Check error message to determine if it's just unverified or wrong password
      if (error.message.includes('Email not confirmed')) {
        console.log('[Auth] Email still not verified');
        return { verified: false, error: null };
      } else if (error.message.includes('Invalid login credentials')) {
        // This implies the email exists and is verified, but password is wrong (as expected)
        console.log('[Auth] Email is verified but password incorrect (expected)');
        return { verified: true, error: null };
      }
      
      // Some other error
      console.error('[Auth] Error checking verification:', error);
      return { verified: false, error };
    }
    
    // If we somehow got through with our fake password, the email is verified
    console.log('[Auth] Email is verified');
    return { verified: true, error: null };
  } catch (error) {
    console.error('[Auth] Unexpected error checking verification:', error);
    return { verified: false, error };
  }
};

// Add function to handle the URL for email confirmation
export const handleAuthRedirect = async (url: string | null) => {
  if (!url) return { success: false, error: 'No URL provided' };
  
  console.log('[Auth] Handling auth redirect for URL:', url);
  
  try {
    // Parse the URL to extract tokens
    const extractParams = (url: string) => {
      // Handle both hash and query parameters
      const hasHashParams = url.includes('#');
      const hasQueryParams = url.includes('?');
      
      if (!hasHashParams && !hasQueryParams) {
        return null;
      }
      
      let paramsString = '';
      if (hasHashParams) {
        paramsString = url.split('#')[1];
      } else if (hasQueryParams) {
        paramsString = url.split('?')[1];
      }
      
      if (!paramsString) return null;
      
      // Parse params from string to object
      const params: Record<string, string> = {};
      paramsString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      });
      
      return params;
    };
    
    const params = extractParams(url);
    
    if (!params) {
      console.log('[Auth] No parameters found in URL');
      return { success: false, error: 'No parameters found in URL' };
    }
    
    console.log('[Auth] Extracted params from URL:', Object.keys(params).join(', '));
    
    // Check if it's a confirmation link with token
    if (params.token) {
      // This is likely an email confirmation link
      // We need to parse the token and handle the verification
      console.log('[Auth] Found token in URL, handling email confirmation');
      
      // Supabase SDK should handle this automatically in most cases
      // But we'll check the session afterward to confirm
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Auth] Error getting session after confirmation:', error);
        return { success: false, error };
      }
      
      if (data?.session) {
        console.log('[Auth] Successfully authenticated after email confirmation');
        return { success: true, session: data.session };
      }
    }
    
    // Check if we have a session already
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData?.session) {
      console.log('[Auth] Session already exists, no need to set session from URL');
      return { success: true, session: sessionData.session };
    }
    
    // Try to set session from tokens in URL
    if (params.access_token && params.refresh_token) {
      console.log('[Auth] Setting session from tokens in URL');
      const { data, error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token
      });
      
      if (error) {
        console.error('[Auth] Error setting session from URL tokens:', error);
        return { success: false, error };
      }
      
      if (data?.session) {
        console.log('[Auth] Successfully set session from URL tokens');
        return { success: true, session: data.session };
      }
    }
    
    return { success: false, error: 'Could not establish session from URL' };
  } catch (error) {
    console.error('[Auth] Error handling auth redirect:', error);
    return { success: false, error };
  }
};

// Add a helper function to create a user profile with proper service_role access
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    console.log('[Supabase] Creating user profile for:', userId);
    
    // Check if the profile already exists to avoid duplicate entries
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('[Supabase] Error checking existing profile:', fetchError);
    }
    
    if (existingProfile) {
      console.log('[Supabase] Profile already exists, updating instead');
      
      // Update the existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: userData?.user_metadata?.name || userData?.user_metadata?.full_name || 'Player',
          avatar_url: userData?.user_metadata?.picture || userData?.user_metadata?.profile_image || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('[Supabase] Error updating profile:', updateError);
        return { success: false, error: updateError };
      }
      
      return { success: true, data: { id: userId, ...userData } };
    }
    
    // Create a new profile
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          username: `player${Math.floor(Math.random() * 10000)}`, // Generate random username
          display_name: userData?.user_metadata?.name || userData?.user_metadata?.full_name || 'Player',
          avatar_url: userData?.user_metadata?.picture || userData?.user_metadata?.profile_image || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (insertError) {
      console.error('[Supabase] Error creating profile in Supabase:', insertError);
      return { success: false, error: insertError };
    }
    
    console.log('[Supabase] Successfully created user profile');
    return { success: true, data: newProfile };
  } catch (error) {
    console.error('[Supabase] Unexpected error creating profile:', error);
    return { success: false, error };
  }
};

// Fetch leaderboard for a contest
export const getContestLeaderboard = async (contestId: string) => {
  try {
    const { data, error } = await supabase
      .from('leaderboards')
      .select(`
        id,
        rank,
        user_id,
        score,
        prize_amount,
        correct_answers,
        total_questions,
        average_response_time_ms,
        total_response_time,
        profiles:profiles(username, full_name, avatar_url)
      `)
      .eq('contest_id', contestId)
      .order('rank', { ascending: true });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting contest leaderboard:', error);
    return [];
  }
}; 