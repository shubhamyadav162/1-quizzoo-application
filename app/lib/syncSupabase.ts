import { supabase } from '@/lib/supabase';

// Ensures a minimal profile exists for a user in Supabase
// यूज़र के लिए Supabase में एक हल्का प्रोफाइल बनाता है (अगर नहीं है)
export async function ensureUserProfile(userId: string, username: string) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    if (!data) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            username,
            total_games_played: 0,
            highest_score: 0,
            total_earnings: 0,
          },
        ]);
      if (insertError) {
        console.error('Error creating profile:', insertError);
      }
    }
  } catch (err) {
    console.error('Error ensuring user profile:', err);
  }
}

// Inserts a summary row for a game in Supabase
// हर गेम के लिए Supabase में summary row डालता है
export type GameSummary = {
  user_id: string;
  date: string;
  score: number;
  rank: number;
  total_questions: number;
  correct_answers: number;
  earnings: number;
  avg_response_time: number;
};

export async function syncGameSummaryToSupabase(summary: GameSummary) {
  try {
    const { error } = await supabase.from('game_history').insert([summary]);
    if (error) {
      console.error('Error syncing game summary:', error);
    }
  } catch (err) {
    console.error('Error syncing game summary:', err);
  }
}

// Syncs all unsynced local game summaries to Supabase
// सारे unsynced लोकल गेम summaries को Supabase में भेजता है
export async function syncAllUnsyncedGames(localGameSummaries: GameSummary[]) {
  for (const game of localGameSummaries) {
    try {
      await syncGameSummaryToSupabase({ ...game });
      // TODO: Mark as synced locally if needed
    } catch (err) {
      console.error('Error syncing one game summary:', err);
    }
  }
}

// Placeholder: Implement this in your local storage logic
// यह function लोकल स्टोरेज से सारे unsynced गेम summaries लाएगा
export async function getUnsyncedGameSummaries(): Promise<GameSummary[]> {
  // TODO: Implement this function to return unsynced games from local storage
  // इसे अपने लोकल स्टोरेज से unsynced गेम summaries लाने के लिए implement करें
  return [];
} 