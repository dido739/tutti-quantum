import { describe, expect, it } from 'vitest';
import { calculateScore, PlacedCard } from '@/lib/gameLogic';

function makePlacedCard(
  id: string,
  type: PlacedCard['type'],
  edge: number,
  arrowDirection?: 'in' | 'out'
): PlacedCard {
  return {
    id,
    type,
    lines: [edge],
    rotation: 0,
    position: { q: 0, r: 0 },
    arrowDirection,
  };
}

describe('scoring and vertex counting', () => {
  it('scores a valid common vertex as +2', () => {
    const diagram: PlacedCard[] = [
      makePlacedCard('q1', 'quark', 0, 'in'),
      makePlacedCard('q2', 'quark', 0, 'in'),
      makePlacedCard('g1', 'gluon', 0),
    ];

    const { score, validVertices, invalidVertices } = calculateScore(diagram);

    expect(validVertices).toBe(1);
    expect(invalidVertices).toBe(0);
    expect(score).toBe(2);
  });

  it('scores an invalid complete vertex as -1', () => {
    const diagram: PlacedCard[] = [
      makePlacedCard('e1', 'electron', 1, 'in'),
      makePlacedCard('ph1', 'photon', 1),
      makePlacedCard('g1', 'gluon', 1),
    ];

    const { score, validVertices, invalidVertices } = calculateScore(diagram);

    expect(validVertices).toBe(0);
    expect(invalidVertices).toBe(1);
    expect(score).toBe(-1);
  });

  it('treats quark with opposite arrow as antiquark for valid combinations', () => {
    const diagram: PlacedCard[] = [
      makePlacedCard('q', 'quark', 2, 'in'),
      makePlacedCard('qbar', 'quark', 2, 'out'),
      makePlacedCard('g', 'gluon', 2),
    ];

    const { score, validVertices, invalidVertices } = calculateScore(diagram);

    expect(validVertices).toBe(1);
    expect(invalidVertices).toBe(0);
    expect(score).toBe(3);
  });
});
