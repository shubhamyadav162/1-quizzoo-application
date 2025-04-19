-- Quizzoo App - Contest Functions
-- Supporting functions for contest creation and management

-- Function to automatically select questions for a contest based on settings
CREATE OR REPLACE FUNCTION public.select_questions_for_contest(
  contest_id UUID
)
RETURNS VOID AS $$
DECLARE
  contest_settings_record RECORD;
  question_count INTEGER;
  available_questions TEXT[];
  selected_question TEXT;
  sequence_num INTEGER := 1;
BEGIN
  -- Get the contest settings
  SELECT * INTO contest_settings_record 
  FROM public.contest_settings 
  WHERE contest_id = select_questions_for_contest.contest_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contest settings not found for contest ID %', contest_id;
  END IF;
  
  question_count := contest_settings_record.question_count;
  
  -- Find available questions matching the criteria
  WITH filtered_questions AS (
    SELECT question_id
    FROM public.question_reference
    WHERE 
      (contest_settings_record.categories = '{}' OR category_id = ANY(contest_settings_record.categories))
      AND
      (contest_settings_record.difficulty_levels = '{}' OR difficulty_level = ANY(contest_settings_record.difficulty_levels))
    ORDER BY RANDOM()
    LIMIT question_count
  )
  SELECT array_agg(question_id) INTO available_questions FROM filtered_questions;
  
  -- Check if we have enough questions
  IF array_length(available_questions, 1) < question_count THEN
    RAISE WARNING 'Not enough questions found matching criteria. Found % of % requested.', 
      array_length(available_questions, 1), question_count;
  END IF;
  
  -- Insert the selected questions
  FOR i IN 1..array_length(available_questions, 1) LOOP
    selected_question := available_questions[i];
    
    INSERT INTO public.contest_questions (
      contest_id, 
      question_id, 
      sequence_number
    ) VALUES (
      contest_id,
      selected_question,
      sequence_num
    );
    
    sequence_num := sequence_num + 1;
  END LOOP;
  
  RAISE NOTICE 'Successfully selected % questions for contest %', sequence_num - 1, contest_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a contest with default settings
CREATE OR REPLACE FUNCTION public.create_contest(
  contest_name TEXT,
  entry_fee DECIMAL,
  max_participants INTEGER DEFAULT 100,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes'),
  end_time TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
  is_private BOOLEAN DEFAULT FALSE,
  question_count INTEGER DEFAULT 10,
  time_limit_seconds INTEGER DEFAULT 6,
  categories TEXT[] DEFAULT '{}',
  difficulty_levels TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  new_contest_id UUID;
  private_code TEXT;
BEGIN
  -- Generate private code if it's a private contest
  IF is_private THEN
    private_code := UPPER(SUBSTRING(MD5(NOW()::TEXT || RANDOM()::TEXT) FOR 6));
  ELSE
    private_code := NULL;
  END IF;
  
  -- Calculate prize pool (90% of entry_fee * max_participants)
  DECLARE
    prize_pool DECIMAL := (entry_fee * max_participants) * 0.9;
  BEGIN
    -- Insert the contest
    INSERT INTO public.contests (
      name,
      entry_fee,
      prize_pool,
      status,
      start_time,
      end_time,
      max_participants,
      is_private,
      private_code
    ) VALUES (
      contest_name,
      entry_fee,
      prize_pool,
      CASE 
        WHEN start_time <= NOW() THEN 'active'
        ELSE 'upcoming'
      END,
      start_time,
      end_time,
      max_participants,
      is_private,
      private_code
    )
    RETURNING id INTO new_contest_id;
    
    -- Insert contest settings
    INSERT INTO public.contest_settings (
      contest_id,
      question_count,
      time_limit_seconds,
      categories,
      difficulty_levels
    ) VALUES (
      new_contest_id,
      question_count,
      time_limit_seconds,
      categories,
      difficulty_levels
    );
    
    -- Select questions for the contest
    PERFORM public.select_questions_for_contest(new_contest_id);
    
    RETURN new_contest_id;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join a contest
CREATE OR REPLACE FUNCTION public.join_contest(
  user_id UUID,
  contest_id UUID
)
RETURNS JSONB AS $$
DECLARE
  contest_record RECORD;
  user_wallet RECORD;
  participation_id UUID;
  result JSONB;
BEGIN
  -- Get contest details
  SELECT * INTO contest_record FROM public.contests WHERE id = contest_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Contest not found');
  END IF;
  
  -- Check if contest is joinable
  IF contest_record.status != 'upcoming' AND contest_record.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Contest is not available for joining');
  END IF;
  
  -- Check if already joined
  IF EXISTS (SELECT 1 FROM public.participations WHERE user_id = join_contest.user_id AND contest_id = join_contest.contest_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Already joined this contest');
  END IF;
  
  -- Check participant limit
  IF (SELECT COUNT(*) FROM public.participations WHERE contest_id = join_contest.contest_id) >= contest_record.max_participants THEN
    RETURN jsonb_build_object('success', false, 'message', 'Contest is full');
  END IF;
  
  -- Check user wallet
  SELECT * INTO user_wallet FROM public.wallets WHERE user_id = join_contest.user_id;
  IF NOT FOUND OR user_wallet.balance < contest_record.entry_fee THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient funds');
  END IF;
  
  -- Begin transaction
  BEGIN
    -- Deduct entry fee
    UPDATE public.wallets
    SET balance = balance - contest_record.entry_fee
    WHERE user_id = join_contest.user_id;
    
    -- Record transaction
    INSERT INTO public.transactions (
      user_id,
      amount,
      transaction_type,
      reference_id,
      payment_method,
      transaction_status
    ) VALUES (
      join_contest.user_id,
      -contest_record.entry_fee,
      'contest_entry',
      contest_id,
      'wallet',
      'completed'
    );
    
    -- Create participation record
    INSERT INTO public.participations (
      user_id,
      contest_id,
      status
    ) VALUES (
      join_contest.user_id,
      contest_id,
      'active'
    ) RETURNING id INTO participation_id;
    
    -- Create initial leaderboard entry
    INSERT INTO public.leaderboards (
      contest_id,
      user_id,
      score
    ) VALUES (
      contest_id,
      join_contest.user_id,
      0
    );
    
    -- Get contest questions
    WITH contest_questions_data AS (
      SELECT 
        cq.question_id, 
        cq.sequence_number
      FROM 
        public.contest_questions cq
      WHERE 
        cq.contest_id = join_contest.contest_id
      ORDER BY 
        cq.sequence_number ASC
    )
    SELECT jsonb_agg(jsonb_build_object(
      'question_id', question_id,
      'sequence', sequence_number
    )) INTO result FROM contest_questions_data;
    
    -- Return success with participation data
    RETURN jsonb_build_object(
      'success', true, 
      'participation_id', participation_id,
      'questions', result
    );
  EXCEPTION
    WHEN OTHERS THEN
      RETURN jsonb_build_object('success', false, 'message', SQLERRM);
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit answer and update score
CREATE OR REPLACE FUNCTION public.submit_answer(
  participation_id UUID,
  question_id TEXT,
  selected_answer_index INTEGER,
  response_time_ms INTEGER
)
RETURNS JSONB AS $$
DECLARE
  user_id UUID;
  contest_id UUID;
  is_correct BOOLEAN;
  correct_answer_index INTEGER;
  max_points INTEGER := 100;
  time_factor DECIMAL;
  points_earned INTEGER;
  result JSONB;
BEGIN
  -- Get participation record and verify
  SELECT p.user_id, p.contest_id INTO user_id, contest_id
  FROM public.participations p 
  WHERE p.id = submit_answer.participation_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Participation not found');
  END IF;
  
  -- Check if answer already submitted
  IF EXISTS (
    SELECT 1 FROM public.user_responses 
    WHERE participation_id = submit_answer.participation_id AND question_id = submit_answer.question_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Answer already submitted for this question');
  END IF;
  
  -- Get correct answer
  SELECT qr.correct_answer_index INTO correct_answer_index
  FROM public.question_reference qr
  WHERE qr.question_id = submit_answer.question_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Question not found');
  END IF;
  
  -- Check if answer is correct
  is_correct := (correct_answer_index = selected_answer_index);
  
  -- Calculate points based on time
  -- Formula: max_points * (1 - time_factor)
  -- Where time_factor ranges from 0 (instant) to 0.5 (maximum time)
  IF is_correct THEN
    -- Get time limit
    DECLARE
      time_limit_seconds INTEGER;
    BEGIN
      SELECT cs.time_limit_seconds INTO time_limit_seconds
      FROM public.contest_settings cs
      WHERE cs.contest_id = contest_id;
      
      -- Calculate time factor (0 to 0.5 based on response time)
      time_factor := LEAST(0.5, response_time_ms::DECIMAL / (time_limit_seconds * 1000));
      
      -- Calculate points
      points_earned := ROUND(max_points * (1 - time_factor));
    END;
  ELSE
    -- No points for wrong answer
    points_earned := 0;
  END IF;
  
  -- Record the answer
  INSERT INTO public.user_responses (
    participation_id,
    question_id,
    selected_answer_index,
    is_correct,
    response_time_ms,
    points_earned
  ) VALUES (
    participation_id,
    question_id,
    selected_answer_index,
    is_correct,
    response_time_ms,
    points_earned
  );
  
  -- Update participation score
  UPDATE public.participations
  SET final_score = final_score + points_earned
  WHERE id = participation_id;
  
  -- Update leaderboard
  UPDATE public.leaderboards
  SET 
    score = score + points_earned,
    updated_at = NOW()
  WHERE contest_id = contest_id AND user_id = user_id;
  
  -- Recalculate ranks (this could be expensive with many participants)
  -- Should be moved to a batch process for production
  UPDATE public.leaderboards
  SET rank = ranks.rank
  FROM (
    SELECT id, RANK() OVER (ORDER BY score DESC) as rank
    FROM public.leaderboards
    WHERE contest_id = contest_id
  ) ranks
  WHERE public.leaderboards.id = ranks.id;
  
  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'is_correct', is_correct,
    'points_earned', points_earned,
    'correct_answer', correct_answer_index
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a contest and distribute prizes
CREATE OR REPLACE FUNCTION public.complete_contest(
  contest_id UUID
)
RETURNS JSONB AS $$
DECLARE
  contest_record RECORD;
  prize_pool DECIMAL;
  winners RECORD;
  winner_count INTEGER;
BEGIN
  -- Get contest details
  SELECT * INTO contest_record FROM public.contests WHERE id = contest_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Contest not found');
  END IF;
  
  -- Check if contest is active
  IF contest_record.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Contest is not active');
  END IF;
  
  -- Update contest status
  UPDATE public.contests
  SET 
    status = 'completed',
    end_time = NOW()
  WHERE id = contest_id;
  
  -- Get prize pool
  prize_pool := contest_record.prize_pool;
  
  -- Get top 3 winners
  FOR winners IN (
    SELECT 
      user_id, 
      rank,
      CASE 
        WHEN rank = 1 THEN ROUND(prize_pool * 0.5555, 2) -- 55.55% for 1st place
        WHEN rank = 2 THEN ROUND(prize_pool * 0.2777, 2) -- 27.77% for 2nd place
        WHEN rank = 3 THEN ROUND(prize_pool * 0.1666, 2) -- 16.66% for 3rd place
        ELSE 0
      END as prize_amount
    FROM public.leaderboards
    WHERE contest_id = contest_id AND rank BETWEEN 1 AND 3
    ORDER BY rank ASC
  )
  LOOP
    IF winners.prize_amount > 0 THEN
      -- Update wallet
      UPDATE public.wallets
      SET balance = balance + winners.prize_amount
      WHERE user_id = winners.user_id;
      
      -- Record transaction
      INSERT INTO public.transactions (
        user_id,
        amount,
        transaction_type,
        reference_id,
        payment_method,
        transaction_status
      ) VALUES (
        winners.user_id,
        winners.prize_amount,
        'contest_winning',
        contest_id,
        'prize',
        'completed'
      );
    END IF;
  END LOOP;
  
  -- Mark all participations as completed
  UPDATE public.participations
  SET status = 'completed'
  WHERE contest_id = contest_id;
  
  -- Count winners
  SELECT COUNT(*) INTO winner_count
  FROM public.transactions
  WHERE 
    transaction_type = 'contest_winning' AND 
    reference_id = contest_id;
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Contest completed and prizes distributed',
    'winners', winner_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 