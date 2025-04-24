/*
  # Create recipes table and related schemas

  1. New Tables
    - `recipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `ingredients` (jsonb)
      - `instructions` (jsonb)
      - `image_url` (text)
      - `preparation_time` (text)
      - `difficulty` (text)
      - `servings` (integer)
      - `cuisine` (text)
      - `dietary_preferences` (jsonb)
      - `flavor_summary` (text)
      - `recipe_type` (text)
      - `appearance_prompt` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `recipes` table
    - Add policies for authenticated users to:
      - Read all recipes
      - Create new recipes
      - Delete their own recipes
*/

CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  ingredients jsonb NOT NULL,
  instructions jsonb NOT NULL,
  image_url text,
  preparation_time text,
  difficulty text,
  servings integer,
  cuisine text,
  dietary_preferences jsonb,
  flavor_summary text,
  recipe_type text NOT NULL,
  appearance_prompt text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX recipes_cuisine_idx ON recipes (cuisine);
CREATE INDEX recipes_recipe_type_idx ON recipes (recipe_type);
CREATE INDEX recipes_created_at_idx ON recipes (created_at DESC);