import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/app/lib/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [initialNavigationCompleted, setInitialNavigationCompleted] = useState(false);

  console.log('Index rendering - user:', user ? 'exists' : 'null', 'loading:', loading);

  // If the user is logged in, redirect to the tabs
  // Otherwise, redirect to the login page
  useEffect(() => {
    // Check if navigation is ready before trying to navigate
    if (!rootNavigationState?.key || initialNavigationCompleted) {
      console.log('[Index] Navigation not ready or already navigated');
      return;
    }
    
    console.log('[Index] Navigation is ready!');
    console.log('[Index] User:', user ? 'exists' : 'null', 'loading:', loading);
    
    const navigateBasedOnAuth = async () => {
      if (!loading) {
        setInitialNavigationCompleted(true);
        if (user) {
          console.log('[Index] User is logged in, redirecting to tabs');
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 100);
        } else {
          console.log('[Index] User is not logged in, redirecting to login');
          try {
            setTimeout(() => {
              router.replace('/login');
            }, 100);
          } catch (error) {
            console.error('[Index] Error navigating to login:', error);
          }
        }
      }
    };
    
    navigateBasedOnAuth();
  }, [loading, user, router, rootNavigationState?.key, initialNavigationCompleted]);

  // While loading, show a loading spinner
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.light.tint} />
      <ThemedText style={styles.loadingText}>Loading...</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
}); 