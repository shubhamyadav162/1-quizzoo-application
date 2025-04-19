import { useEffect, useState } from 'react';
import {
  ContestTemplate,
  TemplateWithParameters,
  TemplateActivation,
  getTemplates,
  getTemplateWithParameters,
  subscribeToTemplateChanges,
  subscribeToTemplateActivations,
  subscribeToAppSettings,
  subscribeToDashboardActions,
  getAppSettings
} from '../lib/template-system';

export function useTemplateSystem() {
  // States
  const [templates, setTemplates] = useState<ContestTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<TemplateWithParameters | null>(null);
  const [appSettings, setAppSettings] = useState<any>(null);
  const [recentActivations, setRecentActivations] = useState<TemplateActivation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        // Fetch templates
        const templateData = await getTemplates();
        setTemplates(templateData);
        
        // Fetch app settings
        const settings = await getAppSettings();
        setAppSettings(settings);
        
        setError(null);
      } catch (err: any) {
        console.error('Error initializing template system:', err.message);
        setError('Failed to initialize template system');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Set up real-time subscriptions
  useEffect(() => {
    // Listen for template changes
    const unsubscribeTemplateChanges = subscribeToTemplateChanges((updatedTemplate) => {
      // Update the active template if it matches
      if (activeTemplate && updatedTemplate.id === activeTemplate.id) {
        setActiveTemplate(updatedTemplate);
      }
      
      // Update the template in the templates list
      setTemplates(prev => 
        prev.map(template => 
          template.id === updatedTemplate.id ? 
            { ...updatedTemplate } : 
            template
        )
      );
    });
    
    // Listen for template activations
    const unsubscribeTemplateActivations = subscribeToTemplateActivations((activation) => {
      // Add to recent activations, keep only the latest 10
      setRecentActivations(prev => {
        const updated = [activation, ...prev].slice(0, 10);
        return updated;
      });
      
      // If completed, refresh templates to ensure we have the latest state
      if (activation.activation_status === 'completed') {
        getTemplates().then(setTemplates);
      }
    });
    
    // Listen for app setting changes
    const unsubscribeAppSettings = subscribeToAppSettings((settings) => {
      setAppSettings(settings);
    });
    
    // Listen for dashboard actions
    const unsubscribeDashboardActions = subscribeToDashboardActions((action) => {
      // Handle different action types
      console.log('Dashboard action received:', action);
      
      // Refresh app settings when relevant actions occur
      if (action.action_type === 'update_app_settings' && 
          action.action_status === 'completed') {
        getAppSettings().then(setAppSettings);
      }
    });
    
    // Cleanup subscriptions
    return () => {
      unsubscribeTemplateChanges();
      unsubscribeTemplateActivations();
      unsubscribeAppSettings();
      unsubscribeDashboardActions();
    };
  }, [activeTemplate]);
  
  // Function to load a specific template with parameters
  const loadTemplate = async (templateId: string) => {
    try {
      setIsLoading(true);
      const template = await getTemplateWithParameters(templateId);
      setActiveTemplate(template);
      setError(null);
      return template;
    } catch (err: any) {
      console.error('Error loading template:', err.message);
      setError('Failed to load template');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    templates,
    activeTemplate,
    appSettings,
    recentActivations,
    isLoading,
    error,
    loadTemplate,
    // Returns the value of a specific parameter from app settings
    getAppSetting: (key: string, defaultValue: any = null) => {
      return appSettings?.[key] ?? defaultValue;
    }
  };
} 