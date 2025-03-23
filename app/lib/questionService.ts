import { supabase } from './supabase';
import { Database } from './database.types';

export type Question = Database['public']['Tables']['questions']['Row'];

export const questionService = {
  /**
   * Fetches questions by category
   */
  getQuestionsByCategory: async (category: string, limit: number = 10): Promise<Question[]> => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('category', category)
      .limit(limit);

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Fetches questions by difficulty
   */
  getQuestionsByDifficulty: async (difficulty: string, limit: number = 10): Promise<Question[]> => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('difficulty', difficulty)
      .limit(limit);

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Fetches random questions
   */
  getRandomQuestions: async (limit: number = 10): Promise<Question[]> => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at')
      .limit(limit);

    if (error) {
      console.error('Error fetching random questions:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Adds a new question to the database
   */
  addQuestion: async (question: Database['public']['Tables']['questions']['Insert']): Promise<Question> => {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .single();

    if (error) {
      console.error('Error adding question:', error);
      throw error;
    }

    return data;
  },

  /**
   * Records a user's answer to a question
   */
  recordUserAnswer: async (
    userId: string,
    questionId: string,
    selectedAnswer: string,
    isCorrect: boolean,
    pointsEarned: number = 0
  ): Promise<void> => {
    const { error } = await supabase
      .from('user_answers')
      .insert({
        user_id: userId,
        question_id: questionId,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        points_earned: pointsEarned
      });

    if (error) {
      console.error('Error recording user answer:', error);
      throw error;
    }
  },

  /**
   * Updates a user's points
   */
  updateUserPoints: async (userId: string, pointsToAdd: number): Promise<void> => {
    // First get current points
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user points:', fetchError);
      throw fetchError;
    }

    const currentPoints = userData?.points || 0;
    const newPoints = currentPoints + pointsToAdd;

    const { error: updateError } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user points:', updateError);
      throw updateError;
    }
  }
}; 