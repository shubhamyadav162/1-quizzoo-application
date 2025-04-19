import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TemplateSystemProvider, useTemplateSystemContext } from '../components/TemplateSystemProvider';
import { TemplateManager } from '../components/TemplateManager';
import { Stack } from 'expo-router';
import { activateTemplate, updateAppSettings } from '../lib/template-activator';

// Test action buttons component
const TestActions = () => {
  const { templates, isLoading } = useTemplateSystemContext();
  const [actionInProgress, setActionInProgress] = useState(false);

  const handleActivateTemplate = async () => {
    if (templates.length === 0 || actionInProgress) return;
    
    try {
      setActionInProgress(true);
      // Pick the first available template for testing
      const templateId = templates[0].id;
      
      // Example custom parameters
      const customParams = {
        name: `Test Contest ${new Date().toLocaleTimeString()}`,
        entry_fee: 50,
        max_participants: 10,
        start_time: new Date(Date.now() + 10 * 60000).toISOString(), // Start in 10 minutes
      };
      
      await activateTemplate(templateId, customParams);
    } catch (error) {
      console.error('Error in test activation:', error);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (actionInProgress) return;
    
    try {
      setActionInProgress(true);
      
      // Example settings update
      const newSettings = {
        platform_fee_percentage: Math.floor(Math.random() * 5) + 8, // Random value between 8-12%
        upi_payments_enabled: Math.random() > 0.5, // Randomly toggle
      };
      
      await updateAppSettings(newSettings);
    } catch (error) {
      console.error('Error in test settings update:', error);
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <View style={styles.testActionsContainer}>
      <Text style={styles.testActionsTitle}>Test Functions</Text>
      
      <View style={styles.buttonsRow}>
        <TouchableOpacity 
          style={[styles.button, actionInProgress && styles.buttonDisabled]} 
          onPress={handleActivateTemplate}
          disabled={isLoading || actionInProgress || templates.length === 0}
        >
          {actionInProgress ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Activate Template</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.settingsButton, actionInProgress && styles.buttonDisabled]} 
          onPress={handleUpdateSettings}
          disabled={actionInProgress}
        >
          {actionInProgress ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Update Settings</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.helpText}>
        These buttons simulate actions from the Vercel admin dashboard
      </Text>
    </View>
  );
};

export default function TemplateSystemScreen() {
  const handleTemplateActivated = (contestId: string) => {
    console.log(`New contest created from template: ${contestId}`);
    // In a real app, you might navigate to the contest details screen:
    // router.push(`/contests/${contestId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Vercel Template System' }} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Template System</Text>
          <Text style={styles.subtitle}>
            Real-time updates from Vercel dashboard to app
          </Text>
        </View>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            This system enables contest templates to be managed from the Vercel admin dashboard.
            Changes to templates and app settings are synchronized in real-time.
          </Text>
        </View>
        
        <TemplateSystemProvider>
          <TestActions />
          <TemplateManager onTemplateActivated={handleTemplateActivated} />
        </TemplateSystemProvider>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by Supabase real-time subscriptions
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e8f5e9',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#e8f5e9',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  testActionsContainer: {
    backgroundColor: '#f5f5f5',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  settingsButton: {
    backgroundColor: '#2196F3',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
}); 