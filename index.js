import { registerRootComponent } from 'expo';
import { Platform, LogBox, Alert, View, Text, Pressable } from 'react-native';
import { ExpoRoot } from 'expo-router';
import React, { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Ignore certain warnings that might affect performance but don't break functionality
LogBox.ignoreLogs([
  'Overwriting fontFamily style attribute preprocessor',
  'Constants.installationId has been deprecated',
  'AsyncStorage has been extracted from react-native',
  'Linking requires a build-time setting',
]);

// Custom error boundary component to handle errors at app's root level
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App root error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Oops! Something went wrong.
          </Text>
          <Text style={{ marginBottom: 20, textAlign: 'center' }}>
            {this.state.error?.message || "We encountered an unexpected error. Please try again."}
          </Text>
          <Pressable 
            style={{ backgroundColor: '#4285F4', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 6 }}
            onPress={this.retry}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

// Simple app component without complex async logic
export function App() {
  // Use a simpler implementation to avoid potential issues
  try {
    const ctx = require.context('./app');
    return (
      <ErrorBoundary>
        <ExpoRoot context={ctx} />
      </ErrorBoundary>
    );
  } catch (e) {
    console.error('Failed to load app context:', e);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Startup Error
        </Text>
        <Text style={{ marginBottom: 20, textAlign: 'center' }}>
          {e?.message || "The app could not be started. Please try again."}
        </Text>
      </View>
    );
  }
}

// Register the root component
registerRootComponent(App); 