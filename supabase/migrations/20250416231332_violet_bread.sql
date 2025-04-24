/*
  # Recipe Database Schema Update

  1. Changes
    - Add indexes for better search performance
    - Update RLS policies for better recipe sharing
    - Add view counts and ratings (future feature)

  2. Security
    - Enable RLS
    - Allow public recipe viewing
    - Restrict creation to authenticated users
    - Allow creators to update their recipes
*/

-- Add view_count and average_rating columns
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating numeric(3,2) DEFAULT NULL;

-- Update RLS policies for better sharing
DROP POLICY IF EXISTS "Anyone can view recipes" ON recipes;
DROP POLICY IF EXISTS "Users can create recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;

-- New policies for recipe sharing
CREATE POLICY "Public recipes are viewable by everyone"
  ON recipes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recipe creators can update their recipes"
  ON recipes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recipe creators can delete their recipes"
  ON recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add full-text search capabilities
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(flavor_summary, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS recipes_fts_idx ON recipes USING gin(fts);

-- Add more specific indexes for filtering
CREATE INDEX IF NOT EXISTS recipes_dietary_preferences_idx ON recipes USING gin(dietary_preferences);
CREATE INDEX IF NOT EXISTS recipes_difficulty_idx ON recipes (difficulty);
CREATE INDEX IF NOT EXISTS recipes_servings_idx ON recipes (servings);