import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, View, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../lib/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';

interface ExternalLoginButtonProps {
  buttonText?: string;
  checkButtonText?: string;
  onLoginStart?: () => void;
  onLoginComplete?: () => void;
  onError?: (message: string) => void;
}

export default function ExternalLoginButton({
  buttonText = 'Sign In with Google',
  checkButtonText = 'I\'ve Completed Login',
  onLoginStart,
  onLoginComplete,
  onError
}: ExternalLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckButton, setShowCheckButton] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const router = useRouter();
  const { isDark } = useTheme();

  // Check for in-progress auth on mount
  useEffect(() => {
    const checkAuthInProgress = async () => {
      try {
        const inProgress = await AsyncStorage.getItem('google-auth-in-progress');
        if (inProgress === 'true') {
          console.log('Found in-progress Google auth from previous session');
          setShowCheckButton(true);
          setShowInstructions(true);
        }
      } catch (error) {
        console.error('Error checking auth progress:', error);
      }
    };
    
    checkAuthInProgress();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      if (onLoginStart) onLoginStart();
      await AsyncStorage.setItem('google-auth-in-progress', 'true');
      // Use makeRedirectUri for correct deep link in all environments
      const redirectUrl = makeRedirectUri({ scheme: 'quizzoo' });
      // Start OAuth flow with Google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      });
      if (error) {
        throw new Error(`Authentication error: ${error.message}`);
      }
      if (data?.url) {
        // Open URL in WebBrowser instead of Linking
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success' && result.url) {
          // Parse tokens or code from the returned URL and set session
          const url = result.url;
          const params = Linking.parse(url).queryParams || {};
          if (params.access_token && params.refresh_token) {
            await supabase.auth.setSession({
              access_token: params.access_token as string,
              refresh_token: params.refresh_token as string,
            });
            await AsyncStorage.setItem('google-auth-in-progress', 'false');
            if (onLoginComplete) onLoginComplete();
            router.replace('/(tabs)');
            return;
          }
          // If code is present, exchange it for a session
          if (params.code) {
            const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(params.code as string);
            if (sessionError) {
              throw new Error(`Failed to exchange code for session: ${sessionError.message}`);
            }
            if (sessionData && sessionData.session) {
              await AsyncStorage.setItem('google-auth-in-progress', 'false');
              if (onLoginComplete) onLoginComplete();
              router.replace('/(tabs)');
              return;
            }
          }
          // If tokens or code not found, fallback to checkSession
          await checkSession();
        } else {
          setShowCheckButton(true);
          setShowInstructions(true);
          Alert.alert(
            'Complete Google Sign In',
            'Please confirm if you\'ve completed the Google login in your browser',
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error('No authentication URL returned');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      if (onError) onError(`Failed to start Google login: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      setIsLoading(true);
      console.log('Checking for session...');
      
      // Try to refresh the session
      await supabase.auth.refreshSession();
      
      // Get current session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        console.log('Valid session found!');
        await AsyncStorage.setItem('google-auth-in-progress', 'false');
        if (onLoginComplete) onLoginComplete();
        router.replace('/(tabs)');
        return;
      }
      
      // No session found, implement multiple retries
      console.log('No session found, will retry with exponential backoff');
      
      // Show check button to let user manually verify
      setShowCheckButton(true);
      setShowInstructions(true);
      
      // We'll try up to 5 times with increasing delays
      const checkWithRetry = async (attemptNumber = 1, maxAttempts = 5) => {
        if (attemptNumber > maxAttempts) {
          console.log(`Reached maximum retry attempts (${maxAttempts})`);
          setIsLoading(false);
          return false;
        }
        
        const delayMs = Math.min(2000 * Math.pow(1.5, attemptNumber - 1), 10000); // Exponential backoff capped at 10s
        console.log(`Retry attempt ${attemptNumber} after ${delayMs}ms delay`);
        
        // Wait for the delay
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        try {
          // Try to refresh the session first
          await supabase.auth.refreshSession();
          
          // Then check for session
          const { data: retryData } = await supabase.auth.getSession();
          
          if (retryData.session) {
            console.log(`Session found on retry attempt ${attemptNumber}`);
            await AsyncStorage.setItem('google-auth-in-progress', 'false');
            if (onLoginComplete) onLoginComplete();
            router.replace('/(tabs)');
            return true;
          } else {
            // No session yet, try next attempt
            return await checkWithRetry(attemptNumber + 1, maxAttempts);
          }
        } catch (e) {
          console.error(`Error checking session on retry attempt ${attemptNumber}:`, e);
          // Continue with next attempt despite error
          return await checkWithRetry(attemptNumber + 1, maxAttempts);
        }
      };
      
      // Start the retry process
      checkWithRetry(1, 5).then(success => {
        if (!success) {
          setIsLoading(false);
        }
      });
    } catch (error: any) {
      console.error('Error verifying login:', error);
      if (onError) onError(`Login verification failed: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" style={{ marginRight: 10 }} />
        ) : (
        <AntDesign name="google" size={20} color="white" />
        )}
        <Text style={styles.buttonText}>
          {isLoading ? 'Opening Browser...' : buttonText}
        </Text>
      </TouchableOpacity>
      
      {showCheckButton && (
        <>
          {showInstructions && (
            <View style={[
              styles.instructionsContainer,
              { backgroundColor: isDark ? '#333' : '#f0f0f0' }
            ]}>
              <Text style={[
                styles.instructionsText,
                { color: isDark ? '#f0f0f0' : '#333' }
              ]}>
                If Google login doesn't complete automatically:
              </Text>
              <Text style={[
                styles.instructionsStepText,
                { color: isDark ? '#ddd' : '#555' }
              ]}>
                1. Complete the Google login in your browser
              </Text>
              <Text style={[
                styles.instructionsStepText,
                { color: isDark ? '#ddd' : '#555' }
              ]}>
                2. Return to this app
              </Text>
              <Text style={[
                styles.instructionsStepText,
                { color: isDark ? '#ddd' : '#555' }
              ]}>
                3. Tap the "Complete Google Sign In" button below
              </Text>
            </View>
          )}
        <TouchableOpacity
          style={styles.checkButton}
            onPress={checkSession}
          disabled={isLoading}
        >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" style={{ marginRight: 10 }} />
            ) : (
          <AntDesign name="check" size={20} color="white" />
            )}
          <Text style={styles.buttonText}>
            {isLoading ? 'Checking...' : checkButtonText}
          </Text>
        </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  googleButton: {
    backgroundColor: '#DB4437',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  checkButton: {
    backgroundColor: '#388E3C',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  instructionsContainer: {
    backgroundColor: '#f0f0f0', 
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333',
  },
  instructionsStepText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555',
  },
}); 