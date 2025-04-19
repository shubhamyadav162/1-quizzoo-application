import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerPerformance, QuestionPerformance } from './GameTypes';
import { supabase, updateProfile } from '../../lib/supabase';

// Storage keys
const GAME_HISTORY_KEY = 'QUIZZOO_GAME_HISTORY';
const USER_PROFILE_KEY = 'QUIZZOO_USER_PROFILE';
const USER_PRIVATE_CONTESTS_KEY = 'QUIZZOO_USER_PRIVATE_CONTESTS';
const USER_JOINED_CONTESTS_KEY = 'QUIZZOO_USER_JOINED_CONTESTS';
const WALLET_KEY = 'wallet';
const SEEN_QUESTIONS_KEY = 'seen-questions';

// Define the game history entry type
export interface GameHistoryEntry {
  id: string;
  date: string; // ISO string
  score: number;
  rank: number;
  totalQuestions: number;
  correctAnswers: number;
  earnings: number;
  avgResponseTime: number;
  questionPerformance: (QuestionPerformance & {
    selectedAnswerIndex?: number;
    questionId?: string;
  })[];
}

// Define the user profile type
export interface UserProfile {
  name: string;
  email?: string;
  profileImage?: string; // URI for the profile image
  totalGamesPlayed: number;
  totalEarnings: number;
  highestScore: number;
  achievements: string[];
}

// Define private contest types
export interface PrivateContestInfo {
  id: string;
  name: string;
  code: string;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  participants: number;
  status: 'waiting' | 'ongoing' | 'completed' | 'cancelled' | 'scheduled';
  scheduledTime?: string; // ISO string
  createdAt: string; // ISO string
  createdBy: string;
}

export interface JoinedContestInfo {
  contestId: string;
  contestName: string;
  code: string;
  entryFee: number;
  prizePool: number;
  joinedAt: string; // ISO string
  status: 'waiting' | 'ongoing' | 'completed' | 'cancelled' | 'scheduled';
  createdBy: string;
}

/**
 * Save game result to local storage
 */
export const saveGameResult = async (
  gameResultOrObject: PlayerPerformance | any,
  rank?: number,
  earnings?: number,
  totalQuestions?: number
): Promise<void> => {
  try {
    // Handle the case where a single object is passed
    if (typeof rank === 'undefined' && typeof earnings === 'undefined') {
      // Assume first parameter contains all the data
      const data = gameResultOrObject;
      
      // Create a unique ID for this game entry
      const gameId = data.id || `game_${Date.now()}`;
      
      // Format the game history entry
      const historyEntry: GameHistoryEntry = {
        id: gameId,
        date: data.date || new Date().toISOString(),
        score: data.score || 0,
        rank: data.rank || 1,
        totalQuestions: data.totalQuestions || 10,
        correctAnswers: data.correctAnswers || 0,
        earnings: data.earnedAmount || 0,
        avgResponseTime: data.avgTimeMs ? data.avgTimeMs / 1000 : 0,
        questionPerformance: data.questionPerformance || [],
      };
      
      // Get existing game history
      const existingHistoryJson = await AsyncStorage.getItem(GAME_HISTORY_KEY);
      const existingHistory: GameHistoryEntry[] = existingHistoryJson ? JSON.parse(existingHistoryJson) : [];
      
      // Add the new entry at the beginning of the array
      const updatedHistory = [historyEntry, ...existingHistory];
      
      // Save the updated history
      await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(updatedHistory));
      
      // Update user profile stats
      await updateUserProfileStats(historyEntry);
      
      // Save to Supabase if user is authenticated
      const session = await supabase.auth.getSession();
      if (session?.data?.session?.user?.id) {
        // Try to save to Supabase
        const supabaseGameId = await saveGameResultToSupabase(historyEntry);
        if (supabaseGameId) {
          console.log('Game saved to Supabase with ID:', supabaseGameId);
        }
      }
      
      console.log('Game result saved successfully');
      return;
    }
    
    // Original implementation for when all parameters are provided
    const gameResult = gameResultOrObject as PlayerPerformance;
    
    // Create a unique ID for this game entry
    const gameId = `game_${Date.now()}`;
    
    // Format the game history entry
    const historyEntry: GameHistoryEntry = {
      id: gameId,
      date: new Date().toISOString(),
      score: gameResult.score,
      rank: rank || 1,
      totalQuestions: totalQuestions || 10,
      correctAnswers: gameResult.correctAnswers,
      earnings: earnings || 0,
      avgResponseTime: parseFloat(gameResult.avgTime.replace('s', '')),
      questionPerformance: gameResult.questionPerformance || [],
    };
    
    // Get existing game history
    const existingHistoryJson = await AsyncStorage.getItem(GAME_HISTORY_KEY);
    const existingHistory: GameHistoryEntry[] = existingHistoryJson ? JSON.parse(existingHistoryJson) : [];
    
    // Add the new entry at the beginning of the array
    const updatedHistory = [historyEntry, ...existingHistory];
    
    // Save the updated history
    await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(updatedHistory));
    
    // Update user profile stats
    await updateUserProfileStats(historyEntry);
    
    // Save to Supabase if user is authenticated
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.user?.id) {
      // Try to save to Supabase
      const supabaseGameId = await saveGameResultToSupabase(historyEntry);
      if (supabaseGameId) {
        console.log('Game saved to Supabase with ID:', supabaseGameId);
      }
    }
    
    console.log('Game result saved successfully');
  } catch (error) {
    console.error('Error saving game result:', error);
  }
};

/**
 * Sync profile statistics with Supabase
 */
export const syncProfileStatsWithSupabase = async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
  try {
    if (!userId) {
      console.log('Cannot sync profile with Supabase: No user ID provided');
      return;
    }

    // Only sync relevant statistics fields
    const statsToSync = {
      username: profileData.name, // Include username
      total_games_played: profileData.totalGamesPlayed,
      total_earnings: profileData.totalEarnings,
      highest_score: profileData.highestScore,
      avatar_url: profileData.profileImage // Include avatar URL
    };

    // First check if the profile exists
    const { data, error: getError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (getError && getError.code === 'PGRST116') {
      // Profile doesn't exist, use upsert to create it
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...statsToSync
        });

      if (upsertError) {
        console.error('Error creating profile in Supabase:', upsertError);
      } else {
        console.log('Profile created and stats synced with Supabase');
      }
    } else {
      // Profile exists, update it
      const { error } = await updateProfile(userId, statsToSync);
      
      if (error) {
        console.error('Error syncing profile with Supabase:', error);
      } else {
        console.log('Profile stats successfully synced with Supabase');
      }
    }
  } catch (error) {
    console.error('Error in syncProfileStatsWithSupabase:', error);
  }
};

/**
 * Update user profile statistics based on new game result
 */
const updateUserProfileStats = async (gameResult: GameHistoryEntry): Promise<void> => {
  try {
    // Get existing user profile
    const existingProfileJson = await AsyncStorage.getItem(USER_PROFILE_KEY);
    const existingProfile: UserProfile = existingProfileJson 
      ? JSON.parse(existingProfileJson) 
      : {
          name: 'Player',
          profileImage: undefined,
          totalGamesPlayed: 0,
          totalEarnings: 0,
          highestScore: 0,
          achievements: [],
        };
    
    // Update the stats
    const updatedProfile: UserProfile = {
      ...existingProfile,
      totalGamesPlayed: existingProfile.totalGamesPlayed + 1,
      totalEarnings: existingProfile.totalEarnings + gameResult.earnings,
      highestScore: Math.max(existingProfile.highestScore, gameResult.score),
    };
    
    // Save the updated profile
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));

    // Sync with Supabase if the user is authenticated
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.user?.id) {
      await syncProfileStatsWithSupabase(session.data.session.user.id, updatedProfile);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
};

/**
 * Get all game history
 */
export const getGameHistory = async (): Promise<GameHistoryEntry[]> => {
  try {
    // Check if user is authenticated
    const session = await supabase.auth.getSession();
    
    if (session?.data?.session?.user?.id) {
      // Try to get from Supabase first
      const supabaseHistory = await getGameHistoryFromSupabase();
      if (supabaseHistory && supabaseHistory.length > 0) {
        // If we got history from Supabase, return it
        return supabaseHistory;
      }
    }
    
    // Fall back to local storage if Supabase failed or user not authenticated
    const historyJson = await AsyncStorage.getItem(GAME_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting game history:', error);
    // As a final fallback, return empty array
    return [];
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const profileJson = await AsyncStorage.getItem(USER_PROFILE_KEY);
    return profileJson ? JSON.parse(profileJson) : null;
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    return null;
  }
};

/**
 * Update user profile data
 */
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
  try {
    // Get existing profile
    const existingProfileJson = await AsyncStorage.getItem(USER_PROFILE_KEY);
    const existingProfile: UserProfile = existingProfileJson 
      ? JSON.parse(existingProfileJson) 
      : {
          name: 'Player',
          profileImage: undefined,
          totalGamesPlayed: 0,
          totalEarnings: 0,
          highestScore: 0,
          achievements: [],
        };
    
    // Merge with updates
    const updatedProfile = { ...existingProfile, ...profileData };
    
    // Save updated profile
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));

    // Sync with Supabase if the user is authenticated
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.user?.id) {
      await syncProfileStatsWithSupabase(session.data.session.user.id, updatedProfile);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
};

/**
 * Clear all game history
 */
export const clearGameHistory = async (): Promise<void> => {
  try {
    // Clear from AsyncStorage
    await AsyncStorage.removeItem(GAME_HISTORY_KEY);
    
    // Check if user is authenticated and clear from Supabase too
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.user?.id) {
      await clearGameHistoryFromSupabase();
    }
  } catch (error) {
    console.error('Error clearing game history:', error);
  }
};

/**
 * Delete a specific game from history
 */
export const deleteGameFromHistory = async (gameId: string): Promise<void> => {
  try {
    // Get existing history
    const historyJson = await AsyncStorage.getItem(GAME_HISTORY_KEY);
    if (!historyJson) return;
    
    const history: GameHistoryEntry[] = JSON.parse(historyJson);
    
    // Filter out the game to delete
    const updatedHistory = history.filter(game => game.id !== gameId);
    
    // Save updated history
    await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(updatedHistory));
    
    // Check if user is authenticated and delete from Supabase too
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.user?.id) {
      await deleteGameFromSupabase(gameId);
    }
  } catch (error) {
    console.error('Error deleting game from history:', error);
  }
};

/**
 * Save the private contest created by user
 */
export const saveUserPrivateContest = async (contest: PrivateContestInfo): Promise<void> => {
  try {
    // Get existing contests
    const existingContestsJson = await AsyncStorage.getItem(USER_PRIVATE_CONTESTS_KEY);
    const existingContests: PrivateContestInfo[] = existingContestsJson ? JSON.parse(existingContestsJson) : [];
    
    // Add the new contest at the beginning of the array
    const updatedContests = [contest, ...existingContests];
    
    // Save the updated contests
    await AsyncStorage.setItem(USER_PRIVATE_CONTESTS_KEY, JSON.stringify(updatedContests));
    
    console.log('Private contest saved successfully');
  } catch (error) {
    console.error('Error saving private contest:', error);
  }
};

/**
 * Get all private contests created by the user
 */
export const getUserPrivateContests = async (): Promise<PrivateContestInfo[]> => {
  try {
    const contestsJson = await AsyncStorage.getItem(USER_PRIVATE_CONTESTS_KEY);
    return contestsJson ? JSON.parse(contestsJson) : [];
  } catch (error) {
    console.error('Error retrieving user private contests:', error);
    return [];
  }
};

/**
 * Update a private contest
 */
export const updateUserPrivateContest = async (contestId: string, updates: Partial<PrivateContestInfo>): Promise<void> => {
  try {
    // Get existing contests
    const existingContestsJson = await AsyncStorage.getItem(USER_PRIVATE_CONTESTS_KEY);
    if (!existingContestsJson) return;
    
    const existingContests: PrivateContestInfo[] = JSON.parse(existingContestsJson);
    
    // Update the specific contest
    const updatedContests = existingContests.map(contest => 
      contest.id === contestId ? { ...contest, ...updates } : contest
    );
    
    // Save updated contests
    await AsyncStorage.setItem(USER_PRIVATE_CONTESTS_KEY, JSON.stringify(updatedContests));
  } catch (error) {
    console.error('Error updating private contest:', error);
  }
};

/**
 * Save a joined private contest
 */
export const saveJoinedContest = async (contest: JoinedContestInfo): Promise<void> => {
  try {
    // Get existing joined contests
    const existingContestsJson = await AsyncStorage.getItem(USER_JOINED_CONTESTS_KEY);
    const existingContests: JoinedContestInfo[] = existingContestsJson ? JSON.parse(existingContestsJson) : [];
    
    // Check if already joined
    const alreadyJoined = existingContests.some(c => c.contestId === contest.contestId);
    if (alreadyJoined) return;
    
    // Add the new contest at the beginning of the array
    const updatedContests = [contest, ...existingContests];
    
    // Save the updated contests
    await AsyncStorage.setItem(USER_JOINED_CONTESTS_KEY, JSON.stringify(updatedContests));
    
    console.log('Joined contest saved successfully');
  } catch (error) {
    console.error('Error saving joined contest:', error);
  }
};

/**
 * Get all private contests joined by the user
 */
export const getJoinedContests = async (): Promise<JoinedContestInfo[]> => {
  try {
    const contestsJson = await AsyncStorage.getItem(USER_JOINED_CONTESTS_KEY);
    return contestsJson ? JSON.parse(contestsJson) : [];
  } catch (error) {
    console.error('Error retrieving joined contests:', error);
    return [];
  }
};

/**
 * Update a joined contest
 */
export const updateJoinedContest = async (contestId: string, updates: Partial<JoinedContestInfo>): Promise<void> => {
  try {
    // Get existing contests
    const existingContestsJson = await AsyncStorage.getItem(USER_JOINED_CONTESTS_KEY);
    if (!existingContestsJson) return;
    
    const existingContests: JoinedContestInfo[] = JSON.parse(existingContestsJson);
    
    // Update the specific contest
    const updatedContests = existingContests.map(contest => 
      contest.contestId === contestId ? { ...contest, ...updates } : contest
    );
    
    // Save updated contests
    await AsyncStorage.setItem(USER_JOINED_CONTESTS_KEY, JSON.stringify(updatedContests));
  } catch (error) {
    console.error('Error updating joined contest:', error);
  }
};

/**
 * Get a specific game result by ID
 */
export const getGameResult = async (gameId: string): Promise<GameHistoryEntry | null> => {
  try {
    const historyJson = await AsyncStorage.getItem(GAME_HISTORY_KEY);
    const history: GameHistoryEntry[] = historyJson ? JSON.parse(historyJson) : [];
    
    // Find the game with the matching ID
    const gameResult = history.find(entry => entry.id === gameId);
    return gameResult || null;
  } catch (error) {
    console.error('Error retrieving specific game result:', error);
    return null;
  }
};

/**
 * Save seen questions for the user
 */
export const saveSeenQuestions = async (questionIds: string[]): Promise<void> => {
  try {
    // Get the current user's ID
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      console.log('No user logged in, cannot save seen questions');
      return;
    }
    
    // Create a storage key specific to this user
    const userSeenQuestionsKey = `${SEEN_QUESTIONS_KEY}-${userId}`;
    
    // Get existing seen questions
    const existingJson = await AsyncStorage.getItem(userSeenQuestionsKey);
    const existingQuestionIds: string[] = existingJson ? JSON.parse(existingJson) : [];
    
    // Add new unique question IDs
    const uniqueQuestionIds = [...new Set([...existingQuestionIds, ...questionIds])];
    
    // Save back to storage
    await AsyncStorage.setItem(userSeenQuestionsKey, JSON.stringify(uniqueQuestionIds));
    
    console.log(`Saved ${questionIds.length} new seen questions for user ${userId}`);
  } catch (error) {
    console.error('Error saving seen questions:', error);
  }
};

/**
 * Get all question IDs that the user has seen before
 */
export const getSeenQuestions = async (): Promise<string[]> => {
  try {
    // Get the current user's ID
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      console.log('No user logged in, returning empty seen questions list');
      return [];
    }
    
    // Create a storage key specific to this user
    const userSeenQuestionsKey = `${SEEN_QUESTIONS_KEY}-${userId}`;
    
    // Get the stored question IDs
    const existingJson = await AsyncStorage.getItem(userSeenQuestionsKey);
    return existingJson ? JSON.parse(existingJson) : [];
  } catch (error) {
    console.error('Error getting seen questions:', error);
    return [];
  }
};

/**
 * Reset the user's seen questions (for testing or when questions are updated)
 */
export const resetSeenQuestions = async (): Promise<void> => {
  try {
    // Get the current user's ID
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      console.log('No user logged in, cannot reset seen questions');
      return;
    }
    
    // Create a storage key specific to this user
    const userSeenQuestionsKey = `${SEEN_QUESTIONS_KEY}-${userId}`;
    
    // Remove the storage item
    await AsyncStorage.removeItem(userSeenQuestionsKey);
    
    console.log(`Reset seen questions for user ${userId}`);
  } catch (error) {
    console.error('Error resetting seen questions:', error);
  }
};

/**
 * Get game history from Supabase database
 */
export const getGameHistoryFromSupabase = async (limit: number = 100): Promise<GameHistoryEntry[] | null> => {
  try {
    const session = await supabase.auth.getSession();
    if (!session?.data?.session?.user?.id) {
      console.log('Cannot get game history from Supabase: Not authenticated');
      return null;
    }

    const userId = session.data.session.user.id;
    
    // Call the get_user_game_history function to fetch game history
    const { data, error } = await supabase.rpc('get_user_game_history', {
      p_user_id: userId,
      p_limit: limit,
      p_offset: 0
    });
    
    if (error) {
      console.error('Error getting game history from Supabase:', error);
      
      // If we get an error but we're authenticated, try to sync local history first
      const localHistory = await getGameHistory();
      if (localHistory && localHistory.length > 0) {
        // Try syncing first and then fetch again
        const syncSuccess = await syncGameHistoryWithSupabase();
        if (syncSuccess) {
          // Try fetching again after successful sync
          const { data: refreshedData, error: refreshedError } = await supabase.rpc('get_user_game_history', {
            p_user_id: userId,
            p_limit: limit,
            p_offset: 0
          });
          
          if (!refreshedError && refreshedData) {
            // Successfully retrieved after sync
            return formatGameHistoryFromSupabase(refreshedData);
          }
        }
      }
      
      return null;
    }
    
    if (!data || !data.game_history) {
      return [];
    }
    
    return formatGameHistoryFromSupabase(data);
  } catch (error) {
    console.error('Error in getGameHistoryFromSupabase:', error);
    return null;
  }
};

/**
 * Format game history data from Supabase to match the local format
 */
const formatGameHistoryFromSupabase = (data: any): GameHistoryEntry[] => {
  if (!data || !data.game_history || !Array.isArray(data.game_history)) {
    return [];
  }
  
  return data.game_history.map((game: any) => ({
    id: game.id,
    date: game.date,
    score: game.score,
    rank: game.rank,
    totalQuestions: game.total_questions,
    correctAnswers: game.correct_answers,
    earnings: game.earnings,
    avgResponseTime: game.avg_response_time,
    questionPerformance: Array.isArray(game.question_performance) 
      ? game.question_performance.map((qp: any) => ({
          questionId: qp.question_id,
          selectedAnswerIndex: qp.selected_answer_index,
          isCorrect: qp.is_correct,
          responseTimeMs: qp.response_time_ms
        }))
      : []
  }));
};

/**
 * Sync game history with Supabase
 * This will upload any local game history data to Supabase
 */
export const syncGameHistoryWithSupabase = async (): Promise<boolean> => {
  try {
    const session = await supabase.auth.getSession();
    if (!session?.data?.session?.user?.id) {
      console.log('Cannot sync game history with Supabase: Not authenticated');
      return false;
    }

    const userId = session.data.session.user.id;
    
    // Get local game history
    const localHistory = await getGameHistory();
    
    if (!localHistory || localHistory.length === 0) {
      console.log('No local game history to sync');
      return true; // Nothing to sync is still a successful sync
    }
    
    // Get existing game history from Supabase to avoid duplicates
    const { data: existingData } = await supabase.rpc('get_user_game_history', {
      p_user_id: userId,
      p_limit: 1000, // Get a large number to check for duplicates
      p_offset: 0
    });
    
    const existingGameIds = new Set();
    
    if (existingData && existingData.game_history) {
      existingData.game_history.forEach((game: any) => {
        existingGameIds.add(game.id);
      });
    }
    
    // Upload each game that doesn't already exist in Supabase
    const syncPromises = localHistory
      .filter(game => !existingGameIds.has(game.id))
      .map(async (game) => {
        try {
          await saveGameResultToSupabase(game);
          return true;
        } catch (error) {
          console.error('Error syncing individual game:', error);
          return false;
        }
      });
    
    const results = await Promise.all(syncPromises);
    
    // Check if all syncs were successful
    const success = results.every(result => result === true);
    
    if (success) {
      console.log('Successfully synced all game history with Supabase');
    } else {
      console.log('Some games failed to sync with Supabase');
    }
    
    return success;
  } catch (error) {
    console.error('Error syncing game history with Supabase:', error);
    return false;
  }
};

// Function to save game result directly to Supabase (more efficient than syncing all)
export const saveGameResultToSupabase = async (gameResult: GameHistoryEntry): Promise<string | null> => {
  try {
    // Check if user is authenticated
    const session = await supabase.auth.getSession();
    if (!session?.data?.session?.user?.id) {
      console.log('Cannot save game to Supabase: User not authenticated');
      return null;
    }

    const userId = session.data.session.user.id;

    // Call the save game result API
    const { data, error } = await supabase.rpc('api_save_game_result', {
      p_game_data: gameResult
    });

    if (error) {
      console.error('Error saving game result to Supabase:', error);
      return null;
    }

    // After successfully saving game result, update user profile statistics
    try {
      // Get current profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('total_games_played, total_earnings, highest_score')
        .eq('id', userId)
        .single();
      
      // Calculate updated statistics
      const updatedStats = {
        total_games_played: (profileData?.total_games_played || 0) + 1,
        total_earnings: (profileData?.total_earnings || 0) + (gameResult.earnings || 0),
        highest_score: Math.max(profileData?.highest_score || 0, gameResult.score || 0)
      };
      
      // Update the profile in Supabase
      const { error: profileError } = await updateProfile(userId, updatedStats);
      
      if (profileError) {
        console.error('Error updating profile statistics after game save:', profileError);
      } else {
        console.log('Profile statistics updated in Supabase after game save:', updatedStats);
      }
    } catch (profileError) {
      console.error('Error in profile update after game save:', profileError);
      // Continue regardless of profile update error
    }

    console.log('Game result saved to Supabase:', data);
    return data.game_id;
  } catch (error) {
    console.error('Error in saveGameResultToSupabase:', error);
    return null;
  }
};

// Function to delete a game from Supabase
export const deleteGameFromSupabase = async (gameId: string): Promise<boolean> => {
  try {
    // Check if user is authenticated
    const session = await supabase.auth.getSession();
    if (!session?.data?.session?.user?.id) {
      console.log('Cannot delete game: User not authenticated');
      return false;
    }

    // Call the delete game API
    const { data, error } = await supabase.rpc('api_delete_game_history', {
      p_game_id: gameId
    });

    if (error) {
      console.error('Error deleting game from Supabase:', error);
      return false;
    }

    return data.success;
  } catch (error) {
    console.error('Error in deleteGameFromSupabase:', error);
    return false;
  }
};

// Function to clear all game history from Supabase
export const clearGameHistoryFromSupabase = async (): Promise<boolean> => {
  try {
    // Check if user is authenticated
    const session = await supabase.auth.getSession();
    if (!session?.data?.session?.user?.id) {
      console.log('Cannot clear game history: User not authenticated');
      return false;
    }

    // Call the clear game history API
    const { data, error } = await supabase.rpc('api_clear_user_game_history');

    if (error) {
      console.error('Error clearing game history from Supabase:', error);
      return false;
    }

    return data.success;
  } catch (error) {
    console.error('Error in clearGameHistoryFromSupabase:', error);
    return false;
  }
}; 