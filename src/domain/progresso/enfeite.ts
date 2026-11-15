/**
 * Caixa de enfeite (GDD 17.3; ADR-006 seção 2). Reusa a máquina de estados das peças (ADR-004 seção 6), com estes
 * estados: `escondida` (chão livre, com aviso), `visivel` (bloqueia e pega-se) e `encaixada` (chão livre, sem desenho).
 */
import type { Concluida } from './arvore';
import { FASE_DO_ENFEITE } from './arvore';

export type EstadoDoEnfeite = 'escondida' | 'visivel' | 'encaixada';

/**
 * Estado da caixa na partida. Encaixada quando a fase `enfeites` foi concluída. Visível quando `caixaLiberada`
 * (ADR-006 seção 2.4: liberada no primeiro DevolverControle depois da parte 3). Senão, escondida.
 */
export function estadoDoEnfeite(concluida: Concluida, caixaLiberada: boolean): EstadoDoEnfeite {
  if (concluida(FASE_DO_ENFEITE)) return 'encaixada';
  return caixaLiberada ? 'visivel' : 'escondida';
}
