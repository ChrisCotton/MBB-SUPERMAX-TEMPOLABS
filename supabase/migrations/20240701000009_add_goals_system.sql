-- Create goals table for tracking user goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC(12, 2) NOT NULL,
  current_value NUMERIC(12, 2) DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  target_date TIMESTAMPTZ NOT NULL,
  time_frame TEXT NOT NULL CHECK (time_frame IN ('weekly', 'monthly', 'biannual', 'annual')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  reward TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create milestones table for tracking progress points within goals
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC(12, 2) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMPTZ,
  reward TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Users can only access their own goals"
ON goals FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own goal milestones"
ON goal_milestones FOR ALL
USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

-- Enable realtime subscriptions
alter publication supabase_realtime add table goals;
alter publication supabase_realtime add table goal_milestones;
