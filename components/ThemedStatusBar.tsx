import React, { useEffect } from 'react';
import { StatusBar, Platform, StatusBarProps, AppState } from 'react-native';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';

/**
 * This component applies the appropriate status bar style based on the current theme
 * and allows for screen-specific customization
 */
interface ThemedStatusBarProps extends StatusBarProps {
  backgroundColor?: string;
  translucent?: boolean;
}

const ThemedStatusBar = ({
  backgroundColor,
  translucent = true, // Always default to translucent for better UI
  barStyle,
  ...otherProps
}: ThemedStatusBarProps) => {
  const { isDark } = useTheme();
  
  // Determine the final bar style based on theme or prop
  const finalBarStyle = barStyle || (isDark ? 'light-content' : 'dark-content');
  
  // Function to apply status bar settings consistently
  const applyStatusBarSettings = () => {
    StatusBar.setBarStyle(finalBarStyle);
    
    if (Platform.OS === 'android') {
      // Use provided background color or transparent
      const bgColor = backgroundColor || 'transparent';
      StatusBar.setBackgroundColor(bgColor);
      StatusBar.setTranslucent(translucent);
    }
  };
  
  useEffect(() => {
    // Apply settings initially
    applyStatusBarSettings();
    
    // Also apply settings when app comes back to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        applyStatusBarSettings();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [isDark, backgroundColor, translucent, finalBarStyle]); // Re-apply when these change
  
  // Return the actual StatusBar component with props
  return (
    <StatusBar
      barStyle={finalBarStyle}
      backgroundColor={backgroundColor || 'transparent'}
      translucent={translucent}
      {...otherProps}
    />
  );
};

export default ThemedStatusBar;
export { ThemedStatusBar }; 