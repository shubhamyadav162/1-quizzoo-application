import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';
import { useLanguage, LANGUAGE_HI } from '../lib/LanguageContext';

export default function EmailLoginScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { signInWithEmail } = useAuth();
  const { quizLanguage } = useLanguage();
  const isHindi = quizLanguage === LANGUAGE_HI;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(
        isHindi ? 'त्रुटि' : 'Error', 
        isHindi ? 'कृपया अपना ईमेल दर्ज करें' : 'Please enter your email'
      );
      return;
    }
    
    if (!password.trim()) {
      Alert.alert(
        isHindi ? 'त्रुटि' : 'Error', 
        isHindi ? 'कृपया अपना पासवर्ड दर्ज करें' : 'Please enter your password'
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signInWithEmail(email, password);
      // The auth context will handle navigation on success
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled in the Auth context
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={[styles.container, {backgroundColor: isDark ? Colors.dark.background : Colors.light.background}]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.contentContainer}>
        <FontAwesome5 name="envelope" size={60} color="#FF6B00" />
        
        <Text style={[styles.title, {color: isDark ? Colors.dark.text : Colors.light.text}]}>
          {isHindi ? 'ईमेल लॉगिन' : 'Email Login'}
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, {color: isDark ? Colors.dark.text : Colors.light.text}]}>
            {isHindi ? 'ईमेल' : 'Email'}
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
              color: isDark ? Colors.dark.text : Colors.light.text
            }]}
            placeholder={isHindi ? "अपना ईमेल दर्ज करें" : "Enter your email"}
            placeholderTextColor={isDark ? '#888' : '#777'}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, {color: isDark ? Colors.dark.text : Colors.light.text}]}>
            {isHindi ? 'पासवर्ड' : 'Password'}
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
              color: isDark ? Colors.dark.text : Colors.light.text
            }]}
            placeholder={isHindi ? "अपना पासवर्ड दर्ज करें" : "Enter your password"}
            placeholderTextColor={isDark ? '#888' : '#777'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.button, {opacity: isLoading ? 0.7 : 1}]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {isHindi ? 'लॉगिन करें' : 'Login'}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.backButtonText}>
            {isHindi ? 'मुख्य लॉगिन पर वापस जाएँ' : 'Back to Main Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF6B00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#FF6B00',
    fontSize: 16,
  }
}); 