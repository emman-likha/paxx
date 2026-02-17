-- Add username column to profiles table
ALTER TABLE profiles
ADD COLUMN username TEXT UNIQUE;

-- Add constraint to ensure username format (3-20 chars, alphanumeric + underscore/hyphen)
ALTER TABLE profiles
ADD CONSTRAINT username_format CHECK (
  username IS NULL OR (
    username ~ '^[a-zA-Z0-9_-]{3,20}$'
  )
);

-- Create index for faster username lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- Add comment for documentation
COMMENT ON COLUMN profiles.username IS 'Unique username for login (3-20 chars, alphanumeric + underscore/hyphen)';
