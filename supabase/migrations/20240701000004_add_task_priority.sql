-- Add priority and due date fields to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date timestamp with time zone;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Update the tasks table to include the new fields in the RLS policy
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
