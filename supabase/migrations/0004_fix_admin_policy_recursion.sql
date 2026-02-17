-- Fix infinite recursion in admin RLS policies
-- The previous policies queried the profiles table within profiles policies, causing infinite loops
-- Solution: Use a helper function to check admin status

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Create a helper function to check if current user is admin
-- This function is SECURITY DEFINER, meaning it runs with the privileges of the function owner
-- This breaks the recursion because it's evaluated outside the RLS context
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate admin policies using the helper function
-- This avoids infinite recursion because the function call doesn't trigger RLS
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin());
