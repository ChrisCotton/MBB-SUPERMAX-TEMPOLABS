-- Create time_entries table to store task timing data
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add in_progress column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS in_progress BOOLEAN DEFAULT false;

-- Add current_session_start_time column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS current_session_start_time TIMESTAMP WITH TIME ZONE;

-- Enable RLS on time_entries
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for time_entries
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
CREATE POLICY "Users can view their own time entries"
  ON time_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own time entries" ON time_entries;
CREATE POLICY "Users can insert their own time entries"
  ON time_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own time entries" ON time_entries;
CREATE POLICY "Users can update their own time entries"
  ON time_entries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own time entries" ON time_entries;
CREATE POLICY "Users can delete their own time entries"
  ON time_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Add time_entries to realtime publication
alter publication supabase_realtime add table time_entries;