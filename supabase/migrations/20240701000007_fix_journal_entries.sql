-- Check if journal_entries table exists and create it if not
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  audio_url TEXT,
  transcription TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for journal_entries
DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;
CREATE POLICY "Users can view their own journal entries"
  ON journal_entries
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;
CREATE POLICY "Users can insert their own journal entries"
  ON journal_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;
CREATE POLICY "Users can update their own journal entries"
  ON journal_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;
CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE journal_entries;
