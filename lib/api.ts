import { supabase } from '../lib/supabase';

const checkContestAvailability = async (contestId: string) => {
  const { data, error } = await supabase
    .from('contests')
    .select('id, max_participants, start_time')
    .eq('id', contestId)
    .single();

  return {
    exists: !!data,
    isDisabled: false
  };
}; 