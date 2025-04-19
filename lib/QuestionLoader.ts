import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

export interface Question {
  question_id: string;
  text: string;
  options: string[];
  correct_option_index: number;
  explanation?: string;
  tags?: string[];
}

export interface QuestionMeta {
  category: string;
  difficulty: string;
  language: string;
  version: string;
  total_questions: number;
}

export interface QuestionFile {
  meta: QuestionMeta;
  questions: Question[];
}

export interface QuestionReference {
  question_id: string;
  category_id: string;
  difficulty_level: string;
  language: string;
  correct_answer_index: number;
  created_at?: string;
  tags?: string[];
}

/**
 * QuestionLoader handles loading questions from the hybrid storage model
 * where metadata is in Supabase but full questions are stored in JSON files
 */
class QuestionLoader {
  // In-memory cache of loaded question files
  private questionCache: Record<string, QuestionFile> = {};
  
  // Default language
  private defaultLanguage = 'hindi';
  
  /**
   * Load a specific question by its ID
   */
  async getQuestionById(questionId: string, questionRef?: QuestionReference): Promise<Question | null> {
    try {
      // If question reference not provided, parse category and difficulty from ID
      if (!questionRef) {
        const parts = questionId.split('_');
        if (parts.length < 3) {
          console.error(`[QuestionLoader] Invalid question ID format: ${questionId}`);
          return null;
        }
        
        questionRef = {
          question_id: questionId,
          category_id: parts[0],
          difficulty_level: parts[1],
          language: this.defaultLanguage,
          correct_answer_index: 0 // Will be overridden by actual value in JSON
        };
      }
      
      // Get the file path
      const filePath = this.getQuestionFilePath(
        questionRef.language, 
        questionRef.category_id, 
        questionRef.difficulty_level
      );
      
      // Load the file if not in cache
      if (!this.questionCache[filePath]) {
        await this.loadQuestionFile(filePath);
      }
      
      // Find the question in the file
      const file = this.questionCache[filePath];
      if (!file) {
        console.error(`[QuestionLoader] Question file not loaded: ${filePath}`);
        return null;
      }
      
      const question = file.questions.find(q => q.question_id === questionId);
      if (!question) {
        console.error(`[QuestionLoader] Question not found in file: ${questionId}`);
        return null;
      }
      
      return question;
    } catch (error) {
      console.error(`[QuestionLoader] Error loading question ${questionId}:`, error);
      return null;
    }
  }
  
  /**
   * Load multiple questions by their IDs
   */
  async getQuestionsByIds(questionIds: string[], questionRefs?: QuestionReference[]): Promise<Question[]> {
    const questions: Question[] = [];
    
    // Create a map of question references by ID for faster lookup
    const refMap: Record<string, QuestionReference> = {};
    if (questionRefs) {
      questionRefs.forEach(ref => {
        refMap[ref.question_id] = ref;
      });
    }
    
    // Load each question
    for (const id of questionIds) {
      const question = await this.getQuestionById(id, refMap[id]);
      if (question) {
        questions.push(question);
      }
    }
    
    return questions;
  }
  
  /**
   * Get the file path for a question category and difficulty
   */
  private getQuestionFilePath(language: string, category: string, difficulty: string): string {
    return `${language}/${category}/${difficulty}.json`;
  }
  
  /**
   * Load a question file into the cache
   */
  private async loadQuestionFile(relativePath: string): Promise<QuestionFile | null> {
    try {
      // First try loading from file system (if previously downloaded)
      const fileUri = `${FileSystem.documentDirectory}questions/${relativePath}`;
      let fileContent: string | null = null;
      
      try {
        // Check if file exists in document directory
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          fileContent = await FileSystem.readAsStringAsync(fileUri);
        }
      } catch (error) {
        console.log(`[QuestionLoader] File not in document directory: ${relativePath}`);
      }
      
      // If not in document directory, load from assets
      if (!fileContent) {
        const assetPath = `./assets/questions/${relativePath}`;
        const asset = await Asset.loadAsync(require(`../assets/questions/${relativePath}`));
        
        if (asset && asset.length > 0) {
          const assetUri = asset[0].localUri || asset[0].uri;
          if (assetUri) {
            fileContent = await FileSystem.readAsStringAsync(assetUri);
          }
        }
      }
      
      // Parse the file content
      if (fileContent) {
        const questionFile = JSON.parse(fileContent) as QuestionFile;
        this.questionCache[relativePath] = questionFile;
        console.log(`[QuestionLoader] Loaded ${questionFile.questions.length} questions from ${relativePath}`);
        return questionFile;
      }
      
      console.error(`[QuestionLoader] Could not load question file: ${relativePath}`);
      return null;
    } catch (error) {
      console.error(`[QuestionLoader] Error loading question file ${relativePath}:`, error);
      return null;
    }
  }
  
  /**
   * Preload question files for faster access during gameplay
   */
  async preloadQuestionFiles(categories: string[], difficulties: string[], language: string = this.defaultLanguage): Promise<void> {
    try {
      for (const category of categories) {
        for (const difficulty of difficulties) {
          const filePath = this.getQuestionFilePath(language, category, difficulty);
          await this.loadQuestionFile(filePath);
        }
      }
      console.log(`[QuestionLoader] Preloaded ${Object.keys(this.questionCache).length} question files`);
    } catch (error) {
      console.error('[QuestionLoader] Error preloading question files:', error);
    }
  }
  
  /**
   * Clear the question cache to free up memory
   */
  clearCache(): void {
    this.questionCache = {};
    console.log('[QuestionLoader] Question cache cleared');
  }
}

// Export a singleton instance
export const questionLoader = new QuestionLoader();
export default questionLoader; 