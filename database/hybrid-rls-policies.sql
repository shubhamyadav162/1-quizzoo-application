-- Quizzoo App - Row Level Security (RLS) Policies
-- For Hybrid Storage Schema

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Create service role check function
CREATE OR REPLACE FUNCTION auth.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT is_admin FROM auth.users WHERE id = auth.uid());
EXCEPTION
  WHEN OTHERS THEN RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.is_admin());

-- Wallets Policies
CREATE POLICY "Users can view their own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only system can update wallets"
  ON public.wallets FOR UPDATE
  USING (auth.is_admin());

CREATE POLICY "Admin can view all wallets"
  ON public.wallets FOR SELECT
  USING (auth.is_admin());

-- Transactions Policies
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only system can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.is_admin());

CREATE POLICY "Admin can view all transactions"
  ON public.transactions FOR SELECT
  USING (auth.is_admin());

-- Question Reference Policies
CREATE POLICY "Anyone can view question references"
  ON public.question_reference FOR SELECT
  USING (true);

CREATE POLICY "Only admin can modify question references"
  ON public.question_reference FOR ALL
  USING (auth.is_admin());

-- Contests Policies
CREATE POLICY "Anyone can view contests"
  ON public.contests FOR SELECT
  USING (true);

CREATE POLICY "Only admin can modify contests"
  ON public.contests FOR ALL
  USING (auth.is_admin());

-- Contest Settings Policies
CREATE POLICY "Anyone can view contest settings"
  ON public.contest_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admin can modify contest settings"
  ON public.contest_settings FOR ALL
  USING (auth.is_admin());

-- Contest Questions Policies
CREATE POLICY "Anyone can view contest questions"
  ON public.contest_questions FOR SELECT
  USING (true);

CREATE POLICY "Only admin can modify contest questions"
  ON public.contest_questions FOR ALL
  USING (auth.is_admin());

-- Participations Policies
CREATE POLICY "Users can view their own participations"
  ON public.participations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own participations"
  ON public.participations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participations"
  ON public.participations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all participations"
  ON public.participations FOR SELECT
  USING (auth.is_admin());

CREATE POLICY "Anyone can view participations count"
  ON public.participations FOR SELECT
  USING (true)
  WITH CHECK (FALSE);

-- User Responses Policies
CREATE POLICY "Users can view their own responses"
  ON public.user_responses FOR SELECT
  USING (
    participation_id IN (
      SELECT id FROM public.participations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own responses"
  ON public.user_responses FOR INSERT
  WITH CHECK (
    participation_id IN (
      SELECT id FROM public.participations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all responses"
  ON public.user_responses FOR SELECT
  USING (auth.is_admin());

-- Leaderboards Policies
CREATE POLICY "Anyone can view leaderboards"
  ON public.leaderboards FOR SELECT
  USING (true);

CREATE POLICY "Only system can update leaderboards"
  ON public.leaderboards FOR ALL
  USING (auth.is_admin());

-- Withdrawal Requests Policies
CREATE POLICY "Users can view their own withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawal requests"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view and update all withdrawal requests"
  ON public.withdrawal_requests FOR ALL
  USING (auth.is_admin());

-- Create users_table_trigger to create profile and wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (new.id, 'user_' || substr(new.id::text, 1, 8), 'New User');
  
  -- Create wallet
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new.id, 0);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 