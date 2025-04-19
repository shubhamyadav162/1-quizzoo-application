import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { supabase } from './supabase';
// Try different import paths for QuestionManager
let QuestionManager: any;
try {
  // First try the original path
  const originalImport = require('../src/questions/QuestionManager');
  QuestionManager = originalImport.QuestionManager;
} catch (e) {
  try {
    // Try an alternative path
    const altImport = require('../questions/QuestionManager');
    QuestionManager = altImport.QuestionManager;
  } catch (e2) {
    console.error("Could not import QuestionManager:", e2);
    // Create a dummy implementation to prevent crashes
    QuestionManager = {
      getInstance: () => ({
        loadAllQuestions: async () => { 
          console.log('Dummy QuestionManager.loadAllQuestions called');
          return Promise.resolve(); 
        },
        allQuestions: []
      })
    };
  }
}

// Define the structure we want to use in the app
export interface Question {
  id: string;
  text: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  language: 'en' | 'hi' | 'en-hi';
}

// Define type for question file data
interface QuestionFile {
  questions: Question[];
}

// Define question category mapping
const CATEGORY_FILES: Record<string, Record<string, QuestionFile>> = {
  'General Knowledge': {
    en: require('../assets/questions/general_knowledge_en.json'),
    hi: require('../assets/questions/general_knowledge_hi.json')
  }
  // Add more categories as needed
};

// Cache for loaded questions
let questionCache: Record<string, Question[]> = {};

/**
 * Load questions from a specific category and language
 */
export const loadQuestions = async (
  category: string,
  language: 'en' | 'hi' = 'en'
): Promise<Question[]> => {
  const cacheKey = `${category}_${language}`;
  
  // Return from cache if available
  if (questionCache[cacheKey] && questionCache[cacheKey].length > 0) {
    console.log(`Returning ${questionCache[cacheKey].length} cached questions for ${category} in ${language}`);
    return questionCache[cacheKey];
  }
  
  try {
    console.log(`Attempting to load questions for ${category} in ${language} via QuestionManager`);
    
    // Try QuestionManager first
    try {
      // Get the QuestionManager instance
      const questionManager = QuestionManager.getInstance();
      
      // Load all questions if not already loaded
      if (questionManager['allQuestions'].length === 0) {
        await questionManager.loadAllQuestions();
      }
      
      // Filter questions by category
      const allQuestions = questionManager['allQuestions'];
      const filteredQuestions = allQuestions.filter(q => q.category === category);
      
      if (filteredQuestions.length > 0) {
        console.log(`Found ${filteredQuestions.length} questions via QuestionManager`);
        
        // Convert to the expected format
        const questions = filteredQuestions.map(q => ({
          id: q.id,
          text: language === 'hi' ? q.question.hi : q.question.en,
          options: language === 'hi' ? q.options.hi : q.options.en,
          difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
          category: q.category,
          language: language as 'en' | 'hi'
        }));
        
        // Cache the questions
        questionCache[cacheKey] = questions;
        
        return questions;
      } else {
        console.log('No questions found via QuestionManager, trying fallback');
      }
    } catch (managerError) {
      console.error('Error using QuestionManager:', managerError);
    }
    
    // If QuestionManager didn't work, try direct fallback
    return fallbackLoadQuestions(category, language);
  } catch (error) {
    console.error(`Global error loading questions for ${category} in ${language}:`, error);
    // Return empty array as last resort
    return [];
  }
};

// Fallback method for loading questions directly from assets
const fallbackLoadQuestions = async (
  category: string,
  language: 'en' | 'hi' = 'en'
): Promise<Question[]> => {
  try {
    console.log(`Attempting fallback question loading for ${category} in ${language}`);
    
    // Get the file reference
    const fileData = CATEGORY_FILES[category]?.[language];
    
    if (!fileData) {
      console.error(`No question file found for ${category} in ${language}`);
      throw new Error(`No question file found for ${category} in ${language}`);
    }
    
    // Load and parse the JSON file
    const questions = fileData.questions;
    
    if (!questions || questions.length === 0) {
      console.error(`Questions array is empty or invalid for ${category} in ${language}`);
      throw new Error('Questions array is empty or invalid');
    }
    
    console.log(`Successfully loaded ${questions.length} questions via fallback for ${category} in ${language}`);
    
    // Cache the questions
    questionCache[`${category}_${language}`] = questions;
    
    return questions;
  } catch (error) {
    console.error(`Fallback error loading questions for ${category} in ${language}:`, error);
    
    // Last-ditch attempt: try to use hardcoded backup questions from memory
    try {
      console.log('Attempting emergency hardcoded questions');
      const emergencyQuestions = getEmergencyQuestions(language);
      if (emergencyQuestions.length > 0) {
        console.log(`Returning ${emergencyQuestions.length} emergency questions`);
        return emergencyQuestions;
      }
    } catch (e) {
      console.error('Even emergency questions failed:', e);
    }
    
    return [];
  }
};

// Provide emergency hardcoded questions as absolute last resort
function getEmergencyQuestions(language: 'en' | 'hi' = 'en'): Question[] {
  const questions: Question[] = [];
  
  if (language === 'en') {
    questions.push({
      id: "e1",
      text: "What is the capital of France?",
      options: ["London", "Paris", "Berlin", "Rome"],
      difficulty: "easy",
      category: "General Knowledge",
      language: "en"
    });
    questions.push({
      id: "e2",
      text: "Which planet is known as the Red Planet?",
      options: ["Venus", "Jupiter", "Mars", "Saturn"],
      difficulty: "easy",
      category: "General Knowledge",
      language: "en"
    });
    questions.push({
      id: "e3",
      text: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
      difficulty: "easy",
      category: "General Knowledge",
      language: "en"
    });
  } else {
    questions.push({
      id: "e1",
      text: "फ्रांस की राजधानी क्या है?",
      options: ["लंदन", "पेरिस", "बर्लिन", "रोम"],
      difficulty: "easy",
      category: "General Knowledge",
      language: "hi"
    });
    questions.push({
      id: "e2",
      text: "किस ग्रह को लाल ग्रह के नाम से जाना जाता है?",
      options: ["शुक्र", "बृहस्पति", "मंगल", "शनि"],
      difficulty: "easy",
      category: "General Knowledge",
      language: "hi"
    });
    questions.push({
      id: "e3",
      text: "मोना लिसा किसने चित्रित की थी?",
      options: ["विन्सेंट वैन गोघ", "लियोनार्दो दा विंची", "पाब्लो पिकासो", "माइकलएंजेलो"],
      difficulty: "easy",
      category: "General Knowledge",
      language: "hi"
    });
  }
  
  return questions;
}

// Type for question reference from Supabase
interface QuestionReference {
  question_id: string;
  question_order: number;
  question_reference: {
    id: string;
    category_id: number;
    difficulty_level: string;
    language: string;
    correct_answer_index: number;
    categories: {
      name: string;
    };
  };
}

/**
 * Get questions for a specific contest
 */
export const getQuestionsForContest = async (
  contestId: string,
  language: 'en' | 'hi' = 'en'
): Promise<Question[]> => {
  try {
    // Get question references from Supabase
    // @ts-ignore: Suppress TypeScript error for supabase.from
    const { data: questionRefs, error } = await supabase
      // @ts-ignore: Suppress TypeScript error for supabase.from
      .from('contest_questions')
      .select(`
        question_id,
        question_order,
        question_reference(
          id,
          category_id,
          difficulty_level,
          language,
          correct_answer_index,
          categories(name)
        )
      `)
      .eq('contest_id', contestId)
      .order('question_order', { ascending: true });
    
    if (error) throw error;
    
    if (!questionRefs || questionRefs.length === 0) {
      return [];
    }
    
    // Load all required question categories
    const categoryNames = [...new Set(questionRefs.map((qr: QuestionReference) => 
      qr.question_reference.categories.name
    ))];
    
    for (const category of categoryNames as string[]) {
      await loadQuestions(category, language);
    }
    
    // Match question references with actual question content
    const contestQuestions: Question[] = [];
    
    for (const ref of questionRefs as QuestionReference[]) {
      const category = ref.question_reference.categories.name;
      const questionId = ref.question_id;
      
      // Find the question in cache
      const cachedQuestions = questionCache[`${category}_${language}`] || [];
      const question = cachedQuestions.find(q => q.id === questionId);
      
      if (question) {
        contestQuestions.push({
          ...question,
          // Add any additional metadata needed
        });
      }
    }
    
    return contestQuestions;
  } catch (error) {
    console.error('Error fetching questions for contest:', error);
    return [];
  }
};

/**
 * Download and cache new questions
 */
export const updateQuestionBank = async (): Promise<void> => {
  // This function could be used to download updated question banks
  // from a remote server in future versions
};

export default {
  loadQuestions,
  getQuestionsForContest,
  updateQuestionBank
}; 