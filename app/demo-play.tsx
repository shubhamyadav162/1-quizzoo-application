import React, { useEffect } from 'react';
import {
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from './lib/ThemeContext';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

export default function DemoPlayScreen() {
  const { isDark } = useTheme();
  
  useEffect(() => {
    console.log('Demo Play: Navigating to lobby with mode=demo');
    // Navigate to our new lobby with demo mode parameter
    router.push(`/lobby/demo?mode=demo`);
  }, []);
  
  // This just shows a loading screen while we redirect
  return (
    <SafeAreaView style={{
      flex: 1, 
      backgroundColor: isDark ? '#121212' : '#f8f9fa',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <ActivityIndicator size="large" color={isDark ? Colors.primary : Colors.primary} />
      <ThemedText style={{marginTop: 20}}>Loading game...</ThemedText>
    </SafeAreaView>
  );
} 