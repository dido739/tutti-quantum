-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  total_games_played INTEGER NOT NULL DEFAULT 0,
  total_wins INTEGER NOT NULL DEFAULT 0,
  highest_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create game_sessions table for multiplayer games
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  max_players INTEGER NOT NULL DEFAULT 2 CHECK (max_players >= 2 AND max_players <= 4),
  current_player_index INTEGER NOT NULL DEFAULT 0,
  round_number INTEGER NOT NULL DEFAULT 1,
  game_state JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on game_sessions
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for game_sessions
CREATE POLICY "Game sessions are viewable by everyone" 
ON public.game_sessions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create game sessions" 
ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Host can update their game session" 
ON public.game_sessions FOR UPDATE USING (auth.uid() = host_user_id);

CREATE POLICY "Host can delete their game session" 
ON public.game_sessions FOR DELETE USING (auth.uid() = host_user_id);

-- Create game_players table to track players in a session
CREATE TABLE public.game_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_index INTEGER NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  diagram JSONB NOT NULL DEFAULT '[]',
  hand JSONB NOT NULL DEFAULT '[]',
  secret_card JSONB,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id),
  UNIQUE(session_id, player_index)
);

-- Enable RLS on game_players
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

-- RLS policies for game_players
CREATE POLICY "Game players are viewable by session participants" 
ON public.game_players FOR SELECT USING (true);

CREATE POLICY "Users can join game sessions" 
ON public.game_players FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player data" 
ON public.game_players FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave game sessions" 
ON public.game_players FOR DELETE USING (auth.uid() = user_id);

-- Create leaderboard view for high scores
CREATE TABLE public.leaderboard_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('competitive', 'cooperative')),
  player_count INTEGER NOT NULL,
  valid_vertices INTEGER NOT NULL DEFAULT 0,
  invalid_vertices INTEGER NOT NULL DEFAULT 0,
  loops_formed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on leaderboard_entries
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for leaderboard_entries
CREATE POLICY "Leaderboard entries are viewable by everyone" 
ON public.leaderboard_entries FOR SELECT USING (true);

CREATE POLICY "Users can insert their own scores" 
ON public.leaderboard_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for game sessions and players
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
BEFORE UPDATE ON public.game_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique game codes
CREATE OR REPLACE FUNCTION public.generate_game_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;