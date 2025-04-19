import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// Storage key for saving theme preference
const THEME_PREFERENCE_KEY = 'quizzoo-theme-preference';

// Define the type of the theme
type ColorScheme = 'light' | 'dark' | 'system';

// Define the context type
type ThemeContextType = {
  theme: ColorScheme;
  isDark: boolean;
  setTheme: (theme: ColorScheme) => void;
};

// Create the context with default values
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ColorScheme>('system');
  
  // Load saved theme on startup
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('user-theme') as ColorScheme;
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    
    loadTheme();
  }, []);
  
  // Calculate if dark mode should be used based on theme selection
  const isDark = theme === 'system' 
    ? colorScheme === 'dark' 
    : theme === 'dark';
  
  // Set theme with persistence
  const setTheme = async (newTheme: ColorScheme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('user-theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Add default export
export default ThemeProvider; 