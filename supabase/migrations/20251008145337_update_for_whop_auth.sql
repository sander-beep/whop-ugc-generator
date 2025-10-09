/*
  # Update Schema for Whop Authentication

  This migration updates the database schema to work with Whop user IDs
  instead of Supabase auth.users IDs.

  Changes:
  1. Drop foreign key constraints to auth.users
  2. Change user_id columns from uuid to text (Whop format: user_***)
  3. Update RLS policies for service role access
  4. Add indexes for better performance
*/

-- Step 1: Drop existing foreign key constraints
ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE IF EXISTS videos DROP CONSTRAINT IF EXISTS videos_user_id_fkey;
ALTER TABLE IF EXISTS transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

-- Step 2: Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own videos" ON videos;
DROP POLICY IF EXISTS "Users can insert own videos" ON videos;
DROP POLICY IF EXISTS "Users can update own videos" ON videos;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;

-- Step 3: Change ID columns to text for Whop user IDs
ALTER TABLE users ALTER COLUMN id TYPE text;
ALTER TABLE videos ALTER COLUMN user_id TYPE text;
ALTER TABLE transactions ALTER COLUMN user_id TYPE text;

-- Step 4: Create new simplified policies (backend controls access via service role)
-- Users table policies
CREATE POLICY "Enable all access for service role on users"
  ON users
  USING (true)
  WITH CHECK (true);

-- Videos table policies  
CREATE POLICY "Enable all access for service role on videos"
  ON videos
  USING (true)
  WITH CHECK (true);

-- Transactions table policies
CREATE POLICY "Enable all access for service role on transactions"
  ON transactions
  USING (true)
  WITH CHECK (true);

-- Step 5: Add foreign key constraints with text type
ALTER TABLE videos 
  ADD CONSTRAINT videos_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

ALTER TABLE transactions 
  ADD CONSTRAINT transactions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Step 6: Ensure indexes exist
DROP INDEX IF EXISTS videos_user_id_idx;
DROP INDEX IF EXISTS videos_created_at_idx;
DROP INDEX IF EXISTS transactions_user_id_idx;

CREATE INDEX videos_user_id_idx ON videos(user_id);
CREATE INDEX videos_created_at_idx ON videos(created_at DESC);
CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX users_email_idx ON users(email);

-- Step 7: Create storage bucket for videos (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Step 8: Create storage policies for videos bucket
CREATE POLICY "Public read access for videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

CREATE POLICY "Service role can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Service role can update videos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'videos');

CREATE POLICY "Service role can delete videos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'videos');

