import { Question, GamePlayer, GameConfig } from '@/types/quiz';
import { GameState, GameAnimation } from './GameTypes';

interface GameEngineConfig {
  questions: Question[];
  players: GamePlayer[];
  config: GameConfig;
  onStateChange: (state: GameState) => void;
  onGameComplete: (state: GameState, players: GamePlayer[]) => void;
  onAnimation: (type: GameAnimation, data?: any) => void;
}

export class GameEngine {
  private static instance: GameEngine | null = null;
  private questions: Question[];
  private players: GamePlayer[];
  private config: GameConfig;
  private onStateChange: (state: GameState) => void;
  private onGameComplete: (state: GameState, players: GamePlayer[]) => void;
  private onAnimation: (type: GameAnimation, data?: any) => void;
  private currentState: GameState;
  private isRunning: boolean;
  private timer: NodeJS.Timeout | null;

  private constructor() {
    this.questions = [];
    this.players = [];
    this.config = {
      timePerQuestion: 15000,
      questions: [],
      players: [],
    };
    this.onStateChange = () => {};
    this.onGameComplete = () => {};
    this.onAnimation = () => {};
    this.currentState = {
      currentQuestionIndex: 0,
      timeLeft: 0,
      phase: 'waiting',
      score: 0,
    };
    this.isRunning = false;
    this.timer = null;
  }

  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  public initialize(config: GameEngineConfig): void {
    this.questions = config.questions;
    this.players = config.players;
    this.config = config.config;
    this.onStateChange = config.onStateChange;
    this.onGameComplete = config.onGameComplete;
    this.onAnimation = config.onAnimation;
    this.currentState = {
      currentQuestionIndex: 0,
      timeLeft: this.config.timePerQuestion,
      phase: 'waiting',
      score: 0,
    };
  }

  public startGame(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.currentState.phase = 'playing';
    this.startTimer();
    this.onStateChange(this.currentState);
  }

  public stopGame(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.currentState.phase = 'completed';
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.onStateChange(this.currentState);
    this.onGameComplete(this.currentState, this.players);
  }

  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.currentState.timeLeft = this.config.timePerQuestion;
    this.onStateChange(this.currentState);

    this.timer = setInterval(() => {
      this.currentState.timeLeft -= 100;
      this.onStateChange(this.currentState);

      if (this.currentState.timeLeft <= 0) {
        this.handleTimeUp();
      }
    }, 100);
  }

  private handleTimeUp(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.onAnimation(GameAnimation.QUESTION_TIMEOUT);
    
    setTimeout(() => {
      this.moveToNextQuestion();
    }, 2000);
  }

  private moveToNextQuestion(): void {
    if (this.currentState.currentQuestionIndex >= this.questions.length - 1) {
      this.stopGame();
      return;
    }

    this.currentState.currentQuestionIndex++;
    this.startTimer();
    this.onAnimation(GameAnimation.QUESTION_APPEAR);
  }

  public selectAnswer(playerId: string, answerIndex: number): void {
    if (!this.isRunning) return;
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    const currentQuestion = this.questions[this.currentState.currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    if (isCorrect) {
      player.score += 1;
      this.currentState.score = player.score;
      this.onAnimation(GameAnimation.ANSWER_CORRECT);
    } else {
      this.onAnimation(GameAnimation.ANSWER_WRONG);
    }

    setTimeout(() => {
      this.moveToNextQuestion();
    }, 2000);
  }
} 