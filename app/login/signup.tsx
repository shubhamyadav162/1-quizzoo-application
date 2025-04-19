import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { useLanguage, LANGUAGE_HI } from '../lib/LanguageContext';

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { registerWithEmail, checkEmailVerification } = useAuth();
  const { quizLanguage } = useLanguage();
  const isHindi = quizLanguage === LANGUAGE_HI;
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  // Check email verification status periodically
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (verificationSent) {
      interval = setInterval(async () => {
        try {
          const isVerified = await checkEmailVerification();
          console.log('[SignupScreen] Checking email verification. Result:', isVerified);
          
          if (isVerified) {
            clearInterval(interval);
            Alert.alert(
              isHindi ? 'ईमेल सत्यापित' : 'Email Verified',
              isHindi 
                ? 'आपका ईमेल सफलतापूर्वक सत्यापित किया गया है। अब आप साइन इन कर सकते हैं।' 
                : 'Your email has been verified successfully. You can now sign in.',
              [
                {
                  text: 'OK',
                  onPress: () => router.push('/login')
                }
              ]
            );
          }
        } catch (error) {
          console.error('[SignupScreen] Error checking verification:', error);
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [verificationSent]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    contentContainer: {
      padding: 20,
    },
    headerText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginTop: 40,
      marginBottom: 30,
    },
    inputContainer: {
      marginBottom: 15,
    },
    inputLabel: {
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 14,
      marginBottom: 8,
    },
    input: {
      backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
      borderRadius: 10,
    },
    passwordInput: {
      flex: 1,
      padding: 15,
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    passwordToggle: {
      padding: 10,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: isDark ? Colors.dark.tint : Colors.light.tint,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    checkedBox: {
      backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
    },
    termsText: {
      flex: 1,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    termsLink: {
      color: isDark ? Colors.dark.tint : Colors.light.tint,
    },
    button: {
      backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 25,
      marginBottom: 40,
    },
    loginText: {
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    loginLink: {
      color: isDark ? Colors.dark.tint : Colors.light.tint,
      fontWeight: '500',
      marginLeft: 5,
    },
    verificationMessage: {
      backgroundColor: isDark ? '#1A237E' : '#E3F2FD',
      padding: 15,
      borderRadius: 10,
      marginTop: 20,
      marginBottom: 20,
    },
    verificationText: {
      color: isDark ? '#90CAF9' : '#1976D2',
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    resendButton: {
      marginTop: 15,
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: '#1565C0',
      alignSelf: 'center',
    },
    resendButtonText: {
      color: 'white',
      fontWeight: '500',
      fontSize: 14,
    },
  });

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleSignup = async () => {
    // Form validation
    if (!name.trim()) {
      Alert.alert(
        isHindi ? 'त्रुटि' : 'Error', 
        isHindi ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name'
      );
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(
        isHindi ? 'त्रुटि' : 'Error', 
        isHindi ? 'कृपया एक मान्य ईमेल पता दर्ज करें' : 'Please enter a valid email address'
      );
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        isHindi ? 'त्रुटि' : 'Error', 
        isHindi ? 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए' : 'Password must be at least 8 characters'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        isHindi ? 'त्रुटि' : 'Error', 
        isHindi ? 'पासवर्ड मेल नहीं खाते' : 'Passwords do not match'
      );
      return;
    }

    if (!agreeToTerms) {
      Alert.alert(
        isHindi ? 'त्रुटि' : 'Error', 
        isHindi ? 'आपको नियम और शर्तों से सहमत होना होगा' : 'You must agree to the Terms & Conditions'
      );
      return;
    }

    // Submit form
    setIsSubmitting(true);
    console.log('[SignupScreen] Starting registration process');

    try {
      await registerWithEmail(email, password, name);
      console.log('[SignupScreen] Registration successful, email verification sent');
      setVerificationSent(true);
      Alert.alert(
        isHindi ? 'सत्यापन ईमेल भेजा गया' : 'Verification Email Sent',
        isHindi 
          ? 'कृपया अपना खाता सत्यापित करने के लिए अपना ईमेल जांचें। पंजीकरण प्रक्रिया को पूरा करने के लिए ईमेल में सत्यापन लिंक पर क्लिक करें।' 
          : 'Please check your email to verify your account. Click the verification link in the email to complete the registration process.',
        [
          {
            text: 'OK',
            onPress: () => console.log('[SignupScreen] Alert acknowledged')
          }
        ]
      );
    } catch (err: any) {
      console.error('[SignupScreen] Error during signup:', err);
      let errorMessage = isHindi ? 'पंजीकरण के दौरान एक त्रुटि हुई' : 'An error occurred during signup';
      
      if (err.message) {
        if (err.message.includes('already registered')) {
          errorMessage = isHindi 
            ? 'यह ईमेल पहले से ही पंजीकृत है। कृपया अलग ईमेल का उपयोग करें या साइन इन करने का प्रयास करें।' 
            : 'This email is already registered. Please use a different email or try signing in.';
        } else {
          errorMessage = err.message;
        }
      }
      
      Alert.alert(
        isHindi ? 'पंजीकरण त्रुटि' : 'Registration Error', 
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <Text style={styles.headerText}>
        {isHindi ? 'खाता बनाएं' : 'Create Account'}
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {isHindi ? 'पूरा नाम' : 'Full Name'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={isHindi ? "अपना पूरा नाम दर्ज करें" : "Enter your full name"}
          placeholderTextColor={isDark ? '#888' : '#777'}
          value={name}
          onChangeText={setName}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {isHindi ? 'ईमेल पता' : 'Email Address'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={isHindi ? "अपना ईमेल दर्ज करें" : "Enter your email"}
          placeholderTextColor={isDark ? '#888' : '#777'}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {isHindi ? 'पासवर्ड' : 'Password'}
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder={isHindi ? "एक पासवर्ड बनाएं" : "Create a password"}
            placeholderTextColor={isDark ? '#888' : '#777'}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity 
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={24} 
              color={isDark ? Colors.dark.text : Colors.light.text} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {isHindi ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder={isHindi ? "अपने पासवर्ड की पुष्टि करें" : "Confirm your password"}
            placeholderTextColor={isDark ? '#888' : '#777'}
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity 
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={24} 
              color={isDark ? Colors.dark.text : Colors.light.text} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.termsContainer}
        onPress={() => setAgreeToTerms(!agreeToTerms)}
      >
        <View style={[styles.checkbox, agreeToTerms && styles.checkedBox]}>
          {agreeToTerms && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
        <Text style={styles.termsText}>
          {isHindi ? (
            <>मैं <Text style={styles.termsLink}>नियम और शर्तें</Text> और <Text style={styles.termsLink}>गोपनीयता नीति</Text> से सहमत हूं</>
          ) : (
            <>I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and <Text style={styles.termsLink}>Privacy Policy</Text></>
          )}
        </Text>
      </TouchableOpacity>
      
      {verificationSent && (
        <View style={styles.verificationMessage}>
          <Text style={styles.verificationText}>
            {isHindi 
              ? 'आपके ईमेल पते पर एक सत्यापन ईमेल भेजा गया है। कृपया अपने इनबॉक्स की जांच करें और अपने खाते को सत्यापित करने के लिए निर्देशों का पालन करें।'
              : 'A verification email has been sent to your email address. Please check your inbox and follow the instructions to verify your account.'}
          </Text>
          <Text style={[styles.verificationText, { marginTop: 10 }]}>
            {isHindi
              ? '⚠️ अगर आपको अपने इनबॉक्स में ईमेल नहीं दिखता है, तो कृपया अपने स्पैम/जंक फोल्डर की जांच करें। जीमेल उपयोगकर्ताओं को "प्रोमोशन" या "अपडेट" टैब की जांच करने की आवश्यकता हो सकती है।'
              : '⚠️ If you don\'t see the email in your inbox, please check your spam/junk folder. Gmail users may need to check the "Promotions" or "Updates" tabs.'}
          </Text>
          <TouchableOpacity
            style={styles.resendButton}
            onPress={async () => {
              try {
                await supabase.auth.resend({
                  type: 'signup',
                  email: email,
                  options: {
                    emailRedirectTo: 'quizzoo://auth/callback'
                  }
                });
                Alert.alert(
                  isHindi ? 'सफलता' : 'Success', 
                  isHindi 
                    ? 'सत्यापन ईमेल फिर से भेजा गया है। कृपया अपने इनबॉक्स (और स्पैम फोल्डर) की जांच करें।' 
                    : 'Verification email has been resent. Please check your inbox (and spam folder).'
                );
              } catch (error) {
                console.error('Error resending email:', error);
                Alert.alert(
                  isHindi ? 'त्रुटि' : 'Error', 
                  isHindi 
                    ? 'सत्यापन ईमेल फिर से नहीं भेज सका। कृपया बाद में पुनः प्रयास करें।' 
                    : 'Could not resend verification email. Please try again later.'
                );
              }
            }}
          >
            <Text style={styles.resendButtonText}>
              {isHindi ? 'सत्यापन ईमेल फिर से भेजें' : 'Resend Verification Email'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity 
        style={[styles.button, { opacity: isSubmitting ? 0.7 : 1 }]}
        onPress={handleSignup}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting 
            ? (isHindi ? 'खाता बना रहा है...' : 'Creating Account...') 
            : (isHindi ? 'खाता बनाएं' : 'Create Account')}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>
          {isHindi ? 'पहले से ही एक खाता है?' : 'Already have an account?'}
        </Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginLink}>
            {isHindi ? 'साइन इन करें' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 