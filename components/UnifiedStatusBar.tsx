import React, { useEffect } from 'react';
import { Platform, StatusBar, AppState, StyleSheet, View } from 'react-native';
import { useTheme } from '@/app/lib/ThemeContext';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

interface UnifiedStatusBarProps {
  // Optional override for specific screens where status bar should have different styling
  transparentBackground?: boolean; 
  forceLightContent?: boolean;
  backgroundColor?: string;
  includeStatusBarHeight?: boolean;
}

/**
 * Unified status bar component that maintains consistent appearance
 * across the entire app in both light and dark modes.
 * 
 * Features:
 * - Consistent styling based on theme
 * - Never hidden or refreshed during gameplay
 * - Globally applied to all screens
 * - Maintains stability during transitions
 * - Supports transparent mode for immersive headers
 */
export function UnifiedStatusBar({ 
  transparentBackground = true,
  forceLightContent = false,
  backgroundColor,
  includeStatusBarHeight = false
}: UnifiedStatusBarProps) {
  const { isDark } = useTheme();
  
  // Determine bar style based on theme and props
  // If forceLightContent is true, always use light-content
  // Otherwise use theme-based style (dark mode -> light-content, light mode -> dark-content)
  const barStyle = forceLightContent ? 'light-content' : (isDark ? 'light-content' : 'dark-content');

  // Core configuration function - improved to be more robust
  const configureStatusBar = () => {
    StatusBar.setHidden(false);
    StatusBar.setBarStyle(barStyle);
    
    if (Platform.OS === 'android') {
      // On Android, ensure translucent status bar with appropriate color
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  };

  useEffect(() => {
    // Initial configuration
    configureStatusBar();
    
    // Re-apply on app focus
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        configureStatusBar();
      }
    });

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, [isDark, barStyle, transparentBackground]);

  const bg = backgroundColor || (isDark ? '#121212' : '#ffffff');

  return (
    <>
      <ExpoStatusBar
        style={barStyle === 'light-content' ? 'light' : 'dark'}
        translucent={transparentBackground}
        backgroundColor="transparent" 
      />
      {includeStatusBarHeight && (
        <View 
          style={[
            styles.statusBarPlaceholder, 
            { backgroundColor: transparentBackground ? 'transparent' : bg }
          ]} 
        />
      )}
    </>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 47 : StatusBar.currentHeight || 0;

const styles = StyleSheet.create({
  statusBarPlaceholder: {
    height: STATUSBAR_HEIGHT,
    width: '100%',
  },
}); 