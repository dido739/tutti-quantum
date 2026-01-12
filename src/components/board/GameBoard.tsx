import React, { useState } from 'react';
import type { PlacedCard, BoardPosition } from '../../types';
import { HexCard } from '../cards/HexCard';
import { positionToKey, getNeighbors, positionEquals } from '../../utils/hexGrid';

interface GameBoardProps {
  board: PlacedCard[];
  onCardPlace?: (position: BoardPosition, rotation: number) => void;
  selectedCard?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ board, onCardPlace, selectedCard }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const hexSize = 60;
  const hexWidth = hexSize * 2;
  const hexHeight = Math.sqrt(3) * hexSize;

  // Convert cube coordinates to pixel coordinates
  const hexToPixel = (pos: BoardPosition) => {
    const x = hexSize * (3/2 * pos.q);
    const y = hexSize * (Math.sqrt(3)/2 * pos.q + Math.sqrt(3) * pos.r);
    return { x, y };
  };

  // Get valid placement positions (neighbors of existing cards)
  const getValidPlacements = (): BoardPosition[] => {
    if (board.length === 0) {
      return [{ q: 0, r: 0, s: 0 }]; // Center position for first card
    }

    const validPositions: BoardPosition[] = [];
    const occupiedKeys = new Set(board.map(p => positionToKey(p.position)));

    board.forEach(placedCard => {
      const neighbors = getNeighbors(placedCard.position);
      neighbors.forEach(neighbor => {
        const key = positionToKey(neighbor);
        if (!occupiedKeys.has(key)) {
          // Check if this position is already in validPositions
          const exists = validPositions.some(p => positionEquals(p, neighbor));
          if (!exists) {
            validPositions.push(neighbor);
          }
        }
      });
    });

    return validPositions;
  };

  const validPlacements = selectedCard ? getValidPlacements() : [];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedCard) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handlePlacementClick = (position: BoardPosition) => {
    if (onCardPlace && selectedCard) {
      onCardPlace(position, 0);
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => setZoom(z => Math.min(3, z + 0.2))}
          className="w-full px-4 py-2 bg-quantum-blue text-white rounded hover:bg-blue-600 font-semibold"
        >
          Zoom +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
          className="w-full px-4 py-2 bg-quantum-blue text-white rounded hover:bg-blue-600 font-semibold"
        >
          Zoom -
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-semibold text-sm"
        >
          Reset
        </button>
      </div>

      {/* Board */}
      <div
        className={`absolute inset-0 ${!selectedCard ? 'cursor-move' : 'cursor-pointer'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center',
          }}
        >
          <g transform="translate(400, 300)">
            {/* Valid placement indicators */}
            {validPlacements.map((position, index) => {
              const pixel = hexToPixel(position);
              return (
                <g
                  key={`placement-${positionToKey(position)}-${index}`}
                  transform={`translate(${pixel.x}, ${pixel.y})`}
                  onClick={() => handlePlacementClick(position)}
                  style={{ cursor: 'pointer' }}
                  className="placement-indicator"
                >
                  <polygon
                    points={(() => {
                      const s = hexSize / 2;
                      const points: [number, number][] = [];
                      for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI / 3) * i;
                        const x = s * Math.cos(angle);
                        const y = s * Math.sin(angle);
                        points.push([x, y]);
                      }
                      return points.map(([x, y]) => `${x},${y}`).join(' ');
                    })()}
                    fill="rgba(34, 211, 238, 0.2)"
                    stroke="rgba(34, 211, 238, 0.6)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                  <circle cx={0} cy={0} r={8} fill="rgba(34, 211, 238, 0.8)" />
                </g>
              );
            })}

            {/* Placed cards */}
            {board.map((placedCard, index) => {
              const pixel = hexToPixel(placedCard.position);
              return (
                <g
                  key={`${positionToKey(placedCard.position)}-${index}`}
                  transform={`translate(${pixel.x}, ${pixel.y})`}
                >
                  <foreignObject
                    x={-hexWidth / 2}
                    y={-hexHeight / 2}
                    width={hexWidth}
                    height={hexHeight}
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      <HexCard
                        card={placedCard.card}
                        rotation={placedCard.rotation}
                        size={hexSize}
                      />
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Instructions */}
      {board.length === 0 && !selectedCard && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-md text-center">
            <h2 className="text-2xl font-bold text-quantum-blue mb-2">
              Start Building Your Diagram!
            </h2>
            <p className="text-gray-700">
              Click on a card from your hand below to place it on the board.
              The first card will be placed in the center.
            </p>
          </div>
        </div>
      )}

      {/* Placement instructions */}
      {selectedCard && board.length > 0 && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
          <p className="text-sm font-semibold text-quantum-blue">
            Click on a glowing position to place your card
          </p>
        </div>
      )}
    </div>
  );
};
