import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { GameBoard } from '../board/GameBoard';
import { PlayerHand } from '../ui/PlayerHand';
import type { ParticleCard } from '../../types';
import { createPosition } from '../../utils/hexGrid';

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

  const currentPlayer = players[currentPlayerIndex];

  const handleCardClick = (card: ParticleCard) => {
    setSelectedCard(card);
  };

  const handlePlaceCard = () => {
    if (!selectedCard) return;

    // Determine position based on current board state
    const position = board.length === 0 
      ? createPosition(0, 0) // First card goes in center
      : createPosition(1, 0); // Subsequent cards (simplified for now)

    const rotation = 0; // No rotation for now

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
        <GameBoard board={board} />
        
        {/* Place Card Button */}
        {selectedCard && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <button
              onClick={handlePlaceCard}
              className="bg-quantum-blue text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Place {selectedCard.name} 🎯
            </button>
          </div>
        )}
      </div>

      {/* Player Hand */}
      <PlayerHand
        cards={currentPlayer?.hand || []}
        playerName={currentPlayer?.name || ''}
        isCurrentPlayer={true}
        onCardClick={handleCardClick}
        selectedCard={selectedCard || undefined}
      />
    </div>
  );
};
