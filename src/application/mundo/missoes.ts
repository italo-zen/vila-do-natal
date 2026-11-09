import type { Fase } from '../../domain/progresso/Fase';
import type { Destino, Missao } from '../content/Missao';

/**
 * Missão do manifesto, já lida (ADR-002 seção 2; ADR-004 seção 9.1). `maps` são as subáreas abertas enquanto ela é a
 * missão ativa. `requires` são os ids das missões que precisam estar concluídas antes.
 */
export interface MissaoCarregada {
  id: string;
  requires: string[];
  maps: string[];
  missao: Missao;
}

/** Fases que a missão conclui: as chaves de `conquistas` (marco1: luzes; parteN: parteN). */
export function fasesDaMissao(m: MissaoCarregada): Fase[] {
  return Object.keys(m.missao.conquistas) as Fase[];
}

/** Concluída quando todas as fases dela estão concluídas na partida (ADR-004 seção 9.1). */
export function missaoConcluida(m: MissaoCarregada, concluida: (f: Fase) => boolean): boolean {
  const fases = fasesDaMissao(m);
  return fases.length > 0 && fases.every((f) => concluida(f));
}

/**
 * Missão ativa (ADR-004 seção 9.1): a primeira, na ordem do manifesto, que não está concluída e cujos `requires`
 * estão concluídos. Depois da última (jogo livre, GDD 15.6.8), vale a última.
 */
export function missaoAtiva(missoes: readonly MissaoCarregada[], concluida: (f: Fase) => boolean): MissaoCarregada {
  const porId = new Map(missoes.map((m) => [m.id, m]));
  for (const m of missoes) {
    if (missaoConcluida(m, concluida)) continue;
    const prontas = m.requires.every((r) => {
      const req = porId.get(r);
      return !!req && missaoConcluida(req, concluida);
    });
    if (prontas) return m;
  }
  return missoes[missoes.length - 1];
}

/** Missão que contém a fase (como conquista ou como destino de condução). */
export function missaoDaFase(missoes: readonly MissaoCarregada[], fase: Fase): MissaoCarregada | undefined {
  return missoes.find((m) => fasesDaMissao(m).includes(fase) || fase in m.missao.conducao);
}

/** Destino da condução da fase, em qualquer missão do manifesto (ADR-004 seção 11.1). */
export function conducaoDaFase(missoes: readonly MissaoCarregada[], fase: Fase): Destino | undefined {
  return missoes.find((m) => fase in m.missao.conducao)?.missao.conducao[fase];
}
