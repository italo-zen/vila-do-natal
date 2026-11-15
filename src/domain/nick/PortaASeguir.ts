import type { Direcao } from '../shared/Direcao';

/**
 * Porta a seguir (ADR-005 seção 1.2, 4.2): a primeira porta do caminho até o cômodo do alvo. É o que a seta mostra.
 * Nunca é um tile do item (GDD 16.5.3).
 */
export interface PortaASeguir {
  /** Cômodo onde está a porta (a subárea atual). */
  readonly mapa: string;
  /** Id da porta, ex.: 'P8'. */
  readonly id: string;
  /** Tile do gatilho (local da subárea). */
  readonly gatilho: { readonly x: number; readonly y: number };
  /** Lado para onde a seta aponta (`porta.saida` do conteúdo). */
  readonly saida: Direcao;
}
