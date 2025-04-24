/*
  # Add recipe comments functionality

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `recipe_id` (uuid, references recipes)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on comments table
    - Allow users to:
      - Read all comments
      - Create their own comments
      - Edit their own comments
      - Delete their own comments
*/

-- Create public.users view to access auth.users
CREATE OR REPLACE VIEW public.users AS
SELECT
  id,
  email
FROM auth.users;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'comments'
  ) THEN
    DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
    DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
    DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
    DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
  END IF;
END $$;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS comments_recipe_id_idx;
DROP INDEX IF EXISTS comments_created_at_idx;

-- Create or update comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  recipe_id uuid REFERENCES recipes NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies
CREATE POLICY "Anyone can view comments"
  ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX comments_recipe_id_idx ON comments (recipe_id);
CREATE INDEX comments_created_at_idx ON comments (created_at DESC);