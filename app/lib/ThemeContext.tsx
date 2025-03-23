import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

// Storage key for saving theme preference
const THEME_PREFERENCE_KEY = 'quizzoo-theme-preference';

// Define the type of the theme
type ColorScheme = 'light' | 'dark';

// Define the context type
type ThemeContextType = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
  isDark: boolean;
};

// Create the context with default values
export const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  setColorScheme: () => {},
  toggleColorScheme: () => {},
  isDark: false,
});

// Hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Get device color scheme
  const deviceColorScheme = useDeviceColorScheme() as ColorScheme || 'light';
  
  // Initialize with light theme
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  
  // Load saved theme preference on component mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setColorScheme(savedTheme);
        } else {
          // If no saved preference, use device preference
          setColorScheme(deviceColorScheme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fallback to light theme on error
        setColorScheme('light');
      }
    };
    
    loadThemePreference();
  }, [deviceColorScheme]);
  
  // Save theme preference whenever it changes
  useEffect(() => {
    AsyncStorage.setItem(THEME_PREFERENCE_KEY, colorScheme).catch(error => {
      console.error('Error saving theme preference:', error);
    });
  }, [colorScheme]);
  
  // Toggle between light and dark themes
  const toggleColorScheme = () => {
    setColorScheme(currentScheme => (currentScheme === 'light' ? 'dark' : 'light'));
  };
  
  // Context value
  const contextValue: ThemeContextType = {
    colorScheme,
    setColorScheme,
    toggleColorScheme,
    isDark: colorScheme === 'dark',
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
} 