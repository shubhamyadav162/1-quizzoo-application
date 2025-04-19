import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, Animated, Easing, ScrollView, SafeAreaView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import { useLanguage, LANGUAGE_EN, LANGUAGE_HI } from '../lib/LanguageContext';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const { isDark } = useTheme();
  const { quizLanguage, setQuizLanguage } = useLanguage();
  const router = useRouter();
  const [logoTaps, setLogoTaps] = useState(0);
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation values
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.5)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;
  const buttonsFade = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(30)).current;
  const languageToggleFade = useRef(new Animated.Value(0)).current;

  // Add state for unified login/register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Add state to control showing email/password form
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Add debug console log
  useEffect(() => {
    console.log('LoginScreen mounted');
    return () => {
      console.log('LoginScreen unmounted');
    };
  }, []);

  // Start animations when component mounts
  useEffect(() => {
    console.log('Starting animations');
    Animated.sequence([
      Animated.timing(titleFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.bounce
      }),
      Animated.timing(titleScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.elastic(1.2)
      })
    ]).start();

    Animated.timing(taglineFade, {
      toValue: 1,
      duration: 1000,
      delay: 800,
      useNativeDriver: true
    }).start();

    Animated.timing(taglineTranslateY, {
      toValue: 0,
      duration: 800,
      delay: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.7))
    }).start();
    
    // Add animation for buttons
    Animated.parallel([
      Animated.timing(buttonsFade, {
        toValue: 1,
        duration: 800,
        delay: 1200,
        useNativeDriver: true
      }),
      Animated.timing(buttonsTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 1200,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5))
      }),
      Animated.timing(languageToggleFade, {
        toValue: 1,
        duration: 800,
        delay: 1400,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },
    headerSection: {
      alignItems: 'center',
      width: '100%',
      marginTop: Platform.OS === 'ios' ? 60 : 50,
      marginBottom: 40,
    },
    logo: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
    },
    appNameContainer: {
      marginTop: 10,
      marginBottom: 5,
    },
    appNameText: {
      fontSize: 42,
      fontWeight: 'bold',
      color: '#FF6B00',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    tagline: {
      fontSize: 20,
      textAlign: 'center',
      marginTop: 5,
      fontWeight: '600',
      color: '#FF6B00',
      paddingHorizontal: 16,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    buttonsSection: {
      width: '100%',
      marginVertical: 30,
    },
    button: {
      backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
      paddingVertical: 16,
      borderRadius: 12,
      marginBottom: 16,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 12,
    },
    footerSection: {
      width: '100%',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 10,
    },
    footerText: {
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: 10,
      fontSize: 14,
    },
    footerLink: {
      color: isDark ? Colors.dark.tint : Colors.light.tint,
      fontWeight: '500',
    },
    createAccountButton: {
      backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0',
      paddingVertical: 16,
      borderRadius: 12,
      marginBottom: 16,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      borderWidth: 1,
      borderColor: isDark ? '#444' : '#DDD',
    },
    createAccountText: {
      color: isDark ? '#FFF' : '#333',
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 12,
    },
    languageToggleContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 45 : 35,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 10,
    },
    languageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    languageText: {
      fontWeight: '600',
      color: isDark ? '#FFF' : '#333',
      fontSize: 14,
      marginLeft: 4,
    },
  });

  const handleLogoPress = () => {
    const newCount = logoTaps + 1;
    setLogoTaps(newCount);
    
    if (newCount === 5) {
      console.log('Developer mode activated');
      router.push({ pathname: './developer' });
      setLogoTaps(0);
    }
  };
  
  // Toggle between English and Hindi
  const toggleLanguage = async () => {
    const newLanguage = quizLanguage === LANGUAGE_EN ? LANGUAGE_HI : LANGUAGE_EN;
    await setQuizLanguage(newLanguage);
    console.log(`Language changed to: ${newLanguage}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (logoTaps > 0) {
        setLogoTaps(0);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [logoTaps]);

  // Unified login/register handler
  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        quizLanguage === LANGUAGE_HI ? 'त्रुटि' : 'Error',
        quizLanguage === LANGUAGE_HI ? 'कृपया ईमेल और पासवर्ड दर्ज करें।' : 'Please enter email and password.'
      );
      return;
    }
    if (isRegister) {
      // Route to dedicated signup screen
      router.push('./signup');
      setIsRegister(false);
      return;
    }
    setFormLoading(true);
    try {
      await signInWithEmail(email, password);
      // AuthContext will handle navigation on success
    } catch (error: any) {
      Alert.alert(
        quizLanguage === LANGUAGE_HI ? 'त्रुटि' : 'Error',
        error?.message || (quizLanguage === LANGUAGE_HI ? 'कुछ गलत हो गया।' : 'Something went wrong.')
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Google login handler
  const handleGoogleLogin = async () => {
    setFormLoading(true);
    try {
      await signInWithGoogle();
      // AuthContext handles deep-link flow and navigation
    } catch (error: any) {
      Alert.alert(
        quizLanguage === LANGUAGE_HI ? 'त्रुटि' : 'Error',
        error?.message || (quizLanguage === LANGUAGE_HI ? 'Google लॉगिन विफल रहा।' : 'Google login failed.')
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Language toggle button */}
      <Animated.View
        style={[
          styles.languageToggleContainer,
          { opacity: languageToggleFade }
        ]}
      >
        <TouchableOpacity
          style={styles.languageButton}
          onPress={toggleLanguage}
        >
          <Ionicons 
            name="language" 
            size={20} 
            color={isDark ? '#FFF' : '#333'} 
          />
          <Text style={styles.languageText}>
            {quizLanguage === LANGUAGE_EN ? 'हिंदी' : 'English'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <TouchableOpacity onPress={handleLogoPress}>
              <Image 
                source={require('../../assets/images/craiyon_203413_transparent.png')}
                style={styles.logo} 
              />
            </TouchableOpacity>
            
            <Animated.View 
              style={[
                styles.appNameContainer,
                {
                  opacity: titleFade,
                  transform: [{ scale: titleScale }]
                }
              ]}
            >
              <Text style={styles.appNameText}>Quizzoo</Text>
            </Animated.View>
            
            <Animated.View
              style={[
                {
                  opacity: taglineFade,
                  transform: [{ translateY: taglineTranslateY }]
                }
              ]}
            >
              <Text style={styles.tagline}>
                {quizLanguage === LANGUAGE_HI ? 'अपने ज्ञान का परीक्षण करें, बड़ा जीतें!' : 'Test Your Knowledge, Win Big!'}
              </Text>
            </Animated.View>
          </View>

          <Animated.View 
            style={[
              styles.buttonsSection,
              {
                opacity: buttonsFade,
                transform: [{ translateY: buttonsTranslateY }]
              }
            ]}
          >
            {/* Conditional rendering for email/password form or main options */}
            {showEmailForm ? (
              <View style={{ width: '100%', marginBottom: 16 }}>
                {/* Back/Cancel button */}
                <TouchableOpacity
                  style={{ marginBottom: 12, alignSelf: 'flex-start' }}
                  onPress={() => setShowEmailForm(false)}
                  disabled={formLoading}
                >
                  <Text style={{ color: isDark ? Colors.dark.tint : Colors.light.tint, fontWeight: 'bold', fontSize: 16 }}>
                    {quizLanguage === LANGUAGE_HI ? '← वापस' : '← Back'}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.button, { backgroundColor: isDark ? '#222' : '#f5f5f5', color: isDark ? '#fff' : '#222', marginBottom: 8 }]}
                  placeholder={quizLanguage === LANGUAGE_HI ? 'ईमेल' : 'Email'}
                  placeholderTextColor={isDark ? '#aaa' : '#888'}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!formLoading}
                />
                <TextInput
                  style={[styles.button, { backgroundColor: isDark ? '#222' : '#f5f5f5', color: isDark ? '#fff' : '#222', marginBottom: 8 }]}
                  placeholder={quizLanguage === LANGUAGE_HI ? 'पासवर्ड' : 'Password'}
                  placeholderTextColor={isDark ? '#aaa' : '#888'}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!formLoading}
                />
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
                  onPress={handleAuth}
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <ActivityIndicator color="white" size="small" style={{ marginRight: 10 }} />
                  ) : null}
                  <Text style={styles.buttonText}>
                    {isRegister
                      ? (quizLanguage === LANGUAGE_HI ? 'साइन अप करें' : 'Sign Up')
                      : (quizLanguage === LANGUAGE_HI ? 'लॉगिन करें' : 'Login')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginTop: 10, alignSelf: 'center' }}
                  onPress={() => setIsRegister(!isRegister)}
                  disabled={formLoading}
                >
                  <Text style={{ color: isDark ? Colors.dark.tint : Colors.light.tint, fontWeight: 'bold' }}>
                    {isRegister
                      ? (quizLanguage === LANGUAGE_HI ? 'पहले से खाता है? लॉगिन करें' : 'Already have an account? Login')
                      : (quizLanguage === LANGUAGE_HI ? 'नया उपयोगकर्ता? साइन अप करें' : 'New user? Sign Up')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Main options: Login, Sign Up, Google */}
                <TouchableOpacity
                  style={{ marginBottom: 16, width: '100%' }}
                  onPress={() => { setIsRegister(false); setShowEmailForm(true); }}
                  disabled={formLoading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={isDark ? ['#ff9966', '#ff5e62'] : ['#f7971e', '#ffd200']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.button, { backgroundColor: 'transparent', marginBottom: 0 }]}
                  >
                    <Text style={styles.buttonText}>
                      {quizLanguage === LANGUAGE_HI ? 'लॉगिन करें' : 'Login'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginBottom: 16, width: '100%' }}
                  onPress={() => { router.push('./signup'); }}
                  disabled={formLoading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={isDark ? ['#43cea2', '#185a9d'] : ['#43cea2', '#185a9d']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.createAccountButton, { backgroundColor: 'transparent', marginBottom: 0 }]}
                  >
                    <Text style={styles.createAccountText}>
                      {quizLanguage === LANGUAGE_HI ? 'साइन अप करें' : 'Sign Up'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginBottom: 0, width: '100%' }}
                  onPress={handleGoogleLogin}
                  disabled={formLoading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={isDark ? ['#4285F4', '#0f2027'] : ['#4285F4', '#34a853']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.button, { backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 0 }]}
                  >
                    {formLoading ? (
                      <ActivityIndicator color="white" size="small" style={{ marginRight: 10 }} />
                    ) : (
                      <AntDesign name="google" size={24} color="white" style={{ marginRight: 10 }} />
                    )}
                    <Text style={styles.buttonText}>
                      {quizLanguage === LANGUAGE_HI ? 'Google से लॉगिन करें' : 'Login with Google'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>

          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              {quizLanguage === LANGUAGE_HI ? 'जारी रखकर, आप हमारी ' : 'By continuing, you agree to our '}
              <Link href={{ pathname: '../terms' }} style={styles.footerLink}>
                {quizLanguage === LANGUAGE_HI ? 'सेवा की शर्तें' : 'Terms of Service'}
              </Link>
              {quizLanguage === LANGUAGE_HI ? ' और ' : ' and '}
              <Link href={{ pathname: '../privacy' }} style={styles.footerLink}>
                {quizLanguage === LANGUAGE_HI ? 'गोपनीयता नीति' : 'Privacy Policy'}
              </Link>
              {quizLanguage === LANGUAGE_HI ? ' से सहमत हैं' : ''}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 