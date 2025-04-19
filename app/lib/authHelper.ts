import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';
import { Platform } from 'react-native';

// Constants
const SUPABASE_URL = 'https://ozapkrljynijpffngjtt.supabase.co';
const REDIRECT_URI = 'quizzoo://auth/callback';

/**
 * Open Google login directly through Supabase, bypassing any localhost issues
 */
export const openGoogleLogin = async () => {
  try {
    // Build the direct authorization URL
    const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(REDIRECT_URI)}`;
    
    console.log('Opening direct Google auth URL:', authUrl);
    
    // Use different browser methods based on device type for better compatibility
    let result;
    if (Platform.OS === 'ios') {
      // On iOS, use openAuthSessionAsync to better handle redirects
      result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);
    } else {
      // On Android, may need direct browser for some device configs
      result = await WebBrowser.openBrowserAsync(authUrl);
    }
    
    console.log('Auth browser result:', result.type);
    
    // Check the browser result
    if (result.type === 'success' || result.type === 'dismiss') {
      // Check if session was created
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session after auth:', error);
        return { success: false, error: error.message };
      }
      
      if (data?.session) {
        console.log('Login successful, session found');
        return { success: true, session: data.session };
      } else {
        console.log('No session found after auth flow');
        return { success: false, error: 'No session found after authentication' };
      }
    } else {
      // Browser closed without completing auth
      console.log('Auth flow was canceled');
      return { success: false, error: 'Authentication was canceled' };
    }
  } catch (error) {
    console.error('Error in openGoogleLogin:', error);
    return { success: false, error: 'Failed to open authentication browser' };
  }
};

/**
 * Check if we have a valid session
 */
export const checkSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking session:', error);
      return { success: false, error: error.message };
    }
    
    if (data?.session) {
      console.log('Valid session found');
      return { success: true, session: data.session };
    } else {
      console.log('No valid session found');
      return { success: false, error: 'No valid session' };
    }
  } catch (error) {
    console.error('Unexpected error checking session:', error);
    return { success: false, error: 'Unexpected error checking session' };
  }
};

export default {
  openGoogleLogin,
  checkSession
}; 