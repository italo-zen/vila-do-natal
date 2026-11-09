/**
 * Peças e estado da árvore (GDD 15.2 e 15.4; GDD 17.5 para o estado 4). Movido de `application/mundo/pecas.ts` para o
 * domínio (ADR-005 seção 1.3): o Nick (domínio) não pode depender de `application`.
 * Estados: 0 a 3 pelas peças encaixadas; 4 quando a caixa de enfeite também está encaixada (ADR-006 seção 3).
 */
import type { Fase } from './Fase';

export type Concluida = (fase: Fase) => boolean;

/** Estado da árvore (GDD 15.4, 17.5): quantas peças estão encaixadas, e 4 com a caixa de enfeite (ADR-006 seção 3.1). */
export type EstadoDaArvore = 0 | 1 | 2 | 3 | 4;

/** Fase de cada peça (ordem 1 a 3): a peça de ordem N liga-se à fase `parteN` (GDD 15.2.1). */
export const FASE_DA_PECA: Readonly<Record<number, Fase>> = { 1: 'parte1', 2: 'parte2', 3: 'parte3' };

/** Fase que encaixa a caixa de enfeite (ADR-006 seção 2.3): mapeamento explícito, não derivado da ordem. */
export const FASE_DO_ENFEITE: Fase = 'enfeites';

/**
 * Estado da árvore (GDD 15.4 e 17.5). Só chega a 4 com as três peças encaixadas e a caixa encaixada (ADR-006 seção 3.1).
 */
export function estadoDaArvore(concluida: Concluida): EstadoDaArvore {
  const pecas = [1, 2, 3].filter((n) => concluida(FASE_DA_PECA[n])).length;
  if (pecas === 3 && concluida(FASE_DO_ENFEITE)) return 4;
  return pecas as 0 | 1 | 2 | 3;
}
