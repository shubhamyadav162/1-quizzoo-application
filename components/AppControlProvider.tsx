import React, { createContext, useContext, ReactNode } from 'react';
import { useAppControlSystem } from '../hooks/useAppControlSystem';
import { 
  AppControlSystem,
  UiControl,
  ScreenConfig,
  AppAction
} from '../lib/app-control-system';

// Define the context type
interface AppControlContextType {
  controlSystem: AppControlSystem | null;
  isLoading: boolean;
  error: string | null;
  recentActions: AppAction[];
  getFlag: <T>(key: string, defaultValue: T) => T;
  getUiElement: (key: string) => UiControl | null;
  getScreenConfig: (path: string) => ScreenConfig | null;
  isFeatureEnabled: (featureKey: string) => boolean;
  hasPermission: (permissionKey: string, userType: string) => boolean;
  shouldShowElement: (elementKey: string) => boolean;
  wallet: any;
  contest: any;
  profile: any;
  isInitialized: boolean;
}

// Create the context
const AppControlContext = createContext<AppControlContextType | undefined>(undefined);

// Provider props
interface AppControlProviderProps {
  children: ReactNode;
}

// Provider component
export const AppControlProvider: React.FC<AppControlProviderProps> = ({ children }) => {
  const appControlSystem = useAppControlSystem();
  
  return (
    <AppControlContext.Provider value={appControlSystem}>
      {children}
    </AppControlContext.Provider>
  );
};

// Custom hook to use the app control context
export const useAppControl = () => {
  const context = useContext(AppControlContext);
  if (context === undefined) {
    throw new Error('useAppControl must be used within an AppControlProvider');
  }
  return context;
};

// Create controlled UI components that are aware of the app control system

// ElementConfig type to fix linter errors
interface ElementConfig {
  visible: boolean;
  enabled: boolean;
  style?: any;
  content?: any;
  action?: string;
  priority?: number;
}

// ControlledButton: A button that respects visibility rules from the control system
interface ControlledButtonProps {
  elementKey: string;
  fallbackLabel?: string;
  onPress?: () => void;
  style?: any;
  children?: ReactNode;
}

export const ControlledButton: React.FC<ControlledButtonProps> = ({ 
  elementKey, 
  fallbackLabel,
  onPress,
  style,
  children
}) => {
  const { getUiElement, shouldShowElement } = useAppControl();
  
  // If element shouldn't be shown, render nothing
  if (!shouldShowElement(elementKey)) {
    return null;
  }
  
  // Get element details
  const element = getUiElement(elementKey);
  const config = element?.element_config as ElementConfig || {
    visible: true,
    enabled: true
  };
  
  // Determine if button should be disabled
  const isEnabled = config.enabled !== false;
  
  // Extract content and styles from control system if available
  const buttonContent = config.content || fallbackLabel || '';
  const buttonStyle = { 
    ...(config.style || {}),
    ...style,
    opacity: isEnabled ? 1 : 0.5
  };
  
  return (
    <button 
      style={buttonStyle}
      onClick={isEnabled ? onPress : undefined}
      disabled={!isEnabled}
    >
      {children || buttonContent}
    </button>
  );
};

// ControlledFeature: A component that only renders when a feature is enabled
interface ControlledFeatureProps {
  featureKey: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const ControlledFeature: React.FC<ControlledFeatureProps> = ({ 
  featureKey, 
  children,
  fallback = null
}) => {
  const { isFeatureEnabled } = useAppControl();
  
  return isFeatureEnabled(featureKey) ? <>{children}</> : <>{fallback}</>;
};

// ControlledScreen: A component that renders a screen according to its configuration
interface ControlledScreenProps {
  screenPath: string;
  children: ReactNode;
}

export const ControlledScreen: React.FC<ControlledScreenProps> = ({ 
  screenPath, 
  children 
}) => {
  const { getScreenConfig } = useAppControl();
  
  const screenConfig = getScreenConfig(screenPath);
  
  // If no config, just render children
  if (!screenConfig) {
    return <>{children}</>;
  }
  
  // TODO: Implement dynamic screen rendering based on configuration
  // This could include custom layouts, enabled features, etc.
  
  return (
    <div style={screenConfig.config.settings?.style || {}}>
      {children}
    </div>
  );
}; 