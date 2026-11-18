import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ColisaoDoMapa,
  geometriaDoSobrinho,
  mover,
  posicaoCentralizadaNoTile,
  posicaoDoTile,
  type Geometria,
  type Posicao,
} from '../../src/application/mundo/movimento';
import { arestaAberta, girarMascara, paredeNoTile, passosEntreTiles } from '../../src/application/mundo/arestas';
import { interpretarSubarea } from '../../src/application/content/interpretarSubarea';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';
import { mapaDeTexto } from '../helpers/mapasDeArestas';

/**
 * M1 e M2 (ADR-011 seção 8): colisão por aresta do sobrinho. Os testes rodam para tile 16 (v1) e 32 (HD): a geometria dos pés
 * escala com o tile, e o resultado em tiles tem de ser o mesmo.
 */
const PERFIL_V1: PerfilDeArte = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'art-profiles', 'gba-240x160.json'), 'utf-8'));

function geometriaParaTile(tile: number): Geometria {
  const k = tile / 16;
  const perfil = JSON.parse(JSON.stringify(PERFIL_V1)) as PerfilDeArte;
  perfil.tile = tile;
  perfil.corpos.sobrinho.quadro = { w: 16 * k, h: 24 * k };
  perfil.corpos.sobrinho.pes = { w: 12 * k, h: 8 * k };
  return geometriaDoSobrinho(perfil);
}

/** Ambiente de teste: a área escrita em grade dupla, a colisão por tile e por aresta, e a geometria dos pés. */
function ambiente(grade: string[], tile: number) {
  const mapa = mapaDeTexto('t', grade, [], { tile });
  const g = geometriaParaTile(tile);
  const col = new ColisaoDoMapa(mapa.colisao, mapa.paredes);
  const andar = (p: Posicao, dir: 'cima' | 'baixo' | 'esquerda' | 'direita', dist: number) => mover(p, dir, dist, col.bloqueado, g, col.parede);
  /** Caixa dos pés em px: [x0, y0, x1, y1]. */
  const caixa = (p: Posicao) => ({ x0: p.x + g.pes.dx, y0: p.y + g.pes.dy, x1: p.x + g.pes.dx + g.pes.w, y1: p.y + g.pes.dy + g.pes.h });
  return { mapa, g, col, andar, caixa, t: tile };
}

/** Sala 3×3 sem parede interna. */
const SALA_3X3 = ['+-+-+-+', '|. . .|', '+ + + +', '|. . .|', '+ + + +', '|. . .|', '+-+-+-+'];

describe.each([16, 32])('M1: colisão por aresta, tile %i (ADR-011 seção 5.1)', (tile) => {
  it('as quatro direções: encosta na parede externa e não cruza', () => {
    const e = ambiente(SALA_3X3, tile);
    const centro = posicaoDoTile(1, 1, e.g);
    const dir = e.caixa(e.andar(centro, 'direita', 10 * tile));
    const esq = e.caixa(e.andar(centro, 'esquerda', 10 * tile));
    const cima = e.caixa(e.andar(centro, 'cima', 10 * tile));
    const baixo = e.caixa(e.andar(centro, 'baixo', 10 * tile));
    expect(dir.x1).toBeLessThanOrEqual(3 * tile);
    expect(dir.x1).toBeGreaterThan(3 * tile - 1);
    expect(esq.x0).toBeGreaterThanOrEqual(0);
    expect(esq.x0).toBeLessThan(1);
    expect(cima.y0).toBeGreaterThanOrEqual(0);
    expect(cima.y0).toBeLessThan(1);
    expect(baixo.y1).toBeLessThanOrEqual(3 * tile);
    expect(baixo.y1).toBeGreaterThan(3 * tile - 1);
  });

  it('encostar na linha da parede não bloqueia (sair dela é livre); o px seguinte para dentro, sim', () => {
    // Duas salas lado a lado, com a parede entre os tiles 1 e 2 das duas linhas (X = 2·tile).
    const e = ambiente(['+-+-+-+-+', '|. .|. .|', '+ + + + +', '|. .|. .|', '+-+-+-+-+'], tile);
    const encostada: Posicao = { x: 2 * tile - e.g.pes.dx - e.g.pes.w, y: posicaoDoTile(1, 0, e.g).y };
    expect(e.caixa(encostada).x1).toBe(2 * tile);
    expect(e.andar(encostada, 'direita', 1)).toEqual(encostada);
    expect(e.andar(encostada, 'esquerda', 1).x).toBe(encostada.x - 1);
    expect(e.andar(encostada, 'baixo', 1).y).toBe(encostada.y + 1);
  });

  it('parede interna vertical: bloqueia nos dois sentidos e nunca é atravessada, qualquer que seja o passo', () => {
    // Duas salas lado a lado, com a parede entre os tiles 1 e 2 das duas linhas.
    const e = ambiente(['+-+-+-+-+', '|. .|. .|', '+ + + + +', '|. .|. .|', '+-+-+-+-+'], tile);
    expect(arestaAberta(e.mapa.paredes, 1, 0, 'direita')).toBe(false);
    expect(paredeNoTile(e.mapa.paredes, 2, 1, 'esquerda')).toBe(true);
    for (const passo of [0.3, 1, 2.5]) {
      let p = posicaoDoTile(0, 0, e.g);
      for (let i = 0; i < 6 * tile; i++) p = e.andar(p, 'direita', passo);
      expect(e.caixa(p).x1).toBeLessThanOrEqual(2 * tile + 1e-9);
      let q = posicaoDoTile(3, 1, e.g);
      for (let i = 0; i < 6 * tile; i++) q = e.andar(q, 'esquerda', passo);
      expect(e.caixa(q).x0).toBeGreaterThanOrEqual(2 * tile - 1e-9);
    }
  });

  it('parede só de um lado da caixa que ocupa dois tiles bloqueia a caixa inteira', () => {
    // Parede à direita só do tile (1,1). A caixa dos pés, a cavalo entre as linhas 0 e 1, é barrada em X = 2·tile.
    const e = ambiente(SALA_3X3, tile);
    const paredes = e.mapa.paredes.map((l) => [...l]);
    paredes[1][1] |= 2;
    paredes[1][2] |= 8;
    const barrada = new ColisaoDoMapa(e.mapa.colisao, paredes);
    const aCavalo: Posicao = { x: tile + (tile - e.g.pes.w) / 2 - e.g.pes.dx, y: tile - e.g.pes.dy - e.g.pes.h / 2 };
    let p = aCavalo;
    for (let i = 0; i < 3 * tile; i++) p = mover(p, 'direita', 1, barrada.bloqueado, e.g, barrada.parede);
    expect(e.caixa(p).x1).toBeLessThanOrEqual(2 * tile + 1e-9);
    // Sem a parede, a mesma caixa passa.
    let q = aCavalo;
    for (let i = 0; i < 3 * tile; i++) q = e.andar(q, 'direita', 1);
    expect(e.caixa(q).x1).toBeGreaterThan(2 * tile);
  });

  it('esquina com duas paredes perpendiculares: nenhum dos dois eixos escapa', () => {
    const e = ambiente(['+-+-+', '|. .|', '+ + +', '|. .|', '+-+-+'], tile);
    // Parede à direita e embaixo do tile (0,0): fecha o canto (0,0), mas aberto para (1,0) por cima? Constrói à mão.
    e.mapa.paredes[0][0] |= 2 | 4; // direita e baixo de (0,0)
    e.mapa.paredes[0][1] |= 8; // esquerda de (1,0)
    e.mapa.paredes[1][0] |= 1; // cima de (0,1)
    const col = new ColisaoDoMapa(e.mapa.colisao, e.mapa.paredes);
    let p = posicaoDoTile(0, 0, e.g);
    for (let i = 0; i < 3 * tile; i++) p = mover(p, 'direita', 1, col.bloqueado, e.g, col.parede);
    for (let i = 0; i < 3 * tile; i++) p = mover(p, 'baixo', 1, col.bloqueado, e.g, col.parede);
    const c = e.caixa(p);
    expect(c.x1).toBeLessThanOrEqual(tile + 1e-9);
    expect(c.y1).toBeLessThanOrEqual(tile + 1e-9);
  });

  it('parede que acaba no vértice: a caixa só passa depois de livrar a ponta', () => {
    // Parede vertical entre (0,0) e (1,0) apenas na linha 0; a linha 1 é aberta.
    const e = ambiente(['+-+-+', '|. .|', '+ + +', '|. .|', '+-+-+'], tile);
    e.mapa.paredes[0][0] |= 2;
    e.mapa.paredes[0][1] |= 8;
    const col = new ColisaoDoMapa(e.mapa.colisao, e.mapa.paredes);
    const correr = (y: number) => {
      let p: Posicao = { x: (tile - e.g.pes.w) / 2 - e.g.pes.dx, y };
      for (let i = 0; i < 2 * tile; i++) p = mover(p, 'direita', 1, col.bloqueado, e.g, col.parede);
      return e.caixa(p).x1;
    };
    // Pés ainda 4 px dentro da linha 0 (y0 = tile − 4): barrada em x = tile.
    const dentro = correr(tile - 4 - e.g.pes.dy);
    expect(dentro).toBeLessThanOrEqual(tile + 1e-9);
    // Pés exatamente na linha 1 (y0 = tile): passa.
    const fora = correr(tile - e.g.pes.dy);
    expect(fora).toBeGreaterThan(tile + 1);
    // Pés encostando na ponta da parede por baixo (y0 = tile − 0,005): ruído de ponto flutuante não bloqueia.
    expect(correr(tile - e.g.pes.dy - 0.005)).toBeGreaterThan(tile + 1);
  });

  it('a parede de cima não deixa subir e a de baixo não deixa descer, no tile de uma porta fechada', () => {
    const e = ambiente(['+-+D+-+', '|. . .|', '+ + + +', '|. . .|', '+-+-+-+'], tile);
    let p = posicaoCentralizadaNoTile(1, 0, e.g);
    for (let i = 0; i < 2 * tile; i++) p = e.andar(p, 'cima', 1);
    expect(e.caixa(p).y0).toBeGreaterThanOrEqual(-1e-9);
    expect(e.caixa(p).y0).toBeLessThan(1);
  });
});

describe.each([16, 32])('M2: passagem de 1 tile entre muros, tile %i (Cozinha e Lavanderia, ADR-011 seção 5.1)', (tile) => {
  // Corredor de 1 tile de largura (coluna 1) entre dois muros, com 4 tiles de comprimento.
  const GRADE = [
    '+-+-+-+',
    '|.|.|.|',
    '+ + + +',
    '|.|.|.|',
    '+ + + +',
    '|.|.|.|',
    '+ + + +',
    '|.|.|.|',
    '+-+-+-+',
  ];
  const e = ambiente(GRADE, tile);
  const folga = (tile - e.g.pes.w) / 2; // 4 px no HD (ADR-011), 2 px no tile de 16

  /** Sobe o corredor inteiro a partir da coluna 1 com o centro dos pés deslocado `desvio` px. */
  const subir = (desvio: number) => {
    const inicio: Posicao = { x: tile + (tile - e.g.pes.w) / 2 + desvio - e.g.pes.dx, y: 3 * tile - e.g.pes.dy - e.g.pes.h };
    let p = inicio;
    for (let i = 0; i < 4 * tile; i++) p = e.andar(p, 'cima', 1);
    return { inicio, fim: p };
  };

  it(`passa com os pés a 0 e a ${tile === 32 ? 4 : 2} px do centro do tile (a folga é (tile − largura dos pés)/2)`, () => {
    for (const desvio of [0, folga, -folga]) {
      const { inicio, fim } = subir(desvio);
      expect(inicio.y - fim.y, `desvio ${desvio}`).toBeGreaterThan(2 * tile);
    }
  });

  it('não passa a 1 px além da folga', () => {
    for (const desvio of [folga + 1, -folga - 1]) {
      const { inicio, fim } = subir(desvio);
      expect(fim, `desvio ${desvio}`).toEqual(inicio);
    }
  });
});

describe('arestas: funções puras', () => {
  it('aresta aberta exige os dois bits desligados; fora da caixa é fechada', () => {
    const p = [[0, 8], [2, 0]];
    expect(arestaAberta(p, 0, 0, 'direita')).toBe(false); // bit 2 em (1,0)?? (1,0)=8 é esquerda → fechada
    expect(arestaAberta(p, 0, 1, 'direita')).toBe(false); // (0,1)=2 direita
    expect(arestaAberta(p, 0, 0, 'baixo')).toBe(true);
    expect(arestaAberta(p, 0, 0, 'esquerda')).toBe(false); // fora da caixa
  });

  it('girar a máscara quatro vezes devolve a original, e um giro leva cima a direita', () => {
    for (let m = 0; m < 16; m++) {
      let x = m;
      for (let i = 0; i < 4; i++) x = girarMascara(x);
      expect(x).toBe(m);
    }
    expect(girarMascara(1)).toBe(2); // cima → direita
    expect(girarMascara(2)).toBe(4); // direita → baixo
    expect(girarMascara(4)).toBe(8); // baixo → esquerda
    expect(girarMascara(8)).toBe(1); // esquerda → cima
  });

  it('passos entre tiles: vizinho é o destino; diagonal pega o intermediário de arestas abertas', () => {
    const livre = mapaDeTexto('t', ['+-+-+', '|. .|', '+ + +', '|. .|', '+-+-+']).paredes;
    expect(passosEntreTiles(livre, { x: 0, y: 0 }, { x: 1, y: 0 })).toEqual([{ x: 1, y: 0 }]);
    expect(passosEntreTiles(livre, { x: 0, y: 0 }, { x: 1, y: 1 })).toEqual([{ x: 1, y: 0 }, { x: 1, y: 1 }]);
    // Com parede entre (0,0) e (1,0), o caminho aberto é por (0,1).
    const comParede = mapaDeTexto('t', ['+-+-+', '|.|.|', '+ + +', '|. .|', '+-+-+']).paredes;
    expect(passosEntreTiles(comParede, { x: 0, y: 0 }, { x: 1, y: 1 })).toEqual([{ x: 0, y: 1 }, { x: 1, y: 1 }]);
  });
});

describe('interpretarSubarea: schema 3', () => {
  const fixture = JSON.parse(readFileSync(join(__dirname, '..', 'fixtures', 'area-com-paredes.json'), 'utf-8'));
  const decl = { id: 'exemplo', file: 'x.json', tileset: 'tiles_casa' };

  it('lê paredes, porta com lado e spawn de chegada', () => {
    const m = interpretarSubarea(fixture, decl);
    expect(m.paredes).toEqual([[9, 3, 0], [12, 4, 7]]);
    expect(m.objetos.find((o) => o.tipo === 'porta')?.dados.lado).toBe('cima');
    // Bit de cima de (1,0) é a aresta da porta; (2,0) é vazio (máscara 0).
    expect(paredeNoTile(m.paredes, 1, 0, 'cima')).toBe(true);
    expect(m.paredes[0][2]).toBe(0);
  });

  it('recusa a planta antiga (schema 2 ou sem schemaVersion) com mensagem clara', () => {
    expect(() => interpretarSubarea({ ...fixture, schemaVersion: 2 }, decl)).toThrow(/planta antiga/);
    const { schemaVersion: _omitido, ...sem } = fixture;
    expect(() => interpretarSubarea(sem, decl)).toThrow(/planta antiga/);
    expect(() => interpretarSubarea({ ...fixture, schemaVersion: 4 }, decl)).toThrow(/não suportada/);
  });

  it('recusa paredes com o tamanho errado', () => {
    expect(() => interpretarSubarea({ ...fixture, paredes: [0, 0] }, decl)).toThrow(/paredes precisa ter 6 valores/);
  });
});
