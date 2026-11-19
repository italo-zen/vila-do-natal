import type { NickSorteado, PecaSorteada, Plano } from '../../domain/plano/Plano';
import type { Rng } from '../../domain/shared/Rng';
import type { Fase } from '../../domain/progresso/Fase';
import type { PerfilDeArte } from '../arte/PerfilDeArte';
import type { MapaDoJogo } from '../content/Mapa';
import { pontosDePartida } from '../content/pontosDePartida';
import type { RegraDoNick, Sorteio } from '../content/Sorteio';
import { calcularRotaDeConducao } from '../mundo/conducao';
import { FASE_DO_ENFEITE } from '../mundo/enfeite';
import type { MissaoCarregada } from '../mundo/missoes';
import { ordemDaFase, situacaoDaFase } from '../mundo/pecas';
import { candidatosDePeca } from './candidatos';
import { candidatosDeNickDaRegra } from './candidatosDaRegra';
import { mapasComPlano } from './mapasComPlano';

export interface EntradaDoPlano {
  sorteio: Sorteio;
  /** Mapas do conteúdo (sem peças). */
  todos: ReadonlyMap<string, MapaDoJogo>;
  missoes: readonly MissaoCarregada[];
  perfil: PerfilDeArte;
}

const k = (m: string, x: number, y: number) => `${m}:${x}:${y}`;

/** Mapa que tem o item de uma fase: interruptor (luzes), peça N (parteN) ou caixa (enfeites). Nenhum nome de cômodo no código (ADR-013 seção 1). */
function alvoDaMissao(m: MissaoCarregada, todos: ReadonlyMap<string, MapaDoJogo>, pecas: readonly PecaSorteada[]): string {
  for (const fase of Object.keys(m.missao.conquistas)) {
    const ordem = fase === 'luzes' ? undefined : ordemDaFase(fase as Fase);
    if (ordem !== undefined) return pecas.find((p) => p.ordem === ordem)!.mapa;
    const tipo = fase === FASE_DO_ENFEITE ? 'enfeite' : fase === 'luzes' ? 'interruptor' : undefined;
    if (tipo) for (const mp of todos.values()) if (mp.objetos.some((o) => o.tipo === tipo)) return mp.id;
  }
  throw new Error(`Sorteio: missão "${m.id}" sem item para o farejar.`);
}

/**
 * Tiles de Nick válidos de uma área nesta missão, com as 3 peças do plano: regra N004 a N007, alcance (candidatosDeNickDaRegra) e N009:
 * com o tile bloqueado, a rota de toda condução da missão continua existindo. Rota só é refeita se o tile cai na rota base.
 */
export function tilesDoNick(e: EntradaDoPlano, missaoId: string, regra: RegraDoNick, area: string, pecas: readonly PecaSorteada[]): { x: number; y: number }[] {
  const base = candidatosDeNickDaRegra(e.todos as Map<string, MapaDoJogo>, e.missoes, missaoId, { ...regra, areas: [area] }, e.perfil, pecas, e.sorteio.pecas.areas);
  if (base.length === 0) return [];
  const missao = e.missoes.find((m) => m.id === missaoId)!;
  const comPlano = mapasComPlano(e.todos, { pecas });
  const fases = Object.keys(missao.missao.conducao) as Fase[];
  // Rota base de cada fase (primeira partida com rota).
  const emRota = new Set<string>();
  for (const fase of fases) {
    const d = missao.missao.conducao[fase];
    const { concluida, ctx } = situacaoDaFase(e.missoes, fase);
    for (const p of pontosDePartida(fase, e.missoes, comPlano)) {
      const r = calcularRotaDeConducao(comPlano, p, { mapa: d.mapa, x: d.x, y: d.y }, concluida, ctx);
      if (r) {
        for (const n of r.nos) emRota.add(k(n.mapa, n.x, n.y));
        break;
      }
    }
  }
  return base.filter((t) => {
    if (!emRota.has(k(area, t.x, t.y))) return true;
    const mapa = comPlano.get(area)!;
    const colisao = mapa.colisao.map((l) => [...l]);
    colisao[t.y][t.x] = true;
    const bloqueado = new Map(comPlano).set(area, { ...mapa, colisao });
    return fases.every((fase) => {
      const d = missao.missao.conducao[fase];
      const { concluida, ctx } = situacaoDaFase(e.missoes, fase);
      return pontosDePartida(fase, e.missoes, bloqueado).some((p) => calcularRotaDeConducao(bloqueado, p, { mapa: d.mapa, x: d.x, y: d.y }, concluida, ctx));
    });
  });
}

/**
 * Sorteia o plano da partida (GDD 21.16; ADR-013 seção 2). Ordem de consumo do RNG (contrato; mudar muda todo plano):
 * 1. peças 1, 2 e 3: `inteiro` da área entre as ainda não usadas; se a área tem mais de um cômodo, `inteiro` do cômodo; `inteiro` do tile
 *    (lista na ordem y, x). 2. Nick de cada missão do manifesto, em ordem: `inteiro` da área elegível e `inteiro` do tile.
 * `areaAnteriorDaPeca1`: a peça 1 não cai nessa área (anti-repetição só da entropia; com semente fixa não se passa).
 */
export function sortearPlano(e: EntradaDoPlano, rng: Rng, semente: number, areaAnteriorDaPeca1?: string): Plano {
  const { sorteio } = e;
  const pecas: PecaSorteada[] = [];
  const usadas = new Set<string>();
  for (let ordem = 1; ordem <= sorteio.pecas.quantidade; ordem++) {
    let livres = sorteio.pecas.areas.filter((a) => !usadas.has(a.id));
    if (ordem === 1 && areaAnteriorDaPeca1 !== undefined && livres.some((a) => a.id !== areaAnteriorDaPeca1)) livres = livres.filter((a) => a.id !== areaAnteriorDaPeca1);
    const area = livres[rng.inteiro(livres.length)];
    usadas.add(area.id);
    const comodo = area.comodos.length > 1 ? area.comodos[rng.inteiro(area.comodos.length)] : area.comodos[0];
    const tiles = candidatosDePeca(e.todos.get(comodo.mapa)!, e.perfil.sala.linhas, comodo.retangulo, area.passagem);
    const t = tiles[rng.inteiro(tiles.length)];
    pecas.push({ ordem: ordem as 1 | 2 | 3, area: area.id, comodo: comodo.id, mapa: comodo.mapa, x: t.x, y: t.y });
  }
  const nick: Record<string, NickSorteado> = {};
  for (const m of e.missoes) {
    const regra = sorteio.nick[m.id];
    if (!regra) continue;
    const areaDaPeca = regra.foraDaAreaDaPeca !== undefined ? pecas[regra.foraDaAreaDaPeca - 1].mapa : undefined;
    const elegiveis = regra.areas
      .filter((a) => a !== areaDaPeca)
      .map((a) => ({ area: a, tiles: tilesDoNick(e, m.id, regra, a, pecas) }))
      .filter((x) => x.tiles.length > 0);
    if (elegiveis.length === 0) throw new Error(`Sorteio: nenhuma área elegível para o Nick em "${m.id}".`);
    const el = elegiveis[rng.inteiro(elegiveis.length)];
    const t = el.tiles[rng.inteiro(el.tiles.length)];
    nick[m.id] = { missao: m.id, mapa: el.area, x: t.x, y: t.y, direcao: regra.direcao, alvo: alvoDaMissao(m, e.todos, pecas) };
  }
  return { semente, pecas: pecas as unknown as Plano['pecas'], nick };
}
