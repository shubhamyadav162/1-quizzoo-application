import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useSegments, useRouter, Stack } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useTheme } from './lib/ThemeContext';
import { useAuth } from './lib/AuthContext';
import { supabase } from './lib/supabase';

/**
 * This component handles deep linking and authentication redirects.
 * It captures all unmatched routes and specifically looks for auth callbacks
 * from Supabase email confirmation and social login redirects.
 */
export default function UnmatchedRoute() {
  const params = useLocalSearchParams();
  const segments = useSegments();
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, isLoading } = useAuth();
  
  console.log('Unmatched route handler activated');
  console.log('Segments:', segments);
  console.log('Params:', params);
  
  useEffect(() => {
    // Handle authentication callbacks
    const handleDeepLink = async () => {
      try {
        // Check if this is an auth callback
        const isAuthCallback = 
          segments.includes('auth') || 
          segments.includes('callback') || 
          segments.some(s => s.includes('auth')) ||
          params.access_token || 
          params.refresh_token || 
          params.type === 'recovery' ||
          params.type === 'signup' ||
          params.type === 'magiclink';
          
        if (isAuthCallback) {
          console.log('Detected auth callback, refreshing session...');
          
          // Process the URL if it appears to be an auth callback
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            // Navigate back to login page
            router.replace('/login');
            return;
          }
          
          if (data.session) {
            console.log('Session found, navigation to app main screen');
            // Successfully authenticated, navigate to the app
            router.replace('/(tabs)');
            return;
          } else {
            console.log('No session found, redirecting to login');
            router.replace('/login');
            return;
          }
        }
        
        // If we reached here, it's not an auth callback, redirect to home
        console.log('Not an auth callback, redirecting to default screen');
        router.replace('/');
      } catch (error) {
        console.error('Error handling deep link:', error);
        router.replace('/login');
      }
    };
    
    // Only attempt to handle deep link if not loading
    if (!isLoading) {
      handleDeepLink();
    }
  }, [isLoading, params, segments]);
  
  return (
    <View style={[styles.container, {backgroundColor: isDark ? Colors.dark.background : Colors.light.background}]}>
      <Stack.Screen options={{ title: 'Redirecting...' }} />
      <ActivityIndicator size="large" color={isDark ? Colors.dark.tint : Colors.light.tint} />
      <Text style={[styles.text, {color: isDark ? Colors.dark.text : Colors.light.text}]}>
        Redirecting...
      </Text>
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
  text: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
}); 