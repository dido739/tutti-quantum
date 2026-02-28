import { useMemo } from 'react';
import { PlacedCard, GridPosition } from '@/lib/gameLogic';
import { ParticleCard } from './ParticleCard';
import { cn } from '@/lib/utils';

const HEX_CLIP = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

interface GameBoardProps {
  diagram: PlacedCard[];
  onCellClick?: (position: GridPosition) => void;
  selectedPosition?: GridPosition | null;
  canPlace?: boolean;
  highlightValidPositions?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function GameBoard({
  diagram,
  onCellClick,
  selectedPosition,
  canPlace = true,
  highlightValidPositions = false,
  size = 'lg',
}: GameBoardProps) {
  const bounds = useMemo(() => {
    if (diagram.length === 0) {
      return { minQ: -1, maxQ: 1, minR: -1, maxR: 1 };
    }
    let minQ = Infinity, maxQ = -Infinity;
    let minR = Infinity, maxR = -Infinity;
    diagram.forEach(card => {
      minQ = Math.min(minQ, card.position.q);
      maxQ = Math.max(maxQ, card.position.q);
      minR = Math.min(minR, card.position.r);
      maxR = Math.max(maxR, card.position.r);
    });
    return { minQ: minQ - 1, maxQ: maxQ + 1, minR: minR - 1, maxR: maxR + 1 };
  }, [diagram]);

  const validPositions = useMemo(() => {
    if (!highlightValidPositions) return new Set<string>();
    const positions = new Set<string>();

    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let q = bounds.minQ; q <= bounds.maxQ; q++) {
        if (!diagram.some(c => c.position.q === q && c.position.r === r)) {
          positions.add(`${q},${r}`);
        }
      }
    }

    return positions;
  }, [bounds.maxQ, bounds.maxR, bounds.minQ, bounds.minR, diagram, highlightValidPositions]);

  // Flat-top hex: width = cellW, height = cellW * sqrt(3)/2
  // For tight tiling: col step = 3/4 * cellW, row step = cellH (no gaps)
  const cellW = size === 'sm' ? 72 : size === 'md' ? 112 : size === 'lg' ? 150 : 170;
  const cellH = Math.round(cellW * 0.866); // sqrt(3)/2

  const colStep = cellW * 0.75; // 3/4 width for interlocking
  const rowStep = cellH; // full height, no gap

  const cells: { q: number; r: number; card?: PlacedCard; x: number; y: number }[] = [];

  for (let r = bounds.minR; r <= bounds.maxR; r++) {
    for (let q = bounds.minQ; q <= bounds.maxQ; q++) {
      const card = diagram.find(c => c.position.q === q && c.position.r === r);
      const isOddCol = ((q % 2) + 2) % 2 === 1;
      const x = (q - bounds.minQ) * colStep;
      const y = (r - bounds.minR) * rowStep + (isOddCol ? rowStep / 2 : 0);
      cells.push({ q, r, card, x, y });
    }
  }

  const cols = bounds.maxQ - bounds.minQ + 1;
  const rows = bounds.maxR - bounds.minR + 1;
  const totalW = (cols - 1) * colStep + cellW;
  const totalH = rows * rowStep + rowStep / 2;

  return (
    <div className="overflow-auto p-2 flex justify-center">
      <div className="relative" style={{ width: totalW, height: totalH, minHeight: 200 }}>
        {cells.map(({ q, r, card, x, y }) => {
          const key = `${q},${r}`;
          const isValid = validPositions.has(key);
          const isSelected = selectedPosition?.q === q && selectedPosition?.r === r;

          return (
            <div
              key={key}
              className="absolute"
              style={{ left: x, top: y, width: cellW, height: cellH }}
            >
              {card ? (
                <div className="w-full h-full" style={{ clipPath: HEX_CLIP }}>
                  <ParticleCard card={card} size={size} disabled />
                </div>
              ) : (
                <button
                  onClick={() => canPlace && onCellClick?.({ q, r })}
                  disabled={!canPlace || !isValid}
                  className={cn(
                    'w-full h-full transition-all duration-150',
                    isValid && canPlace
                      ? 'bg-primary/8 hover:bg-primary/20 cursor-pointer'
                      : 'bg-transparent cursor-default',
                    isSelected && 'bg-primary/25'
                  )}
                  style={{ clipPath: HEX_CLIP }}
                >
                  {isValid && canPlace && (
                    <span className="text-primary/50 text-lg font-bold">+</span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
