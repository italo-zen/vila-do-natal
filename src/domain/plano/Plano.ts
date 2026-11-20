import type { Direcao } from '../shared/Direcao';

/** Peça da árvore sorteada (ADR-013 seção 3). `area` é o id da área sorteável; `mapa` é o mapa onde o tile está (igual à área, hoje). */
export interface PecaSorteada {
  ordem: 1 | 2 | 3;
  area: string;
  comodo: string;
  mapa: string;
  x: number;
  y: number;
}

/** Caixa de enfeite sorteada (GDD 21.16.12): na área que sobra depois das 3 peças. */
export interface CaixaSorteada {
  area: string;
  comodo: string;
  mapa: string;
  x: number;
  y: number;
}

/** Onde o Nick dorme durante uma missão, e a área que a seta de farejar procura nela (`alvo`). */
export interface NickSorteado {
  missao: string;
  mapa: string;
  x: number;
  y: number;
  direcao: Direcao;
  alvo: string;
}

/** Plano da partida: calculado todo de uma vez ao começar e guardado só em memória (sem save, ADR-002 seção 3). */
export interface Plano {
  semente: number;
  pecas: readonly [PecaSorteada, PecaSorteada, PecaSorteada];
  caixa: CaixaSorteada;
  /** Por id de missão. */
  nick: Readonly<Record<string, NickSorteado>>;
}

/** Assinatura estável do plano (compara dois planos; a anti-repetição guarda só isto da partida anterior). */
export function assinaturaDoPlano(p: Plano): string {
  return JSON.stringify([p.pecas.map((x) => [x.area, x.comodo, x.x, x.y]), [p.caixa.area, p.caixa.comodo, p.caixa.x, p.caixa.y], Object.keys(p.nick).sort().map((k) => [k, p.nick[k].mapa, p.nick[k].x, p.nick[k].y])]);
}
