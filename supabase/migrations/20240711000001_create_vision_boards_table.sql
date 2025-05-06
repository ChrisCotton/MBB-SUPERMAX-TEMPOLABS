-- Create vision_boards table if it doesn't exist
CREATE TABLE IF NOT EXISTS vision_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for vision boards if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'vision-boards'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('vision-boards', 'vision-boards', true);
  END IF;
END $$;

-- Set up RLS policies for vision_boards table
ALTER TABLE vision_boards ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own vision boards
DROP POLICY IF EXISTS "Users can view their own vision boards" ON vision_boards;
CREATE POLICY "Users can view their own vision boards"
  ON vision_boards FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own vision boards
DROP POLICY IF EXISTS "Users can insert their own vision boards" ON vision_boards;
CREATE POLICY "Users can insert their own vision boards"
  ON vision_boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own vision boards
DROP POLICY IF EXISTS "Users can update their own vision boards" ON vision_boards;
CREATE POLICY "Users can update their own vision boards"
  ON vision_boards FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own vision boards
DROP POLICY IF EXISTS "Users can delete their own vision boards" ON vision_boards;
CREATE POLICY "Users can delete their own vision boards"
  ON vision_boards FOR DELETE
  USING (auth.uid() = user_id);

-- Add to realtime publication
alter publication supabase_realtime add table vision_boards;
