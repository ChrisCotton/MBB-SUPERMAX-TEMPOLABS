-- Create tables for Mental Bank Task Manager

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hourly_rate NUMERIC(10, 2) NOT NULL,
  tasks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  hourly_rate NUMERIC(10, 2) NOT NULL,
  estimated_hours NUMERIC(10, 2) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Mental Bank Balances Table
CREATE TABLE IF NOT EXISTS mental_bank_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_balance NUMERIC(12, 2) NOT NULL,
  target_balance NUMERIC(12, 2) NOT NULL,
  progress_percentage INTEGER NOT NULL,
  daily_growth NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_balance UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_bank_balances ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Users can only access their own categories"
ON categories FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own tasks"
ON tasks FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own mental bank balance"
ON mental_bank_balances FOR ALL
USING (auth.uid() = user_id);

-- Enable realtime subscriptions
alter publication supabase_realtime add table categories;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table mental_bank_balances;
