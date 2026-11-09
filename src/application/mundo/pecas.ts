import type { Fase } from '../../domain/progresso/Fase';
import { indiceDaFase } from '../../domain/progresso/Fase';
import { missaoAtiva, missaoDaFase, type MissaoCarregada } from './missoes';
import type { ContextoDeArea, EstadoDaPeca } from './subarea';

/**
 * Peças e árvore do Marco 2 (GDD 15; ADR-004 seção 6; ADR-002 seção 2.2). Regras puras: a cena só consulta.
 * A peça de ordem N liga-se à fase `parteN` (a camada da árvore, GDD 15.2.1). A peça 1 aparece quando a casa
 * acende (fase `luzes` concluída).
 */

export type Concluida = (fase: Fase) => boolean;

/** Fase de cada peça (ordem 1 a 3). */
export const FASE_DA_PECA: Readonly<Record<number, Fase>> = { 1: 'parte1', 2: 'parte2', 3: 'parte3' };

/** Ordem da peça que a fase encaixa: `parteN` → N; `luzes` → 1 (a peça 1 é visível depois das luzes). */
export function ordemDaFase(fase: Fase): number | undefined {
  if (fase === 'luzes') return 1;
  const achada = Object.entries(FASE_DA_PECA).find(([, f]) => f === fase);
  return achada ? Number(achada[0]) : undefined;
}

/**
 * Estado de uma peça (GDD 15.2.3, decisão 21): `encaixada` quando a própria fase foi concluída; `visivel` quando
 * a anterior foi (a peça 1, quando as luzes acendem); senão, `escondida`.
 */
export function estadoDaPeca(ordem: number, concluida: Concluida): EstadoDaPeca {
  if (concluida(FASE_DA_PECA[ordem])) return 'encaixada';
  const anterior: Fase = ordem === 1 ? 'luzes' : FASE_DA_PECA[ordem - 1];
  return concluida(anterior) ? 'visivel' : 'escondida';
}

/** Quantas peças estão encaixadas: é o estado da árvore, de 0 (desmontada) a 3 (montada, GDD 15.4). */
export function estadoDaArvore(concluida: Concluida): number {
  return [1, 2, 3].filter((n) => concluida(FASE_DA_PECA[n])).length;
}

/** Chave do texto de exame da árvore (GDD 15.4): estado 0 é o texto de 14.9.3. */
export function chaveDoEstadoDaArvore(estado: number): string {
  return estado <= 0 ? 'arvore.desmontada' : `arvore.estado.${estado}`;
}

/** Chave do diálogo de chegada depois da peça `ordem` (GDD 15.6.5). */
export function chaveDaChegada(ordem: number): string {
  return `arvore.chegada.${ordem}`;
}

/**
 * Chave do aviso "ainda não" de uma peça escondida (GDD 15.2.7; ADR-004 seção 6): M é a menor ordem entre 1 e N−1
 * ainda não encaixada. A peça 1 nunca tem aviso.
 */
export function chaveDoAviso(ordem: number, concluida: Concluida): string | undefined {
  if (ordem <= 1) return undefined;
  for (let m = 1; m < ordem; m++) {
    if (!concluida(FASE_DA_PECA[m])) return `aviso.peca${ordem}.antes${m}`;
  }
  return undefined;
}

/**
 * Peça que sai do chão ao ser pega (backlog 052, critério 5): a da fase `parteN` que está sendo conduzida. Enquanto a
 * condução roda, ela é chão livre e não é desenhada; o encaixe a põe na árvore. Luzes não tira a peça 1 (ela continua
 * no chão, GDD 15.6.2): só as partes.
 */
export function pecaRetiradaNaConducao(fase: Fase): number | undefined {
  return fase.startsWith('parte') ? ordemDaFase(fase) : undefined;
}

/**
 * Contexto da partida como ela está agora: missão ativa (subáreas abertas) e estado das peças. `retirada` é a peça
 * que a condução atual tira do chão (ver `pecaRetiradaNaConducao`); ela conta como chão livre.
 */
export function contextoDaPartida(missoes: readonly MissaoCarregada[], concluida: Concluida, retirada?: number): ContextoDeArea {
  const abertas = new Set(missaoAtiva(missoes, concluida).maps);
  return {
    areaAberta: (id) => abertas.has(id),
    estadoDaPeca: (ordem) => (ordem === retirada ? 'encaixada' : estadoDaPeca(ordem, concluida)),
  };
}

/**
 * Situação para uma fase (condução e validação, ADR-004 seções 8 e 11): fases antes da fase dada estão concluídas;
 * as subáreas são as da missão que contém a fase; a peça da própria fase conta como visível (pior caso, ADR-004
 * seção 8, item 12). Devolve também `concluida` no mesmo critério.
 */
export function situacaoDaFase(
  missoes: readonly MissaoCarregada[],
  fase: Fase,
): { concluida: Concluida; ctx: ContextoDeArea } {
  const concluida: Concluida = (f) => indiceDaFase(f) < indiceDaFase(fase);
  const missao = missaoDaFase(missoes, fase);
  const abertas = new Set(missao?.maps ?? []);
  const propria = ordemDaFase(fase);
  const retirada = pecaRetiradaNaConducao(fase);
  return {
    concluida,
    ctx: {
      areaAberta: (id) => abertas.has(id),
      // Luzes: a peça 1 segue no chão, visível (pior caso). Partes: a peça da fase sai do chão (ver acima).
      estadoDaPeca: (ordem) => (ordem === retirada ? 'encaixada' : ordem === propria ? 'visivel' : estadoDaPeca(ordem, concluida)),
    },
  };
}
