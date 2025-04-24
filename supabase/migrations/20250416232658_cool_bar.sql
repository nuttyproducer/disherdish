/*
  # Fix recipe schema and add view count function

  1. Changes
    - Add dish_type column to recipes table
    - Create function for incrementing view count
    - Add indexes for improved performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add dish_type column
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS dish_type text NOT NULL DEFAULT 'Dessert';

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_recipe_view_count(recipe_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE recipes
  SET view_count = view_count + 1
  WHERE id = recipe_id;
END;
$$;

-- Add index for dish_type
CREATE INDEX IF NOT EXISTS recipes_dish_type_idx ON recipes (dish_type);

-- Update full-text search to include dish_type
DROP TRIGGER IF EXISTS recipes_fts_update ON recipes;
ALTER TABLE recipes DROP COLUMN IF EXISTS fts;

ALTER TABLE recipes ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(dish_type, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(flavor_summary, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS recipes_fts_idx ON recipes USING gin(fts);