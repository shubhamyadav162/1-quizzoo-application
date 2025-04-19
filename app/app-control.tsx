import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator,
  Switch
} from 'react-native';
import { Stack } from 'expo-router';
import { AppControlProvider, useAppControl } from '../components/AppControlProvider';

// Feature Card Component
const FeatureCard = ({ title, description, isEnabled, featureKey }: { 
  title: string; 
  description: string;
  isEnabled: boolean;
  featureKey: string;
}) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    // In a real implementation, this would update the database
    console.log(`Toggling feature ${featureKey} to ${!isEnabled}`);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <View style={styles.featureCard}>
      <View style={styles.featureHeader}>
        <Text style={styles.featureTitle}>{title}</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#4CAF50" />
        ) : (
          <Switch 
            value={isEnabled} 
            onValueChange={handleToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        )}
      </View>
      <Text style={styles.featureDescription}>{description}</Text>
      <Text style={styles.featureKey}>Feature Key: {featureKey}</Text>
    </View>
  );
};

// Control Flags Section
const ControlFlagsSection = () => {
  const { controlSystem, isLoading } = useAppControl();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading control flags...</Text>
      </View>
    );
  }
  
  const flags = controlSystem?.flags || {};
  const flagKeys = Object.keys(flags).filter(key => key.startsWith('feature.'));
  
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Feature Flags</Text>
      
      {flagKeys.length === 0 ? (
        <Text style={styles.emptyMessage}>No feature flags configured</Text>
      ) : (
        flagKeys.map(key => {
          // Parse feature key to get a human-readable title
          const keyParts = key.split('.');
          const featureName = keyParts[1] || 'unknown';
          const title = featureName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          return (
            <FeatureCard
              key={key}
              title={title}
              description={`Controls the ${featureName} feature`}
              isEnabled={flags[key] === true}
              featureKey={key}
            />
          );
        })
      )}
    </View>
  );
};

// UI Controls Section
const UiControlsSection = () => {
  const { controlSystem, isLoading } = useAppControl();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading UI controls...</Text>
      </View>
    );
  }
  
  const uiElements = controlSystem?.ui.elements || {};
  const uiKeys = Object.keys(uiElements);
  
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>UI Controls</Text>
      
      {uiKeys.length === 0 ? (
        <Text style={styles.emptyMessage}>No UI elements configured</Text>
      ) : (
        uiKeys.map(key => {
          const element = uiElements[key];
          const isVisible = element.element_config.visible;
          
          return (
            <View key={key} style={styles.uiElementCard}>
              <View style={styles.featureHeader}>
                <Text style={styles.elementTitle}>{element.element_key}</Text>
                <View style={[
                  styles.statusIndicator, 
                  isVisible ? styles.statusActive : styles.statusInactive
                ]} />
              </View>
              <Text style={styles.elementType}>Type: {element.element_type}</Text>
              <Text style={styles.elementScreen}>
                Screen: {element.screen_path || 'Global'}
              </Text>
              <Text style={styles.elementStatus}>
                Status: {isVisible ? 'Visible' : 'Hidden'}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
};

// Domain Controls Section
const DomainControlsSection = () => {
  const { wallet, contest, profile, isLoading } = useAppControl();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading domain controls...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Domain Controls</Text>
      
      {/* Wallet Domain */}
      <View style={styles.domainCard}>
        <Text style={styles.domainTitle}>Wallet Controls</Text>
        
        {!wallet ? (
          <Text style={styles.emptyMessage}>No wallet controls configured</Text>
        ) : (
          <View>
            <Text style={styles.domainItem}>
              Min Withdrawal: ₹{wallet.min_withdrawal}
            </Text>
            <Text style={styles.domainItem}>
              Max Withdrawal: ₹{wallet.max_withdrawal}
            </Text>
            <Text style={styles.domainItem}>
              UPI Enabled: {wallet.upi_enabled ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.domainItem}>
              Transaction Fee: {wallet.transaction_fee_percentage}%
            </Text>
            <Text style={styles.domainItem}>
              Processing Time: {wallet.withdrawal_processing_time_hours} hours
            </Text>
          </View>
        )}
      </View>
      
      {/* Contest Domain */}
      <View style={styles.domainCard}>
        <Text style={styles.domainTitle}>Contest Controls</Text>
        
        {!contest ? (
          <Text style={styles.emptyMessage}>No contest controls configured</Text>
        ) : (
          <View>
            <Text style={styles.domainItem}>
              Min Entry Fee: ₹{contest.min_entry_fee}
            </Text>
            <Text style={styles.domainItem}>
              Max Entry Fee: ₹{contest.max_entry_fee}
            </Text>
            <Text style={styles.domainItem}>
              Max Participants: {contest.max_participants}
            </Text>
            <Text style={styles.domainItem}>
              Platform Fee: {contest.platform_fee_percentage}%
            </Text>
            <Text style={styles.domainItem}>
              Contest Types: {contest.contest_types.join(', ')}
            </Text>
          </View>
        )}
      </View>
      
      {/* Profile Domain */}
      <View style={styles.domainCard}>
        <Text style={styles.domainTitle}>Profile Controls</Text>
        
        {!profile ? (
          <Text style={styles.emptyMessage}>No profile controls configured</Text>
        ) : (
          <View>
            <Text style={styles.domainItem}>
              Required Fields: {profile.required_fields.join(', ')}
            </Text>
            <Text style={styles.domainItem}>
              Verification Options: {profile.verification_options.join(', ')}
            </Text>
            <Text style={styles.domainItem}>
              Profile Picture: {profile.profile_picture_enabled ? 'Enabled' : 'Disabled'}
            </Text>
            <Text style={styles.domainItem}>
              Bio Max Length: {profile.bio_max_length} characters
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Recent Actions Section
const RecentActionsSection = () => {
  const { recentActions, isLoading } = useAppControl();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading recent actions...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Recent Actions</Text>
      
      {recentActions.length === 0 ? (
        <Text style={styles.emptyMessage}>No recent actions</Text>
      ) : (
        recentActions.map(action => (
          <View key={action.id} style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <Text style={styles.actionType}>{action.action_type}</Text>
              <View style={[
                styles.statusIndicator,
                action.action_status === 'completed' ? styles.statusActive : 
                action.action_status === 'failed' ? styles.statusError : 
                styles.statusPending
              ]} />
            </View>
            <Text style={styles.actionTime}>
              {new Date(action.created_at).toLocaleString()}
            </Text>
            <Text style={styles.actionStatus}>
              Status: {action.action_status}
            </Text>
            {action.error_message && (
              <Text style={styles.actionError}>{action.error_message}</Text>
            )}
          </View>
        ))
      )}
    </View>
  );
};

// Main control panel component
const AppControlPanel = () => {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.header}>
        <Text style={styles.title}>App Control Center</Text>
        <Text style={styles.subtitle}>
          Manage your app remotely without redeployment
        </Text>
      </View>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          This system enables complete control over your app from the Vercel dashboard.
          Changes to UI elements, features, and business rules are synchronized in real-time.
        </Text>
      </View>
      
      <ControlFlagsSection />
      <UiControlsSection />
      <DomainControlsSection />
      <RecentActionsSection />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by Supabase real-time subscriptions
        </Text>
      </View>
    </ScrollView>
  );
};

// Main screen component
export default function AppControlScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'App Control Center' }} />
      <AppControlProvider>
        <AppControlPanel />
      </AppControlProvider>
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
  sectionContainer: {
    margin: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyMessage: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    padding: 12,
  },
  featureCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  featureKey: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
  uiElementCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  elementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  elementType: {
    fontSize: 14,
    color: '#666',
  },
  elementScreen: {
    fontSize: 14,
    color: '#666',
  },
  elementStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusInactive: {
    backgroundColor: '#F44336',
  },
  statusPending: {
    backgroundColor: '#FFC107',
  },
  statusError: {
    backgroundColor: '#F44336',
  },
  domainCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  domainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 4,
  },
  domainItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    padding: 4,
  },
  actionCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actionTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  actionStatus: {
    fontSize: 14,
    color: '#666',
  },
  actionError: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 6,
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