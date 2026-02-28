import { describe, expect, it } from 'vitest';
import { autoOrientCardForPlacement, findBestLegalPlacement, placeCard, ParticleCard, PlacedCard, isLegalPlacement } from '@/lib/gameLogic';

function makeCard(id: string, lines: number[]): ParticleCard {
  return {
    id,
    type: 'photon',
    lines,
    rotation: 0,
  };
}

describe('placement rules', () => {
  it('allows placing cards without connectivity checks', () => {
    const first = makeCard('first', [0]);
    const second = makeCard('second', []);

    const diagramAfterFirst = placeCard(first, { q: 0, r: 0 }, []);
    const diagramAfterSecond = placeCard(second, { q: 2, r: 0 }, diagramAfterFirst);

    expect(diagramAfterSecond).toHaveLength(2);
  });

  it('accepts a valid opposite-edge connection in all 6 directions', () => {
    const directionPositions = [
      { q: 1, r: -1 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: -1, r: 1 },
      { q: -1, r: 0 },
      { q: 0, r: -1 },
    ];

    directionPositions.forEach((position, edge) => {
      const center = makeCard(`center-${edge}`, [edge]);
      const neighbor = makeCard(`neighbor-${edge}`, []);
      const diagram = placeCard(center, { q: 0, r: 0 }, []);

      expect(isLegalPlacement(neighbor, position, diagram)).toBe(true);
    });
  });

  it('does not reject mismatched edge connections', () => {
    const first = makeCard('first', [0]);
    const mismatched = makeCard('mismatched', []);

    const diagram = placeCard(first, { q: 0, r: 0 }, []);
    const updatedDiagram = placeCard(mismatched, { q: 1, r: 0 }, diagram);

    expect(updatedDiagram).toHaveLength(2);
  });

  it('does not reject non-adjacent placements', () => {
    const first = makeCard('first', [0]);
    const second = makeCard('second', [3]);

    const diagram = placeCard(first, { q: 0, r: 0 }, []);
    const updatedDiagram = placeCard(second, { q: 2, r: 0 }, diagram);

    expect(updatedDiagram).toHaveLength(2);
  });

  it('does not auto-rotate card for placement', () => {
    const card = makeCard('manual', [0, 2]);
    const oriented = autoOrientCardForPlacement(card, { q: 1, r: 0 }, []);

    expect(oriented).toBe(card);
  });

  it('returns first candidate position for helper placement', () => {
    const first = makeCard('first', [0]);
    const diagram: PlacedCard[] = placeCard(first, { q: 0, r: 0 }, []);

    const secretCard = makeCard('secret', [0]);
    const placement = findBestLegalPlacement(secretCard, diagram);

    expect(placement).not.toBeNull();
    expect(placement?.position).toEqual({ q: 1, r: -1 });
  });
});
