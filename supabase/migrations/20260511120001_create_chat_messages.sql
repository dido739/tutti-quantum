-- Create chat_messages table for multiplayer game chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_messages
CREATE POLICY "Chat messages are viewable by session participants" 
ON public.chat_messages FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert chat messages" 
ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX chat_messages_session_id_idx ON public.chat_messages(session_id);
CREATE INDEX chat_messages_created_at_idx ON public.chat_messages(created_at);
