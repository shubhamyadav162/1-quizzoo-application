import React from 'react';
import { View, StyleSheet } from 'react-native';

interface TabBarBackgroundProps {
  isDark?: boolean;
}

const TabBarBackground: React.FC<TabBarBackgroundProps> = ({ isDark = false }) => {
  return (
    <View style={[
      styles.background,
      { backgroundColor: isDark ? '#1f1f1f' : '#ffffff' }
    ]} />
  );
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default TabBarBackground;

// This function is not needed and might cause issues
export function useBottomTabOverflow() {
  return 0;
}
