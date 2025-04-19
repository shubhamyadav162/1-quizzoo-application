import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';

export default function PhoneVerificationScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  
  // Automatically redirect to email login after showing message
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.replace('/login/email');
    }, 2000);
    
    return () => clearTimeout(redirectTimer);
  }, []);
  
  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: isDark ? Colors.dark.background : Colors.light.background}]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.container}>
        <FontAwesome5 name="mobile-alt" size={60} color="#FF6B00" />
        
        <Text style={[styles.title, {color: isDark ? Colors.dark.text : Colors.light.text}]}>
          Redirecting...
        </Text>
        
        <Text style={[styles.message, {color: isDark ? Colors.dark.text : Colors.light.text}]}>
          Phone login is temporarily unavailable. Redirecting you to email login instead.
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/login/email')}
        >
          <Text style={styles.buttonText}>
            Go to Email Login Now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#FF6B00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  }
}); 