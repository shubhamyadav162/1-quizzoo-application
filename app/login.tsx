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
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from './lib/AuthContext';
import { Colors } from '@/constants/Colors';
import { supabase } from './lib/supabase';

// Get screen dimensions
const { width, height } = Dimensions.get('window');
const logoSize = width * 0.35;

// Doodle SVG background pattern - educational themed
const DoodleBackground = () => (
  <View style={styles.doodleContainer}>
    {/* Math symbols */}
    <ThemedText style={[styles.doodle, { top: '10%', left: '5%', transform: [{ rotate: '15deg' }] }]}>π</ThemedText>
    <ThemedText style={[styles.doodle, { top: '30%', left: '85%', transform: [{ rotate: '-10deg' }] }]}>Σ</ThemedText>
    <ThemedText style={[styles.doodle, { top: '80%', left: '20%', transform: [{ rotate: '5deg' }] }]}>÷</ThemedText>
    <ThemedText style={[styles.doodle, { top: '40%', left: '70%', transform: [{ rotate: '-5deg' }] }]}>∞</ThemedText>
    <ThemedText style={[styles.doodle, { top: '22%', left: '12%', transform: [{ rotate: '8deg' }] }]}>×</ThemedText>
    <ThemedText style={[styles.doodle, { top: '55%', left: '15%', transform: [{ rotate: '-12deg' }] }]}>√</ThemedText>
    <ThemedText style={[styles.doodle, { top: '72%', left: '88%', transform: [{ rotate: '20deg' }] }]}>±</ThemedText>
    <ThemedText style={[styles.doodle, { top: '18%', left: '60%', transform: [{ rotate: '-3deg' }] }]}>∫</ThemedText>
    
    {/* Science symbols */}
    <ThemedText style={[styles.doodle, { top: '15%', left: '75%', transform: [{ rotate: '20deg' }] }]}>⚛️</ThemedText>
    <ThemedText style={[styles.doodle, { top: '60%', left: '10%', transform: [{ rotate: '-8deg' }] }]}>🧪</ThemedText>
    <ThemedText style={[styles.doodle, { top: '70%', left: '80%', transform: [{ rotate: '12deg' }] }]}>🔬</ThemedText>
    <ThemedText style={[styles.doodle, { top: '25%', left: '35%', transform: [{ rotate: '18deg' }] }]}>🧬</ThemedText>
    <ThemedText style={[styles.doodle, { top: '65%', left: '55%', transform: [{ rotate: '-15deg' }] }]}>🧫</ThemedText>
    <ThemedText style={[styles.doodle, { top: '40%', left: '18%', transform: [{ rotate: '10deg' }] }]}>🔭</ThemedText>
    
    {/* Geography/language */}
    <ThemedText style={[styles.doodle, { top: '25%', left: '25%', transform: [{ rotate: '-15deg' }] }]}>🌎</ThemedText>
    <ThemedText style={[styles.doodle, { top: '50%', left: '90%', transform: [{ rotate: '8deg' }] }]}>अ</ThemedText>
    <ThemedText style={[styles.doodle, { top: '55%', left: '75%', transform: [{ rotate: '-8deg' }] }]}>🌍</ThemedText>
    <ThemedText style={[styles.doodle, { top: '30%', left: '5%', transform: [{ rotate: '12deg' }] }]}>🗺️</ThemedText>
    <ThemedText style={[styles.doodle, { top: '75%', left: '35%', transform: [{ rotate: '-20deg' }] }]}>क</ThemedText>
    <ThemedText style={[styles.doodle, { top: '28%', left: '42%', transform: [{ rotate: '7deg' }] }]}>🧠</ThemedText>
    
    {/* Computer science */}
    <ThemedText style={[styles.doodle, { top: '75%', left: '50%', transform: [{ rotate: '-10deg' }] }]}>{ }</ThemedText>
    <ThemedText style={[styles.doodle, { top: '20%', left: '50%', transform: [{ rotate: '5deg' }] }]}>&lt;/&gt;</ThemedText>
    <ThemedText style={[styles.doodle, { top: '50%', left: '30%', transform: [{ rotate: '-5deg' }] }]}>if()</ThemedText>
    <ThemedText style={[styles.doodle, { top: '65%', left: '20%', transform: [{ rotate: '15deg' }] }]}>for()</ThemedText>
    <ThemedText style={[styles.doodle, { top: '35%', left: '60%', transform: [{ rotate: '-18deg' }] }]}>==</ThemedText>
    <ThemedText style={[styles.doodle, { top: '80%', left: '75%', transform: [{ rotate: '10deg' }] }]}>[i]</ThemedText>
    
    {/* Additional educational symbols */}
    <ThemedText style={[styles.doodle, { top: '85%', left: '65%', transform: [{ rotate: '10deg' }], fontSize: 26 }]}>?</ThemedText>
    <ThemedText style={[styles.doodle, { top: '5%', left: '40%', transform: [{ rotate: '-12deg' }], fontSize: 24 }]}>✓</ThemedText>
    <ThemedText style={[styles.doodle, { top: '35%', left: '8%', transform: [{ rotate: '7deg' }], fontSize: 25 }]}>A+</ThemedText>
    <ThemedText style={[styles.doodle, { top: '65%', left: '40%', transform: [{ rotate: '-9deg' }], fontSize: 24 }]}>123</ThemedText>
    <ThemedText style={[styles.doodle, { top: '45%', left: '50%', transform: [{ rotate: '15deg' }], fontSize: 26 }]}>abc</ThemedText>
    <ThemedText style={[styles.doodle, { top: '12%', left: '20%', transform: [{ rotate: '-5deg' }], fontSize: 24 }]}>🔢</ThemedText>
    <ThemedText style={[styles.doodle, { top: '78%', left: '12%', transform: [{ rotate: '22deg' }], fontSize: 25 }]}>📝</ThemedText>
    <ThemedText style={[styles.doodle, { top: '8%', left: '60%', transform: [{ rotate: '-7deg' }], fontSize: 26 }]}>📚</ThemedText>
    <ThemedText style={[styles.doodle, { top: '82%', left: '60%', transform: [{ rotate: '15deg' }], fontSize: 25 }]}>🎓</ThemedText>
    <ThemedText style={[styles.doodle, { top: '88%', left: '30%', transform: [{ rotate: '-10deg' }], fontSize: 24 }]}>✏️</ThemedText>
    <ThemedText style={[styles.doodle, { top: '3%', left: '85%', transform: [{ rotate: '8deg' }], fontSize: 26 }]}>🔍</ThemedText>
  </View>
);

export default function LoginScreen() {
  const { signInWithEmail, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // बिल्कुल सरल लॉगिन हैंडलर
  const handleSignIn = () => {
    if (!email || !password) {
      Alert.alert('त्रुटि', 'ईमेल और पासवर्ड दोनों भरें');
      return;
    }
    setLoading(true);
    setMessage('लॉगिन हो रहा है...');
    
    // अब असली लॉगिन फंक्शन कॉल करेंगे
    signInWithEmail(email, password)
      .then(() => {
        // लॉगिन सक्सेस पर कुछ नहीं करना, AuthContext अपने आप रीडायरेक्ट करेगा
      })
      .catch((error) => {
        console.error('Login error:', error);
        Alert.alert('लॉगिन त्रुटि', error.message || 'लॉगिन के दौरान एक त्रुटि हुई');
        setMessage('');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // सरल पासवर्ड भूल गए हैंडलर
  const handleForgotPassword = () => {
    // अब असल में रीसेट पेज पर जाएगा
    router.push('/auth/reset-password');
  };

  // रजिस्ट्रेशन हैंडलर
  const handleRegister = () => {
    // अब असल में रजिस्टर पेज पर जाएगा
    router.push('/register');
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
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Background doodles */}
            <DoodleBackground />
            
            <View style={styles.logoContainer}>
              <Image 
                source={require('@/assets/images/craiyon_203413_transparent.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <ThemedText style={styles.appName}>Quizzoo</ThemedText>
              <ThemedText style={styles.tagline}>ज्ञान के साथ मज़ा</ThemedText>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
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
              </View>
              
              {/* Forgot Password link */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
              >
                <ThemedText style={styles.forgotPasswordText}>
                  पासवर्ड भूल गए?
                </ThemedText>
              </TouchableOpacity>
              
              {/* Login button */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSignIn}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <ThemedText style={styles.actionButtonText}>
                    लॉगिन करें
                  </ThemedText>
                )}
              </TouchableOpacity>
              
              {/* डेवलपर मोड में एंट्री */}
              <TouchableOpacity
                style={[styles.actionButton, {
                  backgroundColor: '#FF5722', 
                  marginTop: 10,
                  borderWidth: 2,
                  borderColor: '#FFC107',
                  flexDirection: 'row',
                  justifyContent: 'center'
                }]}
                onPress={() => router.replace('/(tabs)')}
              >
                <AntDesign name="rocket1" size={20} color="white" style={{marginRight: 8}} />
                <ThemedText style={styles.actionButtonText}>
                  DEV MODE - SKIP LOGIN
                </ThemedText>
              </TouchableOpacity>
              
              {message ? (
                <ThemedText style={styles.messageText}>{message}</ThemedText>
              ) : null}
            </View>
            
            {/* Register button */}
            <View style={styles.registerContainer}>
              <ThemedText style={styles.registerText}>
                अकाउंट नहीं है?
              </ThemedText>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
              >
                <ThemedText style={styles.registerButtonText}>
                  नया अकाउंट बनाएँ
                </ThemedText>
              </TouchableOpacity>
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
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.08,
    marginBottom: height * 0.06,
    paddingHorizontal: 20,
  },
  logo: {
    width: logoSize,
    height: logoSize,
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
    color: Colors.primary,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 32,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    height: 54,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 18,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    color: '#333',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 10,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  messageText: {
    textAlign: 'center',
    marginTop: 10,
    color: Colors.primary,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  registerText: {
    fontSize: 16,
    color: '#444',
    marginRight: 8,
    fontWeight: '500',
  },
  registerButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  registerButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  // Doodle background styles
  doodleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
    opacity: 0.1,
  },
  doodle: {
    position: 'absolute',
    fontSize: 22,
    opacity: 0.15,
    color: '#444',
  },
}); 