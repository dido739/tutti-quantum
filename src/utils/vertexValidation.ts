import type { PlacedCard, Vertex, ParticleType } from '../types';
import { getVertexPoints } from './hexGrid';

// Valid vertex combinations and their point values
// Based on the game rules from the problem statement
type VertexCombination = {
  particles: Set<ParticleType>;
  points: number;
};

const VALID_VERTICES: VertexCombination[] = [
  // 2 points
  { particles: new Set(['quark', 'gluon', 'quark']), points: 2 },
  { particles: new Set(['electron', 'photon', 'electron']), points: 2 },
  
  // 3 points
  { particles: new Set(['quark', 'photon', 'quark']), points: 3 },
  { particles: new Set(['quark', 'gluon', 'photon']), points: 3 },
  { particles: new Set(['electron', 'gluon', 'photon']), points: 3 },
  
  // 4 points
  { particles: new Set(['quark', 'higgs', 'quark']), points: 4 },
  { particles: new Set(['electron', 'higgs', 'electron']), points: 4 },
  
  // 6 points
  { particles: new Set(['quark', 'gluon', 'higgs']), points: 6 },
  { particles: new Set(['electron', 'photon', 'higgs']), points: 6 },
];

export const detectVertices = (board: PlacedCard[]): Vertex[] => {
  if (board.length < 3) return [];

  const vertices: Vertex[] = [];
  const vertexMap = new Map<string, PlacedCard[]>();

  // Group cards by vertex points
  board.forEach(placedCard => {
    const points = getVertexPoints(placedCard.position);
    points.forEach(point => {
      if (!vertexMap.has(point)) {
        vertexMap.set(point, []);
      }
      vertexMap.get(point)!.push(placedCard);
    });
  });

  // Check each vertex
  vertexMap.forEach((cards, point) => {
    if (cards.length === 3) {
      const vertex = validateVertex(cards, point);
      vertices.push(vertex);
    }
  });

  return vertices;
};

const validateVertex = (cards: PlacedCard[], point: string): Vertex => {
  // Check if arrows flow continuously
  const arrowsValid = checkArrowFlow(cards);
  
  // Get particle types
  const particleTypes = cards.map(c => c.card.type);
  const uniqueTypes = new Set(particleTypes);
  
  // Check for invalid conditions
  if (uniqueTypes.size === 1 || uniqueTypes.size === 2) {
    // Only 1 or 2 different particle types = invalid (-1 point)
    return {
      cards,
      point,
      isValid: false,
      points: -1,
    };
  }

  if (!arrowsValid) {
    // Arrows don't flow = invalid (-1 point)
    return {
      cards,
      point,
      isValid: false,
      points: -1,
    };
  }

  // Check if same particle appears twice
  if (particleTypes.length !== uniqueTypes.size) {
    // Same particle twice = incomplete (0 points)
    return {
      cards,
      point,
      isValid: false,
      points: 0,
    };
  }

  // Check against valid vertex combinations
  const typeSet = new Set(particleTypes);
  for (const validVertex of VALID_VERTICES) {
    if (setsEqual(typeSet, validVertex.particles)) {
      return {
        cards,
        point,
        isValid: true,
        points: validVertex.points,
      };
    }
  }

  // No valid combination found
  return {
    cards,
    point,
    isValid: false,
    points: -1,
  };
};

const checkArrowFlow = (_cards: PlacedCard[]): boolean => {
  // TODO: Implement arrow flow validation
  // For now, return true as a placeholder
  // This requires checking that arrows on adjacent edges match (in -> out)
  return true;
};

const setsEqual = <T>(a: Set<T>, b: Set<T>): boolean => {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
};

export const calculateScore = (vertices: Vertex[]): number => {
  return vertices.reduce((total, vertex) => total + vertex.points, 0);
};

export const detectLoops = (_board: PlacedCard[]): number => {
  // TODO: Implement loop detection
  // A valid loop is a closed hexagon of 6 cards
  // Must be composed of 6 complete vertices OR no vertices
  // Adds +2 bonus points
  return 0;
};

export const detectSubDiagrams = (_board: PlacedCard[]): { name: string; points: number }[] => {
  // TODO: Implement sub-diagram detection for educational bonuses
  // - "Blue sky" diagram (photons and matter)
  // - "Atoms stay together" (electron force)
  // - "Nobel Prize 2004" (nuclear force)
  // - "Higgs boson discovery" (specific diagram)
  return [];
};
