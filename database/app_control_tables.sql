-- App Control System Tables
-- These tables provide a comprehensive remote control system for the app
-- without requiring redeployment

-- Control Areas
CREATE TABLE IF NOT EXISTS public.app_control_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Control Flags for app-wide settings
CREATE TABLE IF NOT EXISTS public.app_control_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_area TEXT NOT NULL,
  flag_key TEXT NOT NULL UNIQUE,
  flag_value JSONB NOT NULL,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('boolean', 'number', 'string', 'json')),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (control_area) REFERENCES app_control_areas(area_name) ON DELETE CASCADE
);

-- UI Controls for dynamic UI elements
CREATE TABLE IF NOT EXISTS public.ui_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  element_key TEXT NOT NULL UNIQUE,
  element_type TEXT NOT NULL CHECK (element_type IN ('button', 'banner', 'card', 'section', 'screen')),
  element_config JSONB NOT NULL DEFAULT '{"visible": true, "enabled": true}',
  screen_path TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Screen Configurations for layouts
CREATE TABLE IF NOT EXISTS public.screen_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_path TEXT NOT NULL UNIQUE,
  config JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Permission Rules for dynamic permissions
CREATE TABLE IF NOT EXISTS public.permission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key TEXT NOT NULL UNIQUE,
  user_types TEXT[] NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- App Actions for remote control
CREATE TABLE IF NOT EXISTS public.app_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  action_payload JSONB NOT NULL DEFAULT '{}',
  action_status TEXT NOT NULL CHECK (action_status IN ('pending', 'completed', 'failed')),
  target_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update triggers for updated_at fields
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for each table
CREATE TRIGGER update_app_control_areas_modtime
BEFORE UPDATE ON app_control_areas
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_app_control_flags_modtime
BEFORE UPDATE ON app_control_flags
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_ui_controls_modtime
BEFORE UPDATE ON ui_controls
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_screen_configs_modtime
BEFORE UPDATE ON screen_configs
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_permission_rules_modtime
BEFORE UPDATE ON permission_rules
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_app_actions_modtime
BEFORE UPDATE ON app_actions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Enable row-level security
ALTER TABLE app_control_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_control_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_actions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view app_control_areas" ON app_control_areas
  FOR SELECT USING (true);
  
CREATE POLICY "Anyone can view app_control_flags" ON app_control_flags
  FOR SELECT USING (true);
  
CREATE POLICY "Anyone can view ui_controls" ON ui_controls
  FOR SELECT USING (true);
  
CREATE POLICY "Anyone can view screen_configs" ON screen_configs
  FOR SELECT USING (true);
  
CREATE POLICY "Anyone can view permission_rules" ON permission_rules
  FOR SELECT USING (true);
  
CREATE POLICY "Anyone can view app_actions" ON app_actions
  FOR SELECT USING (true);

-- Only service_role can modify data
CREATE POLICY "Only service_role can insert/update app_control_areas" ON app_control_areas
  FOR ALL USING (auth.role() = 'service_role');
  
CREATE POLICY "Only service_role can insert/update app_control_flags" ON app_control_flags
  FOR ALL USING (auth.role() = 'service_role');
  
CREATE POLICY "Only service_role can insert/update ui_controls" ON ui_controls
  FOR ALL USING (auth.role() = 'service_role');
  
CREATE POLICY "Only service_role can insert/update screen_configs" ON screen_configs
  FOR ALL USING (auth.role() = 'service_role');
  
CREATE POLICY "Only service_role can insert/update permission_rules" ON permission_rules
  FOR ALL USING (auth.role() = 'service_role');
  
CREATE POLICY "Only service_role can insert/update app_actions" ON app_actions
  FOR ALL USING (auth.role() = 'service_role');

-- Set up realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE app_control_areas;
ALTER PUBLICATION supabase_realtime ADD TABLE app_control_flags;
ALTER PUBLICATION supabase_realtime ADD TABLE ui_controls;
ALTER PUBLICATION supabase_realtime ADD TABLE screen_configs;
ALTER PUBLICATION supabase_realtime ADD TABLE permission_rules;
ALTER PUBLICATION supabase_realtime ADD TABLE app_actions;

-- Insert initial control areas
INSERT INTO app_control_areas (area_name, description)
VALUES 
  ('wallet', 'Control wallet functionality and settings'),
  ('contest', 'Control contest rules and settings'),
  ('profile', 'Control user profile settings'),
  ('system', 'Control system-wide settings'),
  ('feature', 'Feature flags for toggling features')
ON CONFLICT (area_name) DO NOTHING;

-- Insert some initial control flags
INSERT INTO app_control_flags (control_area, flag_key, flag_value, flag_type, description)
VALUES
  ('wallet', 'wallet.min_withdrawal', '100', 'number', 'Minimum withdrawal amount'),
  ('wallet', 'wallet.max_withdrawal', '10000', 'number', 'Maximum withdrawal amount'),
  ('wallet', 'wallet.payment_methods', '["UPI", "Bank Transfer"]', 'json', 'Available payment methods'),
  ('wallet', 'wallet.upi_enabled', 'true', 'boolean', 'Whether UPI payments are enabled'),
  ('wallet', 'wallet.transaction_fee_percentage', '2', 'number', 'Transaction fee percentage'),
  ('wallet', 'wallet.withdrawal_processing_time_hours', '24', 'number', 'Withdrawal processing time in hours'),
  
  ('contest', 'contest.min_entry_fee', '5', 'number', 'Minimum entry fee for contests'),
  ('contest', 'contest.max_entry_fee', '1000', 'number', 'Maximum entry fee for contests'),
  ('contest', 'contest.max_participants', '1000', 'number', 'Maximum number of participants per contest'),
  ('contest', 'contest.types', '["quiz", "trivia"]', 'json', 'Available contest types'),
  ('contest', 'contest.platform_fee_percentage', '10', 'number', 'Platform fee percentage'),
  
  ('profile', 'profile.required_fields', '["name", "email"]', 'json', 'Required fields for user profiles'),
  ('profile', 'profile.verification_options', '["email", "phone"]', 'json', 'Available verification options'),
  ('profile', 'profile.picture_enabled', 'true', 'boolean', 'Whether profile pictures are enabled'),
  ('profile', 'profile.bio_max_length', '160', 'number', 'Maximum length for user bios'),
  
  ('system', 'system.version', '"1.0.0"', 'string', 'Current app version'),
  
  ('feature', 'feature.chat.enabled', 'false', 'boolean', 'Whether in-app chat is enabled'),
  ('feature', 'feature.referrals.enabled', 'true', 'boolean', 'Whether referral system is enabled'),
  ('feature', 'feature.dark_mode.enabled', 'true', 'boolean', 'Whether dark mode is enabled'),
  ('feature', 'feature.notifications.enabled', 'true', 'boolean', 'Whether push notifications are enabled')
ON CONFLICT (flag_key) DO NOTHING;

-- Insert some example UI controls
INSERT INTO ui_controls (element_key, element_type, element_config, screen_path, description)
VALUES
  ('wallet_withdraw_button', 'button', 
   '{"visible": true, "enabled": true, "content": "Withdraw", "style": {"backgroundColor": "#4CAF50"}}', 
   '/wallet', 'Withdraw button on wallet screen'),
   
  ('contest_join_button', 'button', 
   '{"visible": true, "enabled": true, "content": "Join Contest", "style": {"backgroundColor": "#2196F3"}}', 
   '/contest', 'Join contest button'),
   
  ('referral_banner', 'banner', 
   '{"visible": true, "enabled": true, "content": {"title": "Invite Friends", "description": "Get ₹50 for each friend who joins!"}}', 
   '/(tabs)', 'Referral banner on home screen'),
   
  ('profile_verification_section', 'section', 
   '{"visible": true, "enabled": true}', 
   '/profile', 'Profile verification section')
ON CONFLICT (element_key) DO NOTHING;

-- Insert some example screen configs
INSERT INTO screen_configs (screen_path, config, description)
VALUES
  ('/(tabs)', 
   '{"layout": "default", "components": ["header", "quick_actions", "contest_list"], "settings": {"showFeaturedContests": true}}',
   'Home screen configuration'),
   
  ('/wallet', 
   '{"layout": "wallet", "components": ["balance", "transactions", "withdrawal_form"], "settings": {"showRecentTransactions": true}}',
   'Wallet screen configuration'),
   
  ('/profile', 
   '{"layout": "profile", "components": ["user_info", "stats", "settings"], "settings": {"allowEdit": true}}',
   'Profile screen configuration')
ON CONFLICT (screen_path) DO NOTHING;

-- Insert some example permission rules
INSERT INTO permission_rules (rule_key, user_types, conditions, description)
VALUES
  ('can_withdraw', '["verified", "premium"]', 
   '{"min_balance": 100}', 
   'Who can withdraw money'),
   
  ('can_create_contest', '["verified", "admin"]', 
   '{"min_balance": 100, "min_contests_played": 5}', 
   'Who can create contests'),
   
  ('can_view_leaderboard', '["*"]', 
   '{}', 
   'Who can view the leaderboard'),
   
  ('can_modify_profile', '["*"]', 
   '{}', 
   'Who can modify their profile')
ON CONFLICT (rule_key) DO NOTHING; 