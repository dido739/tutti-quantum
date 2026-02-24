import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award, User, Calendar, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  game_mode: string;
  player_count: number;
  valid_vertices: number;
  invalid_vertices: number;
  loops_formed: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
}

export default function Leaderboard() {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'competitive' | 'cooperative'>('competitive');

  useEffect(() => {
    fetchLeaderboard();
  }, [mode]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('game_mode', mode)
      .order('score', { ascending: false })
      .limit(50);

    if (!error && data) {
      // Fetch usernames separately
      const userIds = [...new Set(data.map(e => e.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const entriesWithProfiles = data.map(entry => ({
        ...entry,
        profiles: profileMap.get(entry.user_id) || null,
      }));
      
      setEntries(entriesWithProfiles as LeaderboardEntry[]);
    }
    
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/50';
    return 'bg-card/50 border-border/50';
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Button>
          </Link>
          
          <h1 className="font-display text-3xl text-glow text-center flex-1">
            {t('leaderboard.title')}
          </h1>
          
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 max-w-4xl mx-auto">
          <CardHeader>
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'competitive' | 'cooperative')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="competitive" className="font-display">
                  <Zap className="w-4 h-4 mr-2" />
                  {t('leaderboard.competitive')}
                </TabsTrigger>
                <TabsTrigger value="cooperative" className="font-display">
                  <Target className="w-4 h-4 mr-2" />
                  {t('leaderboard.cooperative')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('leaderboard.empty')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry, index) => {
                  const rank = index + 1;
                  const isCurrentUser = user?.id === entry.user_id;
                  
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border transition-all',
                        getRankStyle(rank),
                        isCurrentUser && 'ring-2 ring-primary'
                      )}
                    >
                      <div className="flex-shrink-0">
                        {getRankIcon(rank)}
                      </div>
                      
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-semibold truncate',
                          isCurrentUser && 'text-primary'
                        )}>
                          {entry.profiles?.username || t('leaderboard.unknown')}
                          {isCurrentUser && <span className="text-xs ml-2 text-muted-foreground">{t('common.you')}</span>}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {entry.valid_vertices} {t('leaderboard.valid')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-display text-2xl font-bold text-primary">{entry.score}</p>
                        <p className="text-xs text-muted-foreground">{t('common.points')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
