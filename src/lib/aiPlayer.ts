// AI Player Logic for Tutti Quantum
import {
  ParticleCard,
  PlacedCard,
  GridPosition,
  getNeighbors,
  calculateScore,
  placeCard,
  rotateCard,
  isLegalPlacement,
} from './gameLogic';

interface AIMove {
  card: ParticleCard;
  position: GridPosition;
  rotation: number;
  expectedScore: number;
}

// AI difficulty levels
export type AIDifficulty = 'easy' | 'medium' | 'hard';

// Get all valid positions where a card can be placed
function getValidPositions(diagram: PlacedCard[]): GridPosition[] {
  if (diagram.length === 0) {
    // First card can go at center
    return [{ q: 0, r: 0 }];
  }

  const positions: GridPosition[] = [];
  const occupied = new Set(diagram.map(c => `${c.position.q},${c.position.r}`));

  diagram.forEach(card => {
    const neighbors = getNeighbors(card.position);
    neighbors.forEach(pos => {
      const key = `${pos.q},${pos.r}`;
      if (!occupied.has(key) && !positions.some(p => p.q === pos.q && p.r === pos.r)) {
        positions.push(pos);
      }
    });
  });

  return positions;
}

// Evaluate a potential move
function evaluateMove(
  card: ParticleCard,
  position: GridPosition,
  diagram: PlacedCard[]
): number {
  const newDiagram = placeCard(card, position, diagram);
  const { score } = calculateScore(newDiagram);
  const currentScore = diagram.length > 0 ? calculateScore(diagram).score : 0;
  return score - currentScore;
}

// Find the best move for AI
export function findBestMove(
  availableCards: ParticleCard[],
  diagram: PlacedCard[],
  difficulty: AIDifficulty
): AIMove | null {
  const validPositions = getValidPositions(diagram);
  
  if (validPositions.length === 0 || availableCards.length === 0) {
    return null;
  }

  const moves: AIMove[] = [];

  // Evaluate all possible moves
  availableCards.forEach(card => {
    // Try all 6 rotations
    const rotations = difficulty === 'easy' ? [0] : [0, 60, 120, 180, 240, 300];
    
    rotations.forEach(rotation => {
      const rotatedCard = rotation === 0 ? card : rotateCard(card, rotation);
      
      validPositions.forEach(position => {
        if (!isLegalPlacement(rotatedCard, position, diagram)) {
          return;
        }

        const expectedScore = evaluateMove(rotatedCard, position, diagram);
        moves.push({
          card: rotatedCard,
          position,
          rotation,
          expectedScore,
        });
      });
    });
  });

  if (moves.length === 0) {
    return null;
  }

  // Sort by expected score
  moves.sort((a, b) => b.expectedScore - a.expectedScore);

  // Select move based on difficulty
  switch (difficulty) {
    case 'easy':
      // Pick a random move from bottom 50%
      const easyIndex = Math.floor(Math.random() * Math.ceil(moves.length / 2)) + Math.floor(moves.length / 2);
      return moves[Math.min(easyIndex, moves.length - 1)];
    
    case 'medium':
      // Pick from top 50% with some randomness
      const mediumIndex = Math.floor(Math.random() * Math.ceil(moves.length / 2));
      return moves[mediumIndex];
    
    case 'hard':
      // Always pick the best move
      return moves[0];
    
    default:
      return moves[0];
  }
}

// AI player name based on difficulty
export function getAIName(difficulty: AIDifficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'Electron Bot';
    case 'medium':
      return 'Gluon AI';
    case 'hard':
      return 'Higgs Master';
    default:
      return 'AI Opponent';
  }
}
