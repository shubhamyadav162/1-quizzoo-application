/**
 * ContestTypes.ts
 * 
 * Type definitions for contest pools and related entities for Quizzoo app
 */

/**
 * Contest pool definition
 */
export interface ContestPoolType {
  id: string;                  // Unique identifier for the pool
  name: string;                // Display name of the contest pool
  entryFee: number;            // Entry fee in INR (₹)
  playerCount: number;         // Number of players that can join
  totalPool: number;           // Total prize pool (entry fee * player count)
  platformFee: number;         // Platform fee (10% of total pool)
  netPrizePool: number;        // Prize pool after platform fee
  firstPlaceReward: number;    // Prize for 1st place (50% of net prize pool for standard contests)
  secondPlaceReward: number;   // Prize for 2nd place (30% of net prize pool for standard contests)
  thirdPlaceReward: number;    // Prize for 3rd place (20% of net prize pool for standard contests)
  category: string;            // Category of the contest (standard, medium, large, duel, special)
  description: string;         // Description of the contest
  questionCount: number;       // Number of questions in the contest
  timePerQuestionSec: number;  // Time allowed per question in seconds
  isInstant?: boolean;         // Whether this is an instant-play contest
  image?: string;              // Optional image/icon URL for the contest
}

/**
 * Contest state in database
 */
export interface ContestState {
  id: string;
  name: string;
  entry_fee: number;
  max_participants: number;
  current_participants: number;
  total_prize_pool: number;
  platform_fee_percentage: number;
  net_prize_pool: number;
  status: ContestStatus;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
  is_private: boolean;
  private_code?: string;
  created_by?: string;
  is_instant?: boolean;
  contest_type?: string;
  category?: string;
}

/**
 * Contest status options
 */
export type ContestStatus = 
  | 'upcoming'     // Contest is scheduled but not yet started
  | 'filling'      // Contest is accepting participants
  | 'active'       // Contest is currently in progress
  | 'completed'    // Contest has ended and results are available
  | 'cancelled';   // Contest was cancelled

/**
 * Contest participation record
 */
export interface ContestParticipation {
  id: string;
  contest_id: string;
  user_id: string;
  joined_at: string;
  status: ParticipationStatus;
  final_score?: number;
  rank?: number;
  prize_amount?: number;
}

/**
 * Participation status options
 */
export type ParticipationStatus = 
  | 'joined'       // Player has joined but contest hasn't started
  | 'playing'      // Player is actively playing
  | 'completed'    // Player has completed the contest
  | 'abandoned';   // Player abandoned the contest

/**
 * Contest result record
 */
export interface ContestResult {
  contest_id: string;
  user_id: string;
  rank: number;
  score: number;
  correct_answers: number;
  total_time_ms: number;
  prize_amount: number;
  achievements?: string[];
}

/**
 * User response to a question during a contest
 */
export interface UserResponse {
  participation_id: string;
  question_id: string;
  selected_answer_index: number;
  is_correct: boolean;
  response_time_ms: number;
  points_earned: number;
} 