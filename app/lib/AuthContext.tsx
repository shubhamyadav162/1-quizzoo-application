import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { 
  supabase, 
  signUpWithEmail as supabaseSignUpWithEmail, 
  getCurrentUser,
  getCurrentSession,
  signOut as supabaseSignOut,
  handleAuthRedirect,
  checkEmailVerification as supabaseCheckEmailVerification,
  ensureUserProfile as supabaseEnsureUserProfile
} from '../../lib/supabase';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserProfile, getUserProfile } from './LocalStorage';

// Define the User type
type User = {
  id: string;
  email: string | null;
  displayName?: string | null;
  emailVerified: boolean;
  reload: () => Promise<void>;
  updateProfile: (profile: { displayName?: string }) => Promise<void>;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  signInWithEmailLink: (email: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isEmailVerified: boolean;
  checkEmailVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Add this function to create/update the user profile
  const ensureUserProfile = async (userId: string, userData: any) => {
    try {
      console.log('[AuthContext] Ensuring user profile exists');
      
      // First check if we have a local profile
      const existingProfile = await getUserProfile();
      
      // Create or update the profile with user data
      await updateUserProfile({
        name: userData?.user_metadata?.name || userData?.user_metadata?.full_name || existingProfile?.name || 'Player',
        email: userData.email || existingProfile?.email || '',
        profileImage: userData?.user_metadata?.picture || userData?.user_metadata?.profile_image || existingProfile?.profileImage,
        totalGamesPlayed: existingProfile?.totalGamesPlayed || 0,
        totalEarnings: existingProfile?.totalEarnings || 0,
        highestScore: existingProfile?.highestScore || 0,
        achievements: existingProfile?.achievements || [],
      });
      
      // Also create/update the profile in Supabase
      try {
        const result = await supabaseEnsureUserProfile(userId, userData);
        if (result.error) {
          console.error('Error creating profile in Supabase:', result.error);
        }
      } catch (error) {
        console.error('Exception calling ensureUserProfile:', error);
      }
      
      console.log('[AuthContext] User profile ensured');
    } catch (error) {
      console.error('[AuthContext] Error ensuring user profile:', error);
    }
  };

  // Subscribe to auth state changes and update user
  useEffect(() => {
    console.log('[AuthContext] Setting up auth state subscription');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state changed:', event);
        
        if (session) {
          console.log('[AuthContext] Session exists, fetching user data');
          const supaUser = await getCurrentUser();
          
          if (supaUser) {
            // Map Supabase user to our User type
            const mappedUser: User = {
              id: supaUser.id,
              email: supaUser.email || null,
              displayName: supaUser.user_metadata?.name || null,
              emailVerified: supaUser.email_confirmed_at !== null,
              reload: async () => {
                const refreshed = await getCurrentUser();
                if (refreshed) {
                  setUser({
                    ...mappedUser,
                    emailVerified: refreshed.email_confirmed_at !== null,
                    displayName: refreshed.user_metadata?.name || null,
                  });
                }
              },
              updateProfile: async (profile) => {
                try {
                  const { error } = await supabase.auth.updateUser({
                    data: { name: profile.displayName }
                  });
                  
                  if (error) throw error;
                  
                  // Update local user state
                  setUser({
                    ...mappedUser,
                    displayName: profile.displayName || null
                  });
                } catch (error) {
                  console.error('[AuthContext] Error updating profile:', error);
                  throw error;
                }
              }
            };
            
            setUser(mappedUser);
            
            // Ensure user profile exists
            ensureUserProfile(supaUser.id, supaUser);
          } else {
            setUser(null);
          }
        } else {
          console.log('[AuthContext] No session, clearing user');
          setUser(null);
        }
        
        setLoading(false);
      }
    );
    
    // Initial check for existing session
    const checkExistingSession = async () => {
      try {
        const session = await getCurrentSession();
        if (!session) {
          console.log('[AuthContext] No existing session found');
          setLoading(false);
        }
      } catch (error) {
        console.error('[AuthContext] Error checking existing session:', error);
        setLoading(false);
      }
    };
    
    checkExistingSession();
    
    return () => {
      console.log('[AuthContext] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Listen for deep links for email confirmation
  useEffect(() => {
    // Setup deep link handler for auth redirects
    const setupDeepLinks = async () => {
      // Define URL event handler
      const handleUrl = async ({ url }: { url: string }) => {
        console.log('[DeepLink] URL received:', url);
        
        if (url.includes('auth/callback')) {
          console.log('[DeepLink] Processing auth callback URL');
          const result = await handleAuthRedirect(url);
          
          if (result.success) {
            console.log('[DeepLink] Auth redirect handled successfully');
            // The onAuthStateChange listener will update the user
            router.replace('/(tabs)');
          } else {
            console.error('[DeepLink] Error handling auth redirect:', result.error);
            Alert.alert('Authentication Error', 'There was a problem verifying your email. Please try again.');
          }
        }
      };
      
      // Add URL event listener and check initial URL
      const subscription = Linking.addEventListener('url', handleUrl);
      
      // Check if app was opened with a URL
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('[DeepLink] App opened with URL:', initialUrl);
        await handleUrl({ url: initialUrl });
      }
      
      return () => {
        subscription.remove();
      };
    };
    
    setupDeepLinks();
  }, [router]);

  const checkEmailVerification = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // First try the standard check
      const refreshedUser = await getCurrentUser();
      if (refreshedUser?.email_confirmed_at !== null) {
        console.log('[AuthContext] Email verified based on user data');
        return true;
      }
      
      // If that didn't work, try the alternative verification check
      const storedEmail = await AsyncStorage.getItem('pending-verification-email');
      if (storedEmail) {
        const { verified } = await supabaseCheckEmailVerification(storedEmail);
        console.log(`[AuthContext] Email verification check for ${storedEmail}: ${verified}`);
        
        if (verified) {
          // Update the user state to reflect verified status
          if (user) {
            await user.reload();
          }
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[AuthContext] Error checking email verification:', error);
      return false;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    try {
      console.log('[AuthContext] Registering with email:', email);
      
      const { data, error } = await supabaseSignUpWithEmail(email, password, { name });
      
      if (error) {
        console.error('[AuthContext] Error during registration:', error);
        throw new Error(error.message);
      }
      
      if (data?.user) {
        console.log('[AuthContext] Registration successful, email confirmation required');
        
        // Store the email in AsyncStorage for verification checks
        await AsyncStorage.setItem('pending-verification-email', email);
        
        // Ensure user profile exists
        await ensureUserProfile(data.user.id, data.user);
        
        // Added delay to ensure email has time to be sent by Supabase
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error: any) {
      console.error('[AuthContext] Error during registration:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Signing in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          // Try to resend the verification email
          try {
            await supabase.auth.resend({
              type: 'signup',
              email,
              options: {
                emailRedirectTo: 'quizzoo://auth/callback'
              }
            });
            console.log('[AuthContext] Verification email resent');
            throw new Error('Please verify your email before signing in. A new verification email has been sent.');
          } catch (resendError) {
            console.error('[AuthContext] Error resending verification:', resendError);
            throw new Error('Please verify your email before signing in.');
          }
        } else {
          throw new Error(error.message);
        }
      } else if (data?.user) {
        // Ensure user profile exists
        await ensureUserProfile(data.user.id, data.user);
      }
      
      router.replace('/');
    } catch (error: any) {
      console.error('[AuthContext] Error during sign in:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Close any existing auth sessions
      WebBrowser.maybeCompleteAuthSession();
      
      // Create a URL with app scheme and path from app.json
      const redirectUrl = 'quizzoo://auth/callback';
      console.log('[AuthContext] Google sign-in with redirect URL:', redirectUrl);
      
      // First get the current session if it exists to avoid duplicate logins
      const existingSession = await getCurrentSession();
      if (existingSession) {
        console.log('[AuthContext] Session already exists, refreshing user data');
        const userData = await getCurrentUser();
        if (userData) {
          console.log('[AuthContext] User already signed in:', userData.email);
          router.replace('/(tabs)');
          return; // Already signed in
        }
      }
      
      // Store a flag to indicate we're starting the login flow
      await AsyncStorage.setItem('google-auth-in-progress', 'true');
      
      // Use the Supabase SDK to start the OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // Add these parameters to ensure proper mobile flow
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      });
      
      if (error) {
        console.error('[AuthContext] Google sign-in error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('[AuthContext] Opening OAuth URL with WebBrowser:', data.url);
        
        // Use WebBrowser instead of Linking for better auth flow
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        
        if (result.type === 'success') {
          console.log('[AuthContext] Auth session completed successfully');
          
          // Get the URL to extract tokens
          const { url } = result;
          if (url) {
            // Try to handle auth redirect with the URL
            const redirectResult = await handleAuthRedirect(url);
            if (redirectResult.success) {
              console.log('[AuthContext] Auth redirect handled successfully');
              // Final session check
              const finalSession = await getCurrentSession();
              if (finalSession) {
                router.replace('/(tabs)');
              }
              await AsyncStorage.setItem('google-auth-in-progress', 'false');
              return;
            }
          }
        } else {
          console.log('[AuthContext] WebBrowser session ended with:', result.type);
          // User might need to complete login manually, let the ExternalLoginButton handle this case
        }
      } else {
        throw new Error('No authentication URL returned');
      }
    } catch (error: any) {
      console.error('[AuthContext] Error during Google sign in:', error);
      // Clear the in-progress flag in case of error
      await AsyncStorage.removeItem('google-auth-in-progress');
      throw error;
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      // Since Supabase doesn't directly support phone auth without custom setup,
      // we'll use email with the phone as username for now
      Alert.alert(
        'Not Supported',
        'Phone authentication is not yet supported. Please use email instead.'
      );
    } catch (error: any) {
      console.error('[AuthContext] Error during phone sign in:', error);
      throw error;
    }
  };

  const signInWithEmailLink = async (email: string) => {
    try {
      // This is handled automatically through deep links
      console.log('[AuthContext] Email link sign in is handled through deep links');
    } catch (error: any) {
      console.error('[AuthContext] Error during email link sign in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Starting logout process');
      // Clear any application specific auth data from AsyncStorage
      await AsyncStorage.removeItem('user-profile');
      await AsyncStorage.removeItem('pending-verification-email');
      // Perform the actual sign out
      await supabaseSignOut();
      console.log('[AuthContext] Logout completed, redirecting to login');
      // Set user to null explicitly to trigger UI updates
      setUser(null);
      // Force navigation to login screen after logout
      router.replace('/login');
    } catch (error: any) {
      console.error('[AuthContext] Error during logout:', error);
      // Even if there was an error, still try to redirect to login
      setUser(null);
      router.replace('/login');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'quizzoo://auth/reset-password'
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('[AuthContext] Error during password reset:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signInWithPhone,
    signInWithEmailLink,
    registerWithEmail,
    logout,
    resetPassword,
    isEmailVerified: user?.emailVerified || false,
    checkEmailVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 