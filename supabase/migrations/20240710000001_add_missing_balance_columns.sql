-- Add missing balance columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS initial_balance NUMERIC,
ADD COLUMN IF NOT EXISTS target_balance NUMERIC;
