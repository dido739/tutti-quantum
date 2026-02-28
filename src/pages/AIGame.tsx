import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GameState,
  ParticleCard as ParticleCardType,
  GridPosition,
  initializeGame,
  placeCard,
  rotateCard,
  calculateScore,
  advanceGame,
} from '@/lib/gameLogic';
import { findBestMove, AIDifficulty } from '@/lib/aiPlayer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { GameBoard } from '@/components/GameBoard';
import { ParticleCard } from '@/components/ParticleCard';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bot, Play, Trophy, RotateCcw, User, Cpu, Zap, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';

export default function AIGame() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const getAIName = useCallback(
    (level: AIDifficulty) => {
      if (level === 'easy') return t('ai.easyDesc');
      if (level === 'hard') return t('ai.hardDesc');
      return t('ai.mediumDesc');
    },
    [t]
  );
  const [setupOpen, setSetupOpen] = useState(true);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [playerName, setPlayerName] = useState('Player');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<ParticleCardType | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  const startGame = () => {
    if (!playerName.trim()) {
      toast.error(t('ai.enterName'));
      return;
    }

    const state = initializeGame([playerName.trim(), getAIName(difficulty)]);
    setGameState(state);
    setSetupOpen(false);
    toast.success(t('ai.started'));
  };

  // AI turn logic - use functional state update to avoid stale closures
  useEffect(() => {
    if (!gameState || gameState.phase === 'finished' || gameOver) return;
    
    const isAITurn = gameState.currentPlayerIndex === 1;
    if (!isAITurn) return;

    setAiThinking(true);
    
    const delay = difficulty === 'hard' ? 2000 : difficulty === 'medium' ? 1500 : 1000;
    
    const timeoutId = setTimeout(() => {
      setGameState(prevState => {
        if (!prevState || prevState.currentPlayerIndex !== 1) return prevState;

        const aiMove = findBestMove(
          prevState.centerCards,
          prevState.players[1].diagram,
          difficulty
        );

        if (!aiMove) {
          setAiThinking(false);
          return prevState;
        }

        const newDiagram = placeCard(aiMove.card, aiMove.position, prevState.players[1].diagram);
        const newCenterCards = prevState.centerCards.filter(c => c.id !== aiMove.card.id);
        const { score, invalidVertices } = calculateScore(newDiagram);

        const newPlayers = [...prevState.players];
        newPlayers[1] = {
          ...newPlayers[1],
          diagram: newDiagram,
          score,
          invalidVertices,
        };

        let newState: GameState = {
          ...prevState,
          centerCards: newCenterCards,
          players: newPlayers,
        };

        newState = advanceGame(newState);

        if (newState.phase === 'finished') {
          setTimeout(() => handleGameEnd(newState), 100);
        } else {
          toast.info(t('ai.aiPlaced', { name: getAIName(difficulty) }));
        }

        return newState;
      });
      
      setAiThinking(false);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [gameState?.currentPlayerIndex, gameState?.phase, difficulty, gameOver, getAIName, t]);

  const handleSelectCard = (card: ParticleCardType) => {
    if (gameState?.currentPlayerIndex !== 0) return;
    setSelectedCard(selectedCard?.id === card.id ? null : card);
  };

  const handleRotateCard = (card: ParticleCardType, degrees: number) => {
    if (!gameState || gameState.currentPlayerIndex !== 0) return;

    const rotated = rotateCard(card, degrees);
    const newCenterCards = gameState.centerCards.map(c =>
      c.id === card.id ? rotated : c
    );

    setGameState({ ...gameState, centerCards: newCenterCards });
    if (selectedCard?.id === card.id) {
      setSelectedCard(rotated);
    }
  };

  const handlePlaceCard = (position: GridPosition) => {
    if (!gameState || !selectedCard || gameState.currentPlayerIndex !== 0) return;

    const currentPlayer = gameState.players[0];

    const newDiagram = placeCard(selectedCard, position, currentPlayer.diagram);
    const newCenterCards = gameState.centerCards.filter(c => c.id !== selectedCard.id);
    const { score, invalidVertices } = calculateScore(newDiagram);

    const newPlayers = [...gameState.players];
    newPlayers[0] = {
      ...currentPlayer,
      diagram: newDiagram,
      score,
      invalidVertices,
    };

    let newState: GameState = {
      ...gameState,
      centerCards: newCenterCards,
      players: newPlayers,
    };

    newState = advanceGame(newState);
    setGameState(newState);
    setSelectedCard(null);

    if (newState.phase === 'finished') {
      handleGameEnd(newState);
    }
  };

  const handleGameEnd = (state: GameState) => {
    // Calculate final scores with secret cards
    const finalPlayers = state.players.map(player => {
      if (player.secretCard) {
        const newDiagram = [...player.diagram];
        if (newDiagram.length > 0) {
          const lastCard = newDiagram[newDiagram.length - 1];
          const newPos = { q: lastCard.position.q + 1, r: lastCard.position.r };
          newDiagram.push({ ...player.secretCard, position: newPos });
        }
        const { score, invalidVertices } = calculateScore(newDiagram);
        return { ...player, diagram: newDiagram, score, invalidVertices };
      }
      return player;
    });

    setGameState({ ...state, players: finalPlayers });
    setGameOver(true);
  };

  const getWinner = () => {
    if (!gameState) return null;
    return [...gameState.players].sort((a, b) => b.score - a.score)[0];
  };

  const resetGame = () => {
    setGameState(null);
    setSelectedCard(null);
    setGameOver(false);
    setSetupOpen(true);
  };

  const isMyTurn = gameState?.currentPlayerIndex === 0;

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('common.exit')}
            </Button>
            
            {gameState && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Round {gameState.round}/{gameState.maxRounds}
                </span>
                <span className={cn(
                  "font-display flex items-center gap-2",
                  isMyTurn ? "text-primary" : "text-accent"
                )}>
                  {isMyTurn ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  {isMyTurn ? t('ai.yourTurn') : t('ai.thinking', { name: getAIName(difficulty) })}
                </span>
              </div>
            )}
            
            {gameState && (
              <Button variant="outline" size="sm" onClick={resetGame} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Restart
              </Button>
            )}
          </div>
        </header>

        {/* Game Content */}
        {gameState && !gameOver && (
          <div className="container mx-auto px-4 py-6">
            <div className="grid lg:grid-cols-[1fr,300px] gap-6">
              {/* Main Game Area */}
              <div className="space-y-6">
                {/* Center Cards */}
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Play className="w-5 h-5 text-primary" />
                        {t('ai.availableCards')}
                      </span>
                      {aiThinking && (
                        <span className="text-sm bg-accent/20 text-accent px-3 py-1 rounded-full animate-pulse flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          AI Thinking...
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 flex-wrap justify-center">
                      {gameState.centerCards.map((card) => (
                        <ParticleCard
                          key={card.id}
                          card={card}
                          onClick={() => handleSelectCard(card)}
                          onRotate={(degrees) => handleRotateCard(card, degrees)}
                          selected={selectedCard?.id === card.id}
                          disabled={!isMyTurn || aiThinking}
                          size="xl"
                          showRotateButton={isMyTurn}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Game Board */}
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {t('ai.yourDiagram')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GameBoard
                      diagram={gameState.players[0].diagram}
                      onCellClick={handlePlaceCard}
                      canPlace={isMyTurn && !!selectedCard && !aiThinking}
                      highlightValidPositions={isMyTurn && !!selectedCard}
                      size="xl"
                    />
                  </CardContent>
                </Card>

                {/* AI's Diagram */}
                <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display flex items-center gap-2 text-accent">
                      <Bot className="w-5 h-5" />
                      {t('ai.aiDiagram', { name: getAIName(difficulty) })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GameBoard
                      diagram={gameState.players[1].diagram}
                      canPlace={false}
                      size="xl"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Scores */}
              <div className="space-y-4">
                {gameState.players.map((player, index) => {
                  const { score, validVertices, invalidVertices, loops } = calculateScore(player.diagram);
                  const isCurrentPlayer = index === gameState.currentPlayerIndex;
                  const isHuman = index === 0;
                  
                  return (
                    <Card
                      key={player.id}
                      className={cn(
                        'bg-card/80 backdrop-blur-sm transition-all',
                        isCurrentPlayer ? (isHuman ? 'border-primary ring-2 ring-primary/30' : 'border-accent ring-2 ring-accent/30') : 'border-border/50'
                      )}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className={cn(
                          'text-lg font-display flex items-center justify-between',
                          isCurrentPlayer && (isHuman ? 'text-primary' : 'text-accent')
                        )}>
                          <span className="flex items-center gap-2">
                            {isHuman ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            {player.name}
                          </span>
                          {isCurrentPlayer && (
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              isHuman ? "bg-primary/20" : "bg-accent/20"
                            )}>
                              {isHuman ? 'Your Turn' : 'Thinking'}
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScoreDisplay
                          score={score}
                          validVertices={validVertices}
                          invalidVertices={invalidVertices}
                          loops={loops}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Setup Dialog */}
        <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
          <DialogContent className="bg-card/95 backdrop-blur-sm border-primary/20">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-center text-glow">
                {t('ai.setupTitle')}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t('ai.setupSubtitle')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>{t('ai.yourName')}</Label>
                <input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={t('ai.namePlaceholder')}
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-3">
                <Label>{t('ai.difficulty')}</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setDifficulty('easy')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-center',
                      difficulty === 'easy'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-border hover:border-green-500/50'
                    )}
                  >
                    <Zap className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <span className="font-display text-sm">{t('ai.easy')}</span>
                    <p className="text-xs text-muted-foreground mt-1">{t('ai.easyDesc')}</p>
                  </button>
                  <button
                    onClick={() => setDifficulty('medium')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-center',
                      difficulty === 'medium'
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-border hover:border-yellow-500/50'
                    )}
                  >
                    <Cpu className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <span className="font-display text-sm">{t('ai.medium')}</span>
                    <p className="text-xs text-muted-foreground mt-1">{t('ai.mediumDesc')}</p>
                  </button>
                  <button
                    onClick={() => setDifficulty('hard')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-center',
                      difficulty === 'hard'
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-border hover:border-red-500/50'
                    )}
                  >
                    <Brain className="w-6 h-6 mx-auto mb-2 text-red-500" />
                    <span className="font-display text-sm">{t('ai.hard')}</span>
                    <p className="text-xs text-muted-foreground mt-1">{t('ai.hardDesc')}</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
                {t('ai.cancel')}
              </Button>
              <Button className="flex-1 font-display" onClick={startGame}>
                <Bot className="w-4 h-4 mr-2" />
                {t('ai.startGame')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Game Over Dialog */}
        <Dialog open={gameOver} onOpenChange={setGameOver}>
          <DialogContent className="bg-card/95 backdrop-blur-sm border-primary/20">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-center text-glow">
                {t('ai.gameOver')}
              </DialogTitle>
            </DialogHeader>

            {gameState && (
              <div className="space-y-6 py-4">
                {/* Winner */}
                <div className="text-center">
                  {getWinner()?.id === gameState.players[0].id ? (
                    <>
                      <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
                      <p className="text-lg text-muted-foreground">{t('ai.congrats')}</p>
                      <p className="font-display text-3xl text-primary">{t('ai.youWon')}</p>
                    </>
                  ) : (
                    <>
                      <Bot className="w-16 h-16 text-accent mx-auto mb-3" />
                      <p className="text-lg text-muted-foreground">{t('ai.tryAgain')}</p>
                      <p className="font-display text-3xl text-accent">{t('ai.wins', { name: getAIName(difficulty) })}</p>
                    </>
                  )}
                  <p className="text-2xl font-bold mt-2">
                    {getWinner()?.score} {t('common.points')}
                  </p>
                </div>

                {/* All Scores */}
                <div className="space-y-2">
                  {[...gameState.players]
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <div
                        key={player.id}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg',
                          index === 0 ? 'bg-primary/20' : 'bg-muted/50'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          {player.id === gameState.players[0].id ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          {player.name}
                        </span>
                        <span className="font-display font-bold">{player.score} {t('common.points')}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
                {t('common.exit')}
              </Button>
              <Button className="flex-1 font-display" onClick={resetGame}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('ai.playAgain')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
