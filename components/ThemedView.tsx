import { View, type ViewProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/app/lib/ThemeContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  backgroundType?: 'background' | 'card' | 'navigation' | 'elevated';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  backgroundType = 'background',
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, backgroundType === 'background' ? 'background' : 'cardBackground');
  const { isDark } = useTheme();
  
  // Apply different shadow styles based on theme
  const shadowStyles = isDark 
    ? backgroundType !== 'background' ? styles.darkShadow : undefined 
    : backgroundType !== 'background' ? styles.lightShadow : undefined;

  return (
    <View 
      style={[
        { backgroundColor }, 
        shadowStyles,
        style
      ]} 
      {...otherProps} 
    />
  );
}

const styles = StyleSheet.create({
  lightShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});
