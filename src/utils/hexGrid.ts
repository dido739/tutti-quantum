import type { BoardPosition } from '../types';

// Hexagonal grid utilities using cube coordinates
// Reference: https://www.redblobgames.com/grids/hexagons/

export const createPosition = (q: number, r: number): BoardPosition => {
  return { q, r, s: -q - r };
};

export const positionEquals = (a: BoardPosition, b: BoardPosition): boolean => {
  return a.q === b.q && a.r === b.r && a.s === b.s;
};

export const positionToKey = (pos: BoardPosition): string => {
  return `${pos.q},${pos.r},${pos.s}`;
};

// Get all 6 neighbors of a hex position
export const getNeighbors = (pos: BoardPosition): BoardPosition[] => {
  const directions = [
    { q: 1, r: 0, s: -1 },   // 0: East
    { q: 1, r: -1, s: 0 },   // 1: Northeast
    { q: 0, r: -1, s: 1 },   // 2: Northwest
    { q: -1, r: 0, s: 1 },   // 3: West
    { q: -1, r: 1, s: 0 },   // 4: Southwest
    { q: 0, r: 1, s: -1 },   // 5: Southeast
  ];

  return directions.map(dir => ({
    q: pos.q + dir.q,
    r: pos.r + dir.r,
    s: pos.s + dir.s,
  }));
};

// Get the direction index (0-5) from one position to an adjacent position
export const getDirection = (from: BoardPosition, to: BoardPosition): number | null => {
  const neighbors = getNeighbors(from);
  for (let i = 0; i < neighbors.length; i++) {
    if (positionEquals(neighbors[i], to)) {
      return i;
    }
  }
  return null;
};

// Get the opposite direction (for checking arrow flow)
export const getOppositeDirection = (direction: number): number => {
  return (direction + 3) % 6;
};

// Get vertex points around a hex position
// Each hex has 6 corner points shared with neighbors
export const getVertexPoints = (pos: BoardPosition): string[] => {
  const points: string[] = [];
  
  // Each vertex point is shared by 3 hexes
  // We identify points by their three hex coordinates
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    const neighbors = getNeighbors(pos);
    const n1 = neighbors[i];
    const n2 = neighbors[next];
    
    // Create a unique identifier for this vertex point
    // Sort the three positions to ensure consistency
    const hexes = [pos, n1, n2].sort((a, b) => {
      if (a.q !== b.q) return a.q - b.q;
      if (a.r !== b.r) return a.r - b.r;
      return a.s - b.s;
    });
    
    points.push(`${positionToKey(hexes[0])}_${positionToKey(hexes[1])}_${positionToKey(hexes[2])}`);
  }
  
  return points;
};

// Calculate distance between two hex positions
export const hexDistance = (a: BoardPosition, b: BoardPosition): number => {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
};
