import type { Fase } from '../../../domain/progresso/Fase';
import type { DicaPorEstado } from '../../content/Missao';
import type { MissaoCarregada } from '../missoes';

/**
 * Dica (ADR-005 seção 5.1; GDD 16.8, 16.11, 17.10). Função pura: a chave do texto depende da fase e do estado do Nick. A
 * dica não tem estado de jogo. Não diz cômodo, tile nem direção.
 */

export interface DicaDaFase {
  tituloChave: 'dica.titulo';
  /** Chaves de texto da dica. Cada página do texto vira uma linha da dica. */
  chavesDoTexto: string[];
  /** Estado da árvore mostrado na dica: nunca passa de 3 (ADR-006 seção 3.3; a caixa ainda não foi encaixada). */
  estadoDaArvore: 0 | 1 | 2 | 3;
}

/**
 * Chave da dica de uma fase (porta, luzes, parte1 a parte3, enfeites), por estado do Nick. Devolve undefined quando a
 * fase não tem dica (introdução: a dica não abre ali). Não há `livre` (ADR-006 seção 6).
 */
export function chaveDaDica(missoes: readonly MissaoCarregada[], fase: Fase, dormindo: boolean): string | undefined {
  const estado = dormindo ? 'dormindo' : 'acordado';
  for (const m of missoes) {
    const valor: DicaPorEstado | undefined = m.missao.dica?.[fase];
    if (valor !== undefined) return typeof valor === 'string' ? valor : valor[estado];
  }
  return undefined;
}

/**
 * Monta a dica da partida: título, texto da fase e do Nick, e a árvore no estado atual (ADR-005 seção 5.1). A árvore
 * da dica nunca passa do estado 3: na fase enfeites a caixa ainda não foi encaixada (ADR-006 seção 3.3).
 */
export function dicaDaFase(missoes: readonly MissaoCarregada[], fase: Fase, dormindo: boolean, estadoDaArvore: number): DicaDaFase | undefined {
  const chave = chaveDaDica(missoes, fase, dormindo);
  if (!chave) return undefined;
  const estado = Math.min(3, Math.max(0, estadoDaArvore)) as 0 | 1 | 2 | 3;
  return { tituloChave: 'dica.titulo', chavesDoTexto: [chave], estadoDaArvore: estado };
}
