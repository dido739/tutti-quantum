-- Add moderation fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS banned_reason TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS profiles_is_banned_idx ON public.profiles(is_banned);

-- Helper for admin checks based on profile badge
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND badge_type IN ('admin', 'dev')
  );
$$;

-- Prevent non-admins from tampering with moderation fields directly
CREATE OR REPLACE FUNCTION public.prevent_profile_moderation_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    IF NEW.badge_type IS DISTINCT FROM OLD.badge_type
      OR NEW.is_banned IS DISTINCT FROM OLD.is_banned
      OR NEW.banned_reason IS DISTINCT FROM OLD.banned_reason
      OR NEW.banned_at IS DISTINCT FROM OLD.banned_at THEN
      RAISE EXCEPTION 'Only admins can manage badges and bans.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_moderation_tampering ON public.profiles;
CREATE TRIGGER prevent_profile_moderation_tampering
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_moderation_tampering();

-- Admin RPC to set badges
CREATE OR REPLACE FUNCTION public.admin_set_profile_badge(p_user_id UUID, p_badge_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Admin access required.';
  END IF;

  IF p_badge_type IS NOT NULL AND p_badge_type NOT IN ('og', 'pro', 'supporter', 'student', 'teacher', 'dev', 'moderator', 'admin') THEN
    RAISE EXCEPTION 'Invalid badge type.';
  END IF;

  UPDATE public.profiles
  SET badge_type = p_badge_type,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Admin RPC to ban or unban users
CREATE OR REPLACE FUNCTION public.admin_set_user_ban(p_user_id UUID, p_is_banned BOOLEAN, p_reason TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Admin access required.';
  END IF;

  UPDATE public.profiles
  SET is_banned = p_is_banned,
      banned_reason = CASE WHEN p_is_banned THEN NULLIF(TRIM(p_reason), '') ELSE NULL END,
      banned_at = CASE WHEN p_is_banned THEN now() ELSE NULL END,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Admin RPC to delete an auth user and cascade their profile data
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Admin access required.';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own account from the admin dashboard.';
  END IF;

  DELETE FROM auth.users
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_profile_badge(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_ban(UUID, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;