-- Update user_settings table to ensure it has the right structure
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS ai_config JSONB DEFAULT '{"ai_enabled": true, "creativity_level": 50, "auto_suggestions": true, "data_sharing": false}';