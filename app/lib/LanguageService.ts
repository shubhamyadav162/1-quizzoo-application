import { supabase } from '@/config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Type for language preference
export type Language = 'english' | 'hindi';

// Key for local storage
const LANGUAGE_PREFERENCE_KEY = 'quizzoo-language-preference';

/**
 * Service to handle language preferences
 */
export class LanguageService {
  /**
   * Get user's language preference from local storage
   */
  static async getLocalLanguagePreference(): Promise<Language | null> {
    try {
      const language = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
      if (language === 'english' || language === 'hindi') {
        return language as Language;
      }
      return null;
    } catch (error) {
      console.error('Error getting language preference from storage:', error);
      return null;
    }
  }

  /**
   * Save user's language preference to local storage
   */
  static async saveLocalLanguagePreference(language: Language): Promise<void> {
    try {
      await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
    } catch (error) {
      console.error('Error saving language preference to storage:', error);
    }
  }

  /**
   * Check if network is available
   */
  static async isNetworkAvailable(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      
      // For Android: Both isConnected and isInternetReachable should be true
      // For iOS: isConnected might be true even without internet, so check isInternetReachable
      
      // First level check - basic connectivity
      if (netInfo.isConnected !== true) {
        return false;
      }
      
      // Second level check - internet reachability
      // Note: isInternetReachable can be null if the check hasn't completed
      if (netInfo.isInternetReachable === false) {
        return false;
      }
      
      // If isInternetReachable is null (indeterminate), assume connected if isConnected is true
      if (netInfo.isInternetReachable === null && netInfo.isConnected === true) {
        // Make a more conservative assumption for database operations
        // but still allow operations to proceed if we at least have a network connection
        return true;
      }
      
      return netInfo.isInternetReachable === true;
    } catch (error) {
      console.log('Error checking network status:', error);
      // If we can't determine network status, assume it's not available to be safe
      return false;
    }
  }

  /**
   * Get user's language preference from the database
   */
  static async getDatabaseLanguagePreference(userId: string): Promise<Language | null> {
    try {
      // First check if we have network access
      const isConnected = await this.isNetworkAvailable();
      if (!isConnected) {
        console.log('Network not available, skipping database language preference fetch');
        return null;
      }
      
      // Use the new RPC function with better error handling
      const { data, error } = await supabase.rpc('manage_user_language', {
        p_user_id: userId,
        p_operation: 'get'
      });

      if (error) {
        console.error('Error getting language preference from database:', error);
        return null;
      }

      if (data?.success && (data.language === 'english' || data.language === 'hindi')) {
        console.log('Successfully retrieved language from database:', data.language);
        return data.language as Language;
      }

      return null;
    } catch (error) {
      console.error('Error getting language preference from database:', error);
      return null;
    }
  }

  /**
   * Save user's language preference to the database
   */
  static async saveDatabaseLanguagePreference(
    userId: string,
    language: Language
  ): Promise<void> {
    try {
      // First check if we have network access
      const isConnected = await this.isNetworkAvailable();
      if (!isConnected) {
        console.log('Network not available, skipping database language preference save');
        return;
      }
      
      // Use the new RPC function with better error handling
      const { data, error } = await supabase.rpc('manage_user_language', {
        p_user_id: userId,
        p_language: language,
        p_operation: 'set'
      });

      if (error) {
        console.error('Error saving language preference to database:', error);
        return;
      }
      
      console.log('Successfully saved language preference to database:', data);
    } catch (error) {
      console.error('Error saving language preference to database:', error);
    }
  }

  /**
   * Sync language preference between local storage and database
   * This should be called when a user logs in
   */
  static async syncLanguagePreference(userId: string): Promise<Language> {
    try {
      // Get preferences from both sources
      const localPreference = await this.getLocalLanguagePreference();
      let dbPreference = null;
      
      try {
        const isConnected = await this.isNetworkAvailable();
        if (isConnected) {
          dbPreference = await this.getDatabaseLanguagePreference(userId);
        } else {
          console.log('Network not available, skipping database preference sync');
        }
      } catch (dbError) {
        console.log('Database preferences not available, falling back to local only');
      }

      // Decide which to use (local takes precedence if both exist)
      const finalPreference = localPreference || dbPreference || 'english';

      // Save to local storage
      await this.saveLocalLanguagePreference(finalPreference);
      
      // Try to save to database, but don't fail if it doesn't work
      if (await this.isNetworkAvailable()) {
        try {
          await this.saveDatabaseLanguagePreference(userId, finalPreference);
        } catch (saveError) {
          console.log('Could not save to database, but local preference has been updated');
        }
      }

      return finalPreference;
    } catch (error) {
      console.error('Error syncing language preferences:', error);
      // Default to English on error
      return 'english';
    }
  }

  /**
   * Get questions in the user's preferred language
   */
  static async getQuestionsInUserLanguage(language: Language) {
    try {
      // Check network availability first
      const isConnected = await this.isNetworkAvailable();
      if (!isConnected) {
        console.log('Network not available, cannot fetch questions');
        return [];
      }
      
      // Use the database function we created for language-specific questions
      const { data, error } = await supabase
        .rpc('get_questions_in_language', { user_lang: language });

      if (error) {
        throw error;
      }

      // Process options to get the correct language version
      return data.map((question: any) => {
        // If options is a JSONB array of objects with text and text_hindi fields
        const processedOptions = question.options.map((option: any) => {
          return {
            ...option,
            // For Hindi, use text_hindi if available, otherwise fall back to text
            text: language === 'hindi' && option.text_hindi ? option.text_hindi : option.text
          };
        });

        return {
          ...question,
          options: processedOptions
        };
      });
    } catch (error) {
      console.error('Error getting questions in user language:', error);
      return [];
    }
  }
} 