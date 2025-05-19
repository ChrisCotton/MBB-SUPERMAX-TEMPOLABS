-- Create a test user for development purposes
-- First, insert into auth.users table
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  crypt('password123', gen_salt('bf')), -- Using proper Postgres function to hash password
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test User"}',
  false
) ON CONFLICT (id) DO NOTHING;

-- Then, insert into public.user_profiles table
INSERT INTO public.user_profiles (id, user_id, display_name, created_at, updated_at, target_balance, initial_balance)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'Test User',
  now(),
  now(),
  1000,
  0
) ON CONFLICT (id) DO NOTHING;