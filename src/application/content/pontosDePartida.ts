import type { Fase } from '../../domain/progresso/Fase';
import { FASE_DA_PECA, ordemDaFase } from '../mundo/pecas';
import { FASE_DO_ENFEITE } from '../mundo/enfeite';
import type { MissaoCarregada } from '../mundo/missoes';
import type { MapaDoJogo } from './Mapa';
import { calcularRotaDeConducao } from '../mundo/conducao';
import { situacaoDaFase } from '../mundo/pecas';
import { conducaoDaFase } from '../mundo/missoes';

const VIZINHOS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** Piso livre: chão com colisão 0, dentro da caixa (ADR-004 seção 8, item 16). */
export const livreNoMapa = (m: MapaDoJogo, x: number, y: number): boolean =>
  x >= 0 && y >= 0 && x < m.largura && y < m.altura && m.chao[y][x] !== 0 && !m.colisao[y][x];

/**
 * Pontos de partida da condução da caixa de enfeite (ADR-006 seção 2.5): os vizinhos livres do tile da caixa, em
 * qualquer subárea do conteúdo (só há uma caixa, T006). Mesma forma de `pontosDePartida` das peças.
 */
export function pontosDaCaixa(todos: Map<string, MapaDoJogo>): { mapa: string; x: number; y: number }[] {
  for (const m of todos.values()) {
    const caixa = m.objetos.find((o) => o.tipo === 'enfeite');
    if (caixa) return VIZINHOS.map(([dx, dy]) => ({ mapa: m.id, x: caixa.x + dx, y: caixa.y + dy })).filter((p) => livreNoMapa(m, p.x, p.y));
  }
  return [];
}

/**
 * Pontos de partida de uma condução (ADR-004 seção 11.1), na mesma regra de `validarConteudo`: a fase `luzes` parte do
 * início da missão inicial; `parteN` parte de qualquer vizinho livre da peça N; `enfeites` parte da caixa. Usado também
 * pelo N009 (ADR-005).
 */
export function pontosDePartida(
  fase: Fase,
  missoes: readonly MissaoCarregada[],
  todos: Map<string, MapaDoJogo>,
): { mapa: string; x: number; y: number }[] {
  const inicial = missoes.find((m) => m.requires.length === 0);
  const inicio = inicial?.missao.inicio;
  if (fase === 'luzes') {
    if (!inicio) return [];
    const m = todos.get(inicio.mapa);
    const sp = m?.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === inicio.spawn);
    return sp && m ? [{ mapa: m.id, x: sp.x, y: sp.y }] : [];
  }
  if (fase === FASE_DO_ENFEITE) return pontosDaCaixa(todos);
  const ordem = ordemDaFase(fase);
  if (ordem === undefined || FASE_DA_PECA[ordem] !== fase) return [];
  for (const m of todos.values()) {
    const peca = m.objetos.find((o) => o.tipo === 'peca' && Number(o.dados.ordem) === ordem);
    if (peca) return VIZINHOS.map(([dx, dy]) => ({ mapa: m.id, x: peca.x + dx, y: peca.y + dy })).filter((p) => livreNoMapa(m, p.x, p.y));
  }
  return [];
}

/**
 * A condução da fase chega ao destino, a partir de algum ponto de partida, com as subáreas e as peças da situação da
 * fase (ADR-004 seção 11.2). `todos` pode ser uma cópia com um tile a mais bloqueado (N009).
 */
export function rotaDaFaseExiste(
  fase: Fase,
  missoes: readonly MissaoCarregada[],
  todos: Map<string, MapaDoJogo>,
): boolean {
  const destino = conducaoDaFase(missoes, fase);
  if (!destino) return false;
  const { concluida, ctx } = situacaoDaFase(missoes, fase);
  return pontosDePartida(fase, missoes, todos).some((p) => calcularRotaDeConducao(todos, p, { mapa: destino.mapa, x: destino.x, y: destino.y }, concluida, ctx));
}
