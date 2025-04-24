/*
  # Add user profiles with preferences

  1. New Tables
    - `profiles`
      - `id` (bigint, primary key)
      - `username` (text, unique)
      - `allergies` (text array)
      - `custom_allergies` (text)
      - `taste_profile` (jsonb)
      - `pantry_ingredients` (text array)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on profiles table
    - Add policies for users to manage their profiles
*/

CREATE TABLE IF NOT EXISTS profiles (
  id bigint PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  username text UNIQUE,
  allergies text[] DEFAULT '{}',
  custom_allergies text DEFAULT '',
  taste_profile jsonb DEFAULT '{"spicy": 3, "sweet": 3, "tangy": 3, "umami": 3, "bitter": 3, "savory": 3}',
  pantry_ingredients text[] DEFAULT '{}'
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING ((auth.uid())::text::bigint = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING ((auth.uid())::text::bigint = id)
  WITH CHECK ((auth.uid())::text::bigint = id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES ((new.id)::text::bigint);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();