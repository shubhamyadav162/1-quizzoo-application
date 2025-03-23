import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '../lib/supabase';
import { Colors } from '@/constants/Colors';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('त्रुटि', 'कृपया अपना ईमेल दर्ज करें');
      return;
    }

    setLoading(true);
    setMessage('पासवर्ड रीसेट लिंक भेजा जा रहा है...');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'quizzoo://auth/callback',
      });

      if (error) {
        throw error;
      }

      setResetSent(true);
      setMessage('पासवर्ड रीसेट लिंक भेज दिया गया है');
    } catch (error: any) {
      Alert.alert('त्रुटि', error.message || 'पासवर्ड रीसेट करने में समस्या हुई');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoToLogin = () => {
    router.replace('/login');
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <ThemedView style={styles.container}>
            <Stack.Screen options={{ 
              headerShown: true, 
              headerTitle: 'पासवर्ड रीसेट',
              headerTitleAlign: 'center'
            }} />
            
            <View style={styles.contentContainer}>
              <View style={styles.formContainer}>
                <ThemedText style={styles.formTitle}>
                  पासवर्ड रीसेट करें
                </ThemedText>
                
                {!resetSent ? (
                  <>
                    <ThemedText style={styles.description}>
                      अपना पासवर्ड रीसेट करने के लिए अपना ईमेल एड्रेस दर्ज करें। हम आपको एक रीसेट लिंक भेजेंगे।
                    </ThemedText>
                    
                    {/* Email input */}
                    <TextInput
                      style={styles.input}
                      placeholder="ईमेल एड्रेस"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    
                    {/* Reset button */}
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleResetPassword}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <ThemedText style={styles.actionButtonText}>
                          रीसेट लिंक भेजें
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.successContainer}>
                    <ThemedText style={styles.successText}>
                      हमने आपके ईमेल पर पासवर्ड रीसेट लिंक भेज दिया है। कृपया अपना ईमेल चेक करें और रीसेट लिंक पर क्लिक करके अपना पासवर्ड अपडेट करें।
                    </ThemedText>
                  </View>
                )}
                
                {message && !resetSent ? (
                  <ThemedText style={styles.messageText}>{message}</ThemedText>
                ) : null}
                
                {/* Back to login */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleGoToLogin}
                  disabled={loading}
                >
                  <ThemedText style={styles.backButtonText}>
                    लॉगिन पेज पर वापस जाएँ
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(230, 230, 230, 0.5)',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 24,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  actionButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginBottom: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  messageText: {
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.primary,
  },
  successContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  successText: {
    textAlign: 'center',
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  backButtonText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
}); 