import React, { useState } from 'react';
import type { PlacedCard, BoardPosition } from '../../types';
import { HexCard } from '../cards/HexCard';
import { positionToKey } from '../../utils/hexGrid';

interface GameBoardProps {
  board: PlacedCard[];
  onCardPlace?: (position: BoardPosition, rotation: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ board }) => {
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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
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
        className="absolute inset-0 cursor-move"
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
            {/* Grid dots for reference (optional) */}
            {board.length === 0 && (
              <circle cx={0} cy={0} r={5} fill="rgba(255,255,255,0.3)" />
            )}

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
      {board.length === 0 && (
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
    </div>
  );
};
