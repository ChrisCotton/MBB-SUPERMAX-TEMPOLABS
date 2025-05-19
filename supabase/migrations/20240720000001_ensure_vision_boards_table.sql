-- Create vision_boards table if it doesn't exist
CREATE TABLE IF NOT EXISTS vision_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for vision board images if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'vision-board-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('vision-board-images', 'vision-board-images', true);
  END IF;
END
$$;

-- Set up RLS policies for vision_boards table
ALTER TABLE vision_boards ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own vision board items
DROP POLICY IF EXISTS "Users can view their own vision board items" ON vision_boards;
CREATE POLICY "Users can view their own vision board items"
  ON vision_boards FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own vision board items
DROP POLICY IF EXISTS "Users can insert their own vision board items" ON vision_boards;
CREATE POLICY "Users can insert their own vision board items"
  ON vision_boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own vision board items
DROP POLICY IF EXISTS "Users can update their own vision board items" ON vision_boards;
CREATE POLICY "Users can update their own vision board items"
  ON vision_boards FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own vision board items
DROP POLICY IF EXISTS "Users can delete their own vision board items" ON vision_boards;
CREATE POLICY "Users can delete their own vision board items"
  ON vision_boards FOR DELETE
  USING (auth.uid() = user_id);

-- Add to realtime publication
alter publication supabase_realtime add table vision_boards;
