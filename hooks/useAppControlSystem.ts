import { useEffect, useState, useCallback, useRef } from 'react';
import {
  AppControlSystem,
  AppControlFlag,
  UiControl,
  ScreenConfig,
  PermissionRule,
  AppAction,
  loadAppControlSystem
} from '../lib/app-control-system';
import { supabase, createSafeChannel, removeSafeChannel } from '../lib/supabase';
import { testConnection } from '@/config/supabase';

export function useAppControlSystem() {
  // Main state for the entire control system
  const [controlSystem, setControlSystem] = useState<AppControlSystem | null>(null);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Recent app actions log
  const [recentActions, setRecentActions] = useState<AppAction[]>([]);
  
  // Refs to store channel subscriptions
  const channelsRef = useRef<any[]>([]);
  
  // Add a connection health check
  const [connectionHealth, setConnectionHealth] = useState({ lastChecked: 0, status: false });
  
  // Connection health check function
  const checkConnection = useCallback(async () => {
    try {
      const result = await testConnection();
      setConnectionHealth({
        lastChecked: Date.now(),
        status: result.success
      });
      return result.success;
    } catch (error) {
      console.error('[Connection Test] Failed:', error);
      setConnectionHealth({
        lastChecked: Date.now(),
        status: false
      });
      return false;
    }
  }, []);
  
  // Run connection check periodically
  useEffect(() => {
    const runConnectionCheck = async () => {
      await checkConnection();
    };
    
    // Run once on mount
    runConnectionCheck();
    
    // Then periodically
    const intervalId = setInterval(runConnectionCheck, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [checkConnection]);
  
  // Initialize the control system
  useEffect(() => {
    const initControlSystem = async () => {
      try {
        setIsLoading(true);
        
        // Check connection first
        const isConnected = await checkConnection();
        if (!isConnected) {
          console.warn('Poor connection detected, will attempt to load cached data if available');
          // Continue with initialization regardless of connection status
          // This allows the app to use cached data when offline
        }
        
        const system = await loadAppControlSystem();
        setControlSystem(system);
        setError(null);
      } catch (err: any) {
        console.error('Error initializing app control system:', err.message);
        setError('Failed to initialize app control system');
      } finally {
        setIsLoading(false);
      }
    };
    
    initControlSystem();
  }, [checkConnection]);
  
  // Set up real-time subscriptions using the improved channel creation
  useEffect(() => {
    if (!controlSystem) return;
    
    // Clean up function for all subscriptions
    const cleanupSubscriptions = () => {
      channelsRef.current.forEach(channel => {
        try {
          removeSafeChannel(channel);
        } catch (e) {
          console.warn('Error removing channel:', e);
        }
      });
      channelsRef.current = [];
    };
    
    // Clear any existing subscriptions first
    cleanupSubscriptions();
    
    // Create a channel for control flag changes
    const flagsChannel = createSafeChannel('control_flag_changes');
    flagsChannel
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'app_control_flags' 
        },
        (payload) => {
          const flag = payload.new as AppControlFlag;
          setControlSystem(prev => {
            if (!prev) return prev;
            
            // Update the flag in the flat structure
            const updatedFlags = { ...prev.flags, [flag.flag_key]: flag.flag_value };
            
            // Determine which control domain this belongs to and update it
            const [domain, key] = flag.flag_key.split('.');
            
            if (domain && key && prev.controls[domain]) {
              const updatedDomain = { ...prev.controls[domain], [key]: flag.flag_value };
              
              return {
                ...prev,
                flags: updatedFlags,
                controls: {
                  ...prev.controls,
                  [domain]: updatedDomain
                }
              };
            }
            
            return {
              ...prev,
              flags: updatedFlags
            };
          });
        }
      )
      .subscribe();
    
    channelsRef.current.push(flagsChannel);
    
    // Create a channel for UI element changes
    const uiChannel = createSafeChannel('ui_control_changes');
    uiChannel
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'ui_controls' 
        },
        (payload) => {
          const element = payload.new as UiControl;
          setControlSystem(prev => {
            if (!prev) return prev;
            
            // Update the element in our UI elements collection
            return {
              ...prev,
              ui: {
                ...prev.ui,
                elements: {
                  ...prev.ui.elements,
                  [element.element_key]: element
                }
              }
            };
          });
        }
      )
      .subscribe();
    
    channelsRef.current.push(uiChannel);
    
    // Create a channel for screen configuration changes
    const screenChannel = createSafeChannel('screen_config_changes');
    screenChannel
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'screen_configs' 
        },
        (payload) => {
          const config = payload.new as ScreenConfig;
          setControlSystem(prev => {
            if (!prev) return prev;
            
            // Update the screen config in our screens collection
            return {
              ...prev,
              ui: {
                ...prev.ui,
                screens: {
                  ...prev.ui.screens,
                  [config.screen_path]: config
                }
              }
            };
          });
        }
      )
      .subscribe();
    
    channelsRef.current.push(screenChannel);
    
    // Create a channel for permission rule changes
    const permissionChannel = createSafeChannel('permission_rule_changes');
    permissionChannel
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'permission_rules' 
        },
        (payload) => {
          const rule = payload.new as PermissionRule;
          setControlSystem(prev => {
            if (!prev) return prev;
            
            // Update the permission rule
            return {
              ...prev,
              permissions: {
                ...prev.permissions,
                [rule.rule_key]: rule
              }
            };
          });
        }
      )
      .subscribe();
    
    channelsRef.current.push(permissionChannel);
    
    // Create a channel for app actions
    const actionChannel = createSafeChannel('app_action_changes');
    actionChannel
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'app_actions' 
        },
        (payload) => {
          const action = payload.new as AppAction;
          // Add to recent actions, keep only the latest 20
          setRecentActions(prev => {
            const updated = [action, ...prev].slice(0, 20);
            return updated;
          });
          
          // Handle special action types that might require refreshing data
          if (action.action_status === 'completed') {
            if (action.action_type === 'refresh_control_system') {
              // Reload the entire control system
              loadAppControlSystem().then(setControlSystem);
            }
          }
        }
      )
      .subscribe();
    
    channelsRef.current.push(actionChannel);
    
    // Cleanup all subscriptions on unmount
    return cleanupSubscriptions;
  }, [controlSystem]);
  
  // Helper to get a control flag with a type
  const getFlag = useCallback(
    <T>(key: string, defaultValue: T): T => {
      if (!controlSystem) return defaultValue;
      
      const value = controlSystem.flags[key];
      return value !== undefined ? (value as T) : defaultValue;
    },
    [controlSystem]
  );
  
  // Helper to get a UI element by key
  const getUiElement = useCallback(
    (key: string): UiControl | null => {
      if (!controlSystem) return null;
      return controlSystem.ui.elements[key] || null;
    },
    [controlSystem]
  );
  
  // Helper to get a screen configuration
  const getScreenConfig = useCallback(
    (path: string): ScreenConfig | null => {
      if (!controlSystem) return null;
      return controlSystem.ui.screens[path] || null;
    },
    [controlSystem]
  );
  
  // Helper to check if a feature is enabled
  const isFeatureEnabled = useCallback(
    (featureKey: string): boolean => {
      return getFlag<boolean>(`feature.${featureKey}.enabled`, false);
    },
    [getFlag]
  );
  
  // Helper to check user permissions
  const hasPermission = useCallback(
    (permissionKey: string, userType: string): boolean => {
      if (!controlSystem) return false;
      
      const rule = controlSystem.permissions[permissionKey];
      if (!rule || !rule.is_active) return false;
      
      return rule.user_types.includes(userType) || rule.user_types.includes('*');
    },
    [controlSystem]
  );
  
  // Helper to check if a UI element should be shown
  const shouldShowElement = useCallback(
    (elementKey: string): boolean => {
      const element = getUiElement(elementKey);
      if (!element || !element.is_active) return false;
      
      return element.element_config.visible;
    },
    [getUiElement]
  );
  
  return {
    controlSystem,
    isLoading,
    error,
    recentActions,
    getFlag,
    getUiElement,
    getScreenConfig,
    isFeatureEnabled,
    hasPermission,
    shouldShowElement,
    // Access to specific domain controls
    wallet: controlSystem?.controls.wallet,
    contest: controlSystem?.controls.contest,
    profile: controlSystem?.controls.profile,
    // Helper to check if the control system is initialized
    isInitialized: !!controlSystem && !isLoading,
    connectionHealth,
    checkConnection,
  };
} 