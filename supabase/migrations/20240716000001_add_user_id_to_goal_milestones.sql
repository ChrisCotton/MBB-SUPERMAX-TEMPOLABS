-- Add user_id column to goal_milestones table
ALTER TABLE goal_milestones ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS goal_milestones_user_id_idx ON goal_milestones(user_id);
