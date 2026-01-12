import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { GameBoard } from '../board/GameBoard';
import { PlayerHand } from '../ui/PlayerHand';
import { ReferenceCards } from '../ui/ReferenceCards';
import type { ParticleCard, BoardPosition } from '../../types';

export const GamePlay: React.FC = () => {
  const {
    players,
    currentPlayerIndex,
    board,
    placeCard,
    nextTurn,
    mode,
  } = useGameStore();

  const [selectedCard, setSelectedCard] = useState<ParticleCard | null>(null);
  const [showReference, setShowReference] = useState(false);

  const currentPlayer = players[currentPlayerIndex];

  const handleCardClick = (card: ParticleCard) => {
    setSelectedCard(card);
  };

  const handlePlaceCard = (position: BoardPosition, rotation: number) => {
    if (!selectedCard) return;

    placeCard(selectedCard, position, rotation);
    setSelectedCard(null);
    
    // Auto-advance to next player
    setTimeout(() => {
      nextTurn();
    }, 500);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-quantum-blue to-quantum-teal text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tutti Quantum ⚛️</h1>
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <span className="opacity-75">Mode:</span>{' '}
              <span className="font-semibold capitalize">{mode}</span>
            </div>
            <div className="text-sm">
              <span className="opacity-75">Round:</span>{' '}
              <span className="font-semibold">1</span>
            </div>
            <button
              onClick={() => setShowReference(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all font-semibold"
            >
              📚 Reference
            </button>
          </div>
        </div>
      </div>

      {/* Player Scores */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="max-w-7xl mx-auto flex gap-4">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`flex-1 p-3 rounded-lg ${
                index === currentPlayerIndex
                  ? 'bg-quantum-blue text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div className="font-semibold">{player.name}</div>
              <div className="text-2xl font-bold">{player.score} pts</div>
              <div className="text-sm opacity-75">{player.hand.length} cards</div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 relative">
        <GameBoard 
          board={board} 
          onCardPlace={handlePlaceCard}
          selectedCard={!!selectedCard}
        />
      </div>

      {/* Player Hand */}
      <PlayerHand
        cards={currentPlayer?.hand || []}
        playerName={currentPlayer?.name || ''}
        isCurrentPlayer={true}
        onCardClick={handleCardClick}
        selectedCard={selectedCard || undefined}
      />

      {/* Reference Cards Modal */}
      <ReferenceCards isOpen={showReference} onClose={() => setShowReference(false)} />
    </div>
  );
};
