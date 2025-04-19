import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from './lib/ThemeContext';
import { Colors } from '@/constants/Colors';

export default function InstantMatch() {
  const { isDark } = useTheme();
  const bgColor = isDark ? Colors.dark.background : Colors.light.background;
  
  // Redirect to home screen immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
      Alert.alert("Navigation Error", "The requested game screen does not exist.");
      }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.loadingContainer}>
              <ActivityIndicator 
                size="large" 
                color={isDark ? Colors.dark.tint : Colors.light.tint} 
                  />
                </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 