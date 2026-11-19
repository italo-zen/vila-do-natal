import type { Direcao } from '../../domain/shared/Direcao';

/**
 * Paredes por aresta (ADR-011 seção 2.1). Cada tile de piso tem uma máscara de 4 bits: 1 cima, 2 direita, 4 baixo,
 * 8 esquerda. Bit ligado = a aresta daquele lado do tile não pode ser cruzada andando. A máscara é completa (muros,
 * fronteiras e arestas de porta). Aqui ficam só funções puras sobre `paredes[y][x]`.
 */

export const BIT_DO_LADO: Readonly<Record<Direcao, number>> = { cima: 1, direita: 2, baixo: 4, esquerda: 8 };

/** Vetor de um tile para o vizinho do lado (y cresce para baixo). */
export const VETOR_DO_LADO: Readonly<Record<Direcao, { x: number; y: number }>> = {
  cima: { x: 0, y: -1 },
  direita: { x: 1, y: 0 },
  baixo: { x: 0, y: 1 },
  esquerda: { x: -1, y: 0 },
};

export const OPOSTO_DO_LADO: Readonly<Record<Direcao, Direcao>> = { cima: 'baixo', baixo: 'cima', esquerda: 'direita', direita: 'esquerda' };

export const LADOS: readonly Direcao[] = ['cima', 'baixo', 'esquerda', 'direita'];

/** Lado do vetor de um tile; vetor que não é de um tile vizinho não tem lado. */
export function ladoDoVetor(dx: number, dy: number): Direcao | undefined {
  return LADOS.find((l) => VETOR_DO_LADO[l].x === dx && VETOR_DO_LADO[l].y === dy);
}

export type Paredes = readonly (readonly number[])[];

/** O tile (x, y) tem parede no `lado`? Tile fora da caixa conta como parede. Não olha o vizinho. */
export function paredeNoTile(paredes: Paredes, x: number, y: number, lado: Direcao): boolean {
  const linha = paredes[y];
  if (!linha || x < 0 || x >= linha.length) return true;
  return (linha[x] & BIT_DO_LADO[lado]) !== 0;
}

/**
 * A aresta do `lado` de (x, y) está aberta? Fechada se qualquer um dos dois tiles que a dividem tem o bit ligado, ou se
 * o vizinho está fora da caixa. (Num conteúdo válido os dois bits são iguais, item 24; ser tolerante aqui evita brecha.)
 */
export function arestaAberta(paredes: Paredes, x: number, y: number, lado: Direcao): boolean {
  if (paredeNoTile(paredes, x, y, lado)) return false;
  const v = VETOR_DO_LADO[lado];
  return !paredeNoTile(paredes, x + v.x, y + v.y, OPOSTO_DO_LADO[lado]);
}

/**
 * Passos intermediários de um tile para outro, para o Nick (ADR-011 seção 5.4). Vizinhos: o próprio destino. Diagonal (os
 * dois eixos mudaram no mesmo quadro, num vértice): o tile intermediário cujas duas arestas estão abertas, preferindo
 * mudar primeiro o eixo x; sem intermediário aberto, só o destino (o Nick salta, nunca fica à frente). Outras distâncias:
 * só o destino.
 */
export function passosEntreTiles(paredes: Paredes, de: { x: number; y: number }, para: { x: number; y: number }): { x: number; y: number }[] {
  const dx = para.x - de.x;
  const dy = para.y - de.y;
  if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
    const ladoX: Direcao = dx > 0 ? 'direita' : 'esquerda';
    const ladoY: Direcao = dy > 0 ? 'baixo' : 'cima';
    const viaX = { x: para.x, y: de.y };
    const viaY = { x: de.x, y: para.y };
    if (arestaAberta(paredes, de.x, de.y, ladoX) && arestaAberta(paredes, viaX.x, viaX.y, ladoY)) return [viaX, para];
    if (arestaAberta(paredes, de.x, de.y, ladoY) && arestaAberta(paredes, viaY.x, viaY.y, ladoX)) return [viaY, para];
  }
  return [para];
}

/** Rotação de 90° no sentido horário da máscara (ADR-011 seção 2.5): `m' = ((m << 1) | (m >> 3)) & 15`. */
export function girarMascara(m: number): number {
  return ((m << 1) | (m >> 3)) & 15;
}
