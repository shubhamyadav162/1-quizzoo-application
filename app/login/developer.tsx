import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveSupabaseCredentials } from '../../lib/supabase';

export default function DeveloperModeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  
  const [apiKey, setApiKey] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load saved settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedApiKey = await AsyncStorage.getItem('SUPABASE_KEY');
        const savedServerUrl = await AsyncStorage.getItem('SUPABASE_URL');
        const savedDebugMode = await AsyncStorage.getItem('DEBUG_MODE');
        const savedOfflineMode = await AsyncStorage.getItem('OFFLINE_MODE');
        const savedTestMode = await AsyncStorage.getItem('TEST_MODE');
        
        if (savedApiKey) setApiKey(savedApiKey);
        if (savedServerUrl) setServerUrl(savedServerUrl);
        if (savedDebugMode) setIsDebugMode(savedDebugMode === 'true');
        if (savedOfflineMode) setIsOfflineMode(savedOfflineMode === 'true');
        if (savedTestMode) setIsTestMode(savedTestMode === 'true');
      } catch (error) {
        console.error('Failed to load developer settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
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
    warningText: {
      fontSize: 14,
      color: '#FFA000',
      marginBottom: 30,
    },
    inputContainer: {
      marginBottom: 20,
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
      fontFamily: 'monospace',
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    toggleText: {
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 16,
    },
    button: {
      backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
    resetButton: {
      backgroundColor: '#F44336',
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    backButton: {
      marginTop: 40,
    },
    backButtonText: {
      color: isDark ? Colors.dark.tint : Colors.light.tint,
      fontSize: 16,
    },
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Save Supabase credentials
      if (serverUrl && apiKey) {
        await saveSupabaseCredentials(serverUrl, apiKey);
      }
      
      // Save other developer settings
      await AsyncStorage.setItem('DEBUG_MODE', String(isDebugMode));
      await AsyncStorage.setItem('OFFLINE_MODE', String(isOfflineMode));
      await AsyncStorage.setItem('TEST_MODE', String(isTestMode));
      
      setIsSaving(false);
      Alert.alert(
        'Settings Saved', 
        'Developer settings have been saved successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save settings.');
      console.error('Failed to save settings:', error);
    }
  };

  const handleResetSettings = async () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all developer settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all stored settings
              await AsyncStorage.multiRemove([
                'SUPABASE_URL',
                'SUPABASE_KEY',
                'DEBUG_MODE',
                'OFFLINE_MODE',
                'TEST_MODE'
              ]);
              
              // Reset state
              setApiKey('');
              setServerUrl('');
              setIsDebugMode(false);
              setIsOfflineMode(false);
              setIsTestMode(false);
              
              Alert.alert('Settings Reset', 'All developer settings have been reset.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings.');
              console.error('Failed to reset settings:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <Text style={styles.headerText}>Developer Mode</Text>
      <Text style={styles.warningText}>⚠️ These settings are for development and testing only</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Supabase API Key</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Supabase API key"
          placeholderTextColor={isDark ? '#888' : '#777'}
          value={apiKey}
          onChangeText={setApiKey}
          autoCapitalize="none"
          secureTextEntry
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Supabase URL</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Supabase URL"
          placeholderTextColor={isDark ? '#888' : '#777'}
          value={serverUrl}
          onChangeText={setServerUrl}
          autoCapitalize="none"
          keyboardType="url"
        />
      </View>
      
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>Debug Mode</Text>
        <Switch
          value={isDebugMode}
          onValueChange={setIsDebugMode}
          trackColor={{ false: '#767577', true: Colors.primary }}
          thumbColor={isDebugMode ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>Offline Mode</Text>
        <Switch
          value={isOfflineMode}
          onValueChange={setIsOfflineMode}
          trackColor={{ false: '#767577', true: Colors.primary }}
          thumbColor={isOfflineMode ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>Test Environment</Text>
        <Switch
          value={isTestMode}
          onValueChange={setIsTestMode}
          trackColor={{ false: '#767577', true: Colors.primary }}
          thumbColor={isTestMode ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleSaveSettings}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetSettings}
      >
        <Text style={styles.buttonText}>Reset All Settings</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
} 