import { describe, expect, it } from 'vitest';
import { ColisaoDoMapa, caixaCruzaAresta, geometriaDoSobrinho, mover, posicaoCentralizadaNoTile, type Direcao, type Posicao } from '../../src/application/mundo/movimento';
import { bloqueiosDaSubarea } from '../../src/application/mundo/subarea';
import { areasReais, entradaReal } from '../helpers/areasReais';
import { mapaDeTexto } from '../helpers/mapasDeArestas';

/**
 * Assistência de quina (1.2.3): o movimento barrado por uma quina de até `vista.quinaMaximaPx` px desliza para o lado livre, sem
 * atravessar parede nem móvel. Reproduz, com a caixa dos pés de 24 px e o conteúdo real, os dois lugares onde o jogador prendia:
 * (a) o corredor da alcova da Sala (coluna 7) e (b) a abertura de 2 tiles da Cozinha ao encostar na pia (coluna 5).
 */
const { todos } = areasReais();
const perfil = entradaReal().perfil;
const QUINA = perfil.vista!.quinaMaximaPx!;
const g = geometriaDoSobrinho(perfil);
const T = perfil.tile;

function ambiente(id: string) {
  const mapa = todos.get(id)!;
  const col = new ColisaoDoMapa(bloqueiosDaSubarea(mapa, () => true), mapa.paredes);
  const andar = (p: Posicao, d: Direcao, n: number, quina = QUINA) => mover(p, d, n, col.bloqueado, g, col.parede, quina);
  const caixa = (p: Posicao) => ({ x0: p.x + g.pes.dx, y0: p.y + g.pes.dy, x1: p.x + g.pes.dx + g.pes.w, y1: p.y + g.pes.dy + g.pes.h });
  return { mapa, col, andar, caixa };
}
const tileDosPes = (p: Posicao) => ({ x: Math.floor((p.x + g.quadro.w / 2) / T), y: Math.floor((p.y + g.pes.dy + g.pes.h / 2) / T) });
const empurrar = (e: ReturnType<typeof ambiente>, p: Posicao, d: Direcao, quadros: number, quina = QUINA) => {
  for (let i = 0; i < quadros; i++) p = e.andar(p, d, 2, quina);
  return p;
};

/** A caixa dos pés não invade tile bloqueado (além de 1 px) nem cruza aresta de parede. */
function posicaoValida(e: ReturnType<typeof ambiente>, p: Posicao): boolean {
  const c = e.caixa(p);
  for (let ty = Math.floor(c.y0 / T); ty < Math.ceil(c.y1 / T); ty++) {
    for (let tx = Math.floor(c.x0 / T); tx < Math.ceil(c.x1 / T); tx++) {
      const sx = Math.min(c.x1, (tx + 1) * T) - Math.max(c.x0, tx * T);
      const sy = Math.min(c.y1, (ty + 1) * T) - Math.max(c.y0, ty * T);
      if (sx >= 1 && sy >= 1 && e.col.bloqueado(tx, ty)) return false;
    }
  }
  return !caixaCruzaAresta(c.x0, c.y0, c.x1, c.y1, T, e.col.parede);
}

describe('assistência de quina: o perfil', () => {
  it('quinaMaximaPx vem do perfil (8 px no HD)', () => {
    expect(QUINA).toBe(8);
  });
});

describe('(a) alcova da Sala: o corredor da coluna 7 (linhas 1 a 3) até a linha 0', () => {
  const e = ambiente('sala');
  // Centro do corredor: coluna 7 (x de 224 a 256, centro 240). Entra por baixo, vindo da linha 4.
  const comDesvio = (desvio: number): Posicao => {
    const p = posicaoCentralizadaNoTile(7, 4, g);
    return { x: p.x + desvio, y: p.y };
  };

  it('sem a assistência, um desvio de 7 px do centro trava na quina da entrada (reproduz o bug)', () => {
    const fim = empurrar(e, comDesvio(7), 'cima', 120, 0);
    expect(tileDosPes(fim).y).toBeGreaterThanOrEqual(4);
  });

  it.each([-8, -7, -5, -3, 0, 3, 5, 7, 8])('com a assistência, entra com desvio de %i px e chega à alcova (linha 0)', (desvio) => {
    const fim = empurrar(e, comDesvio(desvio), 'cima', 160);
    expect(tileDosPes(fim).y).toBe(0);
    expect(posicaoValida(e, fim)).toBe(true);
  });

  it('na alcova, as duas portas laterais e a de cima se alcançam sem prender (esquerda em (6,0), direita e cima em (7,0))', () => {
    const chegada = empurrar(e, posicaoCentralizadaNoTile(7, 3, g), 'cima', 60);
    const direita = empurrar(e, chegada, 'direita', 60);
    expect(tileDosPes(direita)).toEqual({ x: 7, y: 0 });
    const esquerda = empurrar(e, chegada, 'esquerda', 60);
    expect(tileDosPes(esquerda).x).toBe(6);
    expect(tileDosPes(esquerda).y).toBe(0);
  });
});

describe('(b) Cozinha: a abertura de 2 tiles (colunas 3 e 4) ao encostar na pia (coluna 5)', () => {
  const e = ambiente('cozinha');

  it('com os pés 0,9 px dentro da pia (a colisão tolera 1 px), descer era barrado pela parede de baixo da pia (reproduz o bug)', () => {
    const base = posicaoCentralizadaNoTile(4, 2, g);
    const p = { x: 5 * T + 0.9 - g.pes.dx - g.pes.w, y: base.y };
    const fim = empurrar(e, p, 'baixo', 60, 0);
    expect(tileDosPes(fim).y).toBe(2);
  });

  it('com a assistência, desce para a Lavanderia de qualquer ponto da largura da abertura (x de 3·T a 5·T)', () => {
    const base = posicaoCentralizadaNoTile(3, 2, g);
    for (let borda = 3 * T; borda <= 5 * T + 0.9; borda += 0.5) {
      const p = { x: borda - g.pes.dx - g.pes.w / 2 - g.pes.w / 2, y: base.y };
      // `borda` é a margem direita dos pés; os pés têm de começar dentro da caixa (x0 ≥ 3·T − 0,9).
      if (p.x + g.pes.dx < 3 * T - 0.9) continue;
      const fim = empurrar(e, p, 'baixo', 80);
      expect(tileDosPes(fim).y, `margem direita ${borda}`).toBeGreaterThanOrEqual(3);
      expect(posicaoValida(e, fim)).toBe(true);
    }
  });

  it('e sobe da Lavanderia para a Cozinha de qualquer ponto da abertura', () => {
    const base = posicaoCentralizadaNoTile(3, 3, g);
    for (let x0 = 3 * T - 0.9; x0 <= 5 * T - g.pes.w + 0.9; x0 += 0.5) {
      const p = { x: x0 - g.pes.dx, y: base.y };
      const fim = empurrar(e, p, 'cima', 80);
      expect(tileDosPes(fim).y, `x0 ${x0}`).toBeLessThanOrEqual(2);
    }
  });
});

describe('a assistência nunca atravessa parede nem móvel', () => {
  it('passeio pseudoaleatório nas 9 áreas, com a assistência: a caixa dos pés fica sempre numa posição válida', () => {
    let semente = 20261119;
    const sorteio = (n: number) => {
      semente = (semente * 1103515245 + 12345) & 0x7fffffff;
      return semente % n;
    };
    const direcoes: Direcao[] = ['cima', 'baixo', 'esquerda', 'direita'];
    for (const id of todos.keys()) {
      const e = ambiente(id);
      const livres: { x: number; y: number }[] = [];
      e.mapa.chao.forEach((l, y) => l.forEach((gid, x) => gid !== 0 && !e.mapa.colisao[y][x] && livres.push({ x, y })));
      let p = posicaoCentralizadaNoTile(livres[0].x, livres[0].y, g);
      for (let i = 0; i < 3000; i++) {
        p = e.andar(p, direcoes[sorteio(4)], 1 + sorteio(3));
        if (!posicaoValida(e, p)) throw new Error(`${id}: posição inválida (${p.x}, ${p.y}) no passo ${i}`);
      }
    }
  });

  it('parede reta (sem folga de até 8 px) segue barrando: nada de deslize', () => {
    const e = ambiente('sala');
    const p = posicaoCentralizadaNoTile(2, 7, g);
    const fim = empurrar(e, p, 'baixo', 80);
    expect(tileDosPes(fim).y).toBeLessThanOrEqual(8);
    expect(posicaoValida(e, fim)).toBe(true);
  });

  it('uma abertura mais estreita que a caixa (menos de 24 px) não deixa passar', () => {
    // Tiles de 32 com parede dos dois lados de uma passagem de 32 px: a caixa de 24 px passa; um estreitamento artificial de 1 tile
    // com os pés a 9 px do centro (fora da assistência de 8 px) não é puxado.
    const m = mapaDeTexto('c', ['+-+-+-+', '|.|.|.|', '+ + + +', '|.|.|.|', '+-+-+-+']);
    const col = new ColisaoDoMapa(bloqueiosDaSubarea(m, () => true), m.paredes);
    const centro = posicaoCentralizadaNoTile(1, 1, g);
    let p: Posicao = { x: centro.x + 13, y: centro.y };
    for (let i = 0; i < 60; i++) p = mover(p, 'baixo', 2, col.bloqueado, g, col.parede, QUINA);
    expect(Math.floor((p.y + g.pes.dy + g.pes.h / 2) / T)).toBeLessThanOrEqual(1);
  });
});
