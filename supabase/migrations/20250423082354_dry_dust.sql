/*
  # Add recipe ratings functionality

  1. Changes
    - Add rating columns to recipes table
    - Add user_ratings table for individual ratings
    - Add function to calculate average rating
    - Add trigger to update average rating

  2. Security
    - Enable RLS on user_ratings table
    - Allow users to rate recipes once
    - Allow users to update their ratings
*/

-- Create user_ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  recipe_id uuid REFERENCES recipes NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS on user_ratings
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_ratings
CREATE POLICY "Users can view all ratings"
  ON user_ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can rate recipes once"
  ON user_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their ratings"
  ON user_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to calculate average rating
CREATE OR REPLACE FUNCTION calculate_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipes
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM user_ratings
      WHERE recipe_id = NEW.recipe_id
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM user_ratings
      WHERE recipe_id = NEW.recipe_id
    )
  WHERE id = NEW.recipe_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update average rating
CREATE TRIGGER update_recipe_rating
  AFTER INSERT OR UPDATE OR DELETE
  ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_average_rating();