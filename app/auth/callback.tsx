import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '../lib/ThemeContext';
import { handleAuthRedirect, getCurrentSession, getCurrentUser, supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * This component handles Supabase authentication callbacks and deep links.
 */
export default function AuthCallback() {
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Make sure to close any auth sessions when this component mounts
    WebBrowser.maybeCompleteAuthSession();
    
    const processCallback = async () => {
      try {
        console.log('[AuthCallback] Processing auth callback');
        
        // Try to force refresh the auth state
        try {
          await supabase.auth.refreshSession();
          console.log('[AuthCallback] Refreshed session');
        } catch (refreshError) {
          console.log('[AuthCallback] Session refresh error:', refreshError);
        }
        
        // First check if we already have a session 
        const existingSession = await getCurrentSession();
        if (existingSession) {
          console.log('[AuthCallback] Already have a valid session, going to main app');
          setStatus('success');
          
          // Clear any pending auth flags
          await AsyncStorage.setItem('google-auth-in-progress', 'false');
          
          // Short delay to show success screen
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1000);
          return;
        }
        
        // Try to get the URL if we're in a deep link scenario
        const url = await Linking.getInitialURL();
        if (url) {
          console.log('[AuthCallback] Processing auth URL:', url);
          
          // Try to exchange code for session
          const result = await handleAuthRedirect(url);
          
          if (result.success) {
            console.log('[AuthCallback] Auth successful from URL');
            setStatus('success');
            
            // Clear in-progress flag
            await AsyncStorage.setItem('google-auth-in-progress', 'false');
            
            // Short delay to show success screen
            setTimeout(() => {
            router.replace('/(tabs)');
            }, 1000);
            return;
          } else {
            console.error('[AuthCallback] Auth failed from URL:', result.error);
            setStatus('error');
            // Ensure error is treated as string
            const errorMsg = typeof result.error === 'string' ? result.error : 'Authentication failed. Please try again.';
            setErrorMessage(errorMsg);
            
            // Try again with any available params
            await processWithParams();
          }
        } else {
          // No URL, try with params directly
          await processWithParams();
        }
      } catch (error: any) {
        console.error('[AuthCallback] Unexpected error:', error);
        setStatus('error');
        setErrorMessage(String(error) || 'An unexpected error occurred.');
        
        // Go back to login after showing error for a moment
        setTimeout(() => {
          router.replace('/login');
        }, 3000);
      }
    };
    
    const processWithParams = async () => {
      // If we have an access_token param or a code param, try to handle it
      if (params.access_token || params.code) {
        console.log('[AuthCallback] Have auth params, trying to process');
        
        try {
          // Manually construct URL for processing
          const urlParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (typeof value === 'string') {
              urlParams.append(key, value);
            }
          });
          
          const processUrl = `quizzoo://auth/callback?${urlParams.toString()}`;
          console.log('[AuthCallback] Processing constructed URL:', processUrl);
          
          const result = await handleAuthRedirect(processUrl);
          
          if (result.success) {
            console.log('[AuthCallback] Auth successful from params');
            setStatus('success');
            
            // Clear in-progress flag
            await AsyncStorage.setItem('google-auth-in-progress', 'false');
            
            // Short delay to show success screen
            setTimeout(() => {
                  router.replace('/(tabs)');
            }, 1000);
            return true;
          } else {
            // Ensure error is treated as string
            const errorMsg = typeof result.error === 'string' ? result.error : 'Authentication failed';
            throw new Error(errorMsg);
          }
        } catch (paramError: any) {
          console.error('[AuthCallback] Error processing auth params:', paramError);
          setStatus('error');
          setErrorMessage(String(paramError) || 'Authentication failed. Please try again.');
          
          // Go back to login after showing error for a moment
          setTimeout(() => {
            router.replace('/login');
          }, 3000);
          return false;
          }
        } else {
        // If we got here, we couldn't process the auth
        console.log('[AuthCallback] No auth data to process, returning to login');
        setStatus('error');
        setErrorMessage('No authentication data found. Please try logging in again.');
        
        // Go back to login after showing error for a moment
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
        return false;
      }
    };
    
    // Start the process
    processCallback();
  }, [router, params]);
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
    ]}>
      {status === 'loading' && (
        <>
          <ActivityIndicator 
            size="large" 
            color={isDark ? Colors.dark.tint : Colors.light.tint} 
            style={styles.spinner}
          />
          <Text style={[
            styles.text,
            { color: isDark ? Colors.dark.text : Colors.light.text }
          ]}>
            Processing login...
          </Text>
        </>
      )}
      
      {status === 'success' && (
        <>
          <Text style={[
            styles.text,
            styles.successText,
            { color: isDark ? Colors.dark.tint : Colors.light.tint }
          ]}>
            Login successful!
          </Text>
          <Text style={[
            styles.subText,
            { color: isDark ? Colors.dark.text : Colors.light.text }
          ]}>
            Redirecting to app...
          </Text>
        </>
      )}
      
      {status === 'error' && (
        <>
          <Text style={[
            styles.text,
            styles.errorText,
            { color: 'red' }
          ]}>
            Login Failed
          </Text>
          <Text style={[
            styles.subText,
            { color: isDark ? Colors.dark.text : Colors.light.text }
          ]}>
            {errorMessage || 'Please try again.'}
      </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  successText: {
    fontSize: 24,
  },
  errorText: {
    fontSize: 20,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 30,
  }
}); 