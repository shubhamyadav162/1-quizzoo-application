import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '../lib/supabase';
import { Colors } from '@/constants/Colors';

export default function CallbackScreen() {
  const [message, setMessage] = useState<string>('प्रमाणीकरण हो रहा है...');
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract parameters from URL
        if (!params) {
          setError('URL पैरामीटर उपलब्ध नहीं हैं');
          return;
        }

        // Check for type of auth action
        const type = params.type as string;
        
        if (type === 'recovery') {
          // Handle password recovery
          setMessage('पासवर्ड रीसेट किया जा रहा है...');
          router.replace({
            pathname: '/auth/update-password' as any,
            params: { ...params }
          });
          return;
        } else if (type === 'signup') {
          // Handle email confirmation
          setMessage('ईमेल कन्फर्मेशन सफल हुआ');
          
          // Wait for a moment to show the success message
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 2000);
          return;
        }
        
        // If we get here, it's an unknown type
        setError('अज्ञात प्रमाणीकरण प्रकार');
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.message || 'एक त्रुटि हुई');
      }
    };

    handleCallback();
  }, [params]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorTitle}>प्रमाणीकरण त्रुटि</ThemedText>
            <ThemedText style={styles.errorMessage}>{error}</ThemedText>
            <ThemedText style={styles.errorHelp}>
              कृपया फिर से प्रयास करें या अपना ईमेल फिर से वेरिफाई करें
            </ThemedText>
            <View style={styles.buttonContainer}>
              <ThemedText
                style={styles.link}
                onPress={() => router.replace('/login')}
              >
                लॉगिन पेज पर वापस जाएँ
              </ThemedText>
            </View>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <ThemedText style={styles.message}>{message}</ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
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
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  errorContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#FFF8F8',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    width: '100%',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
  },
  errorHelp: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
  link: {
    color: Colors.primary,
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
  },
}); 