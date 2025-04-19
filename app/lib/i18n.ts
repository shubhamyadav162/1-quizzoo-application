import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import language files
import en from './locales/en.json';
import hi from './locales/hi.json';

// Import language constants from constants file
import { LANGUAGE_EN, LANGUAGE_HI } from './constants';

// Get device language - simplified to avoid warnings
const getDeviceLanguage = (): string => {
  try {
    return LANGUAGE_EN; // Default to English to avoid warnings
  } catch (error) {
    return LANGUAGE_EN;
  }
};

// Simple initialization with minimal options to avoid warnings
i18n
  .use(initReactI18next)
  .init({
    resources: {
      [LANGUAGE_EN]: { translation: en },
      [LANGUAGE_HI]: { translation: hi }
    },
    lng: LANGUAGE_EN,
    fallbackLng: LANGUAGE_EN,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Simplified language initialization that won't cause warnings
try {
  AsyncStorage.getItem('app-language').then(savedLanguage => {
    if (savedLanguage === LANGUAGE_EN || savedLanguage === LANGUAGE_HI) {
      i18n.changeLanguage(savedLanguage);
    }
  }).catch(() => {
    // Silent catch to avoid warnings
  });
} catch (e) {
  // Silent catch to avoid warnings
}

export default i18n; 