import { supabase } from '../../lib/supabase';

// Importing all batch files
import gkBatch1 from './data/gk-questions-batch1.json';
import gkBatch2 from './data/gk-questions-batch2.json';
import gkBatch3 from './data/gk-questions-batch3.json';
import gkBatch4 from './data/gk-questions-batch4.json';
import gkBatch5 from './data/gk-questions-batch5.json';
import gkBatch6 from './data/gk-questions-batch6.json';
import gkBatch7 from './data/gk-questions-batch7.json';
import gkBatch8 from './data/gk-questions-batch8.json';
import gkBatch9 from './data/gk-questions-batch9.json';
import gkBatch10 from './data/gk-questions-batch10.json';
import gkBatch11 from './data/gk-questions-batch11.json';
import gkBatch12 from './data/gk-questions-batch12.json';
import gkBatch13 from './data/gk-questions-batch13.json';
import gkBatch14 from './data/gk-questions-batch14.json';
import gkBatch15 from './data/gk-questions-batch15.json';

// Importing our new question files
import generalQuestions from './data/new-questions/general-questions.json';
import advancedQuestions from './data/new-questions/advanced-questions.json';

// Try importing other fallback files
// If these imports cause errors, the code will handle it gracefully
try {
  // Dynamic imports are not supported in TypeScript so we'll use a different approach
} catch (e) {
  console.warn("Failed to import fallback question batches:", e);
}

// Comment out the problematic imports
// import gkSet1 from './data/gk_set1.json';
// import gkMixed from './data/gk_mixed_5_12.json';

export interface Question {
  id: string;
  question: {
    en: string;
    hi: string;
  };
  options: {
    en: string[];
    hi: string[];
  };
  correctAnswer: number;
  category: string;
  difficulty: string;
}

// Interface for batch questions format
interface BatchQuestion {
  question_id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  category_id: number;
  difficulty_level: string;
  language: string;
}

// Interface for batches file format
interface BatchFile {
  questions: BatchQuestion[];
}

// Interface for fallback question format
interface FallbackQuestion {
  question_text?: string;
  question?: string;
  options?: string[];
  choices?: string[];
  correct_answer_index?: number;
  answer?: number;
  correctAnswer?: number;
  category_id?: number;
  category?: string;
  difficulty_level?: string;
  difficulty?: string;
  language?: string;
}

export class QuestionManager {
  private static instance: QuestionManager;
  private allQuestions: Question[] = [];
  private userAnsweredQuestions: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): QuestionManager {
    if (!QuestionManager.instance) {
      QuestionManager.instance = new QuestionManager();
    }
    return QuestionManager.instance;
  }

  public async loadAllQuestions(): Promise<void> {
    try {
      console.log("Starting to load questions...");
      
      // Empty the questions array first to avoid duplicates
      this.allQuestions = [];
      
      // Load batch format files
      const batchFiles = [
        gkBatch1, gkBatch2, gkBatch3, gkBatch4, gkBatch5,
        gkBatch6, gkBatch7, gkBatch8, gkBatch9, gkBatch10,
        gkBatch11, gkBatch12, gkBatch13, gkBatch14, gkBatch15,
        // Add our new question files
        generalQuestions, advancedQuestions
      ];
      
      let loadedCount = 0;
      let errorCount = 0;
      
      // Group questions by ID to handle separate language versions
      const questionGroups: Record<string, { en?: BatchQuestion, hi?: BatchQuestion }> = {};
      
      // Process all batch files
      for (const batchFile of batchFiles) {
        try {
          // Process batch questions
          if (batchFile && batchFile.questions && Array.isArray(batchFile.questions)) {
            batchFile.questions.forEach((question: BatchQuestion) => {
              try {
                // Skip invalid questions
                if (!question || !question.question_id) {
                  return;
                }
                
                // Extract base ID (without language suffix)
                let baseId = question.question_id;
                if (baseId.includes('-en-') || baseId.includes('-hi-')) {
                  baseId = baseId.replace(/-[a-z]{2}-/, '-');
                }
                
                // Initialize group if needed
                if (!questionGroups[baseId]) {
                  questionGroups[baseId] = {};
                }
                
                // Store by language
                if (question.language === 'en') {
                  questionGroups[baseId].en = question;
                } else if (question.language === 'hi') {
                  questionGroups[baseId].hi = question;
                } else {
                  // Default to English for unspecified language
                  questionGroups[baseId].en = question;
                }
                
                loadedCount++;
              } catch (qError) {
                errorCount++;
                console.error("Error processing individual question:", qError);
              }
            });
          }
        } catch (error) {
          console.error(`Error processing batch file:`, error);
        }
      }
      
      // Convert grouped batch questions to the Question format if we loaded from batches
      if (Object.keys(questionGroups).length > 0) {
        for (const [baseId, group] of Object.entries(questionGroups)) {
          if (group.en || group.hi) {
            // Prefer English question data, fall back to Hindi if needed
            const primary = group.en || group.hi;
            if (!primary) continue;
            
            try {
              const question: Question = {
                id: baseId,
                question: {
                  en: group.en?.question_text || group.hi?.question_text || 'Question not available',
                  hi: group.hi?.question_text || group.en?.question_text || 'प्रश्न उपलब्ध नहीं है'
                },
                options: {
                  en: group.en?.options || group.hi?.options || ['Option not available'],
                  hi: group.hi?.options || group.en?.options || ['विकल्प उपलब्ध नहीं है']
                },
                correctAnswer: primary.correct_answer_index,
                category: this.getCategoryName(primary.category_id),
                difficulty: primary.difficulty_level
              };
              
              this.allQuestions.push(question);
            } catch (qError) {
              console.error("Error creating question object:", qError);
            }
          }
        }
      }
      
      // If no questions were loaded, create emergency fallback questions
      if (this.allQuestions.length === 0) {
        console.log("No questions loaded from files, creating emergency fallback questions");
        this.createEmergencyQuestions();
      }
      
      // Shuffle all questions to mix from different sources
      this.allQuestions = this.shuffleArray(this.allQuestions);
      
      console.log(`Loaded and mixed ${this.allQuestions.length} total questions (${errorCount} errors)`);
      
    } catch (error) {
      console.error('Error loading questions:', error);
      // Create emergency questions as fallback
      this.createEmergencyQuestions();
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getCategoryName(categoryId: number): string {
    const categoryMap: Record<number, string> = {
      1: 'General Knowledge',
      2: 'Science',
      3: 'Technology',
      4: 'Geography',
      5: 'Literature',
      6: 'History',
      7: 'Sports',
      8: 'Entertainment',
      9: 'Politics',
      10: 'Art & Culture'
    };
    
    return categoryMap[categoryId] || 'Miscellaneous';
  }

  public async getUserAnsweredQuestions(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_answered_questions')
        .select('question_id')
        .eq('user_id', userId);

      if (error) throw error;

      this.userAnsweredQuestions = new Set(
        data ? data.map((item: { question_id: string }) => item.question_id) : []
      );
    } catch (error) {
      console.error('Error fetching user answered questions:', error);
      this.userAnsweredQuestions = new Set(); // Reset on error
    }
  }

  public async getUniqueQuestions(count: number, userId: string): Promise<Question[]> {
    console.log(`Getting ${count} unique questions for user ${userId}`);
    
    // If questions not loaded yet, load them
    if (this.allQuestions.length === 0) {
      console.log("No questions loaded, loading now...");
      await this.loadAllQuestions();
    }
    
    // Check if we have questions
    if (this.allQuestions.length === 0) {
      console.error("Failed to load any questions");
      // Create emergency fallback
      this.createEmergencyQuestions();
    }
    
    console.log(`Total questions available: ${this.allQuestions.length}`);
    
    // Shuffle the questions array to get random questions
    const shuffledQuestions = this.shuffleArray(this.allQuestions);
    
    // If we don't have enough questions, reuse some
    if (shuffledQuestions.length < count) {
      console.warn(`Not enough questions (${shuffledQuestions.length}), reusing some to reach ${count}`);
      while (shuffledQuestions.length < count) {
        // Add copies of existing questions
        const additionalQuestions = this.shuffleArray([...shuffledQuestions])
          .slice(0, Math.min(count - shuffledQuestions.length, shuffledQuestions.length));
        
        shuffledQuestions.push(...additionalQuestions);
      }
    }
    
    console.log(`Returning ${count} questions`);
    
    // Return the first 'count' questions
    return shuffledQuestions.slice(0, count);
  }

  private async recordQuestionsForUser(questionIds: string[], userId: string): Promise<void> {
    try {
      const records = questionIds.map(qId => ({
        user_id: userId,
        question_id: qId,
        answered_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('user_answered_questions')
        .insert(records);

      if (error) throw error;
    } catch (error) {
      console.error('Error recording answered questions:', error);
    }
  }
  
  // Emergency fallback questions when all loading methods fail
  private createEmergencyQuestions(): void {
    const emergencyQuestions: Question[] = [
      {
        id: "emergency-1",
        question: { 
          en: "What is the capital of India?",
          hi: "भारत की राजधानी क्या है?"
        },
        options: {
          en: ["New Delhi", "Mumbai", "Kolkata", "Chennai"],
          hi: ["नई दिल्ली", "मुंबई", "कोलकाता", "चेन्नई"]
        },
        correctAnswer: 0,
        category: "Geography",
        difficulty: "easy"
      },
      {
        id: "emergency-2",
        question: { 
          en: "Who painted the Mona Lisa?",
          hi: "मोना लिसा किसने बनाई थी?"
        },
        options: {
          en: ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Michelangelo"],
          hi: ["लियोनार्डो दा विंची", "पाब्लो पिकासो", "विन्सेंट वैन गॉग", "माइकलएंजेलो"]
        },
        correctAnswer: 0,
        category: "Art & Culture",
        difficulty: "easy"
      },
      {
        id: "emergency-3",
        question: { 
          en: "Which planet is known as the Red Planet?",
          hi: "किस ग्रह को लाल ग्रह के नाम से जाना जाता है?"
        },
        options: {
          en: ["Mars", "Venus", "Jupiter", "Saturn"],
          hi: ["मंगल", "शुक्र", "बृहस्पति", "शनि"]
        },
        correctAnswer: 0,
        category: "Science",
        difficulty: "easy"
      },
      {
        id: "emergency-4",
        question: { 
          en: "What is the chemical symbol for gold?",
          hi: "सोने का रासायनिक प्रतीक क्या है?"
        },
        options: {
          en: ["Au", "Ag", "Fe", "Cu"],
          hi: ["Au", "Ag", "Fe", "Cu"]
        },
        correctAnswer: 0,
        category: "Science",
        difficulty: "easy"
      },
      {
        id: "emergency-5",
        question: { 
          en: "Which country is known as the Land of the Rising Sun?",
          hi: "किस देश को उगते सूरज की भूमि के रूप में जाना जाता है?"
        },
        options: {
          en: ["Japan", "China", "India", "South Korea"],
          hi: ["जापान", "चीन", "भारत", "दक्षिण कोरिया"]
        },
        correctAnswer: 0,
        category: "Geography",
        difficulty: "easy"
      },
      {
        id: "emergency-6",
        question: { 
          en: "Who wrote 'Romeo and Juliet'?",
          hi: "'रोमियो और जूलियट' किसने लिखी थी?"
        },
        options: {
          en: ["William Shakespeare", "Charles Dickens", "Jane Austen", "Mark Twain"],
          hi: ["विलियम शेक्सपियर", "चार्ल्स डिकेंस", "जेन ऑस्टेन", "मार्क ट्वेन"]
        },
        correctAnswer: 0,
        category: "Literature",
        difficulty: "easy"
      },
      {
        id: "emergency-7",
        question: { 
          en: "Which is the largest ocean on Earth?",
          hi: "पृथ्वी पर सबसे बड़ा महासागर कौन सा है?"
        },
        options: {
          en: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
          hi: ["प्रशांत महासागर", "अटलांटिक महासागर", "हिंद महासागर", "आर्कटिक महासागर"]
        },
        correctAnswer: 0,
        category: "Geography",
        difficulty: "easy"
      },
      {
        id: "emergency-8",
        question: { 
          en: "Who is known as the Father of India?",
          hi: "भारत के पिता के रूप में किसे जाना जाता है?"
        },
        options: {
          en: ["Mahatma Gandhi", "Jawaharlal Nehru", "Subhas Chandra Bose", "Sardar Patel"],
          hi: ["महात्मा गांधी", "जवाहरलाल नेहरू", "सुभाष चंद्र बोस", "सरदार पटेल"]
        },
        correctAnswer: 0,
        category: "History",
        difficulty: "easy"
      },
      {
        id: "emergency-9",
        question: { 
          en: "What is the largest planet in our solar system?",
          hi: "हमारे सौर मंडल में सबसे बड़ा ग्रह कौन सा है?"
        },
        options: {
          en: ["Jupiter", "Saturn", "Neptune", "Uranus"],
          hi: ["बृहस्पति", "शनि", "नेप्च्यून", "यूरेनस"]
        },
        correctAnswer: 0,
        category: "Science",
        difficulty: "easy"
      },
      {
        id: "emergency-10",
        question: { 
          en: "Which is the smallest continent?",
          hi: "सबसे छोटा महाद्वीप कौन सा है?"
        },
        options: {
          en: ["Australia", "Europe", "Antarctica", "South America"],
          hi: ["ऑस्ट्रेलिया", "यूरोप", "अंटार्कटिका", "दक्षिण अमेरिका"]
        },
        correctAnswer: 0,
        category: "Geography",
        difficulty: "easy"
      }
    ];
    
    this.allQuestions = emergencyQuestions;
    console.log(`Created ${emergencyQuestions.length} emergency questions as fallback`);
  }
}

export const questionManager = QuestionManager.getInstance(); 