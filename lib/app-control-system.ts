import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Core App Control Types
export interface AppControlArea {
  id: string;
  area_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppControlFlag {
  id: string;
  control_area: string;
  flag_key: string;
  flag_value: any;
  flag_type: 'boolean' | 'number' | 'string' | 'json';
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UiControl {
  id: string;
  element_key: string;
  element_type: 'button' | 'banner' | 'card' | 'section' | 'screen';
  element_config: {
    visible: boolean;
    enabled: boolean;
    style?: any;
    content?: any;
    action?: string;
    priority?: number;
  };
  screen_path: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScreenConfig {
  id: string;
  screen_path: string;
  config: {
    layout?: string;
    components?: string[];
    settings?: any;
  };
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionRule {
  id: string;
  rule_key: string;
  user_types: string[];
  conditions: any;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppAction {
  id: string;
  action_type: string; 
  action_payload: any;
  action_status: 'pending' | 'completed' | 'failed';
  target_id?: string;
  created_at: string;
  error_message?: string | null;
}

// Domain-specific control types

export interface WalletControls {
  min_withdrawal: number;
  max_withdrawal: number;
  payment_methods: string[];
  upi_enabled: boolean;
  transaction_fee_percentage: number;
  withdrawal_processing_time_hours: number;
}

export interface ContestControls {
  min_entry_fee: number;
  max_entry_fee: number;
  max_participants: number;
  contest_types: string[];
  platform_fee_percentage: number;
  prize_distribution_templates: any[];
}

export interface ProfileControls {
  required_fields: string[];
  verification_options: string[];
  profile_picture_enabled: boolean;
  bio_max_length: number;
  custom_fields: any[];
}

// App Control System export type that combines all control domains
export interface AppControlSystem {
  controls: {
    wallet: WalletControls;
    contest: ContestControls;
    profile: ProfileControls;
    [key: string]: any;
  };
  ui: {
    elements: Record<string, UiControl>;
    screens: Record<string, ScreenConfig>;
  };
  flags: Record<string, boolean | number | string | any>;
  permissions: Record<string, PermissionRule>;
  version: string;
}

// Cache keys
const APP_CONTROL_SYSTEM_CACHE_KEY = 'quizzoo-app-control-system-cache';
const APP_CONTROL_SYSTEM_CACHE_TIMESTAMP = 'quizzoo-app-control-system-cache-timestamp';

// Helper functions for caching
const saveSystemToCache = async (system: AppControlSystem) => {
  try {
    await AsyncStorage.setItem(APP_CONTROL_SYSTEM_CACHE_KEY, JSON.stringify(system));
    await AsyncStorage.setItem(APP_CONTROL_SYSTEM_CACHE_TIMESTAMP, Date.now().toString());
    console.log('[App Control] System saved to cache');
  } catch (error) {
    console.error('[App Control] Error saving system to cache:', error);
  }
};

const getSystemFromCache = async (): Promise<{system: AppControlSystem | null, timestamp: number}> => {
  try {
    const cachedSystemStr = await AsyncStorage.getItem(APP_CONTROL_SYSTEM_CACHE_KEY);
    const cachedTimestampStr = await AsyncStorage.getItem(APP_CONTROL_SYSTEM_CACHE_TIMESTAMP);
    
    if (!cachedSystemStr) return { system: null, timestamp: 0 };
    
    const timestamp = cachedTimestampStr ? parseInt(cachedTimestampStr) : 0;
    return { 
      system: JSON.parse(cachedSystemStr) as AppControlSystem,
      timestamp
    };
  } catch (error) {
    console.error('[App Control] Error retrieving system from cache:', error);
    return { system: null, timestamp: 0 };
  }
};

// Function to fetch control flags for a specific area
export const getControlFlags = async (area?: string): Promise<AppControlFlag[]> => {
  try {
    let query = supabase
      .from('app_control_flags')
      .select('*')
      .eq('is_active', true);
    
    if (area) {
      query = query.eq('control_area', area);
    }
    
    const { data, error } = await query.order('flag_key');
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching control flags:', error.message);
    return [];
  }
};

// Function to fetch UI elements for a specific screen
export const getUiElements = async (screenPath?: string): Promise<UiControl[]> => {
  try {
    let query = supabase
      .from('ui_controls')
      .select('*')
      .eq('is_active', true);
    
    if (screenPath) {
      query = query.eq('screen_path', screenPath);
    }
    
    const { data, error } = await query.order('element_key');
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching UI elements:', error.message);
    return [];
  }
};

// Function to fetch screen configurations
export const getScreenConfig = async (screenPath: string): Promise<ScreenConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('screen_configs')
      .select('*')
      .eq('screen_path', screenPath)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching screen config:', error.message);
    return null;
  }
};

// Function to fetch permission rules
export const getPermissionRules = async (): Promise<PermissionRule[]> => {
  try {
    const { data, error } = await supabase
      .from('permission_rules')
      .select('*')
      .eq('is_active', true)
      .order('rule_key');
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching permission rules:', error.message);
    return [];
  }
};

// Real-time subscriptions for control changes

// Subscribe to control flag changes
export const subscribeToControlFlags = (callback: (flag: AppControlFlag) => void) => {
  const subscription = supabase
    .channel('control_flag_changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'app_control_flags' 
      },
      (payload) => {
        callback(payload.new as AppControlFlag);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

// Subscribe to UI element changes
export const subscribeToUiControls = (callback: (element: UiControl) => void) => {
  const subscription = supabase
    .channel('ui_control_changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'ui_controls' 
      },
      (payload) => {
        callback(payload.new as UiControl);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

// Subscribe to screen configuration changes
export const subscribeToScreenConfigs = (callback: (config: ScreenConfig) => void) => {
  const subscription = supabase
    .channel('screen_config_changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'screen_configs' 
      },
      (payload) => {
        callback(payload.new as ScreenConfig);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

// Subscribe to permission rule changes
export const subscribeToPermissionRules = (callback: (rule: PermissionRule) => void) => {
  const subscription = supabase
    .channel('permission_rule_changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'permission_rules' 
      },
      (payload) => {
        callback(payload.new as PermissionRule);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

// Subscribe to app actions
export const subscribeToAppActions = (callback: (action: AppAction) => void) => {
  const subscription = supabase
    .channel('app_action_changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'app_actions' 
      },
      (payload) => {
        callback(payload.new as AppAction);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

// Helper function to get a control flag value with a default
export const getControlFlagValue = (
  flags: AppControlFlag[], 
  flagKey: string, 
  defaultValue: any = null
): any => {
  const flag = flags.find(f => f.flag_key === flagKey);
  if (!flag) return defaultValue;
  
  try {
    return flag.flag_value;
  } catch (e) {
    return defaultValue;
  }
};

// Load the entire app control system
export const loadAppControlSystem = async (): Promise<AppControlSystem> => {
  try {
    // First try to get from cache
    const { system: cachedSystem, timestamp } = await getSystemFromCache();
    const cacheAgeInHours = (Date.now() - timestamp) / (1000 * 60 * 60);
    
    // Use cached system if:
    // 1. We have a valid cached system
    // 2. The cache is less than 24 hours old
    if (cachedSystem && cacheAgeInHours < 24) {
      console.log(`[App Control] Using cached system (${cacheAgeInHours.toFixed(2)} hours old)`);
      
      // Attempt to refresh in the background if cache is more than 1 hour old
      if (cacheAgeInHours > 1) {
        console.log('[App Control] Cache is older than 1 hour, refreshing in background');
        setTimeout(() => {
          loadFreshAppControlSystem()
            .then(freshSystem => {
              console.log('[App Control] Background refresh completed');
              // Only save to cache, don't return this value
              saveSystemToCache(freshSystem);
            })
            .catch(error => {
              console.error('[App Control] Background refresh failed:', error);
            });
        }, 100);
      }
      
      return cachedSystem;
    }
    
    // If no valid cache, load fresh data
    console.log('[App Control] No valid cache, loading fresh data');
    const freshSystem = await loadFreshAppControlSystem();
    
    // Save to cache for future use
    await saveSystemToCache(freshSystem);
    
    return freshSystem;
  } catch (error: any) {
    console.error('[App Control] Error in loadAppControlSystem:', error.message);
    
    // Try to use cached system as fallback, regardless of age
    try {
      const { system: cachedSystem } = await getSystemFromCache();
      if (cachedSystem) {
        console.log('[App Control] Using cached system as fallback after error');
        return cachedSystem;
      }
    } catch (cacheError) {
      console.error('[App Control] Cache fallback also failed:', cacheError);
    }
    
    // If all else fails, return a default system
    console.log('[App Control] Using default system as final fallback');
    return getDefaultAppControlSystem();
  }
};

// Load fresh data from the server
const loadFreshAppControlSystem = async (): Promise<AppControlSystem> => {
  try {
    const [flags, uiElements, permissionRules] = await Promise.all([
      getControlFlags(),
      getUiElements(),
      getPermissionRules()
    ]);

    // Get all screen configs
    const { data: screenConfigs, error } = await supabase
      .from('screen_configs')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    
    // Process screen configs
    const screens: Record<string, ScreenConfig> = {};
    screenConfigs?.forEach(config => {
      screens[config.screen_path] = config;
    });
    
    // Process UI elements
    const elements: Record<string, UiControl> = {};
    uiElements.forEach(element => {
      elements[element.element_key] = element;
    });
    
    // Process permission rules
    const permissions: Record<string, PermissionRule> = {};
    permissionRules.forEach(rule => {
      permissions[rule.rule_key] = rule;
    });
    
    // Extract wallet controls
    const walletControls: WalletControls = {
      min_withdrawal: getControlFlagValue(flags, 'wallet.min_withdrawal', 100),
      max_withdrawal: getControlFlagValue(flags, 'wallet.max_withdrawal', 10000),
      payment_methods: getControlFlagValue(flags, 'wallet.payment_methods', ['UPI', 'Bank Transfer']),
      upi_enabled: getControlFlagValue(flags, 'wallet.upi_enabled', true),
      transaction_fee_percentage: getControlFlagValue(flags, 'wallet.transaction_fee_percentage', 2),
      withdrawal_processing_time_hours: getControlFlagValue(flags, 'wallet.withdrawal_processing_time_hours', 24)
    };
    
    // Extract contest controls
    const contestControls: ContestControls = {
      min_entry_fee: getControlFlagValue(flags, 'contest.min_entry_fee', 5),
      max_entry_fee: getControlFlagValue(flags, 'contest.max_entry_fee', 1000),
      max_participants: getControlFlagValue(flags, 'contest.max_participants', 1000),
      contest_types: getControlFlagValue(flags, 'contest.types', ['quiz', 'trivia']),
      platform_fee_percentage: getControlFlagValue(flags, 'contest.platform_fee_percentage', 10),
      prize_distribution_templates: getControlFlagValue(flags, 'contest.prize_templates', [])
    };
    
    // Extract profile controls
    const profileControls: ProfileControls = {
      required_fields: getControlFlagValue(flags, 'profile.required_fields', ['name', 'email']),
      verification_options: getControlFlagValue(flags, 'profile.verification_options', ['email', 'phone']),
      profile_picture_enabled: getControlFlagValue(flags, 'profile.picture_enabled', true),
      bio_max_length: getControlFlagValue(flags, 'profile.bio_max_length', 160),
      custom_fields: getControlFlagValue(flags, 'profile.custom_fields', [])
    };
    
    // Extract all flags into a flat structure
    const flagsMap: Record<string, any> = {};
    flags.forEach(flag => {
      flagsMap[flag.flag_key] = flag.flag_value;
    });
    
    // Construct the complete control system
    return {
      controls: {
        wallet: walletControls,
        contest: contestControls,
        profile: profileControls
      },
      ui: {
        elements,
        screens
      },
      flags: flagsMap,
      permissions,
      version: getControlFlagValue(flags, 'system.version', '1.0.0')
    };
  } catch (error: any) {
    console.error('[App Control] Error loading fresh system:', error.message);
    throw error; // Let the caller handle this
  }
};

// Default system to use as a final fallback
const getDefaultAppControlSystem = (): AppControlSystem => {
  return {
    controls: {
      wallet: {
        min_withdrawal: 100,
        max_withdrawal: 10000,
        payment_methods: ['UPI', 'Bank Transfer'],
        upi_enabled: true,
        transaction_fee_percentage: 2,
        withdrawal_processing_time_hours: 24
      },
      contest: {
        min_entry_fee: 5,
        max_entry_fee: 1000,
        max_participants: 1000,
        contest_types: ['quiz', 'trivia'],
        platform_fee_percentage: 10,
        prize_distribution_templates: []
      },
      profile: {
        required_fields: ['name', 'email'],
        verification_options: ['email', 'phone'],
        profile_picture_enabled: true,
        bio_max_length: 160,
        custom_fields: []
      }
    },
    ui: {
      elements: {},
      screens: {}
    },
    flags: {},
    permissions: {},
    version: '1.0.0'
  };
}; 