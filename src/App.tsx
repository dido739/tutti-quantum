import { useGameStore } from './store/gameStore';
import { GameSetup } from './components/game/GameSetup';
import { GamePlay } from './components/game/GamePlay';
import type { GameMode } from './types';

function App() {
  const { phase, initializeGame } = useGameStore();

  const handleStartGame = (mode: GameMode, playerCount: number, playerNames: string[]) => {
    initializeGame(mode, playerCount, playerNames);
  };

  return (
    <div className="min-h-screen">
      {phase === 'setup' ? (
        <GameSetup onStart={handleStartGame} />
      ) : (
        <GamePlay />
      )}
    </div>
  );
}

export default App;
