export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  timeLimit?: number;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: 'en' | 'hi';
}

export interface GamePlayer {
  id: string;
  name: string;
  score: number;
  avatar?: string;
  isUser?: boolean;
  rank?: number;
  prize?: number;
}

export interface GameConfig {
  timePerQuestion: number;
  questions: Question[];
  players: GamePlayer[];
  maxPlayers?: number;
  allowSkip?: boolean;
  showExplanations?: boolean;
} 