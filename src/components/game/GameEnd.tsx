import React from 'react';
import type { Player, GameMode } from '../../types';

interface GameEndProps {
  players: Player[];
  mode: GameMode;
  onRestart: () => void;
}

export const GameEnd: React.FC<GameEndProps> = ({ players, mode, onRestart }) => {
  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const getCooperativeMessage = (score: number): string => {
    if (score > 38) return "🏆 You will probably win a real Nobel Prize!";
    if (score >= 35) return "🎓 You should consider doing a PhD in Particle Physics!";
    if (score >= 32) return "🔬 You almost have enough time and resources for real experimental physics!";
    if (score >= 29) return "📚 You are starting to understand the secrets of fundamental particles, but you'll need to communicate better in the future!";
    if (score >= 26) return "⚛️ The secrets of fundamental particles are complex! You need to spend more time studying to understand them.";
    return "📖 You need to be more careful when playing with fundamental particles. Study more and try again!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-quantum-blue to-quantum-teal flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-quantum-blue mb-4">
            {mode === 'competitive' ? '🏆 Game Over!' : '🤝 Mission Complete!'}
          </h1>
          {mode === 'cooperative' && (
            <p className="text-2xl font-semibold text-gray-700 mb-2">
              Team Score: {winner.score} points
            </p>
          )}
          <p className="text-xl text-gray-600">
            {mode === 'competitive' 
              ? `${winner.name} wins with ${winner.score} points!`
              : getCooperativeMessage(winner.score)
            }
          </p>
        </div>

        {/* Final Scores */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            {mode === 'competitive' ? 'Final Standings' : 'Team Performance'}
          </h2>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-gray-900'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{player.name}</div>
                    {mode === 'competitive' && player.secretCard && (
                      <div className="text-sm opacity-75">
                        Secret card: {player.secretCard.name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-3xl font-bold">{player.score} pts</div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-lg text-gray-800 mb-3">Game Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-quantum-blue">
                {players.reduce((sum, p) => sum + (p.hand.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Cards Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-quantum-teal">
                {mode === 'competitive' ? winner.score : winner.score}
              </div>
              <div className="text-sm text-gray-600">
                {mode === 'competitive' ? 'Winning Score' : 'Team Score'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-quantum-blue to-quantum-teal text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            🎮 Play Again
          </button>
        </div>

        {/* Fun fact */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🌟 Learn more about particle physics at <a href="https://un-solved.com/game" target="_blank" rel="noopener noreferrer" className="text-quantum-blue hover:underline">un-solved.com/game</a></p>
        </div>
      </div>
    </div>
  );
};
