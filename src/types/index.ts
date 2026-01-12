// Particle types
export type ParticleType = 'quark' | 'electron' | 'gluon' | 'photon' | 'higgs';

// Arrow directions on hexagonal card edges (0-5, clockwise from top)
export type ArrowDirection = 'in' | 'out' | 'none';

// Card edge configuration
export interface CardEdge {
  direction: ArrowDirection;
}

// Particle card definition
export interface ParticleCard {
  id: string;
  type: ParticleType;
  name: string;
  symbol: string;
  color: string;
  edges: [CardEdge, CardEdge, CardEdge, CardEdge, CardEdge, CardEdge]; // 6 edges for hexagon
}

// Position on the game board
export interface BoardPosition {
  q: number; // cube coordinate q
  r: number; // cube coordinate r
  s: number; // cube coordinate s (q + r + s = 0)
}

// Placed card on the board
export interface PlacedCard {
  card: ParticleCard;
  position: BoardPosition;
  rotation: number; // 0-5 (60-degree increments)
}

// Vertex (3 cards meeting at a point)
export interface Vertex {
  cards: PlacedCard[];
  point: string; // identifier for the vertex point
  isValid: boolean;
  points: number; // 2, 3, 4, 6, or -1 for invalid
}

// Game mode
export type GameMode = 'competitive' | 'cooperative';

// Player
export interface Player {
  id: string;
  name: string;
  hand: ParticleCard[];
  score: number;
  secretCard?: ParticleCard; // For competitive mode
}

// Game phase
export type GamePhase = 'setup' | 'playing' | 'finished';

// Game state
export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  board: PlacedCard[];
  deck: ParticleCard[];
  discardPile: ParticleCard[];
  vertices: Vertex[];
  round: number;
  maxRounds: number;
}

// Scoring breakdown
export interface ScoringBreakdown {
  validVertices: { vertex: Vertex; points: number }[];
  invalidVertices: { vertex: Vertex; points: number }[];
  loopBonuses: number;
  subDiagramBonuses: { name: string; points: number }[];
  totalPoints: number;
}
