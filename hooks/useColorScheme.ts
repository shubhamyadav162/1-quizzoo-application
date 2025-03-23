import { useTheme } from '@/app/lib/ThemeContext';

// Use the ThemeContext's colorScheme value
export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme as 'light' | 'dark';
}
