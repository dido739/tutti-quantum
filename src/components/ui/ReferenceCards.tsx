import React from 'react';

interface ReferenceCardsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceCards: React.FC<ReferenceCardsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const vertexTypes = [
    {
      points: 2,
      combinations: [
        { particles: ['Quark', 'Gluon', 'Quark'], color: 'Blue-Purple-Blue' },
        { particles: ['Electron', 'Photon', 'Electron'], color: 'Pink-Yellow-Pink' },
      ],
    },
    {
      points: 3,
      combinations: [
        { particles: ['Quark', 'Photon', 'Quark'], color: 'Blue-Yellow-Blue' },
        { particles: ['Quark', 'Gluon', 'Photon'], color: 'Blue-Purple-Yellow' },
        { particles: ['Electron', 'Gluon', 'Photon'], color: 'Pink-Purple-Yellow' },
      ],
    },
    {
      points: 4,
      combinations: [
        { particles: ['Quark', 'Higgs', 'Quark'], color: 'Blue-Gold-Blue' },
        { particles: ['Electron', 'Higgs', 'Electron'], color: 'Pink-Gold-Pink' },
      ],
    },
    {
      points: 6,
      combinations: [
        { particles: ['Quark', 'Gluon', 'Higgs'], color: 'Blue-Purple-Gold' },
        { particles: ['Electron', 'Photon', 'Higgs'], color: 'Pink-Yellow-Gold' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-quantum-blue to-quantum-teal text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Reference Guide 📚</h2>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-all"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Particle Types */}
          <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Particle Cards</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <div className="w-12 h-12 bg-quark-blue rounded-full mx-auto mb-2"></div>
                <h4 className="font-semibold text-center">Quarks</h4>
                <p className="text-sm text-gray-600 text-center">13 cards</p>
              </div>
              <div className="bg-pink-100 p-4 rounded-lg">
                <div className="w-12 h-12 bg-electron-pink rounded-full mx-auto mb-2"></div>
                <h4 className="font-semibold text-center">Electrons</h4>
                <p className="text-sm text-gray-600 text-center">8 cards</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg">
                <div className="w-12 h-12 bg-gluon-purple rounded-full mx-auto mb-2"></div>
                <h4 className="font-semibold text-center">Gluons</h4>
                <p className="text-sm text-gray-600 text-center">12 cards</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <div className="w-12 h-12 bg-photon-yellow rounded-full mx-auto mb-2"></div>
                <h4 className="font-semibold text-center">Photons</h4>
                <p className="text-sm text-gray-600 text-center">7 cards</p>
              </div>
              <div className="bg-amber-100 p-4 rounded-lg">
                <div className="w-12 h-12 bg-higgs-gold rounded-full mx-auto mb-2"></div>
                <h4 className="font-semibold text-center">Higgs</h4>
                <p className="text-sm text-gray-600 text-center">4 cards</p>
              </div>
            </div>
          </section>

          {/* Valid Vertices */}
          <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Valid Vertex Combinations</h3>
            <p className="text-gray-600 mb-4">
              A vertex is valid when 3 cards meet at a point with arrows flowing continuously
              and exactly 3 different particle types.
            </p>
            <div className="space-y-4">
              {vertexTypes.map((type) => (
                <div key={type.points} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-quantum-blue text-white px-4 py-2 rounded-full font-bold text-lg">
                      {type.points} pts
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {type.combinations.map((combo, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border-2 border-gray-200">
                        <div className="font-medium text-sm">
                          {combo.particles.join(' + ')}
                        </div>
                        <div className="text-xs text-gray-500">{combo.color}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Invalid Vertices */}
          <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Invalid Vertices (-1 pt)</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Only 1 or 2 different particle types</li>
              <li>Arrows don't flow continuously (no in→out connection)</li>
            </ul>
          </section>

          {/* Incomplete Vertices */}
          <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Incomplete Vertices (0 pts)</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Less than 3 cards meeting at a point</li>
              <li>Same particle type appears twice in the vertex</li>
            </ul>
          </section>

          {/* Bonus Scoring */}
          <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Bonus Points</h3>
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Valid Loops (+2 pts)</h4>
              <p className="text-sm text-gray-700">
                A closed hexagon of 6 cards that forms either 6 complete valid vertices OR no vertices at all.
              </p>
            </div>
          </section>

          {/* Educational Bonuses */}
          <section>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Educational Sub-Diagrams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900">Blue Sky Diagram</h4>
                <p className="text-sm text-gray-700">Photons interacting with matter</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900">Atoms Stay Together</h4>
                <p className="text-sm text-gray-700">Electromagnetic force keeping atoms together</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900">Nobel Prize 2004</h4>
                <p className="text-sm text-gray-700">Discovery of nuclear force mechanisms</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900">Higgs Discovery</h4>
                <p className="text-sm text-gray-700">The particle that gives mass to matter</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
