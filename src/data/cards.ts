import type { ParticleCard, ArrowDirection } from '../types';

// Helper to create edge configuration
const edge = (dir: ArrowDirection) => ({ direction: dir });

// Card data for all 44 particle cards
export const PARTICLE_CARDS: ParticleCard[] = [
  // QUARKS (13 cards - blue hexagonal)
  {
    id: 'quark-1',
    type: 'quark',
    name: 'Up Quark',
    symbol: 'u',
    color: '#3B82F6',
    edges: [edge('in'), edge('out'), edge('none'), edge('in'), edge('out'), edge('none')],
  },
  {
    id: 'quark-2',
    type: 'quark',
    name: 'Down Quark',
    symbol: 'd',
    color: '#3B82F6',
    edges: [edge('out'), edge('in'), edge('none'), edge('out'), edge('in'), edge('none')],
  },
  {
    id: 'quark-3',
    type: 'quark',
    name: 'Charm Quark',
    symbol: 'c',
    color: '#3B82F6',
    edges: [edge('in'), edge('none'), edge('out'), edge('in'), edge('none'), edge('out')],
  },
  {
    id: 'quark-4',
    type: 'quark',
    name: 'Strange Quark',
    symbol: 's',
    color: '#3B82F6',
    edges: [edge('out'), edge('none'), edge('in'), edge('out'), edge('none'), edge('in')],
  },
  {
    id: 'quark-5',
    type: 'quark',
    name: 'Top Quark',
    symbol: 't',
    color: '#3B82F6',
    edges: [edge('none'), edge('in'), edge('out'), edge('none'), edge('in'), edge('out')],
  },
  {
    id: 'quark-6',
    type: 'quark',
    name: 'Bottom Quark',
    symbol: 'b',
    color: '#3B82F6',
    edges: [edge('none'), edge('out'), edge('in'), edge('none'), edge('out'), edge('in')],
  },
  {
    id: 'quark-7',
    type: 'quark',
    name: 'Up Quark',
    symbol: 'u',
    color: '#3B82F6',
    edges: [edge('in'), edge('out'), edge('in'), edge('out'), edge('none'), edge('none')],
  },
  {
    id: 'quark-8',
    type: 'quark',
    name: 'Down Quark',
    symbol: 'd',
    color: '#3B82F6',
    edges: [edge('out'), edge('in'), edge('out'), edge('in'), edge('none'), edge('none')],
  },
  {
    id: 'quark-9',
    type: 'quark',
    name: 'Charm Quark',
    symbol: 'c',
    color: '#3B82F6',
    edges: [edge('in'), edge('out'), edge('none'), edge('none'), edge('in'), edge('out')],
  },
  {
    id: 'quark-10',
    type: 'quark',
    name: 'Strange Quark',
    symbol: 's',
    color: '#3B82F6',
    edges: [edge('out'), edge('in'), edge('none'), edge('none'), edge('out'), edge('in')],
  },
  {
    id: 'quark-11',
    type: 'quark',
    name: 'Top Quark',
    symbol: 't',
    color: '#3B82F6',
    edges: [edge('none'), edge('none'), edge('in'), edge('out'), edge('in'), edge('out')],
  },
  {
    id: 'quark-12',
    type: 'quark',
    name: 'Bottom Quark',
    symbol: 'b',
    color: '#3B82F6',
    edges: [edge('none'), edge('none'), edge('out'), edge('in'), edge('out'), edge('in')],
  },
  {
    id: 'quark-13',
    type: 'quark',
    name: 'Quark',
    symbol: 'q',
    color: '#3B82F6',
    edges: [edge('in'), edge('out'), edge('in'), edge('out'), edge('in'), edge('out')],
  },

  // ELECTRONS (8 cards - pink/red hexagonal)
  {
    id: 'electron-1',
    type: 'electron',
    name: 'Electron',
    symbol: 'e⁻',
    color: '#EC4899',
    edges: [edge('in'), edge('out'), edge('none'), edge('in'), edge('out'), edge('none')],
  },
  {
    id: 'electron-2',
    type: 'electron',
    name: 'Positron',
    symbol: 'e⁺',
    color: '#EC4899',
    edges: [edge('out'), edge('in'), edge('none'), edge('out'), edge('in'), edge('none')],
  },
  {
    id: 'electron-3',
    type: 'electron',
    name: 'Muon',
    symbol: 'μ⁻',
    color: '#EC4899',
    edges: [edge('in'), edge('none'), edge('out'), edge('in'), edge('none'), edge('out')],
  },
  {
    id: 'electron-4',
    type: 'electron',
    name: 'Antimuon',
    symbol: 'μ⁺',
    color: '#EC4899',
    edges: [edge('out'), edge('none'), edge('in'), edge('out'), edge('none'), edge('in')],
  },
  {
    id: 'electron-5',
    type: 'electron',
    name: 'Tau',
    symbol: 'τ⁻',
    color: '#EC4899',
    edges: [edge('none'), edge('in'), edge('out'), edge('none'), edge('in'), edge('out')],
  },
  {
    id: 'electron-6',
    type: 'electron',
    name: 'Antitau',
    symbol: 'τ⁺',
    color: '#EC4899',
    edges: [edge('none'), edge('out'), edge('in'), edge('none'), edge('out'), edge('in')],
  },
  {
    id: 'electron-7',
    type: 'electron',
    name: 'Electron',
    symbol: 'e⁻',
    color: '#EC4899',
    edges: [edge('in'), edge('out'), edge('in'), edge('out'), edge('none'), edge('none')],
  },
  {
    id: 'electron-8',
    type: 'electron',
    name: 'Positron',
    symbol: 'e⁺',
    color: '#EC4899',
    edges: [edge('out'), edge('in'), edge('out'), edge('in'), edge('none'), edge('none')],
  },

  // GLUONS (12 cards - red/purple hexagonal)
  {
    id: 'gluon-1',
    type: 'gluon',
    name: 'Gluon',
    symbol: 'g',
    color: '#8B5CF6',
    edges: [edge('in'), edge('out'), edge('none'), edge('in'), edge('out'), edge('none')],
  },
  {
    id: 'gluon-2',
    type: 'gluon',
    name: 'Gluon',
    symbol: 'g',
    color: '#8B5CF6',
    edges: [edge('out'), edge('in'), edge('none'), edge('out'), edge('in'), edge('none')],
  },
  {
    id: 'gluon-3',
    type: 'gluon',
    name: 'Gluon',
    symbol: 'g',
    color: '#8B5CF6',
    edges: [edge('in'), edge('none'), edge('out'), edge('in'), edge('none'), edge('out')],
  },
  {
    id: 'gluon-4',
    type: 'gluon',
    name: 'Gluon',
    symbol: 'g',
    color: '#8B5CF6',
    edges: [edge('out'), edge('none'), edge('in'), edge('out'), edge('none'), edge('in')],
  },
  {
    id: 'gluon-5',
    type: 'gluon',
    name: 'Gluon',
    symbol: 'g',
    color: '#8B5CF6',
    edges: [edge('none'), edge('in'), edge('out'), edge('none'), edge('in'), edge('out')],
  },
  {
    id: 'gluon-6',
    type: 'gluon',
    name: 'Gluon',
    symbol: 'g',
    color: '#8B5CF6',
    edges: [edge('none'), edge('out'), edge('in'), edge('none'), edge('out'), edge('in')],
  },
  {
    id: 'gluon-7',
    type: 'gluon',
    name: 'Gluon',
    symbol: 'g',
    color: '#8B5CF6',
    edges: [edge('in'), edge('out'), edge('in'), edge('out'), edge('none'), edge('none')],
  },
  {
    id: 'gluon-8',
    type: 'gluon',
    name: 'Gluon',
    symbol: 'g',
    color: '#8B5CF6',
    edges: [edge('out'), edge('in'), edge('out'), edge('in'), edge('none'), edge('none')],
  },
  {
    id: 'gluon-9',
    type: 'gluon',
    name: 'Gluon',
    symbol: 'g',
    color: '#8B5CF6',
    edges: [edge('in'), edge('out'), edge('none'), edge('none'), edge('in'), edge('out')],
  },
  {
    id: 'gluon-10',
    type: 'gluon',
    name: 'Gluon',
    symbol: 'g',
    color: '#8B5CF6',
    edges: [edge('out'), edge('in'), edge('none'), edge('none'), edge('out'), edge('in')],
  },
  {
    id: 'gluon-11',
    type: 'gluon',
    name: 'Gluon',
    symbol: 'g',
    color: '#8B5CF6',
    edges: [edge('none'), edge('none'), edge('in'), edge('out'), edge('in'), edge('out')],
  },
  {
    id: 'gluon-12',
    type: 'gluon',
    name: 'Gluon',
    symbol: 'g',
    color: '#8B5CF6',
    edges: [edge('none'), edge('none'), edge('out'), edge('in'), edge('out'), edge('in')],
  },

  // PHOTONS (7 cards - yellow hexagonal)
  {
    id: 'photon-1',
    type: 'photon',
    name: 'Photon',
    symbol: 'γ',
    color: '#F59E0B',
    edges: [edge('in'), edge('out'), edge('none'), edge('in'), edge('out'), edge('none')],
  },
  {
    id: 'photon-2',
    type: 'photon',
    name: 'Photon',
    symbol: 'γ',
    color: '#F59E0B',
    edges: [edge('out'), edge('in'), edge('none'), edge('out'), edge('in'), edge('none')],
  },
  {
    id: 'photon-3',
    type: 'photon',
    name: 'Photon',
    symbol: 'γ',
    color: '#F59E0B',
    edges: [edge('in'), edge('none'), edge('out'), edge('in'), edge('none'), edge('out')],
  },
  {
    id: 'photon-4',
    type: 'photon',
    name: 'Photon',
    symbol: 'γ',
    color: '#F59E0B',
    edges: [edge('out'), edge('none'), edge('in'), edge('out'), edge('none'), edge('in')],
  },
  {
    id: 'photon-5',
    type: 'photon',
    name: 'Photon',
    symbol: 'γ',
    color: '#F59E0B',
    edges: [edge('none'), edge('in'), edge('out'), edge('none'), edge('in'), edge('out')],
  },
  {
    id: 'photon-6',
    type: 'photon',
    name: 'Photon',
    symbol: 'γ',
    color: '#F59E0B',
    edges: [edge('none'), edge('out'), edge('in'), edge('none'), edge('out'), edge('in')],
  },
  {
    id: 'photon-7',
    type: 'photon',
    name: 'Photon',
    symbol: 'γ',
    color: '#F59E0B',
    edges: [edge('in'), edge('out'), edge('in'), edge('out'), edge('none'), edge('none')],
  },

  // HIGGS BOSONS (4 cards - yellow/gold hexagonal)
  {
    id: 'higgs-1',
    type: 'higgs',
    name: 'Higgs Boson',
    symbol: 'H',
    color: '#EAB308',
    edges: [edge('in'), edge('out'), edge('none'), edge('in'), edge('out'), edge('none')],
  },
  {
    id: 'higgs-2',
    type: 'higgs',
    name: 'Higgs Boson',
    symbol: 'H',
    color: '#EAB308',
    edges: [edge('out'), edge('in'), edge('none'), edge('out'), edge('in'), edge('none')],
  },
  {
    id: 'higgs-3',
    type: 'higgs',
    name: 'Higgs Boson',
    symbol: 'H',
    color: '#EAB308',
    edges: [edge('in'), edge('none'), edge('out'), edge('in'), edge('none'), edge('out')],
  },
  {
    id: 'higgs-4',
    type: 'higgs',
    name: 'Higgs Boson',
    symbol: 'H',
    color: '#EAB308',
    edges: [edge('out'), edge('none'), edge('in'), edge('out'), edge('none'), edge('in')],
  },
];

// Shuffle function
export const shuffleDeck = (deck: ParticleCard[]): ParticleCard[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Deal cards based on player count
export const getCardsPerPlayer = (playerCount: number): number => {
  const cardsMap: { [key: number]: number } = {
    2: 9,
    3: 6,
    4: 4,
  };
  return cardsMap[playerCount] || 4;
};
