import { supabase, createSafeChannel, removeSafeChannel } from './supabase';
import { Alert } from 'react-native';

// Types for the template system
export interface ContestTemplate {
  id: string;
  template_name: string;
  template_description: string | null;
  template_type: string;
  template_version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateParameter {
  template_id: string;
  parameter_key: string;
  parameter_value: any;
  parameter_description: string | null;
  is_editable: boolean;
}

export interface TemplateWithParameters extends ContestTemplate {
  parameters: Record<string, {
    value: any;
    description: string | null;
    is_editable: boolean;
  }>;
}

export interface TemplateActivation {
  id: string;
  template_id: string;
  contest_id: string | null;
  activation_status: 'pending' | 'completed' | 'failed';
  parameters: Record<string, any> | null;
  created_at: string;
}

// Function to fetch all available templates
export const getTemplates = async (): Promise<ContestTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('contest_templates')
      .select('*')
      .eq('is_active', true)
      .order('template_name');
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching templates:', error.message);
    return [];
  }
};

// Function to fetch a template with its parameters
export const getTemplateWithParameters = async (templateId: string): Promise<TemplateWithParameters | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_template_with_parameters', { p_template_id: templateId });
    
    if (error) throw error;
    return data.length > 0 ? data[0] : null;
  } catch (error: any) {
    console.error('Error fetching template with parameters:', error.message);
    return null;
  }
};

// Subscribe to template parameter changes
export const subscribeToTemplateChanges = (callback: (template: TemplateWithParameters) => void) => {
  const channel = createSafeChannel('template_changes');
  
  channel
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'template_parameters' },
      async (payload) => {
        // When a parameter changes, fetch the complete template
        const templateId = payload.new.template_id;
        const template = await getTemplateWithParameters(templateId);
        if (template) {
          callback(template);
        }
      }
    )
    .subscribe();

  return () => {
    removeSafeChannel(channel);
  };
};

// Subscribe to template activations (new contests being created)
export const subscribeToTemplateActivations = (callback: (activation: TemplateActivation) => void) => {
  const channel = createSafeChannel('template_activations');
  
  channel
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'template_activations' },
      (payload) => {
        callback(payload.new as TemplateActivation);
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'template_activations' },
      (payload) => {
        callback(payload.new as TemplateActivation);
      }
    )
    .subscribe();

  return () => {
    removeSafeChannel(channel);
  };
};

// Subscribe to global app settings changes
export const subscribeToAppSettings = (callback: (settings: any) => void) => {
  const channel = createSafeChannel('app_settings_changes');
  
  channel
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'app_settings' },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    removeSafeChannel(channel);
  };
};

// Subscribe to dashboard actions (like withdrawal approvals, etc.)
export const subscribeToDashboardActions = (callback: (action: any) => void) => {
  const channel = createSafeChannel('dashboard_actions');
  
  channel
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'dashboard_actions' },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    removeSafeChannel(channel);
  };
};

// Get current app settings
export const getAppSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching app settings:', error.message);
    return null;
  }
};

// Check template activation status
export const checkTemplateActivationStatus = async (activationId: string): Promise<TemplateActivation | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_template_activation_status', { p_activation_id: activationId });
    
    if (error) throw error;
    return data.length > 0 ? data[0] : null;
  } catch (error: any) {
    console.error('Error checking template activation status:', error.message);
    return null;
  }
}; 