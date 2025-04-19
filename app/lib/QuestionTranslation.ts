import { useLanguage } from './LanguageContext';

export interface Question {
  id: string;
  text: string;
  text_hindi?: string;
  options: {
    id: string;
    text: string;
    text_hindi?: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
  explanation_hindi?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Utility function to get the appropriate language version of a question
 */
export function getTranslatedQuestion(question: Question, language: 'english' | 'hindi'): Question {
  if (language === 'english' || !question.text_hindi) {
    return question;
  }
  
  return {
    ...question,
    text: question.text_hindi,
    options: question.options.map(option => ({
      ...option,
      text: option.text_hindi || option.text
    })),
    explanation: question.explanation_hindi || question.explanation
  };
}

/**
 * Hook to get questions in the user's selected language
 */
export function useTranslatedQuestions() {
  const { language } = useLanguage();
  
  const getQuestionInUserLanguage = (question: Question): Question => {
    return getTranslatedQuestion(question, language);
  };
  
  const getQuestionsInUserLanguage = (questions: Question[]): Question[] => {
    return questions.map(q => getQuestionInUserLanguage(q));
  };
  
  return {
    getQuestionInUserLanguage,
    getQuestionsInUserLanguage
  };
} 