import React, { useState } from 'react';
import type { GameMode } from '../../types';

interface GameSetupProps {
  onStart: (mode: GameMode, playerCount: number, playerNames: string[]) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [mode, setMode] = useState<GameMode>('competitive');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const names = Array.from({ length: count }, (_, i) => `Player ${i + 1}`);
    setPlayerNames(names);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStart = () => {
    onStart(mode, playerCount, playerNames);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-quantum-blue to-quantum-teal flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-quantum-blue mb-2">
            Tutti Quantum
          </h1>
          <p className="text-gray-600 text-lg">
            Build Feynman Diagrams, Score Points! 🎮⚛️
          </p>
        </div>

        <div className="space-y-6">
          {/* Game Mode Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                  mode === 'competitive'
                    ? 'bg-quantum-blue text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setMode('competitive')}
              >
                🏆 Competitive
              </button>
              <button
                className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                  mode === 'cooperative'
                    ? 'bg-quantum-teal text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setMode('cooperative')}
              >
                🤝 Cooperative
              </button>
            </div>
          </div>

          {/* Player Count Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Number of Players
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[2, 3, 4].map(count => (
                <button
                  key={count}
                  className={`py-3 rounded-xl font-semibold transition-all ${
                    playerCount === count
                      ? 'bg-quantum-blue text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handlePlayerCountChange(count)}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>

          {/* Player Names */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Player Names
            </label>
            <div className="space-y-3">
              {playerNames.map((name, index) => (
                <input
                  key={index}
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-quantum-blue focus:outline-none"
                  placeholder={`Player ${index + 1} name`}
                />
              ))}
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-quantum-blue mb-2">
              {mode === 'competitive' ? '🏆 Competitive Mode' : '🤝 Cooperative Mode'}
            </h3>
            <p className="text-sm text-gray-700">
              {mode === 'competitive' ? (
                <>
                  Players compete to build the highest-scoring Feynman diagram.
                  Each player gets {playerCount === 2 ? '9' : playerCount === 3 ? '6' : '4'} cards
                  plus 1 secret card revealed at the end.
                </>
              ) : (
                <>
                  Work together to create the highest-scoring diagram possible.
                  Communicate strategically and aim for {'>'}38 points for a Nobel Prize!
                </>
              )}
            </p>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-quantum-blue to-quantum-teal text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Start Game ⚛️
          </button>
        </div>
      </div>
    </div>
  );
};
