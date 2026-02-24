-- Allow any session participant to update game state (turn progression, center cards, rounds)
DROP POLICY IF EXISTS "Host can update their game session" ON public.game_sessions;

CREATE POLICY "Session players can update game sessions"
ON public.game_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.game_players gp
    WHERE gp.session_id = game_sessions.id
      AND gp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.game_players gp
    WHERE gp.session_id = game_sessions.id
      AND gp.user_id = auth.uid()
  )
);
