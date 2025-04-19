/**
 * GameEngine.ts
 * 
 * Core game engine service that handles game state management,
 * scoring, audio, and animations for the Quizzoo app.
 */

import { Audio } from 'expo-av';
import { 
  GameState, 
  QuestionPerformance, 
  PlayerPerformance, 
  GameSound,
  GameAnimation,
  GameDifficulty,
  QuestionDifficulty
} from './GameTypes';
import {
  calculateQuestionPoints,
  calculateTotalScore,
  generateRankAndPrizes,
  detectAchievements,
  generateRealisticOpponents
} from './GameLogic';

// Singleton instance
let instance: GameEngine | null = null;

/**
 * Game Engine class for managing quiz game state
 */
export class GameEngine {
  // Game configuration
  private timePerQuestion: number = 6000; // 6 seconds
  private totalQuestions: number = 10;
  private questions: any[] = [];
  private contest: any = null;
  private soundEnabled: boolean = true;
  private hapticEnabled: boolean = true;
  
  // Game state
  private gameState: GameState = {
    currentQuestionIndex: 0,
    selectedOption: null,
    totalScore: 0,
    timeLeft: 6000,
    questionAnswered: false,
    showEmoji: false,
    emojiType: 'correct',
    showCorrectAnswer: false,
    showFeedback: false,
    feedbackText: '',
    gameCompleted: false,
    answers: [],
    questionPerformance: [],
    totalTimeSpent: 0,
    totalResponseTimeMs: 0, // Initialize total response time for tie-breaking
    nextQuestionCountdown: null,
    currentStreak: 0,
    achievements: [],
    gameStartTime: null,
    gameStarted: false, // Add gameStarted flag
    questionStartTime: null, // Add timestamp for when question started
    questionEndTime: null, // Initialize questionEndTime
  };
  
  // Timer refs
  private timerInterval: NodeJS.Timeout | null = null;
  private questionTimeout: NodeJS.Timeout | null = null;
  
  // Audio objects
  private soundObjects: Map<GameSound, Audio.Sound> = new Map();
  
  // Callbacks
  private onStateChange: ((state: GameState) => void) | null = null;
  private onGameComplete: ((state: GameState, players: PlayerPerformance[]) => void) | null = null;
  private onAnimation: ((type: GameAnimation, data?: any) => void) | null = null;
  
  // New interval ref
  private countdownInterval: NodeJS.Timeout | null = null;
  
  /**
   * Get singleton instance
   */
  static getInstance(): GameEngine {
    if (!instance) {
      instance = new GameEngine();
    }
    return instance;
  }
  
  /**
   * Private constructor for singleton
   */
  private constructor() {
    this.preloadSounds();
  }
  
  /**
   * Initialize the game with questions and settings
   */
  async initialize(
    questions: any[], 
    contest: any,
    options: {
      timePerQuestion?: number;
      soundEnabled?: boolean;
      hapticEnabled?: boolean;
      onStateChange?: (state: GameState) => void;
      onGameComplete?: (state: GameState, players: PlayerPerformance[]) => void;
      onAnimation?: (type: GameAnimation, data?: any) => void;
    } = {}
  ): Promise<void> {
    // Clear any existing timers
    this.clearTimers();
    
    // Validate questions array to prevent issues
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.error('Invalid questions array provided to game engine');
      // Create a minimal valid questions array to allow game to continue
      questions = [
        {
          id: 'error_question',
          text: 'There was an error loading questions. Please try again.',
          options: [
            { id: '0', text: 'Return to home', isCorrect: true },
            { id: '1', text: 'Try again', isCorrect: false },
          ],
          correctAnswer: 0,
          category: 'error',
        }
      ];
    }
    
    // Reset game state first to avoid state conflicts
    this.resetGameState();
    
    // Deep copy questions to avoid reference issues
    try {
      // Ensure each question has the required properties and make deep copies to avoid reference issues
      const sanitizedQuestions = questions.map((q, index) => {
        // Skip null or undefined questions
        if (!q) {
          console.warn(`Question at index ${index} is null or undefined`);
          return {
            id: `auto_generated_${index}`,
            text: `Question ${index + 1}`,
            options: [
              { id: '0', text: 'Option A', isCorrect: true },
              { id: '1', text: 'Option B', isCorrect: false },
            ],
            correctAnswer: 0,
            category: 'general',
          };
        }
        
        // Create a deep copy of the question
        let question;
        try {
          question = JSON.parse(JSON.stringify(q));
        } catch (e) {
          console.warn(`Failed to deep copy question ${index}, using shallow copy`);
          question = {...q};
        }
        
        // Handle options from different possible formats
        let processedOptions: any[] = [];
        
        // First, extract any available options
        if (question.options_en && Array.isArray(question.options_en)) {
          // Format coming from our bilingual questions
          processedOptions = question.options_en.map((text: string, i: number) => ({
            id: `${index}_${i}`,
            text: text,
            text_hindi: question.options_hi && question.options_hi[i] ? question.options_hi[i] : text,
            isCorrect: i === parseInt(question.correct_answer || '0')
          }));
        } else if (question.options && typeof question.options === 'string') {
          // Try to parse JSON string options
          try {
            const parsedOptions = JSON.parse(question.options);
            if (Array.isArray(parsedOptions)) {
              processedOptions = parsedOptions.map((text: string, i: number) => ({
                id: `${index}_${i}`,
                text: text,
                isCorrect: i === parseInt(question.correct_answer || '0')
              }));
            }
          } catch (e) {
            console.warn(`Failed to parse options string for question ${index}`);
            processedOptions = [];
          }
        } else if (question.options && Array.isArray(question.options)) {
          // Handle already formatted options array
          processedOptions = question.options.map((opt: any, i: number) => {
            // If option is just a string
            if (typeof opt === 'string') {
              return {
                id: `${index}_${i}`,
                text: opt,
                isCorrect: i === parseInt(question.correct_answer || '0')
              };
            }
            // If option is an object
            else if (typeof opt === 'object' && opt !== null) {
              return {
                id: opt.id || `${index}_${i}`,
                text: opt.text || `Option ${i+1}`,
                text_hindi: opt.text_hindi || '',
                isCorrect: i === parseInt(question.correct_answer || '0') || opt.isCorrect === true
              };
            }
            // Default fallback
            return {
              id: `${index}_${i}`,
              text: `Option ${i+1}`,
              isCorrect: i === parseInt(question.correct_answer || '0')
            };
          });
        }
        
        // If we still don't have valid options, create default ones
        if (!processedOptions || !Array.isArray(processedOptions) || processedOptions.length === 0) {
          console.warn(`Question ${index} has invalid options, creating default options`);
          // Create default options
          processedOptions = [
            { id: `${index}_0`, text: 'Option A', isCorrect: true },
            { id: `${index}_1`, text: 'Option B', isCorrect: false },
            { id: `${index}_2`, text: 'Option C', isCorrect: false },
            { id: `${index}_3`, text: 'Option D', isCorrect: false },
          ];
        }
        
        // Assign processed options back to question
        question.options = processedOptions;
        
        // Ensure correctAnswer property exists
        if (question.correctAnswer === undefined) {
          console.warn(`Question ${index} missing correctAnswer, setting default`);
          // Find the correct option and set its index as correctAnswer
          const correctIndex = question.options.findIndex((opt: any) => 
            typeof opt === 'object' && opt !== null && opt.isCorrect === true
          );
          question.correctAnswer = correctIndex >= 0 ? correctIndex : 0;
        } else if (typeof question.correctAnswer === 'string') {
          // Convert string correctAnswer to number
          question.correctAnswer = parseInt(question.correctAnswer);
        }
        
        // Ensure text is properly set
        if (!question.text) {
          if (question.question) {
            question.text = question.question;
          } else if (question.title) {
            question.text = question.title;
          } else {
            question.text = `Question ${index + 1}`;
          }
        }
        
        // Ensure category is defined
        if (!question.category) {
          question.category = 'general';
        }
        
        return question;
      });
      
      // Set options
      this.timePerQuestion = options.timePerQuestion || 6000;
      this.soundEnabled = options.soundEnabled !== undefined ? options.soundEnabled : true;
      this.hapticEnabled = options.hapticEnabled !== undefined ? options.hapticEnabled : true;
      
      // Set callbacks
      this.onStateChange = options.onStateChange || null;
      this.onGameComplete = options.onGameComplete || null;
      this.onAnimation = options.onAnimation || null;
      
      // Processs sanitized questions
      const maxQuestionsToUse = Math.min(
        contest?.questionCount || 10, 
        sanitizedQuestions.length
      );
      this.totalQuestions = maxQuestionsToUse;

      // Take only the number of questions defined by contest (or all if not specified)
      // and shuffle them for variety
      this.questions = this.shuffleArray(sanitizedQuestions).slice(0, maxQuestionsToUse);

      // Debug info
      console.log(`Initialized game with ${this.questions.length} questions`);
      console.log(`First question: ${JSON.stringify(this.questions[0]?.text)}`);
      console.log(`Time per question: ${this.timePerQuestion}ms`);

      // Store contest info
      this.contest = contest;

      // Fully reset state
      this.resetGameState();

      // Initialized successfully
      console.log('GameEngine initialized successfully');
      this.notifyStateChange();

      // Don't auto-start - wait for explicit start call
      return Promise.resolve();
    } catch (error) {
      // If any error occurs during initialization, log it and set up a minimal game
      console.error('Error during game initialization:', error);
      
      // Create a minimal valid questions array to allow game to continue
      this.questions = [
        {
          id: 'error_question',
          text: 'There was an error initializing the game. Please try again.',
          options: [
            { id: '0', text: 'Return to home', isCorrect: true },
            { id: '1', text: 'Try again', isCorrect: false },
          ],
          correctAnswer: 0,
          category: 'error',
        }
      ];
      
      // Set minimal game options
      this.timePerQuestion = options.timePerQuestion || 6000;
      this.totalQuestions = 1;
      this.contest = contest || {};
      
      // Keep callbacks
      this.onStateChange = options.onStateChange || null;
      this.onGameComplete = options.onGameComplete || null;
      this.onAnimation = options.onAnimation || null;
      
      // Reset state and start
      this.resetGameState();
      this.startQuestion();
    }
  }
  
  /**
   * Reset the game state to initial values
   */
  private resetGameState(): void {
    console.log('🎮 GameEngine: Resetting game state.');
    
    // Reset to initial state while preserving any necessary data
    this.gameState = {
      ...this.gameState,
      currentQuestionIndex: 0,
      selectedOption: null,
      questionAnswered: false,
      showEmoji: false,
      emojiType: 'correct',
      showCorrectAnswer: false,
      showFeedback: false,
      nextQuestionCountdown: null,
      gameCompleted: false,
      gameStarted: false, // Will be set to true in start()
      gameStartTime: null,
      questionStartTime: null,
      questionEndTime: null,
      answers: [], // Clear previous answers
    };
    
    // Clear any existing timers
    this.clearTimers();
    
    console.log('🎮 GameEngine: Game state reset complete.');
  }
  
  /**
   * Start displaying a question
   */
  private startQuestion(): void {
    try {
      console.log(`GameEngine: Starting question ${this.gameState.currentQuestionIndex + 1}/${this.totalQuestions}`);
      
      // Reset question state
      this.gameState.selectedOption = null;
      this.gameState.questionAnswered = false;
      this.gameState.showEmoji = false;
      this.gameState.emojiType = '';
      this.gameState.showCorrectAnswer = false;
      this.gameState.showFeedback = false;
      this.gameState.feedbackText = '';
      this.gameState.nextQuestionCountdown = null;
      this.gameState.timeLeft = this.timePerQuestion;
      this.gameState._handlingQuestionComplete = false;
      
      // Safety check for question data existence
      const currentQuestion = this.questions[this.gameState.currentQuestionIndex];
      if (!currentQuestion) {
        console.error(`Invalid question at index ${this.gameState.currentQuestionIndex}`);
        // Create a fallback question to prevent crashes
        this.questions[this.gameState.currentQuestionIndex] = {
          id: `fallback_${this.gameState.currentQuestionIndex}`,
          text: `Question ${this.gameState.currentQuestionIndex + 1}`,
          options: [
            { id: '0', text: 'Option A', isCorrect: true },
            { id: '1', text: 'Option B', isCorrect: false },
            { id: '2', text: 'Option C', isCorrect: false },
            { id: '3', text: 'Option D', isCorrect: false },
          ],
          correctAnswer: 0,
        };
      }
      
      // Record start time
      this.gameState.questionStartTime = Date.now();
      this.gameState.questionEndTime = null;
      
      // Notify state change
      this.notifyStateChange();
      
      // Use a small delay before starting the timer to ensure UI is ready
      setTimeout(() => {
        // Start timer
        this.startTimer();
      }, 100);
    } catch (error) {
      console.error('Error in startQuestion:', error);
      // Attempt recovery by moving to next question or ending game
      if (this.gameState.currentQuestionIndex >= this.totalQuestions - 1) {
        this.endGame();
      } else {
        this.gameState.currentQuestionIndex++;
        this.startQuestion();
      }
    }
  }
  
  /**
   * Start the timer for the current question
   */
  private startTimer(): void {
    console.log(`Starting fixed ${this.timePerQuestion}ms timer for question ${this.gameState.currentQuestionIndex + 1}`);
    
    // Clear any existing timers to avoid race conditions
    this.clearTimers();
    
    // Start time for this question
    const startTime = Date.now();
    const endTime = startTime + this.timePerQuestion;
    
    // Flag to prevent multiple completion calls
    let questionCompleted = false;
    
    // Create the single authoritative timer that will move to the next question
    // This timer is the ONLY thing that should trigger question transitions
    this.questionTimeout = setTimeout(() => {
      console.log(`FIXED TIMER: ${this.timePerQuestion}ms elapsed for question ${this.gameState.currentQuestionIndex + 1}, moving to next question`);
      
      // Mark as completed to prevent any other timers from triggering completion
      questionCompleted = true;
      
      // Complete the question
      this.handleQuestionComplete();
    }, this.timePerQuestion);
    
    // Update time display every 50ms, but this is ONLY for UI updates
    this.timerInterval = setInterval(() => {
      // Skip if question is already completed
      if (questionCompleted) return;
      
      // Calculate time left based on current time for accuracy
      const now = Date.now();
      const timeLeft = Math.max(0, endTime - now);
      
      // Update gameState with precise remaining time
      this.gameState.timeLeft = timeLeft;
      
      // Play tick sound at 3, 2, 1 seconds remaining
      if (this.soundEnabled && 
          [3000, 2000, 1000].includes(Math.round(timeLeft / 1000) * 1000)) {
        try {
          this.playSound(GameSound.COUNTDOWN);
        } catch (e) {
          console.log('Tick sound not available');
        }
      }
      
      // ONLY notify state change, don't trigger completion here!
      this.notifyStateChange();
    }, 50);
  }
  
  /**
   * Handle user selecting an option
   */
  selectOption(index: number): void {
    console.log(`Option selected: ${index} for question ${this.gameState.currentQuestionIndex + 1}`);
    
    // Special case: -1 is used as a trigger to start the game
    if (index === -1) {
      console.log('Received start game trigger via selectOption(-1)');
      this.start();
      return;
    }
    
    try {
      // Ignore if already answered or if game is completed
      if (this.gameState.questionAnswered || this.gameState.gameCompleted) {
        console.log('Question already answered or game completed, ignoring selection');
        return;
      }
      
      // Set selection state *immediately* to prevent double clicks
      this.gameState.selectedOption = index;
      this.gameState.questionAnswered = true;
      
      // IMPORTANT: We DO NOT clear or modify ANY timers here
      // The main questionTimeout will handle moving to the next question
      // after the full timePerQuestion duration
      
      // Check if the selected option is correct
      const currentQuestion = this.questions[this.gameState.currentQuestionIndex];
      
      // Validate question and options existence
      if (!currentQuestion || !currentQuestion.options || 
          !Array.isArray(currentQuestion.options) || 
          index >= currentQuestion.options.length) {
        console.error('Invalid question or option index:', 
                     this.gameState.currentQuestionIndex, index);
        return;
      }
      
      // Determine if the selected answer is correct
      let isCorrect = false;
      let correctAnswerIndex = -1;
      
      // Check for correctAnswer property
      if (currentQuestion.correctAnswer !== undefined) {
        console.log('Checking correctAnswer property:', currentQuestion.correctAnswer, 'against index:', index);
        correctAnswerIndex = typeof currentQuestion.correctAnswer === 'string' 
          ? parseInt(currentQuestion.correctAnswer, 10) 
          : currentQuestion.correctAnswer;
        isCorrect = index === correctAnswerIndex;
        console.log('correctAnswer comparison result:', isCorrect);
      }
      // Check for correct_answer property
      else if (currentQuestion.correct_answer !== undefined) {
        console.log('Checking correct_answer property:', currentQuestion.correct_answer);
        correctAnswerIndex = typeof currentQuestion.correct_answer === 'string' 
          ? parseInt(currentQuestion.correct_answer, 10) 
          : currentQuestion.correct_answer;
        isCorrect = index === correctAnswerIndex;
        console.log('correct_answer comparison result:', isCorrect);
      }
      // Check if options have isCorrect property
      else if (currentQuestion.options.some((opt: any) => typeof opt === 'object' && 'isCorrect' in opt)) {
        console.log('Checking options for isCorrect property');
        currentQuestion.options.forEach((opt: any, i: number) => {
          if (opt.isCorrect === true) {
            correctAnswerIndex = i;
          }
        });
        isCorrect = index === correctAnswerIndex;
        console.log('isCorrect property comparison result:', isCorrect);
      }
      else {
        console.error('No valid correct answer property found in question:', currentQuestion);
      }
      
      // Update streak counter
      if (isCorrect) {
        this.gameState.currentStreak++;
        this.playSound(GameSound.CORRECT_ANSWER);
        this.triggerAnimation(GameAnimation.CORRECT);
      } else {
        this.gameState.currentStreak = 0;
        this.playSound(GameSound.WRONG_ANSWER);
        this.triggerAnimation(GameAnimation.WRONG);
      }
      
      // Calculate time spent so far
      const timeSpent = this.gameState.questionStartTime ? Date.now() - this.gameState.questionStartTime : 0;
      const difficulty = currentQuestion.difficulty || GameDifficulty.MEDIUM;
      const pointsEarned = isCorrect ? calculateQuestionPoints(timeSpent, this.timePerQuestion, difficulty) : 0;
      
      // Update state for feedback (emoji, correct answer display)
      this.gameState.emojiType = isCorrect ? 'correct' : 'incorrect';
      this.gameState.showEmoji = true;
      this.gameState.showCorrectAnswer = true;
      this.gameState.showFeedback = true;
      
      // Record performance data
      if (!this.gameState.questionPerformance) this.gameState.questionPerformance = [];
      if (!this.gameState.answers) this.gameState.answers = [];
      
      const questionPerformance: QuestionPerformance = {
          questionNumber: this.gameState.currentQuestionIndex + 1,
          timeSpent, 
          timeAllowed: this.timePerQuestion,
          isCorrect,
          pointsEarned,
          difficulty: difficulty,
          streakAtThisPoint: this.gameState.currentStreak,
          responseTimeMs: timeSpent, 
      };
      this.gameState.questionPerformance.push(questionPerformance);
      this.gameState.answers.push({
          questionIndex: this.gameState.currentQuestionIndex,
          selectedOption: index,
          correct: isCorrect,
          timeSpent,
          responseTimeMs: timeSpent, 
      });
      this.gameState.totalTimeSpent += timeSpent;
      this.gameState.totalResponseTimeMs = (this.gameState.totalResponseTimeMs || 0) + timeSpent;
      
      // Calculate remaining time for the countdown display
      const currentTime = Date.now();
      const startTime = this.gameState.questionStartTime || currentTime;
      const elapsedTime = currentTime - startTime;
      const remainingTime = Math.max(0, this.timePerQuestion - elapsedTime);
      
      // Display countdown timer to next question
      if (remainingTime > 0) {
        this.gameState.nextQuestionCountdown = Math.ceil(remainingTime / 1000);
        
        // Update countdown every second
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        
        this.countdownInterval = setInterval(() => {
          if (this.gameState.nextQuestionCountdown && this.gameState.nextQuestionCountdown > 1) {
            this.gameState.nextQuestionCountdown -= 1;
            this.notifyStateChange();
          } else {
            if (this.countdownInterval) {
              clearInterval(this.countdownInterval);
              this.countdownInterval = null;
            }
          }
        }, 1000);
      }
      
      // Update the UI to show the answer and feedback
      this.notifyStateChange();
      
      // IMPORTANT: We are NOT setting another timeout to call handleQuestionComplete here
      // We let the original timer in startTimer handle the transition
      console.log(`Answer recorded for question ${this.gameState.currentQuestionIndex + 1}. Waiting for timer to finish.`);
      
    } catch (error) {
      console.error('Error in selectOption:', error);
      this.notifyStateChange(); // Notify even on error to reflect partial state changes
    }
  }
  
  /**
   * Handle question completion (whether answered or not)
   */
  private handleQuestionComplete(): void {
    console.log(`Question ${this.gameState.currentQuestionIndex + 1} completed. Processing completion...`);
    
    // If game is already completed, don't process again
    if (this.gameState.gameCompleted) {
      console.log('Game already completed, ignoring handleQuestionComplete call');
      return;
    }
    
    // If question is already in the process of completing, skip
    if (this.gameState._handlingQuestionComplete) {
      console.log('Already handling question completion, skipping duplicate call');
      return;
    }
    
    // Set flag to prevent duplicate processing
    this.gameState._handlingQuestionComplete = true;
    
    // Store question end time
    this.gameState.questionEndTime = Date.now();

    // Safety check - ensure we're not trying to process beyond the available questions
    if (!this.questions || !Array.isArray(this.questions) || 
        this.gameState.currentQuestionIndex >= this.questions.length || 
        this.gameState.currentQuestionIndex < 0) {
      console.log('Warning: Attempted to handle completion for a non-existent question');
      
      // Ensure game is properly ended
      if (!this.gameState.gameCompleted) {
        this.endGame();
      }
      
      // Clear completion flag
      this.gameState._handlingQuestionComplete = false;
      return;
    }
    
    // Clear all timers immediately to prevent any race conditions
    this.clearTimers();
    
    // If the question was not answered, record it as skipped
    if (!this.gameState.questionAnswered) {
      console.log(`Question ${this.gameState.currentQuestionIndex + 1} timed out without an answer`);
      
      // Reset streak counter for skipped questions
      this.gameState.currentStreak = 0;
      
      // For skipped questions, don't show the correct answer
      this.gameState.showEmoji = false;
      this.gameState.emojiType = 'incorrect';
      this.gameState.showCorrectAnswer = false;
      
      // Trigger timeout animation
      this.triggerAnimation(GameAnimation.TIMEOUT);
      this.playSound(GameSound.WRONG_ANSWER);
      
      // Ensure questionPerformance is initialized
      if (!this.gameState.questionPerformance) {
        this.gameState.questionPerformance = [];
      }
      
      // Add to performance tracking for skipped question
      this.gameState.questionPerformance.push({
        questionNumber: this.gameState.currentQuestionIndex + 1,
        timeSpent: this.timePerQuestion,
        timeAllowed: this.timePerQuestion,
        isCorrect: false,
        pointsEarned: 0,
        streakAtThisPoint: 0
      });
    }
    
    // Calculate total score based on all questions so far
    try {
      this.gameState.totalScore = calculateTotalScore(
        this.gameState.questionPerformance as any || []
      );
    } catch (error) {
      console.error('Error calculating total score:', error);
    }
    
    // Check if we've reached the end of questions
    const isLastQuestion = this.gameState.currentQuestionIndex >= this.totalQuestions - 1;
    
    if (isLastQuestion) {
      console.log('Last question completed, ending game');
      
      // First notify the state change so the UI can show the final question result
      this.notifyStateChange();
      
      // End the game after a brief delay
      setTimeout(() => {
        try {
          // Clear completion flag
          this.gameState._handlingQuestionComplete = false;
          this.endGame();
        } catch (error) {
          console.error('Error ending game:', error);
          // Force game completion state and notify
          this.gameState.gameCompleted = true;
          this.notifyStateChange();
        }
      }, 1500);
    } else {
      // Calculate the next question index
      const nextQuestionIndex = this.gameState.currentQuestionIndex + 1;
      
      console.log(`Moving to next question: ${this.gameState.currentQuestionIndex + 1} → ${nextQuestionIndex + 1}`);
      
      // Show a brief countdown before moving to the next question
      this.gameState.nextQuestionCountdown = 1;
      this.notifyStateChange();
      
      // Use a consistent delay before showing the next question
      const transitionDelay = 1500; // 1.5 seconds
      
      setTimeout(() => {
        try {
          // Increment question index
          this.gameState.currentQuestionIndex = nextQuestionIndex;
          
          // Clear completion flag
          this.gameState._handlingQuestionComplete = false;
          
          // Start next question
          this.startQuestion();
        } catch (error) {
          console.error('Error starting next question:', error);
          // Try to recover by ending the game
          this.endGame();
        }
      }, transitionDelay);
    }
  }
  
  /**
   * End the game and show results
   */
  private endGame(): void {
    try {
      // Check if game is already completed to prevent duplicate processing
      if (this.gameState.gameCompleted) {
        console.log('Game already completed, skipping duplicate endGame call');
        return;
      }
      
      // Set game completed
      this.gameState.gameCompleted = true;
      
      // Clear any timers to prevent further updates
      this.clearTimers();
      
      // Play game complete sound
      this.playSound(GameSound.GAME_COMPLETE);
      
      // Ensure questionPerformance array is initialized
      if (!this.gameState.questionPerformance) {
        this.gameState.questionPerformance = [];
        console.log('Initializing empty questionPerformance array');
      }
      
      // Ensure achievements array is initialized
      if (!this.gameState.achievements) {
        this.gameState.achievements = [];
        console.log('Initializing empty achievements array');
      }
      
      // Get achievements with null checks
      const achievementsArray = detectAchievements(
        this.gameState.questionPerformance || [],
        this.gameState.totalScore || 0,
        this.totalQuestions
      );
      
      // Convert string array to Achievement array with null check
      if (achievementsArray && Array.isArray(achievementsArray)) {
        this.gameState.achievements = achievementsArray.map(title => ({
          id: title.toLowerCase().replace(/\s+/g, '-'),
          title: title,
          description: `You earned the "${title}" achievement!`,
          icon: 'trophy'
        }));
      } else {
        // If achievementsArray is undefined or not an array, set to empty array
        this.gameState.achievements = [];
        console.log('Warning: achievementsArray was not a valid array');
      }
      
      // Play achievement sound if any achieved
      if (this.gameState.achievements && this.gameState.achievements.length > 0) {
        this.playSound(GameSound.ACHIEVEMENT);
        
        // Trigger achievement animation
        this.triggerAnimation(GameAnimation.ACHIEVEMENT, {
          achievements: this.gameState.achievements
        });
      }
      
      // Ensure we have valid questionPerformance data
      const validQuestionPerf = this.gameState.questionPerformance || [];
      const totalTimeSpent = this.gameState.totalTimeSpent || 0;
      const totalQuestions = Math.max(1, this.totalQuestions);
      
      // Generate realistic opponents based on user's score
      let opponents = [];
      try {
        opponents = generateRealisticOpponents(
          this.gameState.totalScore || 0,
          9, // Generate 9 opponents (10 players total with user)
          this.totalQuestions * 150 // Max possible score
        );
      } catch (error) {
        console.error('Error generating opponents:', error);
        // Create basic default opponents if generation fails
        opponents = Array(9).fill(0).map((_, i) => ({
          id: i + 1,
          name: `Player ${i + 1}`,
          score: Math.floor(Math.random() * (this.gameState.totalScore || 100)),
          correctAnswers: Math.floor(Math.random() * this.totalQuestions),
          totalTimeSpent: Math.random() * totalTimeSpent * 1.5,
          avgTime: '3.0s',
          avgTimeMs: 3000,
          isUser: false
        }));
      }
      
      // Create user player record with proper error handling for undefined
      const userPlayer: PlayerPerformance = {
        id: 0,
        name: 'You',
        score: this.gameState.totalScore || 0,
        correctAnswers: validQuestionPerf.filter(q => q && q.isCorrect).length,
        totalTimeSpent: totalTimeSpent,
        avgTime: `${(totalTimeSpent / totalQuestions / 1000).toFixed(1)}s`,
        avgTimeMs: totalTimeSpent / totalQuestions, // Exact average time in milliseconds
        totalResponseTimeMs: this.gameState.totalResponseTimeMs || 0, // Exact total time in milliseconds
        isUser: true,
        questionPerformance: validQuestionPerf,
      };
      
      // Combine user and AI players
      const allPlayers = [userPlayer, ...opponents];
      
      // Calculate ranks and prize distribution
      const prizePool = this.contest?.prizePool || 900; // Default to 900 if not provided
      let playersWithPrizes = [];
      try {
        playersWithPrizes = generateRankAndPrizes(allPlayers, prizePool);
      } catch (error) {
        console.error('Error calculating ranks and prizes:', error);
        // Create a basic ranking if generation fails
        playersWithPrizes = allPlayers.sort((a, b) => b.score - a.score)
          .map((player, index) => ({
            ...player,
            rank: index + 1,
            prize: index === 0 ? prizePool * 0.5 : index < 3 ? prizePool * 0.2 : 0
          }));
      }
      
      // Find user rank and earned amount
      const userResult = playersWithPrizes.find(p => p.isUser);
      if (userResult) {
        // Add calculated values to game state for UI access
        (this.gameState as any).userRank = userResult.rank;
        (this.gameState as any).earnedAmount = userResult.prize;
      } else {
        // Provide defaults if user result not found
        (this.gameState as any).userRank = playersWithPrizes.length;
        (this.gameState as any).earnedAmount = 0;
      }
      
      // Notify state change
      this.notifyStateChange();
      
      // Call completion callback
      if (this.onGameComplete) {
        this.onGameComplete(this.gameState, playersWithPrizes);
      }
    } catch (error) {
      // Handle any unexpected errors in the endGame method
      console.error('Critical error in endGame method:', error);
      
      // Force game completed state
      this.gameState.gameCompleted = true;
      
      // Create minimal valid game state for UI
      (this.gameState as any).userRank = 1;
      (this.gameState as any).earnedAmount = 0;
      
      // Notify state change
      this.notifyStateChange();
      
      // Try to call completion callback with minimal data
      if (this.onGameComplete) {
        try {
          this.onGameComplete(this.gameState, [{
            id: 0,
            name: 'You',
            score: this.gameState.totalScore || 0,
            correctAnswers: 0,
            totalTimeSpent: 0,
            avgTime: '0.0s',
            avgTimeMs: 0,
            totalResponseTimeMs: 0,
            isUser: true,
            rank: 1,
            prize: 0,
            questionPerformance: []
          }]);
        } catch (callbackError) {
          console.error('Error in onGameComplete callback:', callbackError);
        }
      }
    }
  }
  
  /**
   * Preload sound effects
   */
  private async preloadSounds(): Promise<void> {
    if (!this.soundEnabled) return;
    
    try {
      // Load and cache all game sounds
      // Note: During development, we'll handle gracefully if sound files don't exist yet
      const sounds = [
        { key: GameSound.CORRECT_ANSWER, file: null },
        { key: GameSound.WRONG_ANSWER, file: null },
        { key: GameSound.GAME_COMPLETE, file: null },
        { key: GameSound.COUNTDOWN, file: null },
        { key: GameSound.TICK, file: null },
        { key: GameSound.ACHIEVEMENT, file: null }
      ];
      
      // Load each sound (only if available)
      for (const sound of sounds) {
        try {
          if (sound.file) {
            const { sound: soundObject } = await Audio.Sound.createAsync(sound.file);
            this.soundObjects.set(sound.key, soundObject);
          }
        } catch (error) {
          console.warn(`Sound ${sound.key} could not be loaded, continuing without sound.`);
        }
      }
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }
  
  /**
   * Play a sound effect
   */
  private async playSound(sound: GameSound): Promise<void> {
    if (!this.soundEnabled) return;
    
    try {
      const soundObject = this.soundObjects.get(sound);
      if (soundObject) {
        // Reset sound to beginning
        await soundObject.setPositionAsync(0);
        await soundObject.playAsync();
      }
    } catch (error) {
      // Silently fail if sound can't be played
      console.warn(`Error playing sound ${sound}, continuing without sound.`);
    }
  }
  
  /**
   * Trigger animation
   */
  private triggerAnimation(type: GameAnimation, data?: any): void {
    if (this.onAnimation) {
      this.onAnimation(type, data);
    }
  }
  
  /**
   * Notify state change to callback
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.gameState });
    }
  }
  
  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    if (this.questionTimeout) {
      clearTimeout(this.questionTimeout);
      this.questionTimeout = null;
    }
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
  
  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    // Clear timers
    this.clearTimers();
    
    // Unload sounds
    for (const sound of this.soundObjects.values()) {
      await sound.unloadAsync();
    }
    this.soundObjects.clear();
  }
  
  /**
   * Get current game state (readonly copy)
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }
  
  /**
   * Start the game - explicitly start the first question
   */
  start(): void {
    console.log('🎮 GameEngine: Start method called.');
    
    // Prevent starting if already started or no questions
    if (this.gameState.gameStarted || this.questions.length === 0) {
      if(this.gameState.gameStarted) console.log('🎮 GameEngine: Game already started, ignoring start call.');
      if(this.questions.length === 0) console.error('🎮 GameEngine: Cannot start game - no questions available.');
      return;
    }
    
    // Clear any existing timers to prevent race conditions
    this.clearTimers();
    
    // Reset game state to initial values
    this.resetGameState();
    
    // Mark game as started
    this.gameState.gameStarted = true;
    this.gameState.gameStartTime = Date.now();
    
    console.log('🎮 GameEngine: Game state reset for starting.');
    
    // Notify state change once AFTER resetting state
    this.notifyStateChange(); 
    
    // Use a small delay before starting the first question to ensure UI is ready
    setTimeout(() => {
      console.log('🎮 GameEngine: Starting first question...');
      this.startQuestion();
    }, 100);
  }

  /**
   * Shuffle an array (for randomizing questions)
   * @param array Array to shuffle
   * @returns Shuffled array
   */
  private shuffleArray<T>(array: T[]): T[] {
    if (!array || !Array.isArray(array)) {
      console.warn('Invalid array passed to shuffleArray');
      return [];
    }
    
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Generate random index
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Export singleton instance
export default GameEngine.getInstance(); 