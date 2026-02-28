import { useState, useCallback } from 'react';
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
import { ParticleBackground } from '@/components/ParticleBackground';
import { GameBoard } from '@/components/GameBoard';
import { PlayerHand } from '@/components/PlayerHand';
import { ParticleCard } from '@/components/ParticleCard';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, Play, Trophy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';

export default function LocalGame() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [setupOpen, setSetupOpen] = useState(true);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<ParticleCardType | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    if (playerNames.some(name => !name.trim())) {
      toast.error(t('ai.enterName'));
      return;
    }

    const state = initializeGame(playerNames);
    setGameState(state);
    setSetupOpen(false);
    toast.success(t('local.started', { name: playerNames[0] }));
  };

  const handleSelectCard = (card: ParticleCardType) => {
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const handleRotateCard = (card: ParticleCardType, degrees: number) => {
    if (!gameState) return;

    const rotated = rotateCard(card, degrees);
    
    // Update the card in center cards
    const newCenterCards = gameState.centerCards.map(c =>
      c.id === card.id ? rotated : c
    );

    setGameState({
      ...gameState,
      centerCards: newCenterCards,
    });

    if (selectedCard?.id === card.id) {
      setSelectedCard(rotated);
    }
  };

  const handlePlaceCard = (position: GridPosition) => {
    if (!gameState || !selectedCard) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Place the card
    const newDiagram = placeCard(selectedCard, position, currentPlayer.diagram);
    
    // Remove card from center
    const newCenterCards = gameState.centerCards.filter(c => c.id !== selectedCard.id);
    
    // Calculate new score
    const { score, validVertices, invalidVertices, loops } = calculateScore(newDiagram);
    
    // Update player state
    const newPlayers = [...gameState.players];
    newPlayers[gameState.currentPlayerIndex] = {
      ...currentPlayer,
      diagram: newDiagram,
      score,
      invalidVertices,
    };

    // Advance game
    let newState: GameState = {
      ...gameState,
      centerCards: newCenterCards,
      players: newPlayers,
    };

    newState = advanceGame(newState);
    
    setGameState(newState);
    setSelectedCard(null);

    // Check if game is finished
    if (newState.phase === 'finished') {
      handleGameEnd(newState);
    } else {
      toast.success(t('local.nextTurn', { name: newState.players[newState.currentPlayerIndex].name }));
    }
  };

  const handleGameEnd = (state: GameState) => {
    // Add secret cards to diagrams
    const finalPlayers = state.players.map(player => {
      if (player.secretCard) {
        const newDiagram = [...player.diagram];
        if (newDiagram.length > 0) {
          const lastCard = newDiagram[newDiagram.length - 1];
          const newPos = { q: lastCard.position.q + 1, r: lastCard.position.r };
          newDiagram.push({
            ...player.secretCard,
            position: newPos,
          });
        }

        const { score, validVertices, invalidVertices } = calculateScore(newDiagram);
        
        return {
          ...player,
          diagram: newDiagram,
          score,
          invalidVertices,
        };
      }
      return player;
    });

    setGameState({
      ...state,
      players: finalPlayers,
    });
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
                  {t('local.round', { round: gameState.round, maxRounds: gameState.maxRounds })}
                </span>
                <span className="font-display text-primary">
                  {t('local.turn', { name: gameState.players[gameState.currentPlayerIndex].name })}
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
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary" />
                      {t('local.availableCards')}
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
                          size="xl"
                          showRotateButton
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Game Board */}
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display">
                      {t('local.diagram', { name: gameState.players[gameState.currentPlayerIndex].name })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GameBoard
                      diagram={gameState.players[gameState.currentPlayerIndex].diagram}
                      onCellClick={handlePlaceCard}
                      canPlace={!!selectedCard}
                      highlightValidPositions={!!selectedCard}
                      size="xl"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Player Scores */}
              <div className="space-y-4">
                {gameState.players.map((player, index) => {
                  const { score, validVertices, invalidVertices, loops } = calculateScore(player.diagram);
                  const isCurrentPlayer = index === gameState.currentPlayerIndex;
                  
                  return (
                    <Card
                      key={player.id}
                      className={cn(
                        'bg-card/80 backdrop-blur-sm transition-all',
                        isCurrentPlayer ? 'border-primary ring-2 ring-primary/30' : 'border-border/50'
                      )}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className={cn(
                          'text-lg font-display flex items-center justify-between',
                          isCurrentPlayer && 'text-primary'
                        )}>
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {player.name}
                          </span>
                          {isCurrentPlayer && (
                            <span className="text-xs bg-primary/20 px-2 py-1 rounded-full">
                              Playing
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
                {t('local.setupTitle')}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t('local.setupSubtitle')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label>{t('local.playerCount')}</Label>
                <div className="flex gap-2">
                  {[2, 3, 4].map((num) => (
                    <Button
                      key={num}
                      variant={playerNames.length === num ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newNames = Array(num).fill('').map((_, i) =>
                          playerNames[i] || t('local.playerLabel', { index: i + 1 })
                        );
                        setPlayerNames(newNames);
                      }}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              {playerNames.map((name, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`player-${index}`}>{t('local.playerLabel', { index: index + 1 })}</Label>
                  <Input
                    id={`player-${index}`}
                    value={name}
                    onChange={(e) => {
                      const newNames = [...playerNames];
                      newNames[index] = e.target.value;
                      setPlayerNames(newNames);
                    }}
                    placeholder={t('local.playerPlaceholder', { index: index + 1 })}
                    className="bg-background/50"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
                {t('local.cancel')}
              </Button>
              <Button className="flex-1 font-display" onClick={startGame}>
                <Play className="w-4 h-4 mr-2" />
                {t('local.startGame')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Game Over Dialog */}
        <Dialog open={gameOver} onOpenChange={setGameOver}>
          <DialogContent className="bg-card/95 backdrop-blur-sm border-primary/20">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-center text-glow">
                {t('local.gameOver')}
              </DialogTitle>
            </DialogHeader>

            {gameState && (
              <div className="space-y-6 py-4">
                {/* Winner */}
                <div className="text-center">
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
                  <p className="text-lg text-muted-foreground">{t('local.winner')}</p>
                  <p className="font-display text-3xl text-primary">
                    {getWinner()?.name}
                  </p>
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
                {t('local.playAgain')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
