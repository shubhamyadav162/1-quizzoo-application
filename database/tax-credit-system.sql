-- Tax Credit System for Quizzoo App
-- This file adds the necessary database structure for the tax credit system

-- 1. Modify wallets table to add tax credit fields
ALTER TABLE IF EXISTS public.wallets
ADD COLUMN IF NOT EXISTS actual_balance NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_credit_balance NUMERIC(10,2) DEFAULT 0;

-- If wallets dont exist yet, create it
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    balance NUMERIC(10,2) NOT NULL DEFAULT 0, -- Total display balance (actual + tax_credit)
    actual_balance NUMERIC(10,2) NOT NULL DEFAULT 0, -- Real money after tax
    tax_credit_balance NUMERIC(10,2) NOT NULL DEFAULT 0, -- Tax credits given
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create tax_credit_logs table to track all tax credits given
CREATE TABLE IF NOT EXISTS public.tax_credit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    deposit_amount NUMERIC(10,2) NOT NULL, -- Original deposit amount
    tax_amount NUMERIC(10,2) NOT NULL, -- Tax deducted (28% of deposit)
    tax_credit_given NUMERIC(10,2) NOT NULL, -- Credit given to compensate tax
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE
);

-- 3. Apply RLS policies
ALTER TABLE IF EXISTS public.tax_credit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own tax credits"
    ON public.tax_credit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- 4. Modify the transactions table to add tax_credit fields
ALTER TABLE IF EXISTS public.transactions
ADD COLUMN IF NOT EXISTS tax_credit_used NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_credit_given NUMERIC(10,2) DEFAULT 0;

-- 5. Update wallet balance function to handle tax credits
CREATE OR REPLACE FUNCTION process_transaction_with_tax_credit()
RETURNS TRIGGER AS $$
DECLARE
    tax_rate NUMERIC := 0.28; -- 28% tax rate
    tax_amount NUMERIC;
    actual_amount NUMERIC;
    credit_amount NUMERIC;
BEGIN
    -- For deposits: Calculate tax, update actual balance and give tax credit
    IF NEW.type = 'deposit' AND NEW.status = 'completed' THEN
        -- Calculate tax and actual amount
        tax_amount := NEW.amount * tax_rate;
        actual_amount := NEW.amount - tax_amount;
        credit_amount := tax_amount;
        
        -- Update the wallet with actual money and tax credit
        UPDATE public.wallets
        SET 
            balance = balance + NEW.amount, -- Show full amount to user
            actual_balance = actual_balance + actual_amount, -- Real money after tax
            tax_credit_balance = tax_credit_balance + credit_amount, -- Add tax credit
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id;
        
        -- Log the tax credit given
        INSERT INTO public.tax_credit_logs
            (user_id, deposit_amount, tax_amount, tax_credit_given, status)
        VALUES
            (NEW.user_id, NEW.amount, tax_amount, credit_amount, 'active');
            
        -- Update the transaction with tax credit given
        NEW.tax_credit_given := credit_amount;
    
    -- For withdrawals: Deduct 28% as tax from the withdrawal amount
    ELSIF NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN
        -- No need to calculate, just deduct from balance
        UPDATE public.wallets
        SET 
            balance = balance - NEW.amount, -- Full requested amount
            actual_balance = actual_balance - (NEW.amount * (1 - tax_rate)), -- Only deduct actual amount
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id;
    
    -- For contest entry: Use tax credits first before using actual balance
    ELSIF NEW.type = 'contest_entry' AND NEW.status = 'completed' THEN
        -- Get current wallet balance
        DECLARE
            wallet_record RECORD;
        BEGIN
            SELECT * INTO wallet_record FROM public.wallets WHERE user_id = NEW.user_id;
            
            -- If tax credit available, use it first
            IF wallet_record.tax_credit_balance > 0 THEN
                IF wallet_record.tax_credit_balance >= NEW.amount THEN
                    -- Tax credit covers full amount
                    UPDATE public.wallets
                    SET 
                        balance = balance - NEW.amount,
                        tax_credit_balance = tax_credit_balance - NEW.amount,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = NEW.user_id;
                    
                    -- Record tax credit used
                    NEW.tax_credit_used := NEW.amount;
                ELSE
                    -- Tax credit covers partial amount
                    DECLARE
                        actual_needed NUMERIC;
                    BEGIN
                        actual_needed := NEW.amount - wallet_record.tax_credit_balance;
                        
                        UPDATE public.wallets
                        SET 
                            balance = balance - NEW.amount,
                            tax_credit_balance = 0,
                            actual_balance = actual_balance - actual_needed,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE user_id = NEW.user_id;
                        
                        -- Record tax credit used
                        NEW.tax_credit_used := wallet_record.tax_credit_balance;
                    END;
                END IF;
            ELSE
                -- No tax credit, use actual balance
                UPDATE public.wallets
                SET 
                    balance = balance - NEW.amount,
                    actual_balance = actual_balance - NEW.amount,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = NEW.user_id;
            END IF;
        END;
    
    -- For prize winnings: Add to actual balance (no tax on winnings at this point)
    ELSIF NEW.type = 'prize_won' AND NEW.status = 'completed' THEN
        UPDATE public.wallets
        SET 
            balance = balance + NEW.amount,
            actual_balance = actual_balance + NEW.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create or replace the trigger
DROP TRIGGER IF EXISTS process_transaction_tax_credit ON public.transactions;

CREATE TRIGGER process_transaction_tax_credit
BEFORE INSERT OR UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION process_transaction_with_tax_credit();

-- 7. Create helper function to get available wallet balance
CREATE OR REPLACE FUNCTION get_wallet_display_balance(user_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    display_balance NUMERIC;
BEGIN
    SELECT balance INTO display_balance FROM public.wallets WHERE user_id = user_uuid;
    RETURN display_balance;
END;
$$ LANGUAGE plpgsql; 