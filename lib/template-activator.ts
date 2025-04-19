import { Alert } from 'react-native';
import { getTemplateWithParameters } from './template-system';

// Mock function to simulate template activation
export const activateTemplate = async (templateId: string, customParameters?: Record<string, any>) => {
  try {
    // Get the template with parameters
    const template = await getTemplateWithParameters(templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Prepare parameters from template defaults + custom parameters
    const baseParameters: Record<string, any> = {};
    
    // Add default parameter values from template
    if (template.parameters) {
      for (const [key, param] of Object.entries(template.parameters)) {
        baseParameters[key] = param.value;
      }
    }
    
    // Override with custom parameters
    const parameters = {
      ...baseParameters,
      ...customParameters,
    };
    
    console.log('Template activation simulation:');
    console.log('- Template:', template.template_name);
    console.log('- Parameters:', JSON.stringify(parameters, null, 2));
    
    // In a real implementation, this would make a database call
    // For now, we'll just alert the user and return a mock ID
    
    // Simulate a delay for network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock activation ID
    const mockActivationId = `act_${Math.random().toString(36).substring(2, 10)}`;
    
    // Show a success message
    Alert.alert(
      'Template Activated',
      `The template "${template.template_name}" has been activated with the specified parameters. Activation ID: ${mockActivationId}`
    );
    
    return mockActivationId;
  } catch (error: any) {
    console.error('Error in template activation:', error.message);
    Alert.alert('Activation Error', error.message);
    throw error;
  }
};

// Mock function to simulate app settings update
export const updateAppSettings = async (settings: Record<string, any>) => {
  try {
    console.log('App settings update simulation:');
    console.log('- Settings:', JSON.stringify(settings, null, 2));
    
    // Simulate a delay for network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock action ID
    const mockActionId = `act_${Math.random().toString(36).substring(2, 10)}`;
    
    // Show a success message
    Alert.alert(
      'App Settings Updated',
      `The app settings have been updated with the specified values. Action ID: ${mockActionId}`
    );
    
    return mockActionId;
  } catch (error: any) {
    console.error('Error updating app settings:', error.message);
    Alert.alert('Settings Update Error', error.message);
    throw error;
  }
}; 