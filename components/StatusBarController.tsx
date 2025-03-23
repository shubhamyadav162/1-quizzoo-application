import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useTheme } from '@/app/lib/ThemeContext';
import { Platform, StatusBar as NativeStatusBar } from 'react-native';

/**
 * A component that manages the status bar appearance based on the current theme
 */
export function StatusBarController() {
  const { isDark } = useTheme();
  
  // Set the status bar color on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Change the status bar background color
      NativeStatusBar.setBackgroundColor(isDark ? '#1a1a1a' : 'transparent');
      
      // Also change the navigation bar color (bottom bar)
      if (NativeStatusBar.setBarStyle) {
        NativeStatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
      }
      
      // Change navigation bar color if available (Android only)
      if (Platform.Version >= 21 && NativeStatusBar.setTranslucent) {
        NativeStatusBar.setTranslucent(true);
      }
    }
  }, [isDark]);
  
  return (
    <StatusBar 
      style={isDark ? 'light' : 'dark'} 
      backgroundColor="transparent" 
      translucent={Platform.OS === 'android'} 
    />
  );
} 