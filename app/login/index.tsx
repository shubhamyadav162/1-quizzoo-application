import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import LoginScreen from './LoginScreen';

export default function Index() {
  useEffect(() => {
    console.log('Login index component mounted');
    return () => {
      console.log('Login index component unmounted');
    };
  }, []);

  return (
    <>
      <Stack.Screen options={{ 
        headerShown: false,
        title: 'Login'
      }} />
      <LoginScreen />
    </>
  );
} 