-- Drop existing policies
DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON recipes;
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;

-- Create new policies for recipes
CREATE POLICY "Authenticated users can view recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (true);

-- Create new policies for comments
CREATE POLICY "Authenticated users can view comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

-- Create public.users view to access auth.users
CREATE OR REPLACE VIEW public.users AS
SELECT
  id,
  email
FROM auth.users;