/**
 * ContestPoolDefinitions.ts
 * 
 * This file defines all the contest pools available in the Quizzoo app.
 * Each pool has specific entry fees, player counts, and prize distributions.
 */

import { ContestPoolType } from './types/ContestTypes';

// Define pool types
export type PoolCategory = 
  | 'standard'    // Standard 10-player contests
  | 'medium'      // 20-player contests
  | 'large'       // 50-player contests
  | 'duel'        // 1v1 head-to-head contests
  | 'special';    // Special format contests

// Pool category configurations
export interface PoolCategoryConfig {
  displayName: string;
  description: string;
  icon: string;
  playerCount: number;
  winnerCount: number;
}

export const POOL_CATEGORIES: Record<PoolCategory, PoolCategoryConfig> = {
  standard: {
    displayName: 'Standard',
    description: '10-player contests with balanced competition',
    icon: 'people-outline',
    playerCount: 10,
    winnerCount: 3
  },
  medium: {
    displayName: 'Pro',
    description: '20-player contests with higher stakes',
    icon: 'trending-up',
    playerCount: 20,
    winnerCount: 3
  },
  large: {
    displayName: 'Royal',
    description: '50-player large tournaments with massive prizes',
    icon: 'trophy-outline',
    playerCount: 50,
    winnerCount: 3
  },
  duel: {
    displayName: 'Duel',
    description: 'Head-to-head 1v1 direct competition',
    icon: 'flash-outline',
    playerCount: 2,
    winnerCount: 1
  },
  special: {
    displayName: 'Special',
    description: 'Unique contest formats with special rules',
    icon: 'star-outline',
    playerCount: 10,
    winnerCount: 3
  }
};

// Define all contest pools based on the specification
export const CONTEST_POOLS: ContestPoolType[] = [
  // Standard tier contests (10 players)
  {
    id: 'S1',
    name: 'Starter Quiz',
    entryFee: 10,
    playerCount: 10,
    totalPool: 100,
    platformFee: 10,
    netPrizePool: 90,
    firstPlaceReward: 45,
    secondPlaceReward: 27,
    thirdPlaceReward: 18,
    category: 'standard',
    description: 'Entry-level option for beginners',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'S2',
    name: 'Basic Quiz',
    entryFee: 25,
    playerCount: 10,
    totalPool: 250,
    platformFee: 25,
    netPrizePool: 225,
    firstPlaceReward: 112.5,
    secondPlaceReward: 67.5,
    thirdPlaceReward: 45,
    category: 'standard',
    description: 'Affordable tier with better rewards',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'S3',
    name: 'Regular Quiz',
    entryFee: 50,
    playerCount: 10,
    totalPool: 500,
    platformFee: 50,
    netPrizePool: 450,
    firstPlaceReward: 225,
    secondPlaceReward: 135,
    thirdPlaceReward: 90,
    category: 'standard',
    description: 'Mid-range option for casual players',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'S4',
    name: 'Premium Quiz',
    entryFee: 100,
    playerCount: 10,
    totalPool: 1000,
    platformFee: 100,
    netPrizePool: 900,
    firstPlaceReward: 450,
    secondPlaceReward: 270,
    thirdPlaceReward: 180,
    category: 'standard',
    description: 'Higher stakes with significant rewards',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'S5',
    name: 'Advanced Quiz',
    entryFee: 250,
    playerCount: 10,
    totalPool: 2500,
    platformFee: 250,
    netPrizePool: 2250,
    firstPlaceReward: 1125,
    secondPlaceReward: 675,
    thirdPlaceReward: 450,
    category: 'standard',
    description: 'Premium tier for serious players',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'S6',
    name: 'Expert Quiz',
    entryFee: 500,
    playerCount: 10,
    totalPool: 5000,
    platformFee: 500,
    netPrizePool: 4500,
    firstPlaceReward: 2250,
    secondPlaceReward: 1350,
    thirdPlaceReward: 900,
    category: 'standard',
    description: 'High-stake pool with major returns',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'S7',
    name: 'Master Quiz',
    entryFee: 1000,
    playerCount: 10,
    totalPool: 10000,
    platformFee: 1000,
    netPrizePool: 9000,
    firstPlaceReward: 4500,
    secondPlaceReward: 2700,
    thirdPlaceReward: 1800,
    category: 'standard',
    description: 'Top-tier contest with massive prizes',
    questionCount: 10,
    timePerQuestionSec: 6
  },

  // Medium player count contests (20 players)
  {
    id: 'M1',
    name: 'Pro Starter',
    entryFee: 10,
    playerCount: 20,
    totalPool: 200,
    platformFee: 20,
    netPrizePool: 180,
    firstPlaceReward: 90,
    secondPlaceReward: 54,
    thirdPlaceReward: 36,
    category: 'medium',
    description: 'Low-risk entry with decent returns',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'M2',
    name: 'Pro Basic',
    entryFee: 25,
    playerCount: 20,
    totalPool: 500,
    platformFee: 50,
    netPrizePool: 450,
    firstPlaceReward: 225,
    secondPlaceReward: 135,
    thirdPlaceReward: 90,
    category: 'medium',
    description: 'Affordable with significant potential',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'M3',
    name: 'Pro Regular',
    entryFee: 50,
    playerCount: 20,
    totalPool: 1000,
    platformFee: 100,
    netPrizePool: 900,
    firstPlaceReward: 450,
    secondPlaceReward: 270,
    thirdPlaceReward: 180,
    category: 'medium',
    description: '9x return potential on 1st place',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'M4',
    name: 'Pro Premium',
    entryFee: 100,
    playerCount: 20,
    totalPool: 2000,
    platformFee: 200,
    netPrizePool: 1800,
    firstPlaceReward: 900,
    secondPlaceReward: 540,
    thirdPlaceReward: 360,
    category: 'medium',
    description: 'Higher stakes with larger group',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'M5',
    name: 'Pro Advanced',
    entryFee: 250,
    playerCount: 20,
    totalPool: 5000,
    platformFee: 500,
    netPrizePool: 4500,
    firstPlaceReward: 2250,
    secondPlaceReward: 1350,
    thirdPlaceReward: 900,
    category: 'medium',
    description: 'Premium tier with substantial rewards',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'M6',
    name: 'Pro Expert',
    entryFee: 500,
    playerCount: 20,
    totalPool: 10000,
    platformFee: 1000,
    netPrizePool: 9000,
    firstPlaceReward: 4500,
    secondPlaceReward: 2700,
    thirdPlaceReward: 1800,
    category: 'medium',
    description: '9x return potential for winners',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'M7',
    name: 'Pro Master',
    entryFee: 1000,
    playerCount: 20,
    totalPool: 20000,
    platformFee: 2000,
    netPrizePool: 18000,
    firstPlaceReward: 9000,
    secondPlaceReward: 5400,
    thirdPlaceReward: 3600,
    category: 'medium',
    description: 'High-roller option with massive prizes',
    questionCount: 10,
    timePerQuestionSec: 6
  },

  // Large player count contests (50 players)
  {
    id: 'L1',
    name: 'Royal Starter',
    entryFee: 10,
    playerCount: 50,
    totalPool: 500,
    platformFee: 50,
    netPrizePool: 450,
    firstPlaceReward: 225,
    secondPlaceReward: 135,
    thirdPlaceReward: 90,
    category: 'large',
    description: '22.5x return potential on small entry',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'L2',
    name: 'Royal Basic',
    entryFee: 25,
    playerCount: 50,
    totalPool: 1250,
    platformFee: 125,
    netPrizePool: 1125,
    firstPlaceReward: 562.5,
    secondPlaceReward: 337.5,
    thirdPlaceReward: 225,
    category: 'large',
    description: 'Low risk with high reward potential',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'L3',
    name: 'Royal Regular',
    entryFee: 50,
    playerCount: 50,
    totalPool: 2500,
    platformFee: 250,
    netPrizePool: 2250,
    firstPlaceReward: 1125,
    secondPlaceReward: 675,
    thirdPlaceReward: 450,
    category: 'large',
    description: '22.5x return on moderate investment',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'L4',
    name: 'Royal Premium',
    entryFee: 100,
    playerCount: 50,
    totalPool: 5000,
    platformFee: 500,
    netPrizePool: 4500,
    firstPlaceReward: 2250,
    secondPlaceReward: 1350,
    thirdPlaceReward: 900,
    category: 'large',
    description: 'Higher stakes with larger community',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'L5',
    name: 'Royal Advanced',
    entryFee: 250,
    playerCount: 50,
    totalPool: 12500,
    platformFee: 1250,
    netPrizePool: 11250,
    firstPlaceReward: 5625,
    secondPlaceReward: 3375,
    thirdPlaceReward: 2250,
    category: 'large',
    description: 'Premium large-group experience',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'L6',
    name: 'Royal Expert',
    entryFee: 500,
    playerCount: 50,
    totalPool: 25000,
    platformFee: 2500,
    netPrizePool: 22500,
    firstPlaceReward: 11250,
    secondPlaceReward: 6750,
    thirdPlaceReward: 4500,
    category: 'large',
    description: 'Major prize potential (22.5x return)',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'L7',
    name: 'Royal Master',
    entryFee: 1000,
    playerCount: 50,
    totalPool: 50000,
    platformFee: 5000,
    netPrizePool: 45000,
    firstPlaceReward: 22500,
    secondPlaceReward: 13500,
    thirdPlaceReward: 9000,
    category: 'large',
    description: 'Flagship contest with maximum prizes',
    questionCount: 10,
    timePerQuestionSec: 6
  },

  // Duel contests (1v1)
  {
    id: 'D1',
    name: 'Duel Starter',
    entryFee: 10,
    playerCount: 2,
    totalPool: 20,
    platformFee: 2,
    netPrizePool: 18,
    firstPlaceReward: 18,
    secondPlaceReward: 0,
    thirdPlaceReward: 0,
    category: 'duel',
    description: 'Low-risk head-to-head challenge',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'D2',
    name: 'Duel Basic',
    entryFee: 25,
    playerCount: 2,
    totalPool: 50,
    platformFee: 5,
    netPrizePool: 45,
    firstPlaceReward: 45,
    secondPlaceReward: 0,
    thirdPlaceReward: 0,
    category: 'duel',
    description: 'Better winning odds with modest stakes',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'D3',
    name: 'Duel Regular',
    entryFee: 50,
    playerCount: 2,
    totalPool: 100,
    platformFee: 10,
    netPrizePool: 90,
    firstPlaceReward: 90,
    secondPlaceReward: 0,
    thirdPlaceReward: 0,
    category: 'duel',
    description: 'Direct competition with meaningful prizes',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'D4',
    name: 'Duel Premium',
    entryFee: 100,
    playerCount: 2,
    totalPool: 200,
    platformFee: 20,
    netPrizePool: 180,
    firstPlaceReward: 180,
    secondPlaceReward: 0,
    thirdPlaceReward: 0,
    category: 'duel',
    description: 'Higher stakes 1v1 with better payouts',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'D5',
    name: 'Duel Advanced',
    entryFee: 250,
    playerCount: 2,
    totalPool: 500,
    platformFee: 50,
    netPrizePool: 450,
    firstPlaceReward: 450,
    secondPlaceReward: 0,
    thirdPlaceReward: 0,
    category: 'duel',
    description: 'Premium duel for serious competitors',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'D6',
    name: 'Duel Expert',
    entryFee: 500,
    playerCount: 2,
    totalPool: 1000,
    platformFee: 100,
    netPrizePool: 900,
    firstPlaceReward: 900,
    secondPlaceReward: 0,
    thirdPlaceReward: 0,
    category: 'duel',
    description: 'High-roller direct competition',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'D7',
    name: 'Duel Master',
    entryFee: 1000,
    playerCount: 2,
    totalPool: 2000,
    platformFee: 200,
    netPrizePool: 1800,
    firstPlaceReward: 1800,
    secondPlaceReward: 0,
    thirdPlaceReward: 0,
    category: 'duel',
    description: 'Ultimate duel with maximum stakes',
    questionCount: 10,
    timePerQuestionSec: 6
  },

  // Special format contests
  {
    id: 'SP1',
    name: 'Special Quick',
    entryFee: 15,
    playerCount: 10,
    totalPool: 150,
    platformFee: 15,
    netPrizePool: 135,
    firstPlaceReward: 67.5,
    secondPlaceReward: 40.5,
    thirdPlaceReward: 27,
    category: 'special',
    description: 'Entry-level special format',
    questionCount: 10,
    timePerQuestionSec: 6
  },
  {
    id: 'SP2',
    name: 'Special Pro',
    entryFee: 75,
    playerCount: 20,
    totalPool: 1500,
    platformFee: 150,
    netPrizePool: 1350,
    firstPlaceReward: 675,
    secondPlaceReward: 405,
    thirdPlaceReward: 270,
    category: 'special',
    description: 'Mid-level special competition',
    questionCount: 10,
    timePerQuestionSec: 6
  }
];

// Helper function to get pool by ID
export function getPoolById(poolId: string): ContestPoolType | undefined {
  return CONTEST_POOLS.find(pool => pool.id === poolId);
}

// Helper function to get pools by category
export function getPoolsByCategory(category: PoolCategory): ContestPoolType[] {
  return CONTEST_POOLS.filter(pool => pool.category === category);
}

// Helper function to filter pools by entry fee range
export function getPoolsByEntryFeeRange(minFee: number, maxFee: number): ContestPoolType[] {
  return CONTEST_POOLS.filter(pool => pool.entryFee >= minFee && pool.entryFee <= maxFee);
}

// Stake tier definitions
export type StakeTier = 'micro' | 'mid' | 'high';

export const STAKE_TIERS: Record<StakeTier, {min: number, max: number, label: string}> = {
  micro: { min: 10, max: 50, label: 'Micro Stakes (₹10-₹50)' },
  mid: { min: 51, max: 200, label: 'Mid Stakes (₹51-₹200)' },
  high: { min: 201, max: 1000, label: 'High Stakes (₹201-₹1000)' }
};

// Helper function to get pools by stake tier
export function getPoolsByStakeTier(tier: StakeTier): ContestPoolType[] {
  const { min, max } = STAKE_TIERS[tier];
  return getPoolsByEntryFeeRange(min, max);
} 