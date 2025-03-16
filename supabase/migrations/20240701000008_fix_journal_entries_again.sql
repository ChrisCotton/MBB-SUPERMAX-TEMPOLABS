-- Ensure journal_entries table exists with correct structure
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  audio_url TEXT,
  transcription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Disable RLS temporarily to ensure we can fix any issues
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Recreate policies
DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;
CREATE POLICY "Users can view their own journal entries"
ON journal_entries FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;
CREATE POLICY "Users can insert their own journal entries"
ON journal_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;
CREATE POLICY "Users can update their own journal entries"
ON journal_entries FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;
CREATE POLICY "Users can delete their own journal entries"
ON journal_entries FOR DELETE
USING (auth.uid() = user_id);

-- Ensure realtime is enabled
alter publication supabase_realtime add table journal_entries;
