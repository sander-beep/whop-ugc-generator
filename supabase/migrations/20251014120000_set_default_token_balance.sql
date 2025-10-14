/*
  # Set Default Token Balance to 100

  This migration updates the users table to give new users 100 tokens by default.
  
  Changes:
  1. Update the default value for token_balance from 0 to 100
  2. Grant 100 tokens to existing users who have 0 tokens
*/

-- Step 1: Update the default value for new users
ALTER TABLE users 
  ALTER COLUMN token_balance SET DEFAULT 100;

-- Step 2: Grant 100 tokens to existing users who currently have 0 tokens
UPDATE users 
  SET token_balance = 100 
  WHERE token_balance = 0;

-- Step 3: Add a comment to document the change
COMMENT ON COLUMN users.token_balance IS 'Token balance for the user. New users receive 100 tokens by default.';

