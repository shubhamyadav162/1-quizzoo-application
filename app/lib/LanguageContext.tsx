import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_EN, LANGUAGE_HI, Language } from './constants';

// Original LanguageContextType (for backward compatibility)
interface OriginalLanguageContextType {
  quizLanguage: Language;
  setQuizLanguage: (lang: Language) => Promise<void>;
  isQuizHindi: boolean;
  t: (key: string, options?: Record<string, any>) => string;
}

// Define the context type
const LanguageContext = createContext<OriginalLanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [quizLanguage, setQuizLanguageState] = useState<Language>(i18n.language as Language || LANGUAGE_EN);

  // Simple effect to load the saved language once
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedAppLanguage = await AsyncStorage.getItem('app-language');
        const savedQuizLanguage = await AsyncStorage.getItem('quiz-language');
        
        const savedLanguage = savedAppLanguage || savedQuizLanguage;
        
        if (savedLanguage === LANGUAGE_HI || savedLanguage === LANGUAGE_EN) {
          i18n.changeLanguage(savedLanguage);
          setQuizLanguageState(savedLanguage);
        }
      } catch (error) {
        // Silent catch
      }
    };
    
    loadSavedLanguage();
    
    // Check i18n.language periodically to detect changes
    const interval = setInterval(() => {
      const currentLang = i18n.language;
      if (currentLang && (currentLang === LANGUAGE_EN || currentLang === LANGUAGE_HI) && 
          currentLang !== quizLanguage) {
        setQuizLanguageState(currentLang as Language);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [quizLanguage]);

  // Simplified language change function
  const setQuizLanguage = async (lang: Language) => {
    try {
      i18n.changeLanguage(lang);
      setQuizLanguageState(lang);
      
      await AsyncStorage.setItem('app-language', lang);
      await AsyncStorage.setItem('quiz-language', lang);
    } catch (error) {
      // Silent catch
    }
  };

  return (
    <LanguageContext.Provider value={{
      quizLanguage, 
      setQuizLanguage,
      isQuizHindi: quizLanguage === LANGUAGE_HI,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): OriginalLanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Re-export language constants for backward compatibility
export { LANGUAGE_EN, LANGUAGE_HI }; 