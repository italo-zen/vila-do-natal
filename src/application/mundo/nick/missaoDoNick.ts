import type { Fase } from '../../../domain/progresso/Fase';
import type { DestinoDoNick } from '../../content/Missao';
import { missaoAtiva, missaoConcluida, type MissaoCarregada } from '../missoes';

/**
 * Leitura do campo `nick` das missões (ADR-005 seções 2 e 3.5). Função pura, sem relógio.
 * Missão ativa = a primeira não concluída (ADR-004 seção 9.1). Quando todas estão concluídas, `missaoAtiva` devolve a
 * última (a final): aí o alvo some e o jogo terminou (ADR-006 seção 1.4).
 */

type Concluida = (fase: Fase) => boolean;

/** Subárea que o farejar procura agora, ou undefined quando não há mais item (depois da parte 3, GDD 16.5.6). */
export function alvoDaFase(missoes: readonly MissaoCarregada[], concluida: Concluida): string | undefined {
  const m = missaoAtiva(missoes, concluida);
  if (missaoConcluida(m, concluida)) return undefined;
  return m.missao.nick?.alvo;
}

/**
 * Onde o Nick dorme agora (ADR-005 seção 3.5; ADR-006 seção 5): o `dorme` da missão ativa. Depois da missão final não há
 * destino (o jogo terminou): devolve undefined e o Nick não se move. `depois` foi removido (ADR-006 seção 6).
 * Lê o tile de conteúdo; `x` e `y` já vêm validados (N001).
 */
export function destinoDoNick(missoes: readonly MissaoCarregada[], concluida: Concluida): { mapa: string; x: number; y: number; direcao: string } | undefined {
  const m = missaoAtiva(missoes, concluida);
  if (missaoConcluida(m, concluida)) return undefined;
  const alvo: DestinoDoNick | undefined = m.missao.nick?.dorme;
  if (!alvo || alvo.x === null || alvo.y === null) return undefined;
  return { mapa: alvo.mapa, x: alvo.x, y: alvo.y, direcao: alvo.direcao };
}

/** Tile de dormir da missão inicial (começo da partida, ADR-005 seção 3.7). */
export function destinoInicialDoNick(missoes: readonly MissaoCarregada[]): { mapa: string; x: number; y: number; direcao: string } | undefined {
  const inicial = missoes.find((m) => m.requires.length === 0);
  const dorme = inicial?.missao.nick?.dorme;
  if (!dorme || dorme.x === null || dorme.y === null) return undefined;
  return { mapa: dorme.mapa, x: dorme.x, y: dorme.y, direcao: dorme.direcao };
}
