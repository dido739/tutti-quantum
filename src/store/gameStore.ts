import { create } from 'zustand';
import type { GameState, GameMode, Player, PlacedCard, ParticleCard, BoardPosition } from '../types';
import { PARTICLE_CARDS, shuffleDeck, getCardsPerPlayer } from '../data/cards';

interface GameStore extends GameState {
  // Actions
  initializeGame: (mode: GameMode, playerCount: number, playerNames: string[]) => void;
  placeCard: (card: ParticleCard, position: BoardPosition, rotation: number) => void;
  drawCard: (playerId: string) => void;
  discardCard: (playerId: string, card: ParticleCard) => void;
  nextTurn: () => void;
  endGame: () => void;
  resetGame: () => void;
}

const initialState: GameState = {
  mode: 'competitive',
  phase: 'setup',
  players: [],
  currentPlayerIndex: 0,
  firstPlayerIndex: 0,
  board: [],
  deck: [],
  discardPile: [],
  vertices: [],
  round: 0,
  maxRounds: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  initializeGame: (mode: GameMode, playerCount: number, playerNames: string[]) => {
    const shuffledDeck = shuffleDeck([...PARTICLE_CARDS]);
    const cardsPerPlayer = getCardsPerPlayer(playerCount);
    
    // Create players and deal cards
    const players: Player[] = playerNames.map((name, index) => {
      const hand = shuffledDeck.splice(0, cardsPerPlayer);
      return {
        id: `player-${index}`,
        name,
        hand,
        score: 0,
      };
    });

    // In competitive mode, give each player a secret card
    if (mode === 'competitive') {
      players.forEach(player => {
        if (shuffledDeck.length > 0) {
          player.secretCard = shuffledDeck.pop();
        }
      });
    }

    // Calculate max rounds based on player count
    const maxRounds = mode === 'competitive' ? 
      Math.floor((PARTICLE_CARDS.length - playerCount) / playerCount) : 
      Math.floor(PARTICLE_CARDS.length / (playerCount * 2));

    set({
      mode,
      phase: 'playing',
      players,
      currentPlayerIndex: 0,
      firstPlayerIndex: 0,
      board: [],
      deck: shuffledDeck,
      discardPile: [],
      vertices: [],
      round: 1,
      maxRounds,
    });
  },

  placeCard: (card: ParticleCard, position: BoardPosition, rotation: number) => {
    const { players, currentPlayerIndex, board } = get();
    const currentPlayer = players[currentPlayerIndex];
    
    // Remove card from player's hand
    const updatedHand = currentPlayer.hand.filter(c => c.id !== card.id);
    
    // Add card to board
    const placedCard: PlacedCard = {
      card,
      position,
      rotation,
    };

    // Update player and board
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...currentPlayer,
      hand: updatedHand,
    };

    set({
      players: updatedPlayers,
      board: [...board, placedCard],
    });
  },

  drawCard: (playerId: string) => {
    const { players, deck } = get();
    if (deck.length === 0) return;

    const card = deck[0];
    const updatedDeck = deck.slice(1);
    
    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          hand: [...player.hand, card],
        };
      }
      return player;
    });

    set({
      players: updatedPlayers,
      deck: updatedDeck,
    });
  },

  discardCard: (playerId: string, card: ParticleCard) => {
    const { players, discardPile } = get();
    
    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          hand: player.hand.filter(c => c.id !== card.id),
        };
      }
      return player;
    });

    set({
      players: updatedPlayers,
      discardPile: [...discardPile, card],
    });
  },

  nextTurn: () => {
    const { players, currentPlayerIndex } = get();
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    set({ currentPlayerIndex: nextIndex });
  },

  endGame: () => {
    set({ phase: 'finished' });
  },

  resetGame: () => {
    set(initialState);
  },
}));
