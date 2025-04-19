import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';

export default function WalletLayout() {
  const { isDark } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? Colors.dark.tint : Colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
        },
      }}
    />
  );
} 