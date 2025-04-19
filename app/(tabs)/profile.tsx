import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/app/lib/ThemeContext';
import ProfileScreen from '@/app/profile';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

export default function ProfileTab() {
  const { isDark } = useTheme();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: "Profile",
          headerStyle: {
            backgroundColor: isDark ? '#121212' : '#f8f9fa',
          },
          headerTitleStyle: {
            color: isDark ? '#ffffff' : '#000000',
          },
          headerShown: false,
        }}
      />
      <ProfileScreen />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  languageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'solid',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 8,
  },
});