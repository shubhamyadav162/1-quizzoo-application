import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { Database } from '../database/types';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';

// =========== DISABLE SUPABASE FLAG =============
// Set this to true to disable all Supabase connections temporarily
// and use mock data locally instead
const DISABLE_SUPABASE = false;
// ==============================================

// Track network state
let isConnected = true;
let networkType = 'unknown';
let isMetered = false;

// Set up network monitoring
NetInfo.addEventListener(state => {
  isConnected = state.isConnected ?? true;
  networkType = state.type;
  isMetered = (state as any).isMetered ?? false;
  
  console.log(`[Network] Connection: ${isConnected ? 'online' : 'offline'}, Type: ${networkType}, Metered: ${isMetered}`);
});

// Initialize Supabase with the URL and public key from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ozapkrljynijpffngjtt.supabase.co';
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey || process.env.EXPO_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96YXBrcmxqeW5panBmZm5nanR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MjA0OTcsImV4cCI6MjA1ODI5NjQ5N30.UADLNyKXipAgE5huKXYsaWXNpMePr9Q_lIWSz_rk-Ds';

// Service role key (keep this secure, only use on server-side)
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96YXBrcmxqeW5panBmZm5nanR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjcyMDQ5NywiZXhwIjoyMDU4Mjk2NDk3fQ.R8ILyOWxUhvmhziSZZa5g7QOoV6cgO59attnLG4Y2fo';

// Determine if we're on Windows
const isWindows = Platform.OS === 'web' && typeof navigator !== 'undefined' && /Windows/.test(navigator.userAgent);
console.log(`[Supabase] Running on ${isWindows ? 'Windows' : Platform.OS}`);

// Get timeout from environment or use default (longer timeout for Windows)
const DEFAULT_TIMEOUT = isWindows ? 120000 : 60000; // Increasing timeouts significantly
const TIMEOUT = process.env.SUPABASE_TIMEOUT ? parseInt(process.env.SUPABASE_TIMEOUT) : DEFAULT_TIMEOUT;
console.log(`[Supabase] Using timeout: ${TIMEOUT}ms`);

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

// Create a mock Supabase client for local development
const createMockClient = () => {
  console.log('[Supabase] USING MOCK CLIENT - NO REAL API CALLS WILL BE MADE');
  
  // Basic mock implementation that returns empty data and doesn't do any network calls
  return {
    from: (table: string) => ({
      select: (query = '*') => ({
        range: () => ({
          eq: () => ({ data: [], error: null }),
          match: () => ({ data: [], error: null }),
          filter: () => ({ data: [], error: null }),
          in: () => ({ data: [], error: null }),
          single: () => ({ data: null, error: null }),
        }),
        eq: () => ({ data: [], error: null }),
        neq: () => ({ data: [], error: null }),
        gt: () => ({ data: [], error: null }),
        lt: () => ({ data: [], error: null }),
        gte: () => ({ data: [], error: null }),
        lte: () => ({ data: [], error: null }),
        like: () => ({ data: [], error: null }),
        ilike: () => ({ data: [], error: null }),
        is: () => ({ data: [], error: null }),
        in: () => ({ data: [], error: null }),
        contains: () => ({ data: [], error: null }),
        containedBy: () => ({ data: [], error: null }),
        filter: () => ({ data: [], error: null }),
        not: () => ({ data: [], error: null }),
        or: () => ({ data: [], error: null }),
        and: () => ({ data: [], error: null }),
        order: () => ({ data: [], error: null }),
        limit: () => ({ data: [], error: null }),
        single: () => ({ data: null, error: null }),
        maybeSingle: () => ({ data: null, error: null }),
        csv: () => ({ data: '', error: null }),
      }),
      insert: () => ({ data: null, error: null }),
      upsert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
    rpc: () => ({ data: null, error: null }),
    auth: {
      onAuthStateChange: (callback: Function) => {
        // No real auth state changes
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: null }),
      signIn: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    channel: (name: string) => ({
      on: () => ({ on: () => ({ subscribe: () => {} }) }),
      subscribe: () => {},
    }),
    removeChannel: () => {},
    storage: {
      from: (bucket: string) => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        list: () => Promise.resolve({ data: [], error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
      }),
    },
  };
};

// Create the Supabase client with proper configuration for mobile
// Use mock client if DISABLE_SUPABASE is true
export const supabase = DISABLE_SUPABASE 
  ? createMockClient() as any
  : createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        storage: customStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // We will handle session manually
        flowType: 'implicit', // Simpler flow that works better on mobile
        debug: false, // Disable debug mode in production
      },
      global: {
        // Add fetch override with better timeout handling for mobile networks
        fetch: async (url, options) => {
          const controller = new AbortController();
          let timeoutId: NodeJS.Timeout | null = null;
          const MAX_RETRIES = 3;
          
          // Function to perform a fetch with retry logic
          const fetchWithRetry = async (retryCount = 0): Promise<Response> => {
            try {
              // Create a new abort controller for each attempt
              const thisController = new AbortController();
              
              // Set timeout with proper cleanup
              if (timeoutId) clearTimeout(timeoutId);
              
              timeoutId = setTimeout(() => {
                if (thisController && !thisController.signal.aborted) {
                  thisController.abort();
                  console.log(`[Supabase] Request timed out, retries left: ${MAX_RETRIES - retryCount}`);
                }
              }, TIMEOUT);
              
              console.log(`[Supabase] Making request to ${url.toString().substring(0, 100)}... (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
              
              const response = await fetch(url, {
                ...options,
                signal: thisController.signal,
              });
              
              // Clean up timeout
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              }
              
              return response;
            } catch (error: any) {
              // Clean up timeout
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              }
              
              // If we haven't exceeded max retries and it's a network error, retry
              if (retryCount < MAX_RETRIES && 
                (error.name === 'AbortError' || 
                 error.message?.includes('network') || 
                 error.message?.includes('timeout'))) {
                
                console.log(`[Supabase] Network error, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
                
                // Exponential backoff: 0.5s, 1s, 2s, etc.
                const delay = Math.min(500 * Math.pow(2, retryCount), 8000);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                return fetchWithRetry(retryCount + 1);
              }
              
              console.error('[Supabase Fetch] Error:', error);
              throw error;
            }
          };
          
          return fetchWithRetry();
        },
      },
      realtime: {
        params: {
          eventsPerSecond: 1, // Lower events per second to reduce load
        },
        heartbeatIntervalMs: 30000, // Increase heartbeat interval for more stable connection
        timeout: TIMEOUT, // Use configured timeout for realtime connections
      },
      db: {
        schema: 'public',
      },
    });

// Log initialization
console.log(`[Supabase] Client initialized with URL: ${DISABLE_SUPABASE ? 'MOCK CLIENT (DISABLED)' : supabaseUrl}`);

// Helper to ensure we don't leak Supabase channels/connections
let activeChannels: any[] = [];

// Function to safely create a channel with auto-cleanup
export const createSafeChannel = (channelName: string) => {
  try {
    // Remove any existing channel with the same name
    const existingChannelIndex = activeChannels.findIndex(ch => ch.topic === `realtime:${channelName}`);
    if (existingChannelIndex >= 0) {
      const existingChannel = activeChannels[existingChannelIndex];
      try {
        supabase.removeChannel(existingChannel);
      } catch (e) {
        console.warn(`[Supabase] Failed to remove existing channel ${channelName}:`, e);
      }
      activeChannels.splice(existingChannelIndex, 1);
    }
    
    // Create new channel
    const newChannel = supabase.channel(channelName);
    activeChannels.push(newChannel);
    
    return newChannel;
  } catch (error) {
    console.error(`[Supabase] Error creating channel ${channelName}:`, error);
    return supabase.channel(channelName); // Fallback to regular channel
  }
};

// Helper to safely remove a channel
export const removeSafeChannel = (channel: any) => {
  try {
    const index = activeChannels.findIndex(ch => ch === channel);
    if (index >= 0) {
      activeChannels.splice(index, 1);
    }
    return supabase.removeChannel(channel);
  } catch (error) {
    console.error('[Supabase] Error removing channel:', error);
  }
};

// When app goes to background or terminates, clean up channels
export const cleanupSupabaseChannels = () => {
  try {
    // Copy the array since we'll be modifying it during iteration
    const channelsToRemove = [...activeChannels];
    
    channelsToRemove.forEach(channel => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        console.warn('[Supabase] Error during channel cleanup:', e);
      }
    });
    
    activeChannels = [];
    console.log('[Supabase] Cleaned up all active channels');
  } catch (error) {
    console.error('[Supabase] Error cleaning up channels:', error);
  }
};

// Helper function for error handling in auth
export const handleAuthError = (error: any) => {
  if (!error) return null;
  
  console.error('[Auth] Error:', error);
  
  // Check for network related errors
  if (error.message && (
    error.message.includes('network') || 
    error.message.includes('Network') ||
    error.message.includes('timeout') ||
    error.message.includes('connection')
  )) {
    return {
      title: 'Network Error',
      message: 'Check your internet connection and try again.'
    };
  }
  
  return {
    title: 'Authentication Error',
    message: error.message || 'An unexpected error occurred'
  };
};

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

// Auth functions
export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  if (!supabase) return { data: null, error: { message: 'Supabase not initialized' } };

  // Use the correct two-argument signature: credentials and options
  return await supabase.auth.signUp(
    { email, password },
    { data: metadata }
  );
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!supabase) return { error: { message: 'Supabase not initialized' } };
  
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};

export const signInWithPhone = async (phone: string, password: string) => {
  if (!supabase) return { error: { message: 'Supabase not initialized' } };
  
  return await supabase.auth.signInWithPassword({ phone, password });
};

export const signInWithOtp = async (phone: string) => {
  if (!supabase) return { error: { message: 'Supabase not initialized' } };
  
  return await supabase.auth.signInWithOtp({ phone });
};

export const resetPassword = async (email: string) => {
  if (!supabase) return { error: { message: 'Supabase not initialized' } };
  
  return await supabase.auth.resetPasswordForEmail(email);
};

// Define a generic payload type for Postgres changes
type PostgresChangePayload = {
  commit_timestamp: string;
  eventType: string;
  schema: string;
  table: string;
  new: Record<string, any>;
  old: Record<string, any>;
  errors: any[] | null;
};

// Setup real-time subscriptions with improved channel management
export const subscribeToActiveContests = (callback: Function) => {
  const channel = supabase.channel('public:contests');
  
  return channel
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'contests', filter: 'status=eq.active' }, 
      (payload: PostgresChangePayload) => {
        callback(payload);
      })
    .subscribe();
};

export const subscribeToLeaderboard = (contestId: string, callback: Function) => {
  const channel = supabase.channel(`leaderboard:${contestId}`);
  
  return channel
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'leaderboards', filter: `contest_id=eq.${contestId}` }, 
      (payload: PostgresChangePayload) => {
        callback(payload);
      })
    .subscribe();
};

export const subscribeToWallet = async (callback: Function) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Cannot subscribe to wallet without a user');
    return null;
  }
  
  const channel = supabase.channel(`wallet:${user.id}`);
  
  try {
    return channel
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` }, 
        (payload: PostgresChangePayload) => {
          callback(payload);
        })
      .subscribe();
  } catch (error) {
    console.error('Error subscribing to wallet:', error);
    return null;
  }
};

export const subscribeToContestUpdates = (contestId: string, callback: (payload: PostgresChangePayload) => void) => {
  const channel = createSafeChannel(`contest:${contestId}`);
  
  return channel
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'contests', filter: `id=eq.${contestId}` }, 
      (payload: PostgresChangePayload) => {
        callback(payload);
      })
    .subscribe();
};

export const subscribeToWalletUpdates = (userId: string, callback: (payload: PostgresChangePayload) => void) => {
  const channel = createSafeChannel(`wallet:${userId}`);
  
  return channel
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${userId}` }, 
      (payload: PostgresChangePayload) => {
        callback(payload);
      })
    .subscribe();
};

// Improved redirect handler for OAuth flows
export const handleAuthRedirect = async (urlString: string) => {
  try {
    console.log('[Auth] Processing redirect URL:', urlString);
    
    // First try getting the current session, as sometimes the callback already set it
    const existingSession = await getCurrentSession();
    if (existingSession) {
      console.log('[Auth] Session already exists before processing redirect');
      return { success: true, error: '', session: existingSession };
    }
    
    // Extract the auth params from the URL
    const parsedUrl = new URL(urlString);
    const params = parsedUrl.searchParams;
    const code = params.get('code');
    const provider = params.get('provider');
    
    console.log('[Auth] Extracted params:', { provider, hasCode: !!code });
    
    if (code) {
      // Handle the OAuth callback with code exchange
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('[Auth] Error exchanging code for session:', error);
          return { success: false, error: error.message || 'Unknown auth error', session: null };
        }
        
        if (data?.session) {
          console.log('[Auth] Successfully exchanged code for session');
          // Store the session as backup
          await storeSession(data.session);
          return { success: true, error: '', session: data.session };
        }
      } catch (exchangeError) {
        console.error('[Auth] Error in code exchange:', exchangeError);
      }
    }
    
    // For direct provider logins, extract state from the URL and handle it
    const hash = parsedUrl.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    
    console.log('[Auth] Access token present:', !!accessToken);
    
    if (accessToken) {
      // For Google auth, sometimes the hash contains the tokens directly
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error) {
          console.error('[Auth] Error setting session:', error);
          return { success: false, error: error.message || 'Unknown auth error', session: null };
        }
        
        if (data?.session) {
          console.log('[Auth] Successfully set session from hash params');
          // Store the session as backup
          await storeSession(data.session);
          return { success: true, error: '', session: data.session };
        }
      } catch (sessionError) {
        console.error('[Auth] Error setting session:', sessionError);
      }
    }
    
    // Try refreshing the session as a last resort
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data?.session) {
        console.log('[Auth] Successfully refreshed session');
        await storeSession(data.session);
        return { success: true, error: '', session: data.session };
      }
    } catch (refreshError) {
      console.error('[Auth] Error refreshing session:', refreshError);
    }
    
    // If we got here, we couldn't set a session
    const finalCheck = await getCurrentSession();
    if (finalCheck) {
      console.log('[Auth] Final check found session');
      return { success: true, error: '', session: finalCheck };
    }
    
    return { success: false, error: 'Could not extract auth tokens from the URL', session: null };
  } catch (error) {
    console.error('[Auth] Error handling auth redirect:', error);
    return { success: false, error: String(error), session: null };
  }
};

// Define a Contest type for database objects
type Contest = {
  id: string;
  name: string;
  description?: string;
  entry_fee: number;
  prize_pool: number;
  category_id?: number;
  status: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  participations: Array<{ count: number }>;
  [key: string]: any; // For any additional properties
};

export const getActiveContests = async () => {
  try {
    const { data, error } = await supabase
      .from('contests')
      .select(`
        *,
        participations:contest_participants(count)
      `)
      .eq('status', 'active')
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    return data.map((contest: Contest) => ({
      ...contest,
      participants_count: contest.participations[0]?.count || 0
    }));
  } catch (error) {
    console.error('Error fetching active contests:', error);
    return [];
  }
};

export const getUpcomingContests = async () => {
  try {
    const { data, error } = await supabase
      .from('contests')
      .select(`
        *,
        participations:contest_participants(count)
      `)
      .eq('status', 'upcoming')
      .order('start_time', { ascending: true })
      .limit(10);
    
    if (error) throw error;
    
    return data.map((contest: Contest) => ({
      ...contest,
      participants_count: contest.participations[0]?.count || 0
    }));
  } catch (error) {
    console.error('Error fetching upcoming contests:', error);
    return [];
  }
};

export const getPrivateContest = async (privateCode: string) => {
  try {
    const { data, error } = await supabase
      .from('contests')
      .select(`
        id, 
        name, 
        entry_fee, 
        prize_pool, 
        start_time, 
        end_time, 
        max_participants, 
        is_private,
        private_code,
        banner_url,
        contest_settings(question_count, time_limit_seconds),
        participations:participations(count)
      `)
      .eq('private_code', privateCode)
      .eq('is_private', true)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) {
      return { contest: null, error: 'Contest not found' };
    }
    
    return { 
      contest: {
        ...data,
        participants_count: data.participations[0]?.count || 0
      }, 
      error: null 
    };
  } catch (error: any) {
    console.error('Error getting private contest:', error);
    return { contest: null, error: error.message || 'Failed to get contest' };
  }
};

export const joinContest = async (userId: string, contestId: string) => {
  try {
    const { data, error } = await supabase
      .from('participations')
      .insert({
        user_id: userId,
        contest_id: contestId,
        status: 'joined'
      })
      .select('*')
      .single();
    
    if (error) throw error;
    return { success: true, error: null, participation: data };
  } catch (error: any) {
    console.error('Error joining contest:', error);
    return { success: false, error: error.message, participation: null };
  }
};

export const submitAnswer = async (
  participationId: string, 
  questionId: string, 
  selectedAnswerIndex: number,
  responseTimeMs: number
) => {
  try {
    const { data, error } = await supabase
      .from('user_answers')
      .insert({
        participation_id: participationId,
        question_id: questionId,
        selected_answer_index: selectedAnswerIndex,
        response_time_ms: responseTimeMs
      })
      .select('*')
      .single();
    
    if (error) throw error;
    return { success: true, error: null, answer: data };
  } catch (error: any) {
    console.error('Error submitting answer:', error);
    return { success: false, error: error.message, answer: null };
  }
};

export const getContestLeaderboard = async (contestId: string) => {
  try {
    const { data, error } = await supabase
      .from('leaderboards')
      .select(`
        id,
        rank,
        user_id,
        score,
        correct_answers,
        average_response_time_ms,
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

export const getUserWallet = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user wallet:', error);
    return null;
  }
};

export const getWalletTransactions = async (limit = 10) => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    return [];
  }
};

export const requestWithdrawal = async (amount: number, paymentMethod: string, paymentDetails: any) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // First check wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance, reserved_balance')
      .eq('user_id', user.id)
      .single();
    
    if (walletError) throw walletError;
    
    if (!wallet || wallet.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }
    
    // Begin a transaction to update wallet and create withdrawal request
    // 1. Update wallet by reserving the amount
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ 
        balance: wallet.balance - amount,
        reserved_balance: (wallet.reserved_balance || 0) + amount 
      })
      .eq('user_id', user.id);
    
    if (updateError) throw updateError;
    
    // 2. Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount: amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: 'pending'
      })
      .select()
      .single();
    
    if (withdrawalError) throw withdrawalError;
    
    return { success: true, error: null, withdrawal };
  } catch (error: any) {
    console.error('Error requesting withdrawal:', error);
    return { success: false, error: error.message };
  }
};

export const getProfile = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
};

export const updateProfile = async (userId: string, updates: any) => {
  try {
    // If updates contains a wallet field, handle it separately
    const { wallet, ...profileUpdates } = updates;
    
    // Update profile table
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);
      
    // If there's wallet data and it includes total_earnings, update the wallet table
    if (wallet && (wallet.total_earnings !== undefined || wallet.balance !== undefined || wallet.total_spent !== undefined)) {
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          total_earnings: wallet.total_earnings,
          balance: wallet.balance,
          total_spent: wallet.total_spent
        })
        .eq('user_id', userId);
        
      if (walletError) {
        console.error('Error updating wallet:', walletError);
        return { error: walletError };
      }
    }
    
    return { error };
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return { error };
  }
};

export const getWallet = async (userId: string) => {
  const { data } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
};

export const getTransactions = async (userId: string, limit = 20) => {
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
};

export const getContestQuestions = async (contestId: string) => {
  const { data, error } = await supabase
    .from('contest_questions')
    .select(`
      id,
      question_order,
      question_reference:question_reference_id(
        id,
        question_id,
        category,
        difficulty
      )
    `)
    .eq('contest_id', contestId)
    .order('question_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching contest questions:', error);
    return [];
  }
  
  return data;
};

// Create an admin Supabase client with service role key for RLS-bypassing operations
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Ensure user has a profile and wallet record using admin client
export const ensureUserProfile = async (userId: string, userData?: any) => {
  try {
    console.log(`[Supabase] Creating user profile for: ${userId}`);
    
    // Check if profile exists using admin client
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', profileCheckError);
      return { error: profileCheckError };
    }
    
    // If profile doesn't exist, create it via admin client
    if (!existingProfile) {
      const defaultUsername = userData?.email?.split('@')[0] || `user_${userId.substring(0, 8)}`;
      
      // Create profile record with valid columns
      const { error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          username: defaultUsername,
          // Optionally set avatar_url; bio left as null
          avatar_url: userData?.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        return { error: createProfileError };
      }
    }
    
    // Check if wallet exists via admin client
    const { data: existingWallet, error: walletCheckError } = await supabaseAdmin
      .from('wallets')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (walletCheckError && walletCheckError.code !== 'PGRST116') {
      console.error('Error checking for existing wallet:', walletCheckError);
      return { error: walletCheckError };
    }
    
    // If wallet doesn't exist, create it via admin client
    if (!existingWallet) {
      const { error: createWalletError } = await supabaseAdmin
        .from('wallets')
        .insert({
          user_id: userId,
          balance: 0,
          actual_balance: 0,
          tax_credit_balance: 0,
          reserved_balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (createWalletError) {
        console.error('Error creating wallet:', createWalletError);
        return { error: createWalletError };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return { error };
  }
};

// Default export with all functions
export default {
  supabase,
  signUpWithEmail,
  signInWithEmail,
  signInWithPhone,
  signInWithOtp,
  signOut,
  resetPassword,
  getCurrentUser,
  getCurrentSession,
  getActiveContests,
  getUpcomingContests,
  getPrivateContest,
  joinContest,
  submitAnswer,
  getContestLeaderboard,
  getUserWallet,
  getWalletTransactions,
  requestWithdrawal,
  subscribeToActiveContests,
  subscribeToLeaderboard,
  subscribeToWallet,
  getProfile,
  updateProfile,
  getWallet,
  getTransactions,
  getContestQuestions,
  subscribeToContestUpdates,
  subscribeToWalletUpdates,
  handleAuthRedirect,
  createSafeChannel,
  removeSafeChannel,
  cleanupSupabaseChannels,
  ensureUserProfile
}; 