-- Add daily_balance column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS daily_balance NUMERIC DEFAULT 0;

-- Create increment function if it doesn't exist
CREATE OR REPLACE FUNCTION increment(row_id text, increment_amount numeric, column_name text)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  current_value numeric;
  new_value numeric;
BEGIN
  EXECUTE format('SELECT COALESCE(%I, 0) FROM tasks WHERE id = $1', column_name)
  INTO current_value
  USING row_id;
  
  new_value := current_value + increment_amount;
  
  EXECUTE format('UPDATE tasks SET %I = $1 WHERE id = $2', column_name)
  USING new_value, row_id;
  
  RETURN new_value;
END;
$$;