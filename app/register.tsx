import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Dimensions,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from './lib/AuthContext';
import { Colors } from '@/constants/Colors';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const { registerWithEmail, isLoading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    // Validation
    if (!name) {
      Alert.alert('त्रुटि', 'कृपया अपना नाम दर्ज करें');
      return;
    }
    
    if (!email) {
      Alert.alert('त्रुटि', 'कृपया अपना ईमेल दर्ज करें');
      return;
    }
    
    if (!password) {
      Alert.alert('त्रुटि', 'कृपया पासवर्ड दर्ज करें');
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

    // Registration process
    setLoading(true);
    setMessage('आपका अकाउंट बनाया जा रहा है...');
    
    try {
      await registerWithEmail(email, password, name);
    } catch (error: any) {
      Alert.alert('त्रुटि', error.message || 'रजिस्ट्रेशन के दौरान एक त्रुटि हुई');
      setMessage('');
    } finally {
      setLoading(false);
    }
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
              headerTitle: 'अकाउंट बनाएँ',
              headerTitleAlign: 'center'
            }} />
            
            <View style={styles.centerContent}>
              <View style={styles.formContainer}>
                <ThemedText style={styles.formTitle}>
                  नया अकाउंट रजिस्टर करें
                </ThemedText>
                
                {/* Input fields */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="आपका नाम"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="ईमेल एड्रेस"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="पासवर्ड"
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
                </View>
                
                {/* Register button */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <ThemedText style={styles.actionButtonText}>
                      रजिस्टर करें
                    </ThemedText>
                  )}
                </TouchableOpacity>
                
                {message ? (
                  <ThemedText style={styles.messageText}>{message}</ThemedText>
                ) : null}
                
                {/* Back to login */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                  disabled={loading}
                >
                  <ThemedText style={styles.backButtonText}>
                    पहले से अकाउंट है? लॉगिन करें
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Privacy Policy Notice */}
              <View style={styles.privacyContainer}>
                <ThemedText style={styles.privacyText}>
                  रजिस्टर करके, आप हमारी गोपनीयता नीति और उपयोग की शर्तें स्वीकार करते हैं।
                </ThemedText>
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
  centerContent: {
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
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  actionButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginBottom: 15,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  messageText: {
    textAlign: 'center',
    marginBottom: 15,
    color: Colors.primary,
  },
  backButton: {
    paddingVertical: 15,
  },
  backButtonText: {
    textAlign: 'center',
    color: Colors.primary,
    fontWeight: '500',
  },
  privacyContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  privacyText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
}); 