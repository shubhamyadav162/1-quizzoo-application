import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

export default function Index() {
  // हमेशा लॉगिन पेज पर रीडायरेक्ट करें
  useEffect(() => {
    // थोड़ा समय दिखाने के बाद लॉगिन पेज पर जाएँ
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ActivityIndicator size="large" color={Colors.primary} />
      <ThemedText style={styles.loadingText}>ऐप लोड हो रहा है...</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
}); 