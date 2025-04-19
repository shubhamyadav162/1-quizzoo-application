/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Quizzoo app color palette
 */

// Primary and secondary colors
const primary = '#4CAF50';  // Green for success/actions
const secondary = '#FF9800'; // Orange for highlights

// Theme colors
const tintColorLight = primary;
const tintColorDark = '#6FCF73'; // Lighter green for dark mode

export const Colors = {
  primary: '#4CAF50',
  primaryDark: '#2E7D32',
  secondary,
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  light: {
    text: '#333333',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    cardBackground: '#F5F5F5',
    border: '#E0E0E0',
  },
  dark: {
    text: '#E0E0E0',
    background: '#121212',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    cardBackground: '#1E1E1E',
    border: '#333333',
  },
};
