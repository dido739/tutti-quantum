-- Add badge_type column to profiles table
ALTER TABLE public.profiles ADD COLUMN badge_type TEXT DEFAULT NULL;

-- Add constraint to limit badge types
ALTER TABLE public.profiles ADD CONSTRAINT valid_badge_type CHECK (
  badge_type IS NULL OR badge_type IN ('og', 'pro', 'supporter', 'student', 'teacher', 'dev', 'moderator', 'admin')
);

-- Create index for efficient querying by badge type
CREATE INDEX profiles_badge_type_idx ON public.profiles(badge_type);
