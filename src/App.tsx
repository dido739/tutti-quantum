import { useGameStore } from './store/gameStore';
import { GameSetup } from './components/game/GameSetup';
import { GamePlay } from './components/game/GamePlay';
import { GameEnd } from './components/game/GameEnd';
import type { GameMode } from './types';

function App() {
  const { phase, players, mode, initializeGame, resetGame } = useGameStore();

  const handleStartGame = (mode: GameMode, playerCount: number, playerNames: string[]) => {
    initializeGame(mode, playerCount, playerNames);
  };

  const handleRestart = () => {
    resetGame();
  };

  return (
    <div className="min-h-screen">
      {phase === 'setup' ? (
        <GameSetup onStart={handleStartGame} />
      ) : phase === 'finished' ? (
        <GameEnd players={players} mode={mode} onRestart={handleRestart} />
      ) : (
        <GamePlay />
      )}
    </div>
  );
}

export default App;
