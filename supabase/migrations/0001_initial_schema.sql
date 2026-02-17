-- 1. PROFILES: Stores public metadata for user encryption
-- This is the "Identity" part of the Zero-Knowledge system.
-- It stores the Salt so the user can derive the same key on any device.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  master_password_salt TEXT NOT NULL, -- Used by the client to derive the Master Key
  is_admin BOOLEAN DEFAULT FALSE, -- Flag for administrative access
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. ENABLE SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES (Row Level Security)
-- Profiles: Users can only see their own salt/metadata.
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin Access: Admins can view ALL profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow users to insert their own profile during the signup flow.
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their profile.
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update any profile (e.g. to promote/demote or suspend)
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    )
  );
