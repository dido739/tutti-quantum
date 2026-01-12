# Tutti Quantum 🎮⚛️

A web-based version of the Tutti Quantum board game - a quantum physics card game where players build Feynman diagrams by connecting particle cards to score points.

![Game Setup](https://github.com/user-attachments/assets/1c5e558f-9005-4fb5-8c82-331fb07ed019)
![Gameplay](https://github.com/user-attachments/assets/79bfafed-7582-456f-be60-808205a93bca)
![Card Placed](https://github.com/user-attachments/assets/9ec5c699-e711-4412-9658-c65d22847f9a)

## 🌟 About the Game

Tutti Quantum is a 2-4 player card game about quantum mechanics where players connect elementary particle cards to build valid Feynman diagrams. The game teaches quantum physics concepts while being fun and competitive.

## 🎯 Features

### ✅ Implemented
- **Game Setup Screen** - Select game mode (Competitive/Cooperative) and number of players (2-4)
- **44 Particle Cards** - Complete deck with Quarks, Electrons, Gluons, Photons, and Higgs Bosons
- **Hexagonal Card Display** - Beautiful color-coded cards with particle symbols and arrows
- **Game Board** - Interactive board with zoom and pan functionality
- **Turn-Based Gameplay** - Players take turns placing cards
- **Card Management** - Shuffle, deal, and draw functionality
- **Player Hands** - Display cards for each player
- **Score Tracking** - Real-time score display for all players
- **Responsive Design** - Works on desktop, tablet, and mobile

### 🚧 In Progress
- Advanced card placement with position selection
- Vertex validation system
- Scoring calculation
- Secret card mechanic for competitive mode
- Cooperative mode turn flow
- End game conditions and winner determination
- Reference cards display
- Game rules overlay
- Educational tooltips
- Advanced scoring (loops, sub-diagrams)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/dido739/tutti-quantum.git
cd tutti-quantum

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development
The development server runs on `http://localhost:5173`

## 🎲 How to Play

### Game Setup
1. Choose your game mode:
   - **Competitive**: Players compete for the highest score
   - **Cooperative**: Work together to maximize team score

2. Select number of players (2-4)

3. Enter player names

### Competitive Mode
- Each player receives cards based on player count:
  - 2 players: 9 cards each
  - 3 players: 6 cards each
  - 4 players: 4 cards each
- Plus 1 secret card revealed at the end
- Players take turns placing cards to build the diagram
- Score points for valid vertices
- Highest score wins!

### Cooperative Mode
- Players work together to build the best diagram
- Communicate strategically (without revealing exact cards)
- Goal: Score >38 points for a "Nobel Prize"!

### Scoring
Valid vertices award points based on particle combinations:
- **2 points**: Quark-Gluon-Quark, Electron-Photon-Electron
- **3 points**: Quark-Photon-Quark, Quark-Gluon-Photon, Electron-Gluon-Photon
- **4 points**: Quark-Higgs-Quark, Electron-Higgs-Electron
- **6 points**: Quark-Gluon-Higgs, Electron-Photon-Higgs

Invalid vertices: **-1 point** (only 1-2 particle types, or arrows don't flow)

## 🎨 Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling and design system
- **Zustand** - State management
- **Framer Motion** - Animations
- **React Icons** - UI icons

### Build Tools
- **Vite** - Fast development and building
- **PostCSS** - CSS processing

## 🗂️ Project Structure

```
src/
├── components/
│   ├── board/          # Game board components
│   ├── cards/          # Card display components
│   ├── game/           # Game flow components
│   └── ui/             # UI components
├── data/               # Card data and configurations
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
    ├── hexGrid.ts      # Hexagonal grid logic
    └── vertexValidation.ts  # Vertex validation logic
```

## 🧪 Game Components

### Particle Cards (44 total)
- **13 Quarks** (blue) - Up, Down, Charm, Strange, Top, Bottom
- **8 Electrons** (pink) - Electron, Positron, Muon, Antimuon, Tau, Antitau
- **12 Gluons** (purple)
- **7 Photons** (yellow)
- **4 Higgs Bosons** (gold)

Each card has 6 edges with arrows indicating interaction directions.

## 📚 Resources

- Original game: [un-solved.com/game](https://un-solved.com/game)
- Learn about Feynman diagrams and particle physics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎓 Educational Value

Tutti Quantum makes learning about particle physics fun! Through gameplay, you'll learn about:
- Elementary particles (quarks, leptons, bosons)
- Particle interactions
- Feynman diagrams
- Conservation laws in physics
- The Standard Model of particle physics

## 🏆 Cooperative Mode Scoring Benchmarks

- **>38 points**: "You will probably win a real Nobel Prize!"
- **35-38 points**: "You should consider doing a PhD in Particle Physics!"
- **32-34 points**: "You almost have enough time and resources for real experimental physics!"
- **29-31 points**: "You are starting to understand the secrets of fundamental particles, but you'll need to communicate better in the future!"
- **26-28 points**: "The secrets of fundamental particles are complex! You need to spend more time studying to understand them."
- **<26 points**: "You need to be more careful when playing with fundamental particles. Study more and try again!"

---

Made with ❤️ and ⚛️ - Making quantum physics fun and accessible!
