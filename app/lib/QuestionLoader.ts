import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for question formats
export interface QuestionBase {
  id: string;
  category: string;
  difficulty: string;
}

// Format used in the original JSON files (gk_set1.json, etc.)
export interface LocalQuestion extends QuestionBase {
  question?: {
    en: string;
    hi: string;
  };
  options?: {
    en: string[];
    hi: string[];
  };
  correctAnswer: number;
  en?: {
    question: string;
    options: string[];
    answer: number;
  };
  hi?: {
    question: string;
    options: string[];
    answer: number;
  };
  level?: number;
}

// Format used in the batch files
export interface BatchQuestion {
  question_id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  category_id: number;
  difficulty_level: string;
  language: string;
}

// Cache seen questions to avoid repetition
let seenQuestionIds: string[] = [];

// Load seen questions from storage
export const loadSeenQuestions = async (): Promise<string[]> => {
  try {
    const savedIds = await AsyncStorage.getItem('seen-question-ids');
    if (savedIds) {
      seenQuestionIds = JSON.parse(savedIds);
      return seenQuestionIds;
    }
  } catch (error) {
    console.error('Error loading seen questions:', error);
  }
  return [];
};

// Save seen questions to storage
export const saveSeenQuestion = async (questionId: string): Promise<void> => {
  try {
    if (!seenQuestionIds.includes(questionId)) {
      seenQuestionIds.push(questionId);
      // Keep the list to a reasonable size (last 100 questions)
      if (seenQuestionIds.length > 100) {
        seenQuestionIds = seenQuestionIds.slice(-100);
      }
      await AsyncStorage.setItem('seen-question-ids', JSON.stringify(seenQuestionIds));
    }
  } catch (error) {
    console.error('Error saving seen question:', error);
  }
};

// Convert batch question format to local question format
const convertBatchToLocalFormat = (batchQuestions: { questions: BatchQuestion[] }): LocalQuestion[] => {
  const result: LocalQuestion[] = [];
  
  // Group questions by ID prefix (removing language suffix)
  const questionGroups: Record<string, BatchQuestion[]> = {};
  
  batchQuestions.questions.forEach(q => {
    // Extract the base ID without language suffix (e.g., "gk-001" from "gk-en-001")
    const baseId = q.question_id.replace(/-[a-z]{2}-/, '-');
    
    if (!questionGroups[baseId]) {
      questionGroups[baseId] = [];
    }
    questionGroups[baseId].push(q);
  });
  
  // Process each group to create bilingual questions
  Object.values(questionGroups).forEach(group => {
    // Find English and Hindi versions
    const enQuestion = group.find(q => q.language === 'en');
    const hiQuestion = group.find(q => q.language === 'hi');
    
    if (enQuestion) {
      const questionId = enQuestion.question_id.replace(/-[a-z]{2}-/, '-');
      
      const localQuestion: LocalQuestion = {
        id: questionId,
        category: getCategoryName(enQuestion.category_id),
        difficulty: enQuestion.difficulty_level,
        question: {
          en: enQuestion.question_text,
          hi: hiQuestion?.question_text || enQuestion.question_text
        },
        options: {
          en: enQuestion.options,
          hi: hiQuestion?.options || enQuestion.options
        },
        correctAnswer: enQuestion.correct_answer_index
      };
      
      result.push(localQuestion);
    }
  });
  
  return result;
};

// Map category IDs to readable names
const getCategoryName = (categoryId: number): string => {
  const categories: Record<number, string> = {
    1: 'Geography',
    2: 'Science',
    3: 'History',
    4: 'General Knowledge',
    5: 'Literature',
    6: 'Sports',
    7: 'Entertainment',
    8: 'Technology',
    9: 'Mathematics',
    10: 'Art & Culture'
  };
  
  return categories[categoryId] || 'General Knowledge';
};

// Load questions from all batch files
export const loadAllQuestionBatches = async (): Promise<LocalQuestion[]> => {
  let allQuestions: LocalQuestion[] = [];
  
  // For batch files (numbered 1 to 15)
  try {
    // Use static imports instead of dynamic requires
    try { const batch1 = require('../../src/questions/data/gk-questions-batch1.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch1)]; } catch (e) { console.warn("Couldn't load batch 1", e); }
    try { const batch2 = require('../../src/questions/data/gk-questions-batch2.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch2)]; } catch (e) { console.warn("Couldn't load batch 2", e); }
    try { const batch3 = require('../../src/questions/data/gk-questions-batch3.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch3)]; } catch (e) { console.warn("Couldn't load batch 3", e); }
    try { const batch4 = require('../../src/questions/data/gk-questions-batch4.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch4)]; } catch (e) { console.warn("Couldn't load batch 4", e); }
    try { const batch5 = require('../../src/questions/data/gk-questions-batch5.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch5)]; } catch (e) { console.warn("Couldn't load batch 5", e); }
    try { const batch6 = require('../../src/questions/data/gk-questions-batch6.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch6)]; } catch (e) { console.warn("Couldn't load batch 6", e); }
    try { const batch7 = require('../../src/questions/data/gk-questions-batch7.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch7)]; } catch (e) { console.warn("Couldn't load batch 7", e); }
    try { const batch8 = require('../../src/questions/data/gk-questions-batch8.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch8)]; } catch (e) { console.warn("Couldn't load batch 8", e); }
    try { const batch9 = require('../../src/questions/data/gk-questions-batch9.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch9)]; } catch (e) { console.warn("Couldn't load batch 9", e); }
    try { const batch10 = require('../../src/questions/data/gk-questions-batch10.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch10)]; } catch (e) { console.warn("Couldn't load batch 10", e); }
    try { const batch11 = require('../../src/questions/data/gk-questions-batch11.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch11)]; } catch (e) { console.warn("Couldn't load batch 11", e); }
    try { const batch12 = require('../../src/questions/data/gk-questions-batch12.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch12)]; } catch (e) { console.warn("Couldn't load batch 12", e); }
    try { const batch13 = require('../../src/questions/data/gk-questions-batch13.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch13)]; } catch (e) { console.warn("Couldn't load batch 13", e); }
    try { const batch14 = require('../../src/questions/data/gk-questions-batch14.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch14)]; } catch (e) { console.warn("Couldn't load batch 14", e); }
    try { const batch15 = require('../../src/questions/data/gk-questions-batch15.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(batch15)]; } catch (e) { console.warn("Couldn't load batch 15", e); }
    
    // Load new question files
    try { const generalQuestions = require('../../src/questions/data/new-questions/general-questions.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(generalQuestions)]; } catch (e) { console.warn("Couldn't load general questions", e); }
    try { const advancedQuestions = require('../../src/questions/data/new-questions/advanced-questions.json'); allQuestions = [...allQuestions, ...convertBatchToLocalFormat(advancedQuestions)]; } catch (e) { console.warn("Couldn't load advanced questions", e); }
  } catch (error) {
    console.error('Error loading batch files:', error);
  }
  
  // Also load from original files for backward compatibility
  try {
    try {
      const gkSet1 = require('../../src/questions/data/gk_set1.json');
      allQuestions = [...allQuestions, ...gkSet1];
    } catch (e) {}
    
    try {
      const gkGeography = require('../../src/questions/data/gk_geography_5_8.json');
      allQuestions = [...allQuestions, ...gkGeography];
    } catch (e) {}
    
    try {
      const gkScience = require('../../src/questions/data/gk_science_5_8.json');
      allQuestions = [...allQuestions, ...gkScience];
    } catch (e) {}
    
    try {
      const gkMixed = require('../../src/questions/data/gk_mixed_5_12.json');
      allQuestions = [...allQuestions, ...gkMixed];
    } catch (e) {}
  } catch (error) {
    console.error('Error loading original files:', error);
  }
  
  return allQuestions;
};

// Get random questions with category filtering and avoiding repeats
export const getRandomQuestions = async (
  categoryFilter?: string,
  count: number = 10,
  allowRepeats: boolean = false
): Promise<LocalQuestion[]> => {
  // Load seen questions
  await loadSeenQuestions();
  
  // Load all questions
  const allQuestions = await loadAllQuestionBatches();
  
  // Filter by category if specified
  let filteredQuestions = categoryFilter
    ? allQuestions.filter(q => q.category.toLowerCase().includes(categoryFilter.toLowerCase()))
    : allQuestions;
  
  // If we don't have enough questions in the specified category, include others
  if (filteredQuestions.length < count) {
    const otherQuestions = allQuestions.filter(q => 
      !categoryFilter || !q.category.toLowerCase().includes(categoryFilter.toLowerCase())
    );
    
    // Prioritize questions of similar categories
    otherQuestions.sort((a, b) => {
      // If no category filter, no sorting needed
      if (!categoryFilter) return 0;
      
      // If the categories are the same for both questions, keep original order
      if (a.category === b.category) return 0;
      
      // Prefer questions that match the general knowledge category
      if (a.category.toLowerCase().includes('general')) return -1;
      if (b.category.toLowerCase().includes('general')) return 1;
      
      return 0;
    });
    
    filteredQuestions = [...filteredQuestions, ...otherQuestions];
  }
  
  // Filter out seen questions if needed
  if (!allowRepeats) {
    filteredQuestions = filteredQuestions.filter(q => !seenQuestionIds.includes(q.id));
    
    // If we don't have enough unseen questions, allow some repeats
    if (filteredQuestions.length < count) {
      console.log('Not enough unseen questions, allowing some repeats');
      // Add back some seen questions, prioritizing older ones
      const seenQuestions = allQuestions.filter(q => seenQuestionIds.includes(q.id));
      
      // Sort by order seen (oldest first)
      seenQuestions.sort((a, b) => {
        return seenQuestionIds.indexOf(a.id) - seenQuestionIds.indexOf(b.id);
      });
      
      filteredQuestions = [...filteredQuestions, ...seenQuestions];
    }
  }
  
  // Shuffle questions
  const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
  
  // Take the required number of questions
  const selectedQuestions = shuffled.slice(0, count);
  
  // Validate and fix questions before returning them
  const validatedQuestions = selectedQuestions.map(question => {
    const fixedQuestion = { ...question };
    
    // Create default bilingual structure if missing
    if (!fixedQuestion.question) {
      fixedQuestion.question = {
        en: fixedQuestion.en?.question || 'Question not available',
        hi: fixedQuestion.hi?.question || 'प्रश्न उपलब्ध नहीं है'
      };
    }
    
    // Ensure options exist and have correct format
    if (!fixedQuestion.options || 
        !fixedQuestion.options.en || 
        !Array.isArray(fixedQuestion.options.en) || 
        fixedQuestion.options.en.length < 2) {
      
      // Create default options if missing
      fixedQuestion.options = {
        en: fixedQuestion.en?.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        hi: fixedQuestion.hi?.options || ['विकल्प A', 'विकल्प B', 'विकल्प C', 'विकल्प D']
      };
    }
    
    // Ensure correctAnswer exists and is valid
    if (fixedQuestion.correctAnswer === undefined || 
        fixedQuestion.correctAnswer < 0 || 
        (fixedQuestion.options && fixedQuestion.correctAnswer >= fixedQuestion.options.en.length)) {
      
      // Use the answer from the language-specific structures if available
      if (fixedQuestion.en?.answer !== undefined) {
        fixedQuestion.correctAnswer = fixedQuestion.en.answer;
      } else if (fixedQuestion.hi?.answer !== undefined) {
        fixedQuestion.correctAnswer = fixedQuestion.hi.answer;
      } else {
        // Default to first option if no correct answer specified
        fixedQuestion.correctAnswer = 0;
      }
    }
    
    return fixedQuestion;
  });
  
  // Mark these questions as seen
  validatedQuestions.forEach(q => {
    saveSeenQuestion(q.id);
  });
  
  return validatedQuestions;
}; 