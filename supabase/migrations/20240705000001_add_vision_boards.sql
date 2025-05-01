-- Create vision_boards table
CREATE TABLE IF NOT EXISTS vision_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vision_boards ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own vision boards" ON vision_boards;
CREATE POLICY "Users can view their own vision boards"
  ON vision_boards FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own vision boards" ON vision_boards;
CREATE POLICY "Users can insert their own vision boards"
  ON vision_boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own vision boards" ON vision_boards;
CREATE POLICY "Users can update their own vision boards"
  ON vision_boards FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own vision boards" ON vision_boards;
CREATE POLICY "Users can delete their own vision boards"
  ON vision_boards FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for vision board images if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'vision-boards'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('vision-boards', 'vision-boards', false);
  END IF;
END $$;

-- Set up storage policies
DROP POLICY IF EXISTS "Users can view their own vision board images" ON storage.objects;
CREATE POLICY "Users can view their own vision board images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vision-boards' AND auth.uid()::TEXT = SPLIT_PART(name, '/', 1));

DROP POLICY IF EXISTS "Users can upload their own vision board images" ON storage.objects;
CREATE POLICY "Users can upload their own vision board images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vision-boards' AND auth.uid()::TEXT = SPLIT_PART(name, '/', 1));

DROP POLICY IF EXISTS "Users can update their own vision board images" ON storage.objects;
CREATE POLICY "Users can update their own vision board images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vision-boards' AND auth.uid()::TEXT = SPLIT_PART(name, '/', 1));

DROP POLICY IF EXISTS "Users can delete their own vision board images" ON storage.objects;
CREATE POLICY "Users can delete their own vision board images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vision-boards' AND auth.uid()::TEXT = SPLIT_PART(name, '/', 1));
