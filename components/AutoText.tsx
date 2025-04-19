import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { ThemedText } from './ThemedText';

// This is a replacement component for the Text component
// It automatically wraps the standard React Native Text component with ThemedText
// to ensure translations work across the entire app
export function Text(props: TextProps) {
  return <ThemedText {...props} />;
}

// Export a function to help migrate code from standard React Native Text to ThemedText
export function migrateTextToThemedText() {
  console.log("Migration helper: Replace all imports of 'Text' from 'react-native' with the Text component from './AutoText'");
} 