import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTemplateSystem } from '../hooks/useTemplateSystem';

interface TemplateManagerProps {
  onTemplateActivated?: (contestId: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onTemplateActivated }) => {
  const {
    templates,
    activeTemplate,
    appSettings,
    recentActivations,
    isLoading,
    error,
    loadTemplate
  } = useTemplateSystem();

  // Notify parent component when a new contest is created
  useEffect(() => {
    const completedActivation = recentActivations.find(
      activation => activation.activation_status === 'completed' && activation.contest_id
    );
    
    if (completedActivation && onTemplateActivated) {
      onTemplateActivated(completedActivation.contest_id!);
    }
  }, [recentActivations, onTemplateActivated]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading template system...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Template List */}
      <Text style={styles.sectionTitle}>Available Contest Templates</Text>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.templateItem,
              activeTemplate?.id === item.id && styles.activeTemplateItem
            ]}
            onPress={() => loadTemplate(item.id)}
          >
            <Text style={styles.templateName}>{item.template_name}</Text>
            <Text style={styles.templateDescription}>{item.template_description || 'No description'}</Text>
            <Text style={styles.templateType}>Type: {item.template_type}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No templates available</Text>
        }
      />

      {/* Active Template Details */}
      {activeTemplate && (
        <View style={styles.activeTemplateContainer}>
          <Text style={styles.sectionTitle}>Selected Template</Text>
          <Text style={styles.activeTemplateName}>{activeTemplate.template_name}</Text>
          
          <Text style={styles.parametersTitle}>Parameters:</Text>
          {Object.entries(activeTemplate.parameters).map(([key, param]) => (
            <View key={key} style={styles.parameterItem}>
              <Text style={styles.parameterKey}>{key}:</Text>
              <Text style={styles.parameterValue}>
                {typeof param.value === 'object' 
                  ? JSON.stringify(param.value) 
                  : String(param.value)}
              </Text>
              {!param.is_editable && (
                <Text style={styles.readOnlyBadge}>Read Only</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* App Settings */}
      {appSettings && (
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <Text style={styles.settingItem}>
            UPI Payments: {appSettings.upi_payments_enabled ? 'Enabled' : 'Disabled'}
          </Text>
          <Text style={styles.settingItem}>
            Platform Fee: {appSettings.platform_fee_percentage}%
          </Text>
          <Text style={styles.settingItem}>
            Min. Withdrawal: ₹{appSettings.minimum_withdrawal_amount}
          </Text>
        </View>
      )}

      {/* Recent Activations */}
      {recentActivations.length > 0 && (
        <View style={styles.activationsContainer}>
          <Text style={styles.sectionTitle}>Recent Template Activations</Text>
          {recentActivations.map((activation) => (
            <View key={activation.id} style={styles.activationItem}>
              <Text style={styles.activationStatus}>
                Status: {activation.activation_status}
              </Text>
              {activation.contest_id && (
                <Text style={styles.contestId}>Contest: {activation.contest_id}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  templateItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeTemplateItem: {
    backgroundColor: '#e0f2e9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  templateType: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  activeTemplateContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  activeTemplateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  parametersTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  parameterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  parameterKey: {
    fontSize: 14,
    fontWeight: '500',
    width: 120,
  },
  parameterValue: {
    fontSize: 14,
    flex: 1,
  },
  readOnlyBadge: {
    fontSize: 10,
    backgroundColor: '#f0f0f0',
    color: '#888',
    padding: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  settingsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  settingItem: {
    fontSize: 14,
    paddingVertical: 2,
  },
  activationsContainer: {
    marginTop: 16,
  },
  activationItem: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  activationStatus: {
    fontSize: 14,
    color: '#555',
  },
  contestId: {
    fontSize: 12,
    color: '#888',
  },
}); 