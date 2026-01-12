import React from 'react';
import type { ParticleCard } from '../../types';
import { HexCard } from '../cards/HexCard';

interface PlayerHandProps {
  cards: ParticleCard[];
  playerName: string;
  isCurrentPlayer: boolean;
  onCardClick?: (card: ParticleCard) => void;
  selectedCard?: ParticleCard;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  playerName,
  isCurrentPlayer,
  onCardClick,
  selectedCard,
}) => {
  return (
    <div className={`bg-white rounded-t-3xl shadow-2xl p-4 ${isCurrentPlayer ? 'border-t-4 border-quantum-blue' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-800">{playerName}</h3>
          {isCurrentPlayer && (
            <span className="bg-quantum-blue text-white px-3 py-1 rounded-full text-sm font-semibold">
              Your Turn ⚡
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {cards.length} {cards.length === 1 ? 'card' : 'cards'}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {cards.length === 0 ? (
          <div className="text-gray-400 text-center w-full py-4">
            No cards in hand
          </div>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className={`flex-shrink-0 transition-all ${
                selectedCard?.id === card.id ? 'ring-4 ring-quantum-blue rounded-lg' : ''
              }`}
            >
              <HexCard
                card={card}
                size={50}
                onClick={() => onCardClick?.(card)}
                className={isCurrentPlayer ? '' : 'opacity-50'}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
