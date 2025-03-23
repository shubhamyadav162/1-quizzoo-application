import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, getCurrentUser } from './supabase';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// स्टोरेज कीज़
const STORAGE_KEYS = {
  USER_DATA: 'quizzoo-user-data',
  AUTH_TOKEN: 'quizzoo-auth-token',
  USER_PROFILE: 'quizzoo-user-profile',
};

type AuthContextType = {
  user: any;
  session: any;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createUserProfile: (userData: any) => Promise<boolean>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize the auth state
    getInitialSession();

    // Set up a subscription to listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed');
          
          setSession(newSession);
          setUser(newSession ? newSession.user : null);
          
          // Save session to local storage for persistence
          if (newSession) {
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(newSession));
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newSession.user));
          }
          
          // If we have a user, create or ensure profile exists
          if (newSession?.user) {
            console.log('Creating/checking profile on auth state change');
            await createUserProfile(newSession.user);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
          setUser(null);
          
          // Clear all data from AsyncStorage when signing out
          try {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
          } catch (error) {
            console.error('Error removing data from AsyncStorage:', error);
          }
        } else {
          // For other events, just update the state
          setSession(newSession);
          setUser(newSession ? newSession.user : null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const getInitialSession = async () => {
    try {
      setIsLoading(true);
      console.log('Getting initial auth state...');
      
      // First try to get from AsyncStorage
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (storedToken && storedUser) {
        console.log('Found stored auth data');
        
        // Try to parse the stored data
        try {
          const parsedToken = JSON.parse(storedToken);
          const parsedUser = JSON.parse(storedUser);
          
          // Check with Supabase if the session is still valid
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error validating stored session:', error);
            // Session invalid, clear storage
            await clearAuthStorage();
          } else if (data.session) {
            // Session is valid, use it
            console.log('Session validated with Supabase');
            setSession(data.session);
            setUser(data.session.user);
            
            // Update the stored data with fresh session
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(data.session));
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.session.user));
          } else {
            // No session from Supabase, use stored user for now
            console.log('No active session, but using stored user data');
            setUser(parsedUser);
            setSession(parsedToken);
          }
        } catch (parseError) {
          console.error('Error parsing stored auth data:', parseError);
          // Invalid data, clear it
          await clearAuthStorage();
        }
      } else {
        // No stored data, check with Supabase
        console.log('No stored auth data, checking with Supabase');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session from Supabase:', error);
        } else if (data.session) {
          console.log('Session found from Supabase');
          setSession(data.session);
          setUser(data.session.user);
          
          // Store this session
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(data.session));
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.session.user));
        } else {
          console.log('No session found anywhere');
          setSession(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Unexpected error getting initial session:', error);
      // On error, clear auth state to be safe
      await clearAuthStorage();
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all auth related storage
  const clearAuthStorage = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    } catch (error) {
      console.error('Error clearing auth storage:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting login with email:', email);
      
      // सीधे लॉगिन अटेम्प्ट करें
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Email login error:', error);
        Alert.alert('लॉगिन त्रुटि', error.message);
        return;
      }
      
      if (data.user) {
        console.log('User signed in with email:', data.user.id);
        setSession(data.session);
        setUser(data.user);
        
        // Store auth data in AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(data.session));
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
        
        // User profile ensure
        await createUserProfile(data.user);
        
        // Navigate to main app
        console.log('Login successful, navigating to main app');
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Unexpected sign-in error:', error);
      Alert.alert('त्रुटि', error.message || 'लॉगिन के दौरान एक त्रुटि हुई');
      throw error; // यह एरर को प्रोपगेट करेगा ताकि हम लॉगिन स्क्रीन में उसे हैंडल कर सकें
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      console.log('Starting registration for email:', email);
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: 'quizzoo://auth/callback',
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        Alert.alert('रजिस्ट्रेशन त्रुटि', error.message);
        return;
      }
      
      console.log('Registration response:', data);
      
      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          // User already exists
          console.log('User already exists with this email');
          Alert.alert('सूचना', 'इस ईमेल से पहले से ही एक अकाउंट है। कृपया लॉगिन करें।');
          router.replace('/login');
          return;
        }
        
        console.log('User registered successfully');
        
        // Store user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
        
        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(data.session));
          
          // Create profile
          await createUserProfile(data.user);
          
          // Navigate to main app
          console.log('Registration successful, navigating to main app');
          router.replace('/(tabs)');
        } else {
          console.log('Registration successful but email verification required');
          // Email confirmation might be required
          Alert.alert(
            'रजिस्ट्रेशन सफल',
            'आपका अकाउंट बन गया है। कृपया अपने ईमेल को वेरिफाई करें।',
            [
              {
                text: 'ठीक है',
                onPress: () => router.replace('/login'),
              },
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('Unexpected registration error:', error);
      Alert.alert('रजिस्ट्रेशन त्रुटि', error.message || 'रजिस्ट्रेशन के दौरान एक त्रुटि हुई');
      throw error; // यह एरर को प्रोपगेट करेगा
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to create or update user profile in Supabase
  const createUserProfile = async (userData: any) => {
    if (!userData || !userData.id) {
      console.error('Cannot create profile - no valid user object');
      return false;
    }
    
    try {
      console.log('Checking if profile exists for user:', userData.id);
      
      // First check if profile already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      // If there's an error that's not "not found", log it
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking for existing profile:', profileError);
      }
      
      // Check if we have a stored profile
      const storedProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      
      // If profile exists in Supabase, store it locally and return
      if (existingProfile) {
        console.log('Profile already exists in Supabase');
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(existingProfile));
        return true;
      }
      
      // Profile doesn't exist in Supabase, check if we have it locally
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        
        if (parsedProfile.id === userData.id) {
          console.log('Using locally stored profile');
          return true;
        }
      }
      
      // Extract user metadata for profile
      const email = userData.email || '';
      const displayName = userData.user_metadata?.full_name || 
                          userData.user_metadata?.name || 
                          email.split('@')[0] || 
                          'User';
      
      const avatarUrl = userData.user_metadata?.avatar_url || null;
      
      // Create new profile object
      const profileData = {
        id: userData.id,
        display_name: displayName,
        email: email,
        avatar_url: avatarUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Create new profile in Supabase
      console.log('Creating new profile for user:', displayName);
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating profile in Supabase:', insertError);
        
        // Even if Supabase insert fails, store profile locally
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profileData));
        
        return true; // Return success because we stored locally
      }
      
      console.log('Profile created successfully in Supabase:', newProfile);
      
      // Store the profile locally too
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile || profileData));
      
      return true;
    } catch (err) {
      console.error('Unexpected error creating profile:', err);
      return false;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear all data from AsyncStorage
      await clearAuthStorage();
      
      // Sign out from Supabase if there's a session
      if (session) {
        await supabase.auth.signOut();
      }
      
      // Clear the local state
      setUser(null);
      setSession(null);
      
      // Navigate to login
      router.replace('/login');
    } catch (error: any) {
      console.error('Sign out error:', error);
      Alert.alert('त्रुटि', error.message || 'लॉगआउट के दौरान एक त्रुटि हुई');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signInWithEmail,
    signOut,
    createUserProfile,
    registerWithEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 