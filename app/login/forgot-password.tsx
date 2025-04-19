import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { resetPassword } from '../../lib/supabase';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<'email' | 'otp' | 'new_password' | 'success'>('email');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
      padding: 20,
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginTop: 40,
      marginBottom: 10,
    },
    subHeaderText: {
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: 30,
      opacity: 0.7,
    },
    inputContainer: {
      marginBottom: 20,
    },
    input: {
      backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    otpInput: {
      backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      letterSpacing: 8,
      textAlign: 'center',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    button: {
      backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
    backButton: {
      marginTop: 40,
    },
    backButtonText: {
      color: isDark ? Colors.dark.tint : Colors.light.tint,
      fontSize: 16,
    },
    successContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 100,
    },
    successText: {
      fontSize: 20,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: 'center',
      marginBottom: 30,
    },
  });

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Request password reset via Supabase
      const { error } = await resetPassword(email);

      if (error) {
        console.error('Password reset request error:', error);
        Alert.alert('Error', error.message || 'Failed to send password reset email');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      
      // With Supabase, the actual flow goes through email
      // So we'll just show a success message
      Alert.alert(
        'Reset Email Sent',
        'Please check your email for a link to reset your password.',
        [{ 
          text: 'OK', 
          onPress: () => router.push('..')
        }]
      );
    } catch (err) {
      console.error('Unexpected error during password reset:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Note: The following methods are kept for UI functionality
  // but actual password reset is handled via email by Supabase
  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter a valid OTP');
      return;
    }

    setIsSubmitting(true);

    // Simulate OTP verification
    setTimeout(() => {
      setIsSubmitting(false);
      setStage('new_password');
    }, 1500);
  };

  const handleResetPassword = () => {
    if (newPassword.length < 8) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    // Simulate password reset
    setTimeout(() => {
      setIsSubmitting(false);
      setStage('success');
    }, 1500);
  };

  const handleBack = () => {
    if (stage === 'otp') {
      setStage('email');
    } else if (stage === 'new_password') {
      setStage('otp');
    } else {
      router.back();
    }
  };

  const renderEmailStage = () => (
    <>
      <Text style={styles.headerText}>Forgot Password</Text>
      <Text style={styles.subHeaderText}>Enter your email to receive a verification code</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor={isDark ? '#888' : '#777'}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleSendOtp}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Sending...' : 'Send Verification Code'}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderOtpStage = () => (
    <>
      <Text style={styles.headerText}>Verify Code</Text>
      <Text style={styles.subHeaderText}>Enter the verification code sent to {email}</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.otpInput}
          placeholder="● ● ● ●"
          placeholderTextColor={isDark ? '#888' : '#777'}
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />
      </View>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleVerifyOtp}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Verifying...' : 'Verify Code'}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderNewPasswordStage = () => (
    <>
      <Text style={styles.headerText}>Create New Password</Text>
      <Text style={styles.subHeaderText}>Your new password must be different from previous passwords</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor={isDark ? '#888' : '#777'}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor={isDark ? '#888' : '#777'}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleResetPassword}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderSuccessStage = () => (
    <View style={styles.successContainer}>
      <Text style={styles.successText}>
        Your password has been reset successfully!
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('..')}
      >
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {stage === 'email' && renderEmailStage()}
      {stage === 'otp' && renderOtpStage()}
      {stage === 'new_password' && renderNewPasswordStage()}
      {stage === 'success' && renderSuccessStage()}
      
      {stage !== 'success' && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
} 