-- Add is_running column to time_entries table
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS is_running BOOLEAN DEFAULT false;

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE time_entries;
