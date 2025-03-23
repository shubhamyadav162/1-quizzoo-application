import React, { useState, useEffect } from 'react';
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
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '../lib/supabase';
import { Colors } from '@/constants/Colors';

export default function UpdatePasswordScreen() {
  const params = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Extract email from params if available
    if (params && params.email) {
      setEmail(params.email as string);
    }
  }, [params]);

  const handleUpdatePassword = async () => {
    // Validation
    if (!password) {
      Alert.alert('त्रुटि', 'कृपया नया पासवर्ड दर्ज करें');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('त्रुटि', 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('त्रुटि', 'पासवर्ड मेल नहीं खा रहे हैं, कृपया जांचें');
      return;
    }

    setLoading(true);
    setMessage('पासवर्ड अपडेट किया जा रहा है...');
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        'सफलता',
        'आपका पासवर्ड सफलतापूर्वक अपडेट कर दिया गया है',
        [{ text: 'ठीक है', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      Alert.alert('त्रुटि', error.message || 'पासवर्ड अपडेट करने में समस्या हुई');
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
              headerTitle: 'पासवर्ड अपडेट करें',
              headerTitleAlign: 'center'
            }} />
            
            <View style={styles.contentContainer}>
              <View style={styles.formContainer}>
                <ThemedText style={styles.formTitle}>
                  नया पासवर्ड सेट करें
                </ThemedText>
                
                <ThemedText style={styles.description}>
                  कृपया अपना नया पासवर्ड दर्ज करें
                  {email ? ` (${email})` : ''}
                </ThemedText>
                
                {/* Password inputs */}
                <TextInput
                  style={styles.input}
                  placeholder="नया पासवर्ड"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="पासवर्ड की पुष्टि करें"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!loading}
                />
                
                {/* Update button */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleUpdatePassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <ThemedText style={styles.actionButtonText}>
                      पासवर्ड अपडेट करें
                    </ThemedText>
                  )}
                </TouchableOpacity>
                
                {message ? (
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
    marginBottom: 16,
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