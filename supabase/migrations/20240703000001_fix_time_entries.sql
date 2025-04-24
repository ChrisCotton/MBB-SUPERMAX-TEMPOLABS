-- This migration ensures the time_entries table has the correct structure
-- and removes any references to the is_running column if it exists

-- Check if is_running column exists and drop it if it does
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'time_entries' AND column_name = 'is_running') THEN
        ALTER TABLE time_entries DROP COLUMN is_running;
    END IF;
END$$;

-- Ensure the time_entries table has the correct structure
ALTER TABLE time_entries
    ALTER COLUMN start_time SET NOT NULL,
    ALTER COLUMN task_id SET NOT NULL,
    ALTER COLUMN user_id SET NOT NULL;

-- Add comment to clarify how timer status is determined
COMMENT ON TABLE time_entries IS 'Time entries for tasks. A running timer has end_time = NULL. A completed timer has end_time set to a timestamp.';
