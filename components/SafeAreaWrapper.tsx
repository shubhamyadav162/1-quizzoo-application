import React, { ReactNode, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Platform, View } from 'react-native';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

interface SafeAreaWrapperProps {
  children: ReactNode;
  style?: any;
  withoutBottom?: boolean;
}

/**
 * A safe area wrapper component that handles consistent top and bottom spacing
 * across the app, respecting status bar and navigation areas.
 */
export const SafeAreaWrapper = ({ 
  children, 
  style, 
  withoutBottom = false 
}: SafeAreaWrapperProps) => {
  const { isDark } = useTheme();
  
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  
  // Set status bar color based on theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(isDark ? '#121212' : '#FFFFFF');
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    }
  }, [isDark]);
  
  // Standard status bar height + extra padding for consistency
  const statusBarHeight = StatusBar.currentHeight || 0;
  const topPadding = Platform.OS === 'android' ? statusBarHeight : 0;
  
  // On Android, we manually handle the status bar padding
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          styles.container,
          { 
            backgroundColor,
            paddingTop: topPadding,
            paddingBottom: withoutBottom ? 0 : 16
          },
          style
        ]}
      >
        <ExpoStatusBar style={isDark ? 'light' : 'dark'} />
        {children}
      </View>
    );
  }
  
  // On iOS, we use the SafeAreaView, but need to handle potential bottom insets
  return (
    <SafeAreaView
      style={[
        styles.container,
        { 
          backgroundColor,
          paddingBottom: withoutBottom ? 0 : 16
        },
        style
      ]}
    >
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaWrapper; 