-- Resolve a public username to the corresponding auth email for login.
-- SECURITY DEFINER is required because auth.users is not directly readable by anon/authenticated roles.
CREATE OR REPLACE FUNCTION public.get_email_for_username(p_username TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT au.email
  FROM public.profiles AS p
  JOIN auth.users AS au ON au.id = p.user_id
  WHERE lower(p.username) = lower(trim(p_username))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_email_for_username(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_for_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_for_username(TEXT) TO authenticated;
