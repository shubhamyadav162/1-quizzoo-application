import { useTheme } from '@/app/lib/ThemeContext';

// Use the ThemeContext's isDark value to determine colorScheme
export function useColorScheme() {
  const { isDark } = useTheme();
  return isDark ? 'dark' : 'light';
}
