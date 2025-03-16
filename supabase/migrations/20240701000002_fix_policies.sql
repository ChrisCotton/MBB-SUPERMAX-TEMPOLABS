-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only access their own categories" ON categories;
DROP POLICY IF EXISTS "Users can only access their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can only access their own mental bank balance" ON mental_bank_balances;

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
