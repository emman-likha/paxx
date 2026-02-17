-- Add username support to profiles table
-- Migration: 0002_add_username_to_profiles

-- Add username column with unique constraint
ALTER TABLE profiles 
ADD COLUMN username TEXT UNIQUE;

-- Add index for faster username lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- Add constraint for username format (alphanumeric, underscore, hyphen, 3-20 chars)
ALTER TABLE profiles
ADD CONSTRAINT username_format 
CHECK (username ~ '^[a-zA-Z0-9_-]{3,20}$');

-- Add comment for documentation
COMMENT ON COLUMN profiles.username IS 'Unique username for login (3-20 chars, alphanumeric + underscore/hyphen)';
