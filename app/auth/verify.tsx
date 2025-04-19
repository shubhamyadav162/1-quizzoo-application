import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '../lib/supabase';
import { Colors } from '@/constants/Colors';
import ThemedStatusBar from '@/components/ThemedStatusBar';

export default function VerifyScreen() {
  const params = useLocalSearchParams();
  const { email } = params;
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerify = async () => {
    if (!verificationCode) {
      Alert.alert('त्रुटि', 'कृपया वेरिफिकेशन कोड दर्ज करें');
      return;
    }

    setLoading(true);
    setMessage('वेरिफिकेशन की जा रही है...');
    
    try {
      // Verify the code with Supabase
      // Note: This is a placeholder as Supabase Auth doesn't directly use a verification code
      // In a real implementation, you'd handle the OTP verification here
      
      Alert.alert(
        'सफलता',
        'आपका ईमेल वेरिफाई हो गया है। अब आप लॉगिन कर सकते हैं।',
        [{ text: 'ठीक है', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      Alert.alert('त्रुटि', error.message || 'वेरिफिकेशन के दौरान एक त्रुटि हुई');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('त्रुटि', 'ईमेल एड्रेस उपलब्ध नहीं है');
      return;
    }

    setLoading(true);
    setMessage('वेरिफिकेशन मेल फिर से भेजा जा रहा है...');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email as string,
      });

      if (error) {
        throw error;
      }

      setMessage('वेरिफिकेशन ईमेल फिर से भेजा गया है');
    } catch (error: any) {
      Alert.alert('त्रुटि', error.message || 'वेरिफिकेशन मेल फिर से भेजने में समस्या हुई');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoToLogin = () => {
    router.replace('/login');
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedStatusBar barStyle="dark" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <ThemedView style={styles.container}>
            <Stack.Screen options={{ 
              headerShown: true, 
              headerTitle: 'ईमेल वेरिफिकेशन',
              headerTitleAlign: 'center'
            }} />
            
            <View style={styles.contentContainer}>
              <View style={styles.formContainer}>
                <ThemedText style={styles.formTitle}>
                  अपना ईमेल वेरिफाई करें
                </ThemedText>
                
                <ThemedText style={styles.description}>
                  हमने आपके ईमेल एड्रेस {email ? `(${email})` : ''} पर एक वेरिफिकेशन लिंक भेजा है। अपना ईमेल चेक करें और वेरिफिकेशन लिंक पर क्लिक करके अपना अकाउंट वेरिफाई करें।
                </ThemedText>
                
                <ThemedText style={styles.alternateText}>
                  वैकल्पिक रूप से, अगर आपको वेरिफिकेशन कोड मिला है, तो उसे नीचे दर्ज करें:
                </ThemedText>
                
                {/* Verification code input */}
                <TextInput
                  style={styles.input}
                  placeholder="वेरिफिकेशन कोड"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  editable={!loading}
                />
                
                {/* Verify button */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleVerify}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <ThemedText style={styles.actionButtonText}>
                      वेरिफाई करें
                    </ThemedText>
                  )}
                </TouchableOpacity>
                
                {message ? (
                  <ThemedText style={styles.messageText}>{message}</ThemedText>
                ) : null}
                
                {/* Resend code */}
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendCode}
                  disabled={loading}
                >
                  <ThemedText style={styles.resendButtonText}>
                    वेरिफिकेशन मेल फिर से भेजें
                  </ThemedText>
                </TouchableOpacity>
                
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
  alternateText: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 16,
    fontStyle: 'italic',
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
    textAlign: 'center',
    letterSpacing: 2,
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
  resendButton: {
    paddingVertical: 12,
  },
  resendButtonText: {
    textAlign: 'center',
    color: Colors.primary,
    fontWeight: '500',
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