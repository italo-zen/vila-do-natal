import type { ObjetoDoMapa } from '../../content/Mapa';
import { alvoDaInteracao, type Geometria, type ParedeNoTile, type Posicao, type Direcao } from '../movimento';

/**
 * Alvo do A (ADR-005 seção 3.6, GDD 16.3). Ordem: (1) objeto na frente ou encostado; o Nick dormindo entra nessa mesma
 * lista, no fim. (2) Só se nada acima achou: o Nick acordado, na frente ou encostado. Assim o A nunca rouba o interruptor,
 * a porta, a peça nem o examinável. `parede`: aresta de parede entre o sobrinho e o objeto não deixa ler (ADR-011 seção 5.2).
 */

export type AlvoDoA = { tipo: 'objeto'; objeto: ObjetoDoMapa } | { tipo: 'nick' } | undefined;

export function alvoDoA(
  objetos: readonly ObjetoDoMapa[],
  nick: { acordado: boolean; objeto: ObjetoDoMapa } | undefined,
  p: Posicao,
  direcao: Direcao,
  g: Geometria,
  parede?: ParedeNoTile,
): AlvoDoA {
  const lista = nick && !nick.acordado ? [...objetos, nick.objeto] : [...objetos];
  const achado = alvoDaInteracao(lista, p, direcao, g, parede);
  if (achado) {
    if (nick && achado === nick.objeto) return { tipo: 'nick' };
    return { tipo: 'objeto', objeto: achado };
  }
  if (nick && nick.acordado) {
    const nickAchado = alvoDaInteracao([nick.objeto], p, direcao, g, parede);
    if (nickAchado) return { tipo: 'nick' };
  }
  return undefined;
}
