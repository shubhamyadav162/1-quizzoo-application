import { useLanguage } from '@/app/lib/LanguageContext';

export function useTranslation() {
  const { language, t, toggleLanguage, isHindi } = useLanguage();
  
  return {
    t,
    language,
    toggleLanguage,
    isHindi
  };
} 