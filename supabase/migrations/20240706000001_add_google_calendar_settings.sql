-- Add Google Calendar settings table
CREATE TABLE IF NOT EXISTS google_calendar_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_connected BOOLEAN NOT NULL DEFAULT FALSE,
  selected_calendar_id TEXT,
  auto_sync_new_tasks BOOLEAN NOT NULL DEFAULT FALSE,
  sync_completed_tasks BOOLEAN NOT NULL DEFAULT FALSE,
  sync_high_priority_only BOOLEAN NOT NULL DEFAULT FALSE,
  refresh_token TEXT,
  access_token TEXT,
  token_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add task_calendar_events table to track synced events
CREATE TABLE IF NOT EXISTS task_calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  calendar_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
DROP POLICY IF EXISTS "Users can only access their own Google Calendar settings" ON google_calendar_settings;
CREATE POLICY "Users can only access their own Google Calendar settings"
  ON google_calendar_settings
  FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own task calendar events" ON task_calendar_events;
CREATE POLICY "Users can only access their own task calendar events"
  ON task_calendar_events
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM tasks WHERE id = task_id));

-- Enable row level security
ALTER TABLE google_calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_calendar_events ENABLE ROW LEVEL SECURITY;

-- Enable realtime
alter publication supabase_realtime add table google_calendar_settings;
alter publication supabase_realtime add table task_calendar_events;