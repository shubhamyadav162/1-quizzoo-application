export type GamePhase = 'waiting' | 'playing' | 'completed';

export interface GameState {
  currentQuestionIndex: number;
  timeLeft: number;
  phase: GamePhase;
  score: number;
  selectedOption?: number;
  questionAnswered?: boolean;
  showCorrectAnswer?: boolean;
  nextQuestionCountdown?: number | null;
  showFeedback?: boolean;
  feedbackText?: string;
  showEmoji?: boolean;
  emojiType?: 'correct' | 'wrong';
  totalScore?: number;
  totalTimeSpent?: number;
  answers?: number[];
  questionPerformance?: {
    questionId: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

export enum GameAnimation {
  QUESTION_APPEAR = 'question-appear',
  QUESTION_TIMEOUT = 'question-timeout',
  ANSWER_CORRECT = 'answer-correct',
  ANSWER_WRONG = 'answer-wrong',
  GAME_COMPLETE = 'game-complete'
} 