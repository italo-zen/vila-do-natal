/**
 * Direção de movimento e de olhar (ADR-005 seção 1.2). Vive no domínio porque o Nick (domínio) a usa.
 * `application/mundo/movimento.ts` reexporta o tipo, para não quebrar quem já importava dali.
 */
export type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita';

export const DIRECOES: readonly Direcao[] = ['cima', 'baixo', 'esquerda', 'direita'];

export function ehDirecao(valor: unknown): valor is Direcao {
  return typeof valor === 'string' && (DIRECOES as readonly string[]).includes(valor);
}

/** Vetor de um passo na direção (y cresce para baixo, como no mapa). */
export function vetorDaDirecao(d: Direcao): { dx: number; dy: number } {
  switch (d) {
    case 'cima':
      return { dx: 0, dy: -1 };
    case 'baixo':
      return { dx: 0, dy: 1 };
    case 'esquerda':
      return { dx: -1, dy: 0 };
    case 'direita':
      return { dx: 1, dy: 0 };
  }
}
