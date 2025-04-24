/*
  # Fix Comments Table RLS Policies

  1. Changes
    - Drop and recreate the INSERT policy for comments table to ensure proper user_id handling
    - Ensure policy allows authenticated users to create comments
    
  2. Security
    - Maintains RLS enabled on comments table
    - Fixes INSERT policy to properly check user authentication
*/

-- Drop existing INSERT policy if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'comments' 
    AND policyname = 'Authenticated users can create comments'
  ) THEN
    DROP POLICY "Authenticated users can create comments" ON public.comments;
  END IF;
END $$;

-- Create new INSERT policy with proper user_id handling
CREATE POLICY "Authenticated users can create comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);