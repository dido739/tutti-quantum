import React from 'react';
import type { ParticleCard } from '../../types';

interface HexCardProps {
  card: ParticleCard;
  rotation?: number;
  size?: number;
  onClick?: () => void;
  className?: string;
  showArrows?: boolean;
}

export const HexCard: React.FC<HexCardProps> = ({
  card,
  rotation = 0,
  size = 80,
  onClick,
  className = '',
  showArrows = true,
}) => {
  const hexagonPath = (s: number) => {
    const points: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = s * Math.cos(angle);
      const y = s * Math.sin(angle);
      points.push([x, y]);
    }
    return points.map(([x, y]) => `${x},${y}`).join(' ');
  };

  const arrowPosition = (edgeIndex: number, s: number) => {
    const angle = (Math.PI / 3) * edgeIndex + (Math.PI / 6);
    const x = s * 0.7 * Math.cos(angle);
    const y = s * 0.7 * Math.sin(angle);
    const rotation = (edgeIndex * 60) - 90;
    return { x, y, rotation };
  };

  const Arrow: React.FC<{ direction: 'in' | 'out' | 'none'; index: number }> = ({ direction, index }) => {
    if (direction === 'none') return null;
    
    const pos = arrowPosition(index, size / 2);
    const arrowSize = 8;
    
    return (
      <g transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation})`}>
        {direction === 'out' ? (
          <path
            d={`M ${-arrowSize/2} ${-arrowSize} L 0 0 L ${-arrowSize/2} ${arrowSize}`}
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d={`M ${arrowSize/2} ${-arrowSize} L 0 0 L ${arrowSize/2} ${arrowSize}`}
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </g>
    );
  };

  return (
    <div
      className={`inline-block cursor-pointer transition-transform hover:scale-105 ${className}`}
      onClick={onClick}
      style={{ transform: `rotate(${rotation * 60}deg)` }}
    >
      <svg
        width={size * 2}
        height={size * 2}
        viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
        className="drop-shadow-lg"
      >
        {/* Hexagon background */}
        <polygon
          points={hexagonPath(size / 2)}
          fill={card.color}
          stroke="#fff"
          strokeWidth="2"
        />
        
        {/* Particle symbol */}
        <text
          x="0"
          y="8"
          textAnchor="middle"
          className="font-bold select-none"
          fill="white"
          fontSize={size / 3}
          style={{ transform: `rotate(${-rotation * 60}deg)` }}
        >
          {card.symbol}
        </text>
        
        {/* Arrows on edges */}
        {showArrows && card.edges.map((edge, index) => (
          <Arrow key={index} direction={edge.direction} index={index} />
        ))}
      </svg>
    </div>
  );
};
