import { describe, expect, it } from 'vitest';
import { carregarConteudoPuro } from '../helpers/conteudoReal';
import type { PecaSorteada } from '../../src/domain/plano/Plano';
import { alcancaveisDe, candidatosDePeca } from '../../src/application/plano/candidatos';
import { candidatosDeNickDaRegra } from '../../src/application/plano/candidatosDaRegra';
import { mapasComPlano } from '../../src/application/plano/mapasComPlano';
import { tilesDoNick } from '../../src/application/plano/sortearPlano';
import { rotaDaFaseExiste, vizinhosLivresAlcancaveis } from '../../src/application/content/pontosDePartida';
import { portaASeguir } from '../../src/application/mundo/nick/portaASeguir';
import type { Fase } from '../../src/domain/progresso/Fase';

/**
 * Enumeração completa (ADR-013 seção 7, item 3; GDD 21.16.6 c): toda peça candidata × todo tile de Nick candidato de cada missão, com a
 * conferência feita à força (rota com o tile bloqueado, sem o atalho do sorteio), e todas as triplas de peças (4 áreas, 3 distintas, em
 * ordem) para as regras que dependem das três (N005, N007).
 */
const c = await carregarConteudoPuro();
const e = { sorteio: c.sorteio, todos: c.todosOsMapas, missoes: c.missoes, perfil: c.perfil };
const L = c.perfil.sala.linhas;

/** Todos os tiles de peça (área, cômodo, tile), na ordem do JSON. */
const PECAS = c.sorteio.pecas.areas.flatMap((a) =>
  a.comodos.flatMap((co) => candidatosDePeca(c.todosOsMapas.get(co.mapa)!, L, co.retangulo, a.passagem).map((t) => ({ area: a.id, comodo: co.id, mapa: co.mapa, x: t.x, y: t.y }))),
);
const peca = (ordem: number, p: (typeof PECAS)[number]): PecaSorteada => ({ ordem: ordem as 1 | 2 | 3, area: p.area, comodo: p.comodo, mapa: p.mapa, x: p.x, y: p.y });

describe('enumeração: os 24 tiles de peça e de caixa', () => {
  it('são 24, em 4 áreas, e nenhum fora das áreas sorteáveis', () => {
    expect(PECAS).toHaveLength(24);
    expect(new Set(PECAS.map((p) => p.area))).toEqual(new Set(['cozinha', 'quarto', 'escritorio', 'quarto_casal']));
  });
});

describe('enumeração: o vizinho de cada tile de peça e de caixa é alcançável da porta (base do __irAPeca e do __irACaixa)', () => {
  it('nos 24 tiles, para a peça e para a caixa, há vizinho livre alcançável a partir das portas, com o tile bloqueado', () => {
    for (const p of PECAS) {
      for (const item of ['peca', 'caixa'] as const) {
        const mapas = item === 'peca' ? mapasComPlano(c.todosOsMapas, { pecas: [peca(1, p)] }) : mapasComPlano(c.todosOsMapas, { pecas: [], caixa: p });
        const m = mapas.get(p.mapa)!;
        const vizinhos = vizinhosLivresAlcancaveis(m, p.x, p.y);
        expect(vizinhos.length, `${item} em ${p.mapa} (${p.x}, ${p.y})`).toBeGreaterThan(0);
        const porta = m.objetos.find((o) => o.tipo === 'porta')!;
        const comp = alcancaveisDe(m, { x: porta.x, y: porta.y }, new Set([`${p.x},${p.y}`]));
        expect(vizinhos.some((v) => comp.has(`${v.x},${v.y}`)), `${item} em ${p.mapa} (${p.x}, ${p.y}): vizinho fora da porta`).toBe(true);
      }
    }
  });
});

describe('enumeração: cada peça N × cada tile de Nick', () => {
  for (const missao of ['marco1', 'parte1', 'parte2', 'parte3', 'enfeites']) {
    it(`missão ${missao}: o sorteio aceita exatamente os tiles de Nick que a conferência à força aceita`, () => {
      const m = c.missoes.find((q) => q.id === missao)!;
      const regra = c.sorteio.nick[missao];
      const ordem = regra.foraDaAreaDaPeca ?? 1;
      const daCaixa = regra.foraDaAreaDaCaixa === true;
      let total = 0;
      for (const p of PECAS) {
        // Só a peça (ou a caixa) da missão; as outras ficam em áreas que não mudam este tile. Marco1: uma peça qualquer.
        const pecas = daCaixa ? [] : [peca(ordem, p)];
        const caixa = daCaixa ? { area: p.area, comodo: p.comodo, mapa: p.mapa, x: p.x, y: p.y } : undefined;
        if (regra.foraDaAreaDaPeca !== undefined && regra.areas.includes(p.mapa) && regra.areas.length === 1) continue;
        for (const area of regra.areas) {
          if ((regra.foraDaAreaDaPeca !== undefined || daCaixa) && area === p.mapa) continue;
          const rapido = tilesDoNick(e, missao, regra, area, pecas, caixa).map((t) => `${t.x},${t.y}`).sort();
          // À força: candidatos da forma, e para cada um, bloqueia o tile e confere a rota de toda condução da missão.
          const comPlano = mapasComPlano(c.todosOsMapas, { pecas, caixa });
          const forca = candidatosDeNickDaRegra(c.todosOsMapas, c.missoes, missao, { ...regra, areas: [area] }, c.perfil, pecas, c.sorteio.pecas.areas, caixa)
            .filter((t) => {
              const mapa = comPlano.get(area)!;
              const colisao = mapa.colisao.map((l) => [...l]);
              colisao[t.y][t.x] = true;
              const bloqueado = new Map(comPlano).set(area, { ...mapa, colisao });
              return Object.keys(m.missao.conducao).every((f) => rotaDaFaseExiste(f as Fase, c.missoes, bloqueado));
            })
            .map((t) => `${t.x},${t.y}`)
            .sort();
          expect(rapido, `${missao}: peça ${p.mapa} (${p.x}, ${p.y}), Nick em ${area}`).toEqual(forca);
          total += forca.length;
          // Seta de farejar: do mapa do Nick até o mapa da peça (se forem diferentes), com as áreas abertas da missão.
          if (forca.length > 0 && area !== p.mapa && (regra.foraDaAreaDaPeca !== undefined || daCaixa)) {
            const porta = portaASeguir(c.todosOsMapas, (id) => m.maps.includes(id), area, p.mapa);
            expect(porta, `${missao}: sem seta de ${area} para ${p.mapa}`).toBeDefined();
          }
        }
      }
      expect(total).toBeGreaterThan(0);
    });
  }
});

describe('enumeração: todas as triplas ordenadas de peças, com a caixa na área que sobra', () => {
  it('toda tripla (3 áreas distintas, em ordem) e a caixa em cada tile da área restante deixam todas as missões com tile de Nick, e o mínimo da Sala', () => {
    const porArea = new Map<string, typeof PECAS>();
    for (const p of PECAS) porArea.set(p.area, [...(porArea.get(p.area) ?? []), p]);
    const areas = [...porArea.keys()];
    let triplas = 0;
    let caixas = 0;
    for (const a1 of areas) for (const a2 of areas) for (const a3 of areas) {
      if (new Set([a1, a2, a3]).size < 3) continue;
      for (const p1 of porArea.get(a1)!) for (const p2 of porArea.get(a2)!) for (const p3 of porArea.get(a3)!) {
        triplas += 1;
        const pecas = [peca(1, p1), peca(2, p2), peca(3, p3)];
        const sobra = areas.find((x) => ![a1, a2, a3].includes(x))!;
        for (const m of c.missoes) {
          const regra = c.sorteio.nick[m.id];
          if (regra.foraDaAreaDaCaixa) continue; // a missão da caixa é conferida abaixo, com a caixa em cada tile
          const fora = regra.foraDaAreaDaPeca !== undefined ? pecas[regra.foraDaAreaDaPeca - 1].mapa : undefined;
          const lista = candidatosDeNickDaRegra(c.todosOsMapas, c.missoes, m.id, { ...regra, areas: regra.areas.filter((a) => a !== fora) }, c.perfil, pecas, c.sorteio.pecas.areas);
          expect(lista.length, `${m.id} com ${a1}/${a2}/${a3}`).toBeGreaterThanOrEqual(regra.minimo ?? 1);
        }
        // A caixa na área que sobra, em cada tile: o Nick da fase `enfeites` sempre tem tile fora da área da caixa.
        const regraE = c.sorteio.nick.enfeites;
        for (const k of porArea.get(sobra)!) {
          caixas += 1;
          const caixa = { mapa: k.mapa, x: k.x, y: k.y };
          const lista = candidatosDeNickDaRegra(c.todosOsMapas, c.missoes, 'enfeites', { ...regraE, areas: regraE.areas.filter((a) => a !== k.mapa) }, c.perfil, [], c.sorteio.pecas.areas, caixa);
          expect(lista.length, `enfeites com ${a1}/${a2}/${a3} e caixa em ${k.mapa} (${k.x}, ${k.y})`).toBeGreaterThanOrEqual(1);
        }
      }
    }
    const tamanho = (id: string) => porArea.get(id)!.length;
    let esperado = 0;
    for (const x of areas) for (const y of areas) for (const z of areas) if (new Set([x, y, z]).size === 3) esperado += tamanho(x) * tamanho(y) * tamanho(z);
    expect(triplas).toBe(esperado);
    expect(caixas).toBeGreaterThan(triplas);

  }, 300_000);
});
