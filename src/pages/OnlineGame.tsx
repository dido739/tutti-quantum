import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ParticleBackground } from '@/components/ParticleBackground';
import { GameBoard } from '@/components/GameBoard';
import { ParticleCard } from '@/components/ParticleCard';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, Users, Play, Globe, UserPlus, Loader2, Copy, Check, Wifi, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';
import {
  ParticleCard as ParticleCardType,
  PlacedCard,
  GridPosition,
  calculateScore,
  createDeck,
  shuffleDeck,
  placeCard,
  rotateCard,
  advanceGame,
} from '@/lib/gameLogic';

interface GamePlayer {
  id: string;
  session_id: string;
  user_id: string;
  player_index: number;
  score: number;
  diagram: any[];
  hand: any[];
  is_ready: boolean;
  username?: string;
}

export default function OnlineGame() {
  const navigate = useNavigate();
  const { gameCode } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useI18n();

  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'lobby' | 'playing' | 'cancelled'>('menu');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [joinCode, setJoinCode] = useState(gameCode || '');
  const [session, setSession] = useState<any>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('A player disconnected.');
  const disconnectCancelInFlightRef = useRef(false);
  const onlinePlayerIdsRef = useRef<Set<string>>(new Set());
  const playersRef = useRef<GamePlayer[]>([]);
  const sessionStatusRef = useRef<string>('waiting');
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    sessionStatusRef.current = session?.status || 'waiting';
  }, [session?.status]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const cancelGameForDisconnect = async (disconnectedUserId?: string) => {
    const activeSession = sessionRef.current;
    if (!activeSession || disconnectCancelInFlightRef.current) return;
    if (activeSession.status !== 'playing') return;

    disconnectCancelInFlightRef.current = true;
    const gameState = activeSession.game_state as any;

    try {
      await supabase
        .from('game_sessions')
        .update({
          status: 'finished',
          game_state: {
            ...gameState,
            phase: 'finished',
            cancelled: true,
            cancelReason: disconnectedUserId
              ? `Player disconnected: ${disconnectedUserId}`
              : 'Player disconnected',
          },
        })
        .eq('id', activeSession.id)
        .eq('status', 'playing');
    } finally {
      disconnectCancelInFlightRef.current = false;
    }
  };

  const fetchPlayers = async (sessionId: string) => {
    const { data } = await supabase
      .from('game_players')
      .select('*')
      .eq('session_id', sessionId)
      .order('player_index');
    
    if (data) {
      const userIds = data.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.username]) || []);
      
      setPlayers(data.map(p => ({
        ...p,
        diagram: (p.diagram as any[]) || [],
        hand: (p.hand as any[]) || [],
        username: profileMap.get(p.user_id) || `Player ${p.player_index + 1}`,
      })));
    }
  };

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`game-${session.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineIds = new Set<string>();

        Object.values(state).forEach((entries: any) => {
          (entries || []).forEach((entry: any) => {
            if (typeof entry?.user_id === 'string') {
              onlineIds.add(entry.user_id);
            }
          });
        });

        onlinePlayerIdsRef.current = onlineIds;
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
        const leavingUserIds = new Set<string>();
        (leftPresences || []).forEach((presence: any) => {
          if (typeof presence?.user_id === 'string') {
            leavingUserIds.add(presence.user_id);
          }
        });

        if (sessionStatusRef.current !== 'playing') return;

        const activePlayers = playersRef.current.filter((player) => player.user_id);
        const someoneInGameLeft = activePlayers.some((player) => leavingUserIds.has(player.user_id));
        if (someoneInGameLeft) {
          const firstLeaving = [...leavingUserIds][0];
          cancelGameForDisconnect(firstLeaving);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${session.id}` },
        (payload) => { if (payload.new) setSession(payload.new); }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players', filter: `session_id=eq.${session.id}` },
        () => { fetchPlayers(session.id); }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user?.id) {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [session?.id, user?.id]);

  useEffect(() => {
    if (gameCode && !authLoading && user) {
      setJoinCode(gameCode);
      handleJoinGame(gameCode);
    }
  }, [gameCode, authLoading, user]);

  useEffect(() => {
    if (!session) return;

    if (session.status === 'playing') {
      setMode('playing');
      return;
    }

    if (session.status === 'waiting') {
      setMode('lobby');
    }
  }, [session?.id, session?.status]);

  useEffect(() => {
    const gameState = session?.game_state as any;
    if (session?.status === 'finished' && gameState?.cancelled) {
      toast.error(t('online.cancelled'));
      setCancelReason(gameState?.cancelReason || t('online.cancelledReason'));
      setMode('cancelled');
      setSession(null);
      setPlayers([]);
      setSelectedCardId(null);
    }
  }, [session?.status, (session?.game_state as any)?.cancelled, t]);

  const generateGameCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  const handleCreateGame = async () => {
    if (!user) { toast.error(t('online.needSignInCreate')); navigate('/login'); return; }
    setLoading(true);

    try {
      const code = generateGameCode();
      const deck = shuffleDeck(createDeck());
      const cardsPerRound = { 2: 3, 3: 4, 4: 5 }[maxPlayers] || 3;
      const centerCards = deck.splice(0, cardsPerRound);

      const gameStateData = {
        deck: JSON.parse(JSON.stringify(deck)),
        centerCards: JSON.parse(JSON.stringify(centerCards)),
        currentPlayerIndex: 0,
        round: 1,
        maxRounds: { 2: 14, 3: 9, 4: 8 }[maxPlayers] || 14,
        phase: 'waiting',
      };

      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .insert([{
          host_user_id: user.id,
          game_code: code,
          max_players: maxPlayers,
          game_state: gameStateData,
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      await supabase.from('game_players').insert({ session_id: sessionData.id, user_id: user.id, player_index: 0 });

      setSession(sessionData);
      setMode('lobby');
      fetchPlayers(sessionData.id);
      toast.success(`Game created! ${t('online.gameCode')}: ${code}`);
    } catch (error: any) { toast.error(error.message); }
    setLoading(false);
  };

  const handleJoinGame = async (code?: string) => {
    if (!user) { toast.error(t('online.needSignInJoin')); navigate('/login'); return; }
    const gameCodeToUse = (code || joinCode).toUpperCase();
    if (gameCodeToUse.length !== 6) { toast.error(t('online.invalidCode')); return; }
    setLoading(true);

    try {
      const { data: sessionData, error } = await supabase.from('game_sessions').select('*').eq('game_code', gameCodeToUse).single();
      if (error || !sessionData) { toast.error(t('online.gameNotFound')); setLoading(false); return; }
      if (sessionData.status !== 'waiting') { toast.error(t('online.alreadyStarted')); setLoading(false); return; }

      const { data: existingPlayer } = await supabase.from('game_players').select('*').eq('session_id', sessionData.id).eq('user_id', user.id).maybeSingle();
      
      if (!existingPlayer) {
        const { data: playerCount } = await supabase.from('game_players').select('id', { count: 'exact' }).eq('session_id', sessionData.id);
        if (playerCount && playerCount.length >= sessionData.max_players) { toast.error(t('online.gameFull')); setLoading(false); return; }
        await supabase.from('game_players').insert({ session_id: sessionData.id, user_id: user.id, player_index: playerCount?.length || 0 });
        toast.success(t('online.joined'));
      }

      setSession(sessionData);
      setMode('lobby');
      fetchPlayers(sessionData.id);
    } catch (error: any) { toast.error(error.message); }
    setLoading(false);
  };

  const copyGameCode = () => {
    if (session?.game_code) {
      navigator.clipboard.writeText(session.game_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t('online.copyCode'));
    }
  };

  const handleStartGame = async () => {
    if (!session || !user || session.host_user_id !== user.id) return;
    if (players.length < 2) { toast.error(t('online.needMinPlayers')); return; }
    setLoading(true);

    try {
      const gameState = session.game_state as any;
      await supabase.from('game_sessions').update({ status: 'playing', game_state: { ...gameState, phase: 'playing' } }).eq('id', session.id);
      setMode('playing');
      toast.success(t('online.gameStarted'));
    } catch (error: any) { toast.error(error.message); }
    setLoading(false);
  };

  const handleLeaveGame = async () => {
    if (!session || !user) return;

    if (session.status === 'playing') {
      await cancelGameForDisconnect(user.id);
    }

    await supabase.from('game_players').delete().eq('session_id', session.id).eq('user_id', user.id);
    setSession(null);
    setPlayers([]);
    setMode('menu');
    toast.success(t('online.left'));
  };

  const handleRotateCard = (card: ParticleCardType, degrees: number) => {
    if (!session || !isMyTurn) return;
    
    const rotated = rotateCard(card, degrees);
    const gameState = session.game_state as any;
    const newCenterCards = gameState.centerCards.map((c: ParticleCardType) =>
      c.id === card.id ? rotated : c
    );
    const optimisticSession = {
      ...session,
      game_state: {
        ...gameState,
        centerCards: newCenterCards,
      },
    };
    setSession(optimisticSession);
    
    // Update session state
    supabase.from('game_sessions').update({
      game_state: { ...gameState, centerCards: newCenterCards },
    }).eq('id', session.id);
  };

  const handlePlaceCard = async (position: GridPosition) => {
    const activeCenterCards: ParticleCardType[] = (session?.game_state as any)?.centerCards || [];
    const selectedCard = activeCenterCards.find((card) => card.id === selectedCardId) || null;

    if (!session || !user || !selectedCard || !isMyTurn || !myPlayer) return;
    
    const gameState = session.game_state as any;
    
    // Place the card
    const newDiagram = placeCard(selectedCard, position, myPlayer.diagram);
    const newCenterCards = gameState.centerCards.filter((c: ParticleCardType) => c.id !== selectedCard.id);
    const { score, invalidVertices } = calculateScore(newDiagram);
    
    try {
      // Update player's diagram
      await supabase.from('game_players').update({
        diagram: JSON.parse(JSON.stringify(newDiagram)),
        score,
      }).eq('id', myPlayer.id);
      
      // Determine next player and check if round is over
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      const isRoundOver = newCenterCards.length === 0;
      
      let newGameState = {
        ...gameState,
        centerCards: newCenterCards,
        currentPlayerIndex: nextPlayerIndex,
      };
      
      if (isRoundOver) {
        const newRound = gameState.round + 1;
        const maxRounds = gameState.maxRounds;
        
        if (newRound > maxRounds) {
          // Game finished
          newGameState = { ...newGameState, phase: 'finished' };
          await supabase.from('game_sessions').update({
            status: 'finished',
            game_state: newGameState,
          }).eq('id', session.id);
          toast.success(t('online.gameFinished'));
        } else {
          // Start new round - deal new cards
          const deck = [...gameState.deck];
          const cardsPerRound = { 2: 3, 3: 4, 4: 5 }[players.length] || 3;
          const newCards: ParticleCardType[] = [];
          for (let i = 0; i < cardsPerRound && deck.length > 0; i++) {
            const card = deck.pop();
            if (card) newCards.push(card);
          }
          
          newGameState = {
            ...newGameState,
            deck,
            centerCards: newCards,
            round: newRound,
          };
          
          await supabase.from('game_sessions').update({
            game_state: newGameState,
          }).eq('id', session.id);
          toast.success(t('online.roundStarted', { round: newRound }));
        }
      } else {
        await supabase.from('game_sessions').update({
          game_state: newGameState,
        }).eq('id', session.id);
        toast.success(`${players[nextPlayerIndex]?.username}'s turn`);
      }
      
      setSelectedCardId(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const isHost = session?.host_user_id === user?.id;
  const gameState = session?.game_state as any;
  const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;
  const myPlayer = players.find(p => p.user_id === user?.id);
  const isMyTurn = !!myPlayer && myPlayer.player_index === currentPlayerIndex;
  const selectedCard = (gameState?.centerCards as ParticleCardType[] | undefined)?.find(
    (card) => card.id === selectedCardId
  ) || null;

  if (!authLoading && !user && mode !== 'menu') {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <ParticleBackground />
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 p-8 text-center relative z-10">
          <h2 className="font-display text-xl mb-4">{t('online.signInRequired')}</h2>
          <p className="text-muted-foreground mb-6">{t('online.needSignIn')}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>{t('common.back')}</Button>
            <Button onClick={() => navigate('/login')}>{t('common.signIn')}</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <div className="relative z-10">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => mode === 'menu' ? navigate('/') : setMode('menu')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {mode === 'menu' ? t('common.exit') : t('common.back')}
            </Button>
            <h1 className="font-display text-xl text-primary">{t('online.title')}</h1>
            {session && <div className="flex items-center gap-2"><Wifi className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">{t('online.connected')}</span></div>}
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {mode === 'menu' && (
            <div className="max-w-md mx-auto space-y-4">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6 space-y-4">
                  <Button className="w-full h-16 text-lg font-display" onClick={() => setMode('create')}><Globe className="w-5 h-5 mr-2" />{t('online.createGame')}</Button>
                  <Button variant="outline" className="w-full h-16 text-lg font-display" onClick={() => setMode('join')}><UserPlus className="w-5 h-5 mr-2" />{t('online.joinGame')}</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {mode === 'cancelled' && (
            <div className="max-w-md mx-auto space-y-4">
              <Card className="bg-card/80 backdrop-blur-sm border-destructive/40">
                <CardHeader>
                  <CardTitle className="font-display text-center flex items-center justify-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    {t('online.cancelledTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-center text-muted-foreground">{cancelReason}</p>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>{t('common.home')}</Button>
                    <Button className="flex-1" onClick={() => setMode('menu')}>{t('online.onlineMenu')}</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {mode === 'create' && (
            <div className="max-w-md mx-auto">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader><CardTitle className="font-display text-center">{t('online.createTitle')}</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>{t('online.playerCount')}</Label>
                    <div className="flex gap-2">{[2, 3, 4].map(num => <Button key={num} variant={maxPlayers === num ? 'default' : 'outline'} className="flex-1" onClick={() => setMaxPlayers(num)}>{num} {t('online.playersSuffix')}</Button>)}</div>
                  </div>
                  <Button className="w-full font-display" onClick={handleCreateGame} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}{t('online.createGame')}</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {mode === 'join' && (
            <div className="max-w-md mx-auto">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader><CardTitle className="font-display text-center">{t('online.joinGame')}</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="gameCode">{t('online.gameCode')}</Label>
                    <Input id="gameCode" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder={t('online.codePlaceholder')} maxLength={6} className="text-center text-2xl font-mono tracking-widest uppercase" />
                  </div>
                  <Button className="w-full font-display" onClick={() => handleJoinGame()} disabled={loading || joinCode.length !== 6}>{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}{t('online.joinGame')}</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {mode === 'lobby' && session && (
            <div className="max-w-md mx-auto space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader><CardTitle className="font-display text-center">{t('online.gameLobby')}</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">{t('online.gameCode')}</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl font-mono font-bold tracking-widest text-primary">{session.game_code}</span>
                      <Button variant="outline" size="icon" onClick={copyGameCode}>{copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{t('online.players', { count: players.length, max: session.max_players })}</p>
                    {players.map((player, index) => (
                      <div key={player.id} className={cn('flex items-center gap-3 p-3 rounded-lg border', player.user_id === user?.id ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border/50')}>
                        <Users className="w-4 h-4 text-primary" />
                        <span className="flex-1">{player.username}{player.user_id === session.host_user_id && <span className="ml-2 text-xs text-primary">{t('common.host')}</span>}{player.user_id === user?.id && <span className="ml-2 text-xs text-muted-foreground">{t('common.you')}</span>}</span>
                      </div>
                    ))}
                    {Array.from({ length: session.max_players - players.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border/30"><UserPlus className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground">{t('online.waiting')}</span></div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleLeaveGame}>{t('common.leave')}</Button>
                    {isHost && <Button className="flex-1 font-display" onClick={handleStartGame} disabled={loading || players.length < 2}>{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}{t('online.start')}</Button>}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {(mode === 'playing' || session?.status === 'playing') && session && (
            <div className="grid lg:grid-cols-[1fr,300px] gap-6">
              <div className="space-y-6">
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display flex items-center justify-between">
                      <span className="flex items-center gap-2"><Play className="w-5 h-5 text-primary" />{t('online.availableCards')}</span>
                      <span className={cn('text-sm px-3 py-1 rounded-full', isMyTurn ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>{isMyTurn ? t('online.yourTurn') : t('online.turnPlayer', { name: players[currentPlayerIndex]?.username || 'Player' })}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 flex-wrap justify-center">
                      {gameState?.centerCards?.map((card: ParticleCardType) => (
                        <ParticleCard 
                          key={card.id} 
                          card={card} 
                          onClick={() => isMyTurn && setSelectedCardId(selectedCardId === card.id ? null : card.id)} 
                          onRotate={(degrees) => handleRotateCard(card, degrees)}
                          selected={selectedCard?.id === card.id} 
                          disabled={!isMyTurn} 
                          size="xl"
                          showRotateButton={isMyTurn} 
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                  <CardHeader className="pb-3"><CardTitle className="text-lg font-display">{t('online.yourDiagram')}</CardTitle></CardHeader>
                  <CardContent>
                    <GameBoard 
                      diagram={myPlayer?.diagram || []} 
                      onCellClick={handlePlaceCard}
                      canPlace={isMyTurn && !!selectedCard} 
                      highlightValidPositions={isMyTurn && !!selectedCard} 
                      size="xl"
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                {players.map((player, index) => {
                  const { score, validVertices, invalidVertices, loops } = calculateScore(player.diagram || []);
                  return (
                    <Card key={player.id} className={cn('bg-card/80 backdrop-blur-sm transition-all', index === currentPlayerIndex ? 'border-primary ring-2 ring-primary/30' : 'border-border/50', player.user_id === user?.id && 'bg-primary/5')}>
                      <CardHeader className="pb-2"><CardTitle className={cn('text-lg font-display flex items-center justify-between', index === currentPlayerIndex && 'text-primary')}><span className="flex items-center gap-2"><Users className="w-4 h-4" />{player.username}{player.user_id === user?.id && <span className="text-xs text-muted-foreground">{t('common.you')}</span>}</span>{index === currentPlayerIndex && <span className="text-xs bg-primary/20 px-2 py-1 rounded-full">{t('common.playing')}</span>}</CardTitle></CardHeader>
                      <CardContent><ScoreDisplay score={score} validVertices={validVertices} invalidVertices={invalidVertices} loops={loops} /></CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
