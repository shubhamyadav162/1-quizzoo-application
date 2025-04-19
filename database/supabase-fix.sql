-- Check if transactions table exists and its structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions';

-- Option 1: Modify existing transactions table to add type column
ALTER TABLE IF EXISTS public.transactions
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('deposit', 'withdrawal', 'contest_entry', 'prize_won', 'refund'));

-- Option 2: If transactions table doesn't exist, create it properly
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    amount NUMERIC(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'contest_entry', 'prize_won', 'refund')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_method TEXT,
    upi_reference_id TEXT,
    upi_transaction_id TEXT,
    transaction_status TEXT,
    qr_code_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Option 3: If you need to recreate RLS policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create deposit transactions" ON public.transactions;

-- Recreate the policies after confirming the table structure
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create deposit transactions"
    ON public.transactions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND type = 'deposit');

-- Fix the wallet balance update trigger if it's causing the issue
DROP TRIGGER IF EXISTS on_transaction_completed ON public.transactions;
DROP FUNCTION IF EXISTS update_wallet_balance();

CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        IF NEW.type IN ('deposit', 'prize_won', 'refund') THEN
            UPDATE public.wallets
            SET 
                balance = balance + NEW.amount,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = NEW.user_id;
        ELSIF NEW.type IN ('withdrawal', 'contest_entry') THEN
            UPDATE public.wallets
            SET 
                balance = balance - NEW.amount,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_completed
AFTER INSERT OR UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION update_wallet_balance(); 