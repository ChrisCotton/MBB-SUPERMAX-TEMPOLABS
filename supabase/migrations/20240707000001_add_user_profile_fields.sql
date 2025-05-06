-- Add notification fields to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS notification_daily_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_goal_achievement BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_task_reminders BOOLEAN DEFAULT true;
