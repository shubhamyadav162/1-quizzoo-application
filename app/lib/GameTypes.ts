/**
 * GameTypes.ts
 * 
 * Type definitions for game data in Quizzoo app
 */

/**
 * Performance data for a single question
 */
export interface QuestionPerformance {
  questionNumber: number;
  timeSpent: number;
  timeAllowed?: number;
  isCorrect: boolean;
  pointsEarned: number;
  difficulty?: string;
  streakAtThisPoint?: number;
  responseTimeMs?: number; // Exact response time in milliseconds for tie-breaking
}

/**
 * Player data with performance metrics
 */
export interface PlayerPerformance {
  id: number;
  name: string;
  score: number;
  correctAnswers: number;
  totalTimeSpent: number;
  avgTime: string;
  avgTimeMs?: number; // Average response time in milliseconds for tie-breaking
  totalResponseTimeMs?: number; // Total response time in milliseconds
  isUser?: boolean;
  questionPerformance: QuestionPerformance[];
  earnedAmount?: number;
  rank?: number; // Player's rank in the leaderboard
  prize?: number; // Prize amount won by the player
}

/**
 * Contest information
 */
export interface Contest {
  id: string;
  name: string;
  entryFee: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  category: string;
  tier: 'Low-Stake' | 'Medium-Stake' | 'High-Stake';
}

/**
 * Game state for the current quiz session
 */
export interface GameState {
  currentQuestionIndex: number;
  selectedOption: number | null;
  totalScore: number;
  timeLeft: number;
  questionAnswered: boolean;
  showEmoji: boolean;
  emojiType: string;
  showCorrectAnswer: boolean;
  showFeedback: boolean;
  feedbackText: string;
  gameCompleted: boolean;
  answers: {
    questionIndex: number;
    selectedOption: number | null;
    correct: boolean;
    timeSpent: number;
    responseTimeMs: number;
  }[];
  questionPerformance: QuestionPerformance[];
  totalTimeSpent: number;
  totalResponseTimeMs: number;
  nextQuestionCountdown: number | null;
  currentStreak: number;
  achievements: Achievement[];
  gameStartTime: number | null;
  gameStarted: boolean;
  _handlingQuestionComplete?: boolean;
  questionStartTime?: number | null;
  questionEndTime?: number | null; // Add timestamp for when question ended
}

/**
 * Achievement type
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points?: number;
}

/**
 * Sound options for game feedback
 */
export enum GameSound {
  CORRECT_ANSWER = 'correctAnswer',
  WRONG_ANSWER = 'wrongAnswer',
  COUNTDOWN = 'countdown',
  LEVEL_UP = 'levelUp',
  GAME_COMPLETE = 'gameComplete',
  ACHIEVEMENT = 'achievement',
  TICK = 'tick'
}

/**
 * Animation types for visual feedback
 */
export enum GameAnimation {
  CORRECT = 'correct',
  WRONG = 'wrong',
  TIMEOUT = 'timeout',
  LEVEL_UP = 'levelUp',
  GAME_COMPLETE = 'gameComplete',
  ACHIEVEMENT = 'achievement'
}

/**
 * Game difficulty settings
 */
export enum GameDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

/**
 * Game mode options
 */
export enum GameMode {
  STANDARD = 'standard',
  TIMED = 'timed',
  SURVIVAL = 'survival',
  PRACTICE = 'practice'
} 