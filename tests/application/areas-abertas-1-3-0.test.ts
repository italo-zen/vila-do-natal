import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { areasReais, entradaReal } from '../helpers/areasReais';
import { missoesReais } from '../helpers/missoesReais';
import { contextoDaPartida } from '../../src/application/mundo/pecas';
import { resolverPorta } from '../../src/application/mundo/subarea';
import { ColisaoDoMapa, geometriaDoSobrinho, mover, posicaoCentralizadaNoTile, type Direcao, type Posicao } from '../../src/application/mundo/movimento';
import { bloqueiosDaSubarea } from '../../src/application/mundo/subarea';
import { portaContraAoAndar } from '../../src/application/mundo/travessia';
import { arestaAberta, VETOR_DO_LADO, LADOS } from '../../src/application/mundo/arestas';
import { calcularRotaDeConducao } from '../../src/application/mundo/conducao';
import { indicadoresDaSubarea } from '../../src/application/mundo/indicadores';
import type { Fase } from '../../src/domain/progresso/Fase';

/**
 * 1.3.0: o Quarto do casal e os dois banheiros abrem (Quartinho segue fechado). Portas nos dois sentidos, chegada, ninguém preso,
 * rotas, indicadores, modo explorar e nenhuma dica levando às áreas novas.
 */
const { manifesto, todos } = areasReais();
const missoes = missoesReais();
const perfil = entradaReal().perfil;
const g = geometriaDoSobrinho(perfil);
const T = perfil.tile;
const QUINA = perfil.vista!.quinaMaximaPx!;
const NOVAS = ['quarto_casal', 'banheiro1', 'banheiro_escritorio'];
const PORTAS_NOVAS = ['quarto_casal-sala', 'banheiro1-quarto', 'banheiro1-quarto_casal', 'banheiro_escritorio-escritorio'];
const depoisDasLuzes = (f: Fase) => f === 'introducao' || f === 'porta' || f === 'luzes';

describe('as áreas novas e o Quartinho', () => {
  it('abrem da parte 1 em diante; o Quartinho segue fechado', () => {
    const ctx = contextoDaPartida(missoes, depoisDasLuzes);
    for (const a of NOVAS) expect(ctx.areaAberta(a), a).toBe(true);
    expect(ctx.areaAberta('quartinho')).toBe(false);
    expect(contextoDaPartida(missoes, () => false).areaAberta('quarto_casal')).toBe(false);
  });

  it.each(PORTAS_NOVAS)('porta %s: abre nos dois sentidos, com chegada no tile da porta do outro lado olhando para dentro', (id) => {
    const ctx = contextoDaPartida(missoes, depoisDasLuzes);
    const lados = [...todos.values()].flatMap((a) => a.objetos.filter((o) => o.tipo === 'porta' && o.dados.id === id).map((o) => ({ area: a.id, o })));
    expect(lados).toHaveLength(2);
    for (const { area, o } of lados) {
      const r = resolverPorta(o, depoisDasLuzes, ctx);
      expect(r, `${area}/${id}`).toMatchObject({ tipo: 'entrar', spawn: id });
      const destino = todos.get(String(o.dados.destino))!;
      const chegada = destino.objetos.find((x) => x.tipo === 'spawn' && x.dados.nome === id)!;
      const porta = destino.objetos.find((x) => x.tipo === 'porta' && x.dados.id === id)!;
      expect([chegada.x, chegada.y]).toEqual([porta.x, porta.y]);
      expect(chegada.dados.direcao).toBe(o.dados.lado);
    }
  });

  it('a `cozinha-quartinho` continua fechada pelo lado da Cozinha', () => {
    const ctx = contextoDaPartida(missoes, depoisDasLuzes);
    const p = todos.get('cozinha')!.objetos.find((o) => o.tipo === 'porta' && o.dados.id === 'cozinha-quartinho')!;
    expect(resolverPorta(p, depoisDasLuzes, ctx)).toEqual({ tipo: 'fechada' });
  });

  it('o jogador atravessa cada porta empurrando contra ela, a partir do tile da porta, nas duas áreas', () => {
    for (const id of PORTAS_NOVAS) {
      for (const a of todos.values()) {
        const o = a.objetos.find((x) => x.tipo === 'porta' && x.dados.id === id);
        if (!o) continue;
        const col = new ColisaoDoMapa(bloqueiosDaSubarea(a, () => true), a.paredes);
        const lado = o.dados.lado as Direcao;
        let p = posicaoCentralizadaNoTile(o.x, o.y, g);
        let dispara = false;
        for (let i = 0; i < 40 && !dispara; i++) {
          p = mover(p, lado, 2, col.bloqueado, g, col.parede, QUINA);
          dispara = portaContraAoAndar(p, lado, [{ x: o.x, y: o.y, lado }], g) !== undefined;
        }
        expect(dispara, `${a.id}/${id}`).toBe(true);
      }
    }
  });
});

describe('ninguém fica preso nas áreas abertas (movimento real, caixa dos pés de 24 px, com a assistência de quina)', () => {
  const ABERTAS = ['hall', 'sala', 'cozinha', 'quarto', 'escritorio', ...NOVAS];
  it.each(ABERTAS)('%s: de cada tile livre se chega a cada vizinho livre de aresta aberta, andando', (id) => {
    const a = todos.get(id)!;
    const col = new ColisaoDoMapa(bloqueiosDaSubarea(a, () => true), a.paredes);
    const livre = (x: number, y: number) => x >= 0 && y >= 0 && x < a.largura && y < a.altura && a.chao[y][x] !== 0 && !a.colisao[y][x];
    for (let y = 0; y < a.altura; y++) {
      for (let x = 0; x < a.largura; x++) {
        if (!livre(x, y)) continue;
        for (const lado of LADOS) {
          const nx = x + VETOR_DO_LADO[lado].x;
          const ny = y + VETOR_DO_LADO[lado].y;
          if (!livre(nx, ny) || !arestaAberta(a.paredes, x, y, lado)) continue;
          let p: Posicao = posicaoCentralizadaNoTile(x, y, g);
          for (let i = 0; i < 40; i++) p = mover(p, lado, 2, col.bloqueado, g, col.parede, QUINA);
          const t = { x: Math.floor((p.x + g.quadro.w / 2) / T), y: Math.floor((p.y + g.pes.dy + g.pes.h / 2) / T) };
          // Chegou ao vizinho (ou passou por ele, em corredor reto), nunca ficou parado onde estava.
          const andou = lado === 'cima' ? t.y < y : lado === 'baixo' ? t.y > y : lado === 'esquerda' ? t.x < x : t.x > x;
          expect(andou, `${id} (${x}, ${y}) → ${lado}`).toBe(true);
        }
      }
    }
  });
});

describe('rotas, dicas, indicadores e modo explorar com as áreas novas', () => {
  it('nenhuma caixa, interruptor, árvore nem destino de condução cai nas áreas novas; só o Quarto do casal entra no sorteio das peças, os banheiros não (GDD 21.16)', () => {
    for (const a of NOVAS) {
      const area = todos.get(a)!;
      expect(area.objetos.filter((o) => ['enfeite', 'interruptor', 'arvore'].includes(o.tipo)), a).toEqual([]);
    }
    const sorteio = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'sorteio.json'), 'utf-8')) as { pecas: { areas: { id: string }[] }; nick: Record<string, { areas: string[] }> };
    expect(sorteio.pecas.areas.map((a) => a.id).sort()).toEqual(['cozinha', 'escritorio', 'quarto', 'quarto_casal']);
    for (const r of Object.values(sorteio.nick)) for (const a of r.areas) expect(['banheiro1', 'banheiro_escritorio'].includes(a)).toBe(false);
    for (const m of missoes) {
      for (const d of Object.values(m.missao.conducao)) expect(NOVAS.includes(d.mapa)).toBe(false);
    }
  });

  it('a condução e o farejar seguem iguais: a rota da parte 2 não passa pelas áreas novas', () => {
    const { manifesto: mf } = areasReais();
    const sessao = (fase: Fase) => contextoDaPartida(missoes, (f) => f === 'introducao' || f === 'porta' || f === 'luzes' || f === fase);
    const ctx = sessao('parte1' as Fase);
    const r = calcularRotaDeConducao(todos, { mapa: 'cozinha', x: 3, y: 0 }, { mapa: 'sala', x: 2, y: 7 }, () => true, ctx);
    expect(r).not.toBeNull();
    expect(r!.nos.some((n) => NOVAS.includes(n.mapa))).toBe(false);
    expect(mf.missions.at(-1)?.maps).toEqual(expect.arrayContaining(NOVAS));
  });

  it('indicadores das portas novas: setas laterais e tapete, sem indicador em porta de lado cima', () => {
    for (const a of NOVAS) {
      const area = todos.get(a)!;
      const ind = indicadoresDaSubarea(area, { colunas: 15, linhas: 11 });
      for (const o of area.objetos.filter((x) => x.tipo === 'porta')) {
        const lado = String(o.dados.lado);
        const achou = ind.find((i) => i.porta === o.dados.id);
        if (lado === 'cima') expect(achou, `${a}/${String(o.dados.id)}`).toBeUndefined();
        else expect(achou, `${a}/${String(o.dados.id)}`).toBeDefined();
      }
    }
  });

  it('modo explorar: as áreas novas estão em missions[enfeites].maps e têm tabela de decoração', () => {
    const enfeites = manifesto.missions.find((m) => m.id === 'enfeites')!;
    for (const a of NOVAS) {
      expect(enfeites.maps).toContain(a);
      expect(manifesto.maps.find((m) => m.id === a)?.decoracao, a).toBeDefined();
      const dec = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'maps', 'decoracao', `${a}.json`), 'utf-8')) as { enfeites: unknown[] };
      expect(dec.enfeites.length, a).toBeGreaterThan(0);
    }
  });
});
