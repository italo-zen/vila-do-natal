import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CarregarConteudo } from '../../src/application/usecases/CarregarConteudo';
import { ContentSourceDeArquivos } from '../../src/infrastructure/content/ContentSourceDeArquivos';
import { calcularRotaDeConducao, CUSTO_DA_PORTA } from '../../src/application/mundo/conducao';
import { arestaDoParFechado, bloqueiosDaSubarea, deslocamentoDaSubarea, resolverPorta } from '../../src/application/mundo/subarea';
import { indicadoresDaSubarea } from '../../src/application/mundo/indicadores';
import { contextoDaPartida, FASE_DA_PECA } from '../../src/application/mundo/pecas';
import type { Fase } from '../../src/domain/progresso/Fase';

/**
 * Par P2 (Sala ↔ Quarto), com chegada declarada nos dois lados e vão livre (ADR-004 seção 13; GDD 15.3.3 e 15.3.4).
 * Coordenadas do conteúdo: locais a cada subárea (sala 11×10, quarto 5×8). A tela é 15×11 (perfil HD).
 */

const CONTENT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content');
function lerConteudo(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const varrer = (dir: string) => {
    for (const nome of readdirSync(dir)) {
      const cam = join(dir, nome);
      if (statSync(cam).isDirectory()) varrer(cam);
      else if (nome.endsWith('.json')) out[relative(CONTENT, cam).split('\\').join('/')] = JSON.parse(readFileSync(cam, 'utf-8'));
    }
  };
  varrer(CONTENT);
  return out;
}
const carregar = () => new CarregarConteudo(new ContentSourceDeArquivos(lerConteudo())).executar();
const TELA = { colunas: 15, linhas: 11 };
const apenasLuzes = (f: Fase) => f === 'luzes';
const nada = () => false;

describe('par P2 Sala ↔ Quarto: ida e volta (ADR-004 seção 13.17; backlog 059)', () => {
  it('ida: do gatilho da Sala (7, 1) ao Quarto (0, 6), a travessia custa 3 passos (vão, gatilho, chegada)', async () => {
    const c = await carregar();
    const ctx = contextoDaPartida(c.missoes, apenasLuzes);
    const rota = calcularRotaDeConducao(c.todosOsMapas, { mapa: 'sala', x: 7, y: 1 }, { mapa: 'quarto', x: 0, y: 6 }, apenasLuzes, ctx);
    expect(CUSTO_DA_PORTA).toBe(3);
    expect(rota?.passos).toBe(3);
    expect(rota?.nos.at(-1)).toEqual({ mapa: 'quarto', x: 0, y: 6, spawn: 'P2' });
  });

  it('ida a partir de (7, 2), onde o A está antes da porta: 1 passo até o gatilho e 3 da travessia = 4 passos', async () => {
    const c = await carregar();
    const ctx = contextoDaPartida(c.missoes, apenasLuzes);
    const rota = calcularRotaDeConducao(c.todosOsMapas, { mapa: 'sala', x: 7, y: 2 }, { mapa: 'quarto', x: 0, y: 6 }, apenasLuzes, ctx);
    expect(rota?.passos).toBe(4);
  });

  it('volta: do Quarto (0, 6) à Sala (7, 2), 1 passo até o gatilho e 3 da travessia; a chegada é (7, 2), olhando para baixo', async () => {
    const c = await carregar();
    const ctx = contextoDaPartida(c.missoes, apenasLuzes);
    const rota = calcularRotaDeConducao(c.todosOsMapas, { mapa: 'quarto', x: 0, y: 6 }, { mapa: 'sala', x: 7, y: 2 }, apenasLuzes, ctx);
    expect(rota?.passos).toBe(4);
    expect(rota?.nos.at(-1)).toEqual({ mapa: 'sala', x: 7, y: 2, spawn: 'P2' });
    const chegada = c.todosOsMapas.get('sala')!.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === 'P2')!;
    expect([chegada.x, chegada.y, chegada.dados.direcao]).toEqual([7, 2, 'baixo']);
  });

  it('a chegada do Quarto (0, 6) encosta no gatilho (0, 7), que é o único vizinho livre dele, e olha para dentro (cima)', async () => {
    const c = await carregar();
    const quarto = c.todosOsMapas.get('quarto')!;
    const gatilho = quarto.objetos.find((o) => o.tipo === 'porta')!;
    const chegada = quarto.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === 'P2')!;
    expect(Math.abs(chegada.x - gatilho.x) + Math.abs(chegada.y - gatilho.y)).toBe(1);
    expect(chegada.dados.direcao).toBe('cima');
    expect(quarto.colisao[gatilho.y - 1][gatilho.x]).toBe(false);
  });

  it('o vão da P2 é o tile à direita do gatilho da Sala (8, 1): sem piso, bloqueado, e a Sala não o usa', async () => {
    const c = await carregar();
    const sala = c.todosOsMapas.get('sala')!;
    expect(sala.chao[1][8]).toBe(0);
    expect(sala.colisao[1][8]).toBe(true);
    const ctx = contextoDaPartida(c.missoes, apenasLuzes);
    const rota = calcularRotaDeConducao(c.todosOsMapas, { mapa: 'sala', x: 7, y: 2 }, { mapa: 'sala', x: 8, y: 1 }, apenasLuzes, ctx);
    expect(rota).toBeNull();
  });
});

describe('par P2: porta fechada antes de parte1 (ADR-004 seção 9.1; GDD 15.3.6)', () => {
  it('antes das luzes (Marco 1), o Quarto está fechado: o gatilho da P2 é parede, age como porta fechada e não tem transição', async () => {
    const c = await carregar();
    const sala = c.todosOsMapas.get('sala')!;
    const gatilho = sala.objetos.find((o) => o.tipo === 'porta' && o.dados.id === 'P2')!;
    const ctx = contextoDaPartida(c.missoes, nada);
    expect(ctx.areaAberta('quarto')).toBe(false);
    expect(resolverPorta(gatilho, nada, ctx)).toEqual({ tipo: 'fechada' });
    expect(bloqueiosDaSubarea(sala, nada, ctx)[gatilho.y][gatilho.x]).toBe(true);
    expect(calcularRotaDeConducao(c.todosOsMapas, { mapa: 'sala', x: 7, y: 2 }, { mapa: 'quarto', x: 0, y: 6 }, nada, ctx)).toBeNull();
  });

  it('depois das luzes (parte1 ativa), o Quarto abre e o gatilho da P2 leva ao spawn P2', async () => {
    const c = await carregar();
    const sala = c.todosOsMapas.get('sala')!;
    const gatilho = sala.objetos.find((o) => o.tipo === 'porta' && o.dados.id === 'P2')!;
    const ctx = contextoDaPartida(c.missoes, apenasLuzes);
    expect(ctx.areaAberta('quarto')).toBe(true);
    expect(resolverPorta(gatilho, apenasLuzes, ctx)).toEqual({ tipo: 'entrar', mapa: 'quarto', spawn: 'P2' });
    expect(bloqueiosDaSubarea(sala, apenasLuzes, ctx)[gatilho.y][gatilho.x]).toBe(false);
  });

  it('a P2 não está em nenhuma missão antes de parte1: marco1 abre só hall, sala e cozinha', async () => {
    const c = await carregar();
    expect(c.missoes[0].maps).toEqual(['hall', 'sala', 'cozinha']);
    for (const m of c.missoes.slice(1)) expect(m.maps).toContain('quarto');
  });

  it('a P2 fechada, antes de parte1, não tem indicador de porta aberta, mas o desenho segue o campo saida', async () => {
    const c = await carregar();
    const indicadores = indicadoresDaSubarea(c.todosOsMapas.get('sala')!, TELA);
    expect(indicadores.find((i) => i.porta === 'P2')).toEqual({ tipo: 'seta-direita', x: 7, y: 1, porta: 'P2' });
  });
});

describe('par fechado: a faixa de porta fica na aresta do lado de dentro (ADR-004 seção 3, "Arestas")', () => {
  it('antes do Marco 2, a P2 fechada na Sala tem a faixa na aresta de baixo de (7, 1), voltada para a chegada (7, 2); a P3 na da esquerda', async () => {
    const c = await carregar();
    const sala = c.todosOsMapas.get('sala')!;
    const chegada = (id: string) => sala.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === id)!;
    const gatilho = (id: string) => sala.objetos.find((o) => o.tipo === 'porta' && o.dados.id === id)!;
    expect(arestaDoParFechado(gatilho('P2'), chegada('P2'))).toBe('baixo');
    expect(arestaDoParFechado(gatilho('P3'), chegada('P3'))).toBe('esquerda');
    // A P2 não aponta a aresta para a parede (esquerda), que era o erro de usar só a saída (direita).
    expect(arestaDoParFechado(gatilho('P2'), chegada('P2'))).not.toBe('esquerda');
  });
});

describe('Quarto: câmera, caixa e conteúdo (GDD 15.3.2 e 15.3.4; ADR-004 seção 2)', () => {
  it('a caixa do Quarto é 5×8 e cabe em 15×11, centralizada em (5, 1) sem rolagem', async () => {
    const c = await carregar();
    const quarto = c.todosOsMapas.get('quarto')!;
    expect([quarto.largura, quarto.altura]).toEqual([5, 8]);
    expect(quarto.largura).toBeLessThanOrEqual(TELA.colunas);
    expect(quarto.altura).toBeLessThanOrEqual(TELA.linhas);
    expect(deslocamentoDaSubarea(quarto, TELA)).toEqual({ x: 5, y: 1 });
  });

  it('todo objeto do Quarto cai dentro da tela e acima da linha da barra (última linha da tela = 10)', async () => {
    const c = await carregar();
    const quarto = c.todosOsMapas.get('quarto')!;
    const d = deslocamentoDaSubarea(quarto, TELA);
    for (const o of quarto.objetos) {
      expect(o.y + d.y, `${o.tipo} ${String(o.dados.id ?? o.dados.nome)}`).toBeLessThan(TELA.linhas - 1);
    }
  });

  it('nenhuma peça no Quarto (GDD 15.3.2 e 15.2.2): só paredes, piso, a P2 e a P4 fechada e a chegada', async () => {
    const c = await carregar();
    const tipos = new Set(c.todosOsMapas.get('quarto')!.objetos.map((o) => o.tipo));
    expect(tipos.has('peca')).toBe(false);
    expect([...tipos].sort()).toEqual(['porta', 'portaFechada', 'spawn']);
  });

  it('o Quarto não tem tapete (saída lateral) e não tem NPC nem texto novo além da porta fechada P4', async () => {
    const c = await carregar();
    const quarto = c.todosOsMapas.get('quarto')!;
    const indicadores = indicadoresDaSubarea(quarto, TELA);
    expect(indicadores.some((i) => i.tipo === 'tapete')).toBe(false);
    expect(quarto.objetos.filter((o) => o.dados.texto !== undefined).map((o) => o.dados.texto)).toEqual(['porta.fechada']);
  });

  it('a peça de ordem 2 e a 3 não estão no Quarto (são da Cozinha e da Lavanderia, ADR-004 seção 8, item 18)', async () => {
    const c = await carregar();
    const pecasDoQuarto = c.todosOsMapas.get('quarto')!.objetos.filter((o) => o.tipo === 'peca');
    expect(pecasDoQuarto).toEqual([]);
    expect(FASE_DA_PECA[2]).toBe('parte2');
    expect(c.todosOsMapas.get('cozinha')!.objetos.some((o) => o.tipo === 'peca' && o.dados.ordem === 2)).toBe(true);
  });

  it('as rotas das três partes não passam pelo Quarto (GDD 15.3.5 e 15.10, E7 e E17)', async () => {
    const c = await carregar();
    const ctx = contextoDaPartida(c.missoes, (f: Fase) => f === 'luzes' || f === 'parte1' || f === 'parte2');
    for (const ordem of [1, 2, 3]) {
      const peca = [...c.todosOsMapas.values()].flatMap((m) => m.objetos.filter((o) => o.tipo === 'peca').map((o) => ({ m, o }))).find((p) => Number(p.o.dados.ordem) === ordem)!;
      const vizinhos = [[0, -1], [0, 1], [-1, 0], [1, 0]].map(([dx, dy]) => ({ mapa: peca.m.id, x: peca.o.x + dx, y: peca.o.y + dy }));
      const destino = { mapa: 'sala', x: 3, y: 7 };
      const rota = vizinhos.map((v) => calcularRotaDeConducao(c.todosOsMapas, v, destino, (f: Fase) => f === 'luzes' || f === 'parte1' || f === 'parte2', ctx)).find((r) => r !== null);
      expect(rota, `peça ${ordem}`).toBeDefined();
      expect(rota!.nos.some((n) => n.mapa === 'quarto'), `peça ${ordem}`).toBe(false);
    }
  });
});
