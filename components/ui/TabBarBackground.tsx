import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Dimensions, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface TabBarBackgroundProps {
  isDark?: boolean;
}

const TabBarBackground: React.FC<TabBarBackgroundProps> = ({ isDark = false }) => {
  // Attempt to remove help tab if it's added by a third-party library
  useEffect(() => {
    const removeHelpTab = () => {
      // This is a workaround for when a help tab is added outside of our control
      try {
        if (Platform.OS === 'android') {
          // In native Android, we might need a different approach
          // This is a placeholder for potential native module integration
          console.log("Attempting to remove help tab on Android");
        }
      } catch (err) {
        console.log("Error removing help tab:", err);
      }
    };
    
    // Run once on component mount
    removeHelpTab();
    
    // Also set up an interval to check periodically
    const interval = setInterval(removeHelpTab, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
      ]}
    />
  );
};

// Get tab bar height based on platform
const getTabBarHeight = (): number => {
  return Platform.OS === 'ios' ? 85 : 65;
};

// Hook to calculate bottom tab overflow for content layout
export function useBottomTabOverflow() {
  const tabHeight = getTabBarHeight();
  return tabHeight;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: getTabBarHeight(),
    zIndex: 1,
    borderTopWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default TabBarBackground;
