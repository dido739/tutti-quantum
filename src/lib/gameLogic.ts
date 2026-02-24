// Tutti Quantum Game Logic
// Based on Feynman diagram rules from particle physics

export type ParticleType = 'quark' | 'antiquark' | 'electron' | 'positron' | 'photon' | 'gluon' | 'higgs';

export interface ParticleCard {
  id: string;
  type: ParticleType;
  // Lines configuration: which edges have particle lines
  // For hex grid: 0=top-right, 1=right, 2=bottom-right, 3=bottom-left, 4=left, 5=top-left
  lines: number[];
  // For charged particles (quarks, electrons), arrow direction matters
  arrowDirection?: 'in' | 'out';
  rotation: number; // 0, 60, 120, 180, 240, 300 degrees
}

export interface GridPosition {
  q: number; // axial coordinate
  r: number; // axial coordinate
}

export interface PlacedCard extends ParticleCard {
  position: GridPosition;
}

export interface Vertex {
  position: GridPosition;
  edge: number; // which edge of the cell
  cards: PlacedCard[];
  isComplete: boolean;
  isValid: boolean | null; // null if not enough cards to determine
  points: number;
}

export interface GameState {
  deck: ParticleCard[];
  centerCards: ParticleCard[];
  players: PlayerState[];
  currentPlayerIndex: number;
  round: number;
  maxRounds: number;
  phase: 'setup' | 'playing' | 'finished';
  mode: 'competitive' | 'cooperative';
}

export interface PlayerState {
  id: string;
  name: string;
  diagram: PlacedCard[];
  secretCard: ParticleCard | null;
  score: number;
  invalidVertices: number;
}

const HEX_DIRECTIONS: GridPosition[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

// Card configurations for different particle types
const PARTICLE_CONFIGS: Record<ParticleType, { count: number; isCharged: boolean }> = {
  quark: { count: 13, isCharged: true },
  antiquark: { count: 0, isCharged: true }, // Antiquarks are represented as quarks with opposite arrow
  electron: { count: 8, isCharged: true },
  positron: { count: 0, isCharged: true }, // Positrons are electrons with opposite arrow
  photon: { count: 7, isCharged: false },
  gluon: { count: 12, isCharged: false },
  higgs: { count: 4, isCharged: false },
};

// Valid vertex combinations (3 particles meeting at a point)
// Points are assigned based on rarity in nature
const VALID_VERTICES: { particles: ParticleType[]; points: number; description: string }[] = [
  // 2 points vertices
  { particles: ['quark', 'quark', 'gluon'], points: 2, description: 'Strong force interaction' },
  { particles: ['electron', 'electron', 'photon'], points: 2, description: 'Electromagnetic interaction' },
  { particles: ['quark', 'antiquark', 'photon'], points: 2, description: 'Quark-photon coupling' },
  
  // 3 points vertices
  { particles: ['gluon', 'gluon', 'gluon'], points: 3, description: 'Triple gluon vertex' },
  { particles: ['quark', 'antiquark', 'gluon'], points: 3, description: 'Quark-gluon interaction' },
  
  // 4 points vertices
  { particles: ['quark', 'antiquark', 'higgs'], points: 4, description: 'Higgs-quark coupling' },
  { particles: ['electron', 'positron', 'higgs'], points: 4, description: 'Higgs-electron coupling' },
  
  // 6 points vertices (rarest)
  { particles: ['higgs', 'higgs', 'higgs'], points: 6, description: 'Triple Higgs self-coupling' },
];

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Create the deck of cards
export function createDeck(): ParticleCard[] {
  const deck: ParticleCard[] = [];
  
  // Create cards for each particle type
  Object.entries(PARTICLE_CONFIGS).forEach(([type, config]) => {
    if (config.count === 0) return;
    
    for (let i = 0; i < config.count; i++) {
      // Generate different line configurations
      const lineConfigs = generateLineConfigurations(type as ParticleType);
      const lines = lineConfigs[i % lineConfigs.length];
      
      deck.push({
        id: generateId(),
        type: type as ParticleType,
        lines,
        arrowDirection: config.isCharged ? (Math.random() > 0.5 ? 'in' : 'out') : undefined,
        rotation: 0,
      });
    }
  });
  
  return shuffleDeck(deck);
}

// Generate different line configurations for variety
function generateLineConfigurations(type: ParticleType): number[][] {
  // Each card has 2-3 lines connecting through the center
  const configs: number[][] = [
    [0, 3], // straight through
    [1, 4], // straight through
    [2, 5], // straight through
    [0, 2, 4], // three-way
    [1, 3, 5], // three-way
    [0, 1, 3], // curved
    [1, 2, 4], // curved
    [2, 3, 5], // curved
    [0, 4, 5], // curved
  ];
  
  return configs;
}

// Shuffle the deck using Fisher-Yates algorithm
export function shuffleDeck(deck: ParticleCard[]): ParticleCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Initialize game state
export function initializeGame(
  playerNames: string[],
  mode: 'competitive' | 'cooperative' = 'competitive'
): GameState {
  const playerCount = playerNames.length;
  let deck = createDeck();
  
  // For 3 players, remove 5 random cards
  if (playerCount === 3) {
    deck = deck.slice(5);
  }
  
  // Determine rounds and cards per round
  const config = {
    2: { cards: 3, rounds: 14 },
    3: { cards: 4, rounds: 9 },
    4: { cards: 5, rounds: 8 },
  }[playerCount] || { cards: 3, rounds: 14 };
  
  // Deal secret cards to each player
  const players: PlayerState[] = playerNames.map((name, index) => ({
    id: generateId(),
    name,
    diagram: [],
    secretCard: deck.pop() || null,
    score: 0,
    invalidVertices: 0,
  }));
  
  // Draw center cards for first round
  const centerCards: ParticleCard[] = [];
  for (let i = 0; i < config.cards; i++) {
    const card = deck.pop();
    if (card) centerCards.push(card);
  }
  
  return {
    deck,
    centerCards,
    players,
    currentPlayerIndex: 0,
    round: 1,
    maxRounds: config.rounds,
    phase: 'playing',
    mode,
  };
}

// Check if a position is adjacent to existing cards
export function isAdjacentToExisting(position: GridPosition, diagram: PlacedCard[]): boolean {
  if (diagram.length === 0) return true;
  
  const neighbors = getNeighbors(position);
  return neighbors.some(neighbor => 
    diagram.some(card => card.position.q === neighbor.q && card.position.r === neighbor.r)
  );
}

// Get all neighboring positions in hex grid
export function getNeighbors(position: GridPosition): GridPosition[] {
  return HEX_DIRECTIONS.map(d => ({ q: position.q + d.q, r: position.r + d.r }));
}

function hasLineOnEdge(card: ParticleCard, edge: number): boolean {
  return card.lines.includes(((edge % 6) + 6) % 6);
}

function oppositeEdge(edge: number): number {
  return (edge + 3) % 6;
}

function getCardAtPosition(diagram: PlacedCard[], position: GridPosition): PlacedCard | undefined {
  return diagram.find(c => c.position.q === position.q && c.position.r === position.r);
}

function evaluatePlacement(
  card: ParticleCard,
  position: GridPosition,
  diagram: PlacedCard[]
): { isLegal: boolean; connectedEdges: number } {
  const occupied = getCardAtPosition(diagram, position);
  if (occupied) return { isLegal: false, connectedEdges: 0 };

  if (!isAdjacentToExisting(position, diagram)) {
    return { isLegal: false, connectedEdges: 0 };
  }

  let connectedEdges = 0;

  for (let edge = 0; edge < 6; edge++) {
    const direction = HEX_DIRECTIONS[edge];
    const neighborPosition = {
      q: position.q + direction.q,
      r: position.r + direction.r,
    };
    const neighbor = getCardAtPosition(diagram, neighborPosition);

    if (!neighbor) continue;

    const cardHasLine = hasLineOnEdge(card, edge);
    const neighborHasLine = hasLineOnEdge(neighbor, oppositeEdge(edge));

    if (cardHasLine !== neighborHasLine) {
      return { isLegal: false, connectedEdges: 0 };
    }

    if (cardHasLine && neighborHasLine) {
      connectedEdges++;
    }
  }

  if (diagram.length > 0 && connectedEdges === 0) {
    return { isLegal: false, connectedEdges: 0 };
  }

  return { isLegal: true, connectedEdges };
}

export function isLegalPlacement(
  card: ParticleCard,
  position: GridPosition,
  diagram: PlacedCard[]
): boolean {
  return evaluatePlacement(card, position, diagram).isLegal;
}

export function autoOrientCardForPlacement(
  card: ParticleCard,
  position: GridPosition,
  diagram: PlacedCard[]
): ParticleCard | null {
  let bestCard: ParticleCard | null = null;
  let bestConnections = -1;

  for (let step = 0; step < 6; step++) {
    const rotated = step === 0 ? card : rotateCard(card, step * 60);
    const { isLegal, connectedEdges } = evaluatePlacement(rotated, position, diagram);

    if (!isLegal) continue;

    if (connectedEdges > bestConnections) {
      bestConnections = connectedEdges;
      bestCard = rotated;
    }
  }

  return bestCard;
}

// Place a card on the diagram
export function placeCard(
  card: ParticleCard,
  position: GridPosition,
  diagram: PlacedCard[]
): PlacedCard[] {
  const placedCard: PlacedCard = {
    ...card,
    position,
  };
  
  return [...diagram, placedCard];
}

// Rotate a card (changes line positions)
export function rotateCard(card: ParticleCard, degrees: number): ParticleCard {
  const steps = (degrees / 60) % 6;
  const newLines = card.lines.map(line => (line + steps) % 6);
  
  return {
    ...card,
    lines: newLines,
    rotation: (card.rotation + degrees) % 360,
  };
}

// Calculate score for a diagram
export function calculateScore(diagram: PlacedCard[]): { score: number; validVertices: number; invalidVertices: number; loops: number } {
  let matchedConnections = 0;
  let mismatchedConnections = 0;
  let openEnds = 0;

  diagram.forEach(card => {
    card.lines.forEach(edge => {
      const direction = HEX_DIRECTIONS[edge];
      const neighborPosition = {
        q: card.position.q + direction.q,
        r: card.position.r + direction.r,
      };
      const neighbor = getCardAtPosition(diagram, neighborPosition);

      if (!neighbor) {
        openEnds++;
        return;
      }

      const neighborHasLine = hasLineOnEdge(neighbor, oppositeEdge(edge));
      if (neighborHasLine) {
        matchedConnections++;
      } else {
        mismatchedConnections++;
      }
    });
  });

  const validVertices = Math.floor(matchedConnections / 2);
  const invalidVertices = Math.floor(mismatchedConnections / 2) + openEnds;
  let score = validVertices * 2 - Math.floor(mismatchedConnections / 2) * 2 - openEnds;
  
  // Check for loops (hexagonal cycles)
  const loops = countValidLoops(diagram);
  score += loops * 2;
  
  return { score, validVertices, invalidVertices, loops };
}

// Find all vertices in the diagram
export function findAllVertices(diagram: PlacedCard[]): Vertex[] {
  const vertices: Vertex[] = [];
  const vertexMap = new Map<string, PlacedCard[]>();
  
  // For each card, check which vertices it contributes to
  diagram.forEach(card => {
    card.lines.forEach(lineEdge => {
      const vertexKey = getVertexKey(card.position, lineEdge);
      const existing = vertexMap.get(vertexKey) || [];
      vertexMap.set(vertexKey, [...existing, card]);
    });
  });
  
  // Evaluate each vertex
  vertexMap.forEach((cards, key) => {
    const isComplete = cards.length === 3;
    const isValid = isComplete ? isValidVertex(cards) : null;
    const points = isValid ? getVertexPoints(cards) : (isComplete ? -1 : 0);
    
    const [q, r, edge] = key.split(',').map(Number);
    
    vertices.push({
      position: { q, r },
      edge,
      cards,
      isComplete,
      isValid,
      points,
    });
  });
  
  return vertices;
}

// Generate a unique key for a vertex position
function getVertexKey(position: GridPosition, edge: number): string {
  // Normalize to the same vertex key regardless of which card references it
  // Each vertex is shared by 3 cards
  return `${position.q},${position.r},${edge}`;
}

// Check if a vertex combination is valid according to physics rules
function isValidVertex(cards: PlacedCard[]): boolean {
  if (cards.length !== 3) return false;
  
  const types = cards.map(c => c.type).sort();
  
  // Check against valid vertex combinations
  return VALID_VERTICES.some(valid => {
    const validTypes = [...valid.particles].sort();
    return types.every((type, i) => type === validTypes[i]);
  });
}

// Get points for a valid vertex
function getVertexPoints(cards: PlacedCard[]): number {
  const types = cards.map(c => c.type).sort();
  
  const matching = VALID_VERTICES.find(valid => {
    const validTypes = [...valid.particles].sort();
    return types.every((type, i) => type === validTypes[i]);
  });
  
  return matching?.points || 0;
}

// Count valid loops (hexagonal cycles)
function countValidLoops(diagram: PlacedCard[]): number {
  // Simplified loop detection - check for complete hexagons
  // A valid loop is 6 cards forming a complete hexagon with all valid vertices
  let loops = 0;
  
  // Get all unique positions
  const positions = new Set(diagram.map(c => `${c.position.q},${c.position.r}`));
  
  // Check each position as potential center of a loop
  diagram.forEach(card => {
    const neighbors = getNeighbors(card.position);
    const presentNeighbors = neighbors.filter(n => positions.has(`${n.q},${n.r}`));
    
    // Need all 6 neighbors for a complete loop around this card
    if (presentNeighbors.length === 6) {
      // Verify all vertices in the loop are valid
      // Simplified: just count it as a loop for now
      loops++;
    }
  });
  
  // Each loop is counted 7 times (once for center, once for each of 6 surrounding)
  // So divide by 7 and round down
  return Math.floor(loops / 7);
}

// Get particle display info
export function getParticleInfo(type: ParticleType): { name: string; symbol: string; color: string } {
  const info: Record<ParticleType, { name: string; symbol: string; color: string }> = {
    quark: { name: 'Quark', symbol: 'q', color: 'quark' },
    antiquark: { name: 'Antiquark', symbol: 'q̄', color: 'antiquark' },
    electron: { name: 'Electron', symbol: 'e⁻', color: 'electron' },
    positron: { name: 'Positron', symbol: 'e⁺', color: 'positron' },
    photon: { name: 'Photon', symbol: 'γ', color: 'photon' },
    gluon: { name: 'Gluon', symbol: 'g', color: 'gluon' },
    higgs: { name: 'Higgs Boson', symbol: 'H', color: 'higgs' },
  };
  
  return info[type];
}

// Advance to next player/round
export function advanceGame(state: GameState): GameState {
  const playerCount = state.players.length;
  const cardsPerRound = {
    2: 3,
    3: 4,
    4: 5,
  }[playerCount] || 3;
  
  // Check if all cards for this round have been taken
  if (state.centerCards.length === 0) {
    // Move to next round
    const newRound = state.round + 1;
    
    if (newRound > state.maxRounds) {
      // Game is finished
      return {
        ...state,
        phase: 'finished',
      };
    }
    
    // Draw new center cards
    const newDeck = [...state.deck];
    const newCenterCards: ParticleCard[] = [];
    for (let i = 0; i < cardsPerRound && newDeck.length > 0; i++) {
      const card = newDeck.pop();
      if (card) newCenterCards.push(card);
    }
    
    return {
      ...state,
      deck: newDeck,
      centerCards: newCenterCards,
      currentPlayerIndex: (state.currentPlayerIndex + 1) % playerCount,
      round: newRound,
    };
  }
  
  // Just advance to next player
  return {
    ...state,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % playerCount,
  };
}
