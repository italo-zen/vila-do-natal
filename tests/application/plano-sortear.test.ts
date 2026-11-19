import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { carregarConteudoPuro } from '../helpers/conteudoReal';
import { criarRng } from '../../src/domain/shared/Rng';
import { assinaturaDoPlano, type Plano } from '../../src/domain/plano/Plano';
import { sortearPlano, tilesDoNick } from '../../src/application/plano/sortearPlano';
import { mapasComPlano } from '../../src/application/plano/mapasComPlano';
import { candidatosDePeca } from '../../src/application/plano/candidatos';
import { IniciarNovoJogo, planejadorDoConteudo } from '../../src/application/usecases/IniciarNovoJogo';
import { SessaoDeJogo } from '../../src/application/SessaoDeJogo';

const c = await carregarConteudoPuro();
const e = { sorteio: c.sorteio, todos: c.todosOsMapas, missoes: c.missoes, perfil: c.perfil };
const plano = (semente: number, anterior?: string) => sortearPlano(e, criarRng(semente), semente, anterior);
const PROIBIDAS = ['sala', 'hall', 'quartinho', 'banheiro1', 'banheiro_escritorio'];

describe('sortearPlano (GDD 21.16; ADR-013 seção 7, itens 4 a 6)', () => {
  it('mesma semente, mesmo plano; sementes diferentes, planos diferentes', () => {
    expect(plano(7)).toEqual(plano(7));
    const assinaturas = new Set(Array.from({ length: 50 }, (_, i) => assinaturaDoPlano(plano(i + 1))));
    expect(assinaturas.size).toBeGreaterThan(40);
  });

  it('propriedade, 1000 sementes: o plano é sempre válido', () => {
    const areasDePeca1 = new Set<string>();
    for (let semente = 0; semente < 1000; semente++) {
      const p = plano(semente);
      // 3 áreas distintas, em ordem 1, 2, 3, fora de Sala, Hall, banheiros e Quartinho.
      expect(p.pecas.map((x) => x.ordem)).toEqual([1, 2, 3]);
      expect(new Set(p.pecas.map((x) => x.area)).size).toBe(3);
      for (const x of p.pecas) {
        expect(PROIBIDAS.includes(x.area), `semente ${semente}`).toBe(false);
        expect(candidatosDePeca(c.todosOsMapas.get(x.mapa)!, c.perfil.sala.linhas, undefined, c.sorteio.pecas.areas.find((a) => a.id === x.area)!.passagem).some((t) => t.x === x.x && t.y === x.y), `semente ${semente}: ${x.area} (${x.x}, ${x.y})`).toBe(true);
      }
      areasDePeca1.add(p.pecas[0].area);
      // Nick: Sala nas luzes e na parte 1; fora da área da peça nas partes 2 e 3; fora do Escritório nos enfeites.
      expect(p.nick.marco1.mapa).toBe('sala');
      expect(p.nick.parte1.mapa).toBe('sala');
      expect(p.nick.parte2.mapa).not.toBe(p.pecas[1].mapa);
      expect(p.nick.parte3.mapa).not.toBe(p.pecas[2].mapa);
      expect(p.nick.enfeites.mapa).not.toBe('escritorio');
      expect(PROIBIDAS.filter((a) => a !== 'sala').includes(p.nick.parte2.mapa)).toBe(false);
      // Alvo do farejar: Sala (interruptor) nas luzes, mapa da peça N na parte N, mapa da caixa nos enfeites.
      expect(p.nick.marco1.alvo).toBe('sala');
      expect(p.nick.parte1.alvo).toBe(p.pecas[0].mapa);
      expect(p.nick.parte2.alvo).toBe(p.pecas[1].mapa);
      expect(p.nick.parte3.alvo).toBe(p.pecas[2].mapa);
      expect(p.nick.enfeites.alvo).toBe('escritorio');
      // `mapasComPlano` põe exatamente 3 peças e todas as rotas de condução existem com o Nick da missão bloqueado.
      const mapas = mapasComPlano(c.todosOsMapas, p);
      expect([...mapas.values()].flatMap((m) => m.objetos.filter((o) => o.tipo === 'peca'))).toHaveLength(3);
      for (const m of c.missoes) {
        const n = p.nick[m.id];
        const tiles = tilesDoNick(e, m.id, c.sorteio.nick[m.id], n.mapa, p.pecas);
        expect(tiles.some((t) => t.x === n.x && t.y === n.y), `semente ${semente}: Nick de ${m.id} em ${n.mapa} (${n.x}, ${n.y})`).toBe(true);
      }
    }
    expect(areasDePeca1.size).toBe(4); // a peça 1 já caiu em todas as áreas sorteáveis
  }, 120_000);

  it('distribuição: sementes 1 a 200 e sementes vizinhas não dão a peça 1 sempre na mesma área', () => {
    const conta = (sementes: number[]) => {
      const m = new Map<string, number>();
      for (const x of sementes) m.set(plano(x).pecas[0].area, (m.get(plano(x).pecas[0].area) ?? 0) + 1);
      return m;
    };
    const m = conta(Array.from({ length: 200 }, (_, i) => i + 1));
    expect(m.size).toBe(4);
    for (const n of m.values()) expect(n).toBeGreaterThanOrEqual(25); // esperado 50 por área; mínimo folgado
    // Achado do QA: 500, 513, 526 (passo 13) davam sempre o Quarto da Oli.
    const vizinhas = conta(Array.from({ length: 40 }, (_, i) => 500 + 13 * i));
    expect(vizinhas.size).toBeGreaterThanOrEqual(3);
    // Nick da parte 2: também varia entre sementes vizinhas.
    expect(new Set(Array.from({ length: 40 }, (_, i) => plano(500 + i).nick.parte2.mapa)).size).toBeGreaterThanOrEqual(3);
  });

  it('golden: as sementes 1, 2 e 42 têm o plano gravado em tests/fixtures/plano-1.3.0.json', () => {
    const arquivo = join(__dirname, '..', 'fixtures', 'plano-1.3.0.json');
    const atual: Record<string, Plano> = Object.fromEntries([1, 2, 42].map((s) => [String(s), plano(s)]));
    if (!existsSync(arquivo) || process.env.GRAVAR_GOLDEN === '1') writeFileSync(arquivo, JSON.stringify(atual, null, 2) + '\n');
    expect(atual).toEqual(JSON.parse(readFileSync(arquivo, 'utf-8')));
  });

  it('anti-repetição: com a área da peça 1 anterior, a peça 1 cai em outra área (só vale com semente da entropia)', () => {
    for (let semente = 0; semente < 200; semente++) {
      const sem = plano(semente);
      const com = plano(semente, sem.pecas[0].area);
      expect(com.pecas[0].area).not.toBe(sem.pecas[0].area);
      expect(new Set(com.pecas.map((x) => x.area)).size).toBe(3);
    }
  });

  it('IniciarNovoJogo: semente fixa dá o mesmo plano e não aplica anti-repetição; semente da fonte aplica', () => {
    const sessao = new SessaoDeJogo();
    let n = 0;
    const planejador = planejadorDoConteudo(e, { nova: () => 5 + (n++ % 2) });
    const iniciar = new IniciarNovoJogo(sessao, c.missoes, planejador);
    iniciar.executar('lolo', 9);
    const a = sessao.plano;
    iniciar.executar('lolo', 9);
    expect(sessao.plano).toEqual(a); // semente fixa: mesmo plano
    expect(sessao.mapas.size).toBe(c.todosOsMapas.size);
    iniciar.sementeDaProxima = 9;
    iniciar.executar('lolo');
    expect(sessao.plano).toEqual(a);
    expect(sessao.progresso.nick.tile).toMatchObject({ mapa: a.nick.marco1.mapa, x: a.nick.marco1.x, y: a.nick.marco1.y });
    // Entropia: duas partidas seguidas não repetem a área da peça 1.
    for (let i = 0; i < 20; i++) {
      const antes = sessao.plano.pecas[0].area;
      iniciar.executar('lolo');
      expect(sessao.plano.pecas[0].area).not.toBe(antes);
    }
  });
});
