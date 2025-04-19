/**
 * GameLogic.ts
 * 
 * This file contains core game logic utilities for the Quizzoo app.
 * It includes functions for scoring, timing, achievements, and other game mechanics.
 */

import { Question } from './QuestionTranslation';

// Define score multipliers based on difficulty and time
const TIME_MULTIPLIERS = {
  VERY_FAST: 1.5,  // Less than 2 seconds
  FAST: 1.25,      // 2-3 seconds
  NORMAL: 1.0,     // 3-4 seconds
  SLOW: 0.8,       // 4-5 seconds
  VERY_SLOW: 0.6   // More than 5 seconds
};

const DIFFICULTY_MULTIPLIERS = {
  EASY: 0.8,
  MEDIUM: 1.0,
  HARD: 1.5,
  EXPERT: 2.0
};

const STREAK_BONUSES = {
  // Additional multipliers for consecutive correct answers - disabled as per user request
  3: 1.0,  // No bonus (previously 10%)
  5: 1.0,  // No bonus (previously 20%)
  7: 1.0,  // No bonus (previously 30%)
  10: 1.0  // No bonus (previously 50%)
};

// Achievement thresholds
export const ACHIEVEMENTS = {
  PERFECT_SCORE: 'Perfect Score',
  SPEED_DEMON: 'Speed Demon',
  COMEBACK_KID: 'Comeback Kid',
  CONSISTENCY_KING: 'Consistency King',
  LAST_SECOND_HERO: 'Last Second Hero'
};

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuestionPerformance {
  timeSpent: number;
  timePerQuestion: number;
  difficulty: QuestionDifficulty;
  isCorrect: boolean;
}

export interface Player {
  id: string;
  score: number;
  rank?: number;
  name: string;
  totalResponseTimeMs: number;
  totalTimeSpent: number;
}

// Add TIME_PER_QUESTION constant
export const TIME_PER_QUESTION = 30000; // 30 seconds in milliseconds

/**
 * Calculate time-based multiplier for scoring
 * @param timeSpent Time spent answering in milliseconds
 * @param timePerQuestion Total time allowed per question
 * @returns Time multiplier for scoring
 */
export const getTimeMultiplier = (timeSpent: number, timePerQuestion: number): number => {
  const timeRatio = timeSpent / timePerQuestion;
  
  if (timeRatio < 0.33) return TIME_MULTIPLIERS.VERY_FAST;
  if (timeRatio < 0.5) return TIME_MULTIPLIERS.FAST;
  if (timeRatio < 0.67) return TIME_MULTIPLIERS.NORMAL;
  if (timeRatio < 0.83) return TIME_MULTIPLIERS.SLOW;
  return TIME_MULTIPLIERS.VERY_SLOW;
};

/**
 * Calculate points for a question based on time spent and difficulty
 * @param timeSpent Time spent answering in milliseconds
 * @param difficulty Question difficulty (default: MEDIUM)
 * @param isCorrect Boolean indicating if the answer is correct
 * @returns Points earned for this question
 */
export const calculateQuestionPoints = (
  timeSpent: number,
  difficulty: QuestionDifficulty,
  isCorrect: boolean
): number => {
  if (!isCorrect) return 0;
  
  // Base score of 100 points for correct answers
  const baseScore = 100;
  
  // Time bonus: Faster answers get more points (up to 50 bonus points)
  // For 6-second questions: 
  // 0-2s: 50 bonus points
  // 2-4s: 25 bonus points
  // 4-6s: 10 bonus points
  let timeBonus = 0;
  if (timeSpent <= 2000) timeBonus = 50;
  else if (timeSpent <= 4000) timeBonus = 25;
  else timeBonus = 10;
  
  // Apply difficulty multiplier
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  
  // Calculate final score
  return Math.round((baseScore + timeBonus) * difficultyMultiplier);
};

/**
 * Calculate total score for the game with improved accuracy
 * @param questionPerformance Array of performance data for each question
 * @returns Total score for the game
 */
export const calculateTotalScore = (questionPerformance: QuestionPerformance[]): number => {
  return questionPerformance.reduce((total, current) => {
    const points = calculateQuestionPoints(
      current.timeSpent,
      current.difficulty,
      current.isCorrect
    );
    return total + points;
  }, 0);
};

/**
 * Generate rank and prize distribution with accurate timing
 * @param allPlayers Array of all players with their scores
 * @param prizePool Total prize pool
 * @returns Updated array with rank and prize information
 */
export const generateRankAndPrizes = (allPlayers: Player[], prizePool: number): Player[] => {
  if (!allPlayers?.length) return [];

  // Sort players by score first, then by time for tiebreakers
  const sortedPlayers = [...allPlayers].sort((a: Player, b: Player) => {
    // First compare by score (higher is better)
    if (b.score !== a.score) return b.score - a.score;
    
    // If scores are tied, compare by time (lower is better)
    const aTime = a.totalResponseTimeMs || a.totalTimeSpent || 0;
    const bTime = b.totalResponseTimeMs || b.totalTimeSpent || 0;
    return aTime - bTime;
  });

  // Prize distribution (50/30/20)
  const prizeDistribution = [0.5, 0.3, 0.2];
  
  // Assign ranks and prizes
  return sortedPlayers.map((player, index) => {
    const rank = index + 1;
    const prizeShare = rank <= 3 ? prizeDistribution[index] : 0;
    const prize = Math.round(prizePool * prizeShare);

    return {
      ...player,
      rank,
      prize,
      score: player.score || 0 // Ensure score is never undefined
    };
  });
};

/**
 * Detect achievements unlocked during the game
 * @param questionPerformance Array of performance data for each question
 * @param totalScore Total score achieved
 * @param totalQuestions Total number of questions in the game
 * @returns Array of unlocked achievements
 */
export const detectAchievements = (
  questionPerformance: any[], 
  totalScore: number,
  totalQuestions: number = 10
): string[] => {
  // Initialize achievement array and validate input
  const achievements: string[] = [];
  
  // Safety check - if questionPerformance is not a valid array, return empty array
  if (!questionPerformance || !Array.isArray(questionPerformance) || questionPerformance.length === 0) {
    console.log('Warning: questionPerformance was invalid in detectAchievements');
    return achievements;
  }
  
  // Count correct answers (with null check)
  const correctAnswers = questionPerformance.filter(q => q && q.isCorrect).length;
  
  // Check for perfect score
  if (correctAnswers === totalQuestions) {
    achievements.push(ACHIEVEMENTS.PERFECT_SCORE);
  }
  
  // Check for speed demon (all correct answers in less than half the allowed time)
  const fastAnswers = questionPerformance.filter(q => 
    q && q.isCorrect && q.timeSpent < (q.timeAllowed || 6000) / 2
  ).length;
  
  if (fastAnswers >= totalQuestions * 0.8) {
    achievements.push(ACHIEVEMENTS.SPEED_DEMON);
  }
  
  // Check for comeback kid (started with 2+ wrong, finished with 3+ correct)
  const firstHalf = questionPerformance.slice(0, Math.floor(totalQuestions / 2));
  const secondHalf = questionPerformance.slice(Math.floor(totalQuestions / 2));
  
  const firstHalfWrong = firstHalf.filter(q => q && !q.isCorrect).length;
  const secondHalfCorrect = secondHalf.filter(q => q && q.isCorrect).length;
  
  if (firstHalfWrong >= 2 && secondHalfCorrect >= 3) {
    achievements.push(ACHIEVEMENTS.COMEBACK_KID);
  }
  
  // Check for consistency king (no more than 2 second difference between fastest and slowest correct answer)
  const correctTimings = questionPerformance
    .filter(q => q && q.isCorrect)
    .map(q => q.timeSpent)
    .filter(timing => timing !== undefined && timing !== null);
  
  if (correctTimings.length > 0) {
    const fastest = Math.min(...correctTimings);
    const slowest = Math.max(...correctTimings);
    
    if (slowest - fastest <= 2000) {
      achievements.push(ACHIEVEMENTS.CONSISTENCY_KING);
    }
  }
  
  // Check for last second hero (at least 3 correct answers with less than 1 second remaining)
  const lastSecondCorrect = questionPerformance.filter(q => 
    q && q.isCorrect && (q.timeAllowed || 6000) - q.timeSpent < 1000
  ).length;
  
  if (lastSecondCorrect >= 3) {
    achievements.push(ACHIEVEMENTS.LAST_SECOND_HERO);
  }
  
  return achievements;
};

/**
 * Generate AI opponent scores that are challenging but beatable
 * @param userScore User's score to base AI difficulty on
 * @param totalPlayers Number of AI opponents to generate
 * @param maxScore Maximum possible score in the game
 * @returns Array of AI players with realistic scores
 */
export const generateRealisticOpponents = (
  userScore: number, 
  totalPlayers: number = 9,
  maxScore: number = 1000
): any[] => {
  // Names for AI players
  const playerNames = [
    'Rajesh', 'Priya', 'Amit', 'Neha', 'Vikram', 'Anjali', 'Rahul', 
    'Sneha', 'Arjun', 'Pooja', 'Karan', 'Meera', 'Deepak', 'Ritu'
  ];
  
  // Make scores challenging but beatable
  // Some better, some worse than the user
  const opponents = [];
  
  // Score distribution: 1/3 better than user, 2/3 worse than user
  const betterPlayerCount = Math.floor(totalPlayers / 3);
  
  for (let i = 0; i < totalPlayers; i++) {
    const isBetterPlayer = i < betterPlayerCount;
    
    // Better players get scores 0-15% above user
    // Worse players get scores 5-30% below user
    const scoreVariation = isBetterPlayer 
      ? Math.random() * 0.15 + 0.01 // 1-15% better
      : -(Math.random() * 0.25 + 0.05); // 5-30% worse
      
    let score = Math.round(userScore * (1 + scoreVariation));
    
    // Make sure score is within valid range
    score = Math.max(Math.min(score, maxScore), Math.round(maxScore * 0.2));
    
    // Calculate other stats based on score
    const correctAnswers = Math.min(10, Math.floor(score / 100) + Math.floor(Math.random() * 3));
    const avgTimeRaw = 3 + Math.random() * 2; // 3-5 seconds average
    const totalTimeSpent = avgTimeRaw * 10;
    
    opponents.push({
      id: i + 1,
      name: playerNames[Math.floor(Math.random() * playerNames.length)],
      score,
      correctAnswers,
      avgTime: `${avgTimeRaw.toFixed(1)}s`,
      totalTimeSpent,
      isUser: false
    });
  }
  
  return opponents;
};

export const calculateRank = (player: Player, index: number): number => {
  return index + 1;
};

// Export all game logic functions as default
export default {
  calculateQuestionPoints,
  calculateTotalScore,
  getTimeMultiplier,
  generateRankAndPrizes,
  detectAchievements,
  generateRealisticOpponents
}; 