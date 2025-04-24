-- Add is_running column to time_entries table
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS is_running BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column usage
COMMENT ON COLUMN time_entries.is_running IS 'Indicates if this time entry is currently running';

-- Update existing entries to set is_running based on end_time
UPDATE time_entries SET is_running = (end_time IS NULL);
