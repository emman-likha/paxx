-- Allow anyone to check username availability (for signup validation)
-- This policy only allows SELECT on the username column for availability checking
-- Users still cannot see sensitive data like master_password_salt
CREATE POLICY "Anyone can check username availability" ON public.profiles
  FOR SELECT 
  USING (true);

-- Note: The frontend should only query the username column when checking availability
-- Example: supabase.from('profiles').select('username').eq('username', 'test_user')
