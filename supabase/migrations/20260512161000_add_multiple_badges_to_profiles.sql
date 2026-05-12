-- Add support for multiple badges per profile
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS badge_types TEXT[] NOT NULL DEFAULT '{}'::TEXT[];

-- Backfill array values from legacy single badge column
UPDATE public.profiles
SET badge_types = CASE
  WHEN badge_type IS NULL THEN '{}'::TEXT[]
  ELSE ARRAY[badge_type]
END
WHERE badge_types = '{}'::TEXT[];

-- Keep existing badge_type column in sync for backward compatibility
UPDATE public.profiles
SET badge_type = badge_types[1]
WHERE COALESCE(badge_type, '') IS DISTINCT FROM COALESCE(badge_types[1], '');

-- Validate all badge values stored in the array
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS valid_badge_types;

ALTER TABLE public.profiles
ADD CONSTRAINT valid_badge_types CHECK (
  badge_types <@ ARRAY['og', 'pro', 'supporter', 'student', 'teacher', 'dev', 'moderator', 'admin']::TEXT[]
);

CREATE INDEX IF NOT EXISTS profiles_badge_types_idx ON public.profiles USING GIN (badge_types);

-- Helper for admin checks based on one or many badges
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
      AND (
        badge_type IN ('admin', 'dev')
        OR badge_types && ARRAY['admin', 'dev']::TEXT[]
      )
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
      OR NEW.badge_types IS DISTINCT FROM OLD.badge_types
      OR NEW.is_banned IS DISTINCT FROM OLD.is_banned
      OR NEW.banned_reason IS DISTINCT FROM OLD.banned_reason
      OR NEW.banned_at IS DISTINCT FROM OLD.banned_at THEN
      RAISE EXCEPTION 'Only admins can manage badges and bans.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Admin RPC to set multiple badges
CREATE OR REPLACE FUNCTION public.admin_set_profile_badges(p_user_id UUID, p_badge_types TEXT[] DEFAULT '{}'::TEXT[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  normalized_badge_types TEXT[];
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Admin access required.';
  END IF;

  SELECT COALESCE(ARRAY_AGG(badge ORDER BY badge), '{}'::TEXT[])
  INTO normalized_badge_types
  FROM (
    SELECT DISTINCT TRIM(value) AS badge
    FROM UNNEST(COALESCE(p_badge_types, '{}'::TEXT[])) AS value
    WHERE TRIM(value) <> ''
  ) badges;

  IF EXISTS (
    SELECT 1
    FROM UNNEST(normalized_badge_types) AS badge
    WHERE badge NOT IN ('og', 'pro', 'supporter', 'student', 'teacher', 'dev', 'moderator', 'admin')
  ) THEN
    RAISE EXCEPTION 'Invalid badge type.';
  END IF;

  UPDATE public.profiles
  SET badge_types = normalized_badge_types,
      badge_type = CASE
        WHEN CARDINALITY(normalized_badge_types) > 0 THEN normalized_badge_types[1]
        ELSE NULL
      END,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Keep single-badge RPC for compatibility, backed by multi-badge storage
CREATE OR REPLACE FUNCTION public.admin_set_profile_badge(p_user_id UUID, p_badge_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF p_badge_type IS NULL OR TRIM(p_badge_type) = '' THEN
    PERFORM public.admin_set_profile_badges(p_user_id, '{}'::TEXT[]);
    RETURN;
  END IF;

  PERFORM public.admin_set_profile_badges(p_user_id, ARRAY[TRIM(p_badge_type)]::TEXT[]);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_profile_badges(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_profile_badge(UUID, TEXT) TO authenticated;
