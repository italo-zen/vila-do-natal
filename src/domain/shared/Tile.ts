/**
 * Tile (value object, ADR-005 seção 1.2): subárea e posição local dela. Igualdade por valor.
 * O domínio não conhece o mapa: `mapa` é só o id da subárea.
 */
export interface Tile {
  readonly mapa: string;
  readonly x: number;
  readonly y: number;
}

export const tile = (mapa: string, x: number, y: number): Tile => ({ mapa, x, y });

export function mesmoTile(a: Tile, b: Tile): boolean {
  return a.mapa === b.mapa && a.x === b.x && a.y === b.y;
}

/** Vizinhos de 4 lados na mesma subárea. */
export function ehVizinho(a: Tile, b: Tile): boolean {
  return a.mapa === b.mapa && Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}
