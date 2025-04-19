import React, { createContext, useContext, ReactNode } from 'react';
import { useTemplateSystem } from '../hooks/useTemplateSystem';
import { 
  ContestTemplate,
  TemplateWithParameters,
  TemplateActivation
} from '../lib/template-system';

// Define the context type
interface TemplateSystemContextType {
  templates: ContestTemplate[];
  activeTemplate: TemplateWithParameters | null;
  appSettings: any;
  recentActivations: TemplateActivation[];
  isLoading: boolean;
  error: string | null;
  loadTemplate: (templateId: string) => Promise<TemplateWithParameters | null>;
  getAppSetting: (key: string, defaultValue?: any) => any;
}

// Create the context
const TemplateSystemContext = createContext<TemplateSystemContextType | undefined>(undefined);

// Provider component props
interface TemplateSystemProviderProps {
  children: ReactNode;
}

// Provider component
export const TemplateSystemProvider: React.FC<TemplateSystemProviderProps> = ({ children }) => {
  const templateSystem = useTemplateSystem();
  
  return (
    <TemplateSystemContext.Provider value={templateSystem}>
      {children}
    </TemplateSystemContext.Provider>
  );
};

// Custom hook to use the template system context
export const useTemplateSystemContext = () => {
  const context = useContext(TemplateSystemContext);
  if (context === undefined) {
    throw new Error('useTemplateSystemContext must be used within a TemplateSystemProvider');
  }
  return context;
}; 