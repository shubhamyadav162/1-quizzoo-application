import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contest types
export interface Contest {
  id: string;
  name: string;
  description?: string;
  entry_fee: number;
  max_participants: number;
  platform_fee_percentage: number;
  total_prize_pool: number;
  status: string;
  start_time?: string;
  end_time?: string;
  is_private?: boolean;
  private_code?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  is_instant?: boolean;
  notification_sent?: boolean;
  contest_type?: string;
  is_disabled?: boolean;
}

// Map the database contest to our app's format
export const mapContestFromDB = (dbContest: any): Contest => {
  return {
    id: dbContest.id,
    name: dbContest.name,
    description: dbContest.description,
    entry_fee: dbContest.entry_fee,
    max_participants: dbContest.max_participants,
    platform_fee_percentage: dbContest.platform_fee_percentage,
    total_prize_pool: dbContest.total_prize_pool,
    status: dbContest.status,
    start_time: dbContest.start_time,
    end_time: dbContest.end_time,
    is_private: dbContest.is_private,
    private_code: dbContest.private_code,
    created_by: dbContest.created_by,
    created_at: dbContest.created_at,
    updated_at: dbContest.updated_at,
    is_instant: dbContest.is_instant,
    notification_sent: dbContest.notification_sent,
    contest_type: dbContest.contest_type,
    is_disabled: dbContest.is_disabled || false
  };
};

// Fetch all available contests
export const fetchContests = async (contestType?: string): Promise<Contest[]> => {
  try {
    let query = supabase
      .from('contests')
      .select('*')
      .eq('status', 'upcoming')
      .eq('is_disabled', false);
    
    if (contestType && contestType !== 'All') {
      query = query.eq('contest_type', contestType.toLowerCase());
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching contests:', error);
      return [];
    }
    
    return data.map(mapContestFromDB);
  } catch (error) {
    console.error('Exception fetching contests:', error);
    return [];
  }
};

// Fetch a specific contest by ID
export const fetchContestById = async (contestId: string): Promise<Contest | null> => {
  try {
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .eq('id', contestId)
      .single();
    
    if (error) {
      console.error('Error fetching contest by ID:', error);
      return null;
    }
    
    if (data.is_disabled) {
      console.log('Contest is disabled:', contestId);
      return null;
    }
    
    return mapContestFromDB(data);
  } catch (error) {
    console.error('Exception fetching contest by ID:', error);
    return null;
  }
};

// Check if a contest is available
export const checkContestAvailability = async (contestId: string): Promise<{exists: boolean, isDisabled: boolean}> => {
  try {
    const { data, error } = await supabase
      .from('contests')
      .select('id, is_disabled')
      .eq('id', contestId)
      .single();
    
    if (error) {
      console.error('Error checking contest availability:', error);
      return { exists: false, isDisabled: false };
    }
    
    return { 
      exists: true, 
      isDisabled: data.is_disabled || false 
    };
  } catch (error) {
    console.error('Exception checking contest availability:', error);
    return { exists: false, isDisabled: false };
  }
};

// Join an instant contest
export const joinInstantContest = async (contestId: string, userId: string): Promise<boolean> => {
  try {
    const availability = await checkContestAvailability(contestId);
    if (!availability.exists) {
      console.error('Contest does not exist:', contestId);
      return false;
    }
    
    if (availability.isDisabled) {
      console.error('Contest is disabled:', contestId);
      return false;
    }
    
    const { data: existingParticipation, error: checkError } = await supabase
      .from('participations')
      .select('*')
      .eq('contest_id', contestId)
      .eq('user_id', userId)
      .single();
    
    if (!checkError && existingParticipation) {
      console.log('User already joined this contest');
      return true;
    }
    
    const { error } = await supabase
      .from('participations')
      .insert([
        { 
          contest_id: contestId, 
          user_id: userId,
          joined_at: new Date().toISOString(),
          status: 'joined'
        }
      ]);
    
    if (error) {
      console.error('Error joining contest:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception joining contest:', error);
    return false;
  }
};

// Register for a scheduled contest
export const registerForScheduledContest = async (contestId: string, userId: string): Promise<boolean> => {
  try {
    const availability = await checkContestAvailability(contestId);
    if (!availability.exists) {
      console.error('Contest does not exist:', contestId);
      return false;
    }
    
    if (availability.isDisabled) {
      console.error('Contest is disabled:', contestId);
      return false;
    }
    
    const { data: existingParticipation, error: checkError } = await supabase
      .from('participations')
      .select('*')
      .eq('contest_id', contestId)
      .eq('user_id', userId)
      .single();
    
    if (!checkError && existingParticipation) {
      console.log('User already registered for this contest');
      return true;
    }
    
    const { error } = await supabase
      .from('participations')
      .insert([
        { 
          contest_id: contestId, 
          user_id: userId,
          joined_at: new Date().toISOString(),
          status: 'active'
        }
      ]);
    
    if (error) {
      console.error('Error registering for contest:', error);
      return false;
    }
    
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .select('*')
      .eq('id', contestId)
      .single();
    
    if (contestError) {
      console.error('Error fetching contest details for notification:', contestError);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Exception registering for contest:', error);
    return false;
  }
};

// Get user's registered contests
export const getUserRegisteredContests = async (userId: string): Promise<Contest[]> => {
  try {
    const { data, error } = await supabase
      .from('participations')
      .select(`
        contest_id,
        contests:contest_id(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active');
    
    if (error) {
      console.error('Error fetching user registered contests:', error);
      return [];
    }
    
    return data.map((item: any) => mapContestFromDB(item.contests));
  } catch (error) {
    console.error('Exception fetching user registered contests:', error);
    return [];
  }
};

// Update contest status (for admin use)
export const updateContestStatus = async (contestId: string, status: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contests')
      .update({ status })
      .eq('id', contestId);
    
    if (error) {
      console.error('Error updating contest status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating contest status:', error);
    return false;
  }
};

// Create a new contest (for admin or premium users)
export const createContest = async (contestData: Partial<Contest>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('contests')
      .insert([contestData])
      .select();
    
    if (error) {
      console.error('Error creating contest:', error);
      return null;
    }
    
    return data[0].id;
  } catch (error) {
    console.error('Exception creating contest:', error);
    return null;
  }
};

export default {
  fetchContests,
  fetchContestById,
  joinInstantContest,
  registerForScheduledContest,
  getUserRegisteredContests,
  updateContestStatus,
  createContest,
  mapContestFromDB,
  checkContestAvailability
}; 