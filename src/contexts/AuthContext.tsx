import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_games_played: number;
  total_wins: number;
  highest_score: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    setProfile(data ?? null);
  };

  const ensureProfile = async (authUser: User) => {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (existingProfile) {
      setProfile(existingProfile);
      return;
    }

    const metadataUsername = typeof authUser.user_metadata?.username === 'string'
      ? authUser.user_metadata.username
      : null;

    const fallbackUsername = authUser.email
      ? authUser.email.split('@')[0]
      : `user_${authUser.id.slice(0, 8)}`;

    const username = metadataUsername || fallbackUsername;

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: authUser.id,
          username,
        },
        {
          onConflict: 'user_id',
        }
      );

    if (error) throw error;

    await fetchProfile(authUser.id);
  };

  const normalizeAuthError = (error: unknown): Error => {
    const getObjectMessage = (value: unknown): string | null => {
      if (!value || typeof value !== 'object') return null;

      const record = value as Record<string, unknown>;
      const directMessage = typeof record.message === 'string' ? record.message : null;
      const description = typeof record.error_description === 'string' ? record.error_description : null;
      const code = typeof record.code === 'string' ? record.code : null;

      if (directMessage && code) return `${directMessage} (${code})`;
      return directMessage || description;
    };

    const message =
      (error instanceof Error ? error.message : null) ||
      getObjectMessage(error) ||
      null;

    if (message && /failed to fetch|networkerror|network error/i.test(message)) {
      return new Error(
        'Cannot reach Supabase. Check internet, VITE_SUPABASE_URL, and your anon key. Also disable blockers/firewalls for supabase.co.'
      );
    }

    if (message && /rate limit|too many requests|email rate limit/i.test(message)) {
      return new Error(
        'Email rate limit reached. Wait a few minutes before trying again, or use a different email address.'
      );
    }

    if (message) {
      return new Error(message);
    }

    return new Error('Unexpected authentication error (no details returned)');
  };

  useEffect(() => {
    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            ensureProfile(session.user).catch(() => {
              fetchProfile(session.user.id);
            });
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        ensureProfile(session.user)
          .catch(() => fetchProfile(session.user.id))
          .finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (existingUsername) {
        throw new Error('Username is already taken. Please choose another one.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        await ensureProfile(data.user);
      }

      return { error: null };
    } catch (error) {
      return { error: normalizeAuthError(error) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: normalizeAuthError(error) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(data);

      return { error: null };
    } catch (error) {
      return { error: normalizeAuthError(error) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
