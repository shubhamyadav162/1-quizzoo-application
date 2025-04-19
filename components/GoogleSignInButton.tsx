import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View,
  Alert
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useAuth } from '../app/lib/AuthContext';
import { router } from 'expo-router';

interface GoogleSignInButtonProps {
  onSignInSuccess?: (userData: any) => void;
  onSignInError?: (error: any) => void;
  buttonText?: string;
  loadingText?: string;
}

export default function GoogleSignInButton({
  onSignInSuccess,
  onSignInError,
  buttonText = 'Continue with Google',
  loadingText = 'Authenticating...'
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      if (isLoading) return;
      
      setIsLoading(true);
      console.log('Starting Google Sign-In via OAuth...');
      
      // Use the OAuth-based Google Sign-In method from AuthContext
      const result: any = await signInWithGoogle();
      
      console.log('Google sign-in result:', result);
      
      if (!result) {
        Alert.alert('Login Cancelled', 'You closed the login window before completing sign in.');
        return;
      }
      
      if (result.error) {
        console.error('Google sign-in error:', result.error);
        if (onSignInError) onSignInError(result.error);
        Alert.alert('Login Error', result.error.message || 'Unknown error');
      } else if (result.data) {
        console.log('Google sign-in successful');
        if (onSignInSuccess) {
          onSignInSuccess(result.data);
        } else {
          // Navigate to the main app if no success handler
          router.replace({ pathname: './tabs' });
        }
      } else {
        Alert.alert('Login Error', 'Unexpected login result. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
      if (onSignInError) onSignInError(error);
      const err = error as Error;
      Alert.alert('Unexpected Error', err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.googleButton}
      onPress={handleGoogleSignIn}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.buttonText}>{loadingText}</Text>
        </View>
      ) : (
        <>
          <AntDesign name="google" size={20} color="white" />
          <Text style={styles.buttonText}>{buttonText}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    backgroundColor: '#DB4437',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 