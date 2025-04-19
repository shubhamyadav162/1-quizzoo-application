import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function GameDetail() {
  const params = useLocalSearchParams();
  const { id, contestId, poolId, mode, difficulty } = params;
  const [hasRedirected, setHasRedirected] = useState(false);
  
  useEffect(() => {
    // Log all parameters for debugging
    console.log('GameDetail mounted with params:', JSON.stringify(params, null, 2));
    console.log('id:', id);
    console.log('contestId:', contestId);
    console.log('poolId:', poolId);
    console.log('mode:', mode);
    console.log('difficulty:', difficulty);
  }, [params]);
  
  // Handle "quiz" ID as a special case
  useEffect(() => {
    if (id === 'quiz' && !hasRedirected) {
      console.log('Redirecting from [id] to quiz with params once:', JSON.stringify(params));
      
      // Create a params object without the id parameter
      const queryParams = {...params};
      delete queryParams.id;
      
      try {
        // Mark as redirected first to prevent loop
        setHasRedirected(true);
        
        setTimeout(() => {
          // Directly go to home to break the infinite loop
          console.log('Redirecting HOME to break infinite loop');
          router.replace('../(tabs)');
        }, 500);
      } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert('Navigation Error', 'Failed to navigate. Please try again.');
      }
    }
  }, [id, params, hasRedirected]);
  
  // If we're trying to go to quiz but hit an infinite loop
  if (id === 'quiz') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#333' }}>
          {hasRedirected ? 'Redirecting to break loop...' : 'Loading quiz...'}
        </Text>
        
        <View style={{ marginTop: 30 }}>
          <Button 
            title="Go to Home Screen" 
            onPress={() => {
              console.log('Manual navigation to home');
              router.replace('../(tabs)');
            }} 
          />
        </View>
      </View>
    );
  }
  
  // For other IDs, show the default game detail page
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Game with ID: {id}</Text>
      <Text style={{ marginBottom: 10 }}>Contest ID: {contestId || 'Not provided'}</Text>
      <Text style={{ marginBottom: 10 }}>Pool ID: {poolId || 'Not provided'}</Text>
      <Text style={{ marginBottom: 10 }}>Mode: {mode || 'Not provided'}</Text>
      <Text style={{ marginBottom: 10 }}>Difficulty: {difficulty || 'Not provided'}</Text>
      <Text style={{ marginBottom: 30 }}>This is a placeholder for the game detail page.</Text>
      
      <Button 
        title="Go to Home Screen" 
        onPress={() => {
          console.log('Manual navigation to home from detail page');
          router.replace('../(tabs)');
        }} 
      />
    </View>
  );
} 