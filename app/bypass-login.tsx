import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { Stack, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from './lib/supabase';

export default function BypassLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDirectLogin = async () => {
    try {
      setIsLoading(true);
      
      // Generate a timestamp-based user ID
      const tempUserId = `temp_${Date.now()}`;
      
      // Create a mock user
      const mockUser = {
        id: tempUserId,
        email: `user_${Math.floor(Math.random() * 10000)}@example.com`,
        user_metadata: {
          full_name: 'Quizzoo User',
          avatar_url: null
        }
      };
      
      console.log('Creating mock user:', mockUser);
      
      // Create profile in Supabase
      try {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: mockUser.id,
              display_name: mockUser.user_metadata.full_name,
              email: mockUser.email,
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
          
        if (insertError) {
          console.log('Error creating profile, but continuing:', insertError);
        } else {
          console.log('Profile created in Supabase');
        }
      } catch (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway
      }
      
      // Store mock user in AsyncStorage
      await AsyncStorage.setItem('quizzoo-user', JSON.stringify(mockUser));
      console.log('User stored in AsyncStorage');
      
      // Go directly to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Direct login error:', error);
      Alert.alert('लॉगिन त्रुटि', 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.content}>
        <Text style={styles.title}>QUIZZOO</Text>
        
        <Text style={styles.subtitle}>
          Google लॉगिन में समस्या? कोई बात नहीं!
        </Text>
        
        <Text style={styles.description}>
          बिना Google के अपने ऐप में सीधे प्रवेश करें। यह विकल्प आपको बिना किसी जटिल प्रक्रिया के ऐप का उपयोग करने देगा।
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleDirectLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>सीधे ऐप में प्रवेश करें</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>वापस जाएँ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
  },
}); 