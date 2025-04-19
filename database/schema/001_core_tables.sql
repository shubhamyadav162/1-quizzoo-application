-- Wallet table for user funds
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL NOT NULL DEFAULT 0,
  actual_balance DECIMAL NOT NULL DEFAULT 0,
  tax_credit_balance DECIMAL NOT NULL DEFAULT 0,
  reserved_balance DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index for one wallet per user
CREATE UNIQUE INDEX IF NOT EXISTS wallets_user_id_idx ON wallets (user_id); 