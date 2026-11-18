import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ColisaoDoMapa, geometriaDoSobrinho, mover, posicaoCentralizadaNoTile, type Direcao } from '../../src/application/mundo/movimento';
import { bloqueiosDaSubarea } from '../../src/application/mundo/subarea';
import { alvoDoA, TIPOS_INTERATIVOS } from '../../src/application/mundo/nick/alvoDoA';
import { espinhosoContra, espinhososDe } from '../../src/application/mundo/espinhoso';
import { vizinhosLivresAlcancaveis } from '../../src/application/content/pontosDePartida';
import { objetosDoTipo, type ObjetoDoMapa } from '../../src/application/content/Mapa';
import { areasReais, entradaReal } from '../helpers/areasReais';

/** Bugs do QA da 1.2.0 (BUG-120-01 e BUG-120-02, e o A sobre o cacto). Conteúdo real e movimento do domínio. */
const { todos } = areasReais();
const perfil = entradaReal().perfil;
const g = geometriaDoSobrinho(perfil);
const T = perfil.tile;

function ambiente(id: string) {
  const mapa = todos.get(id)!;
  const col = new ColisaoDoMapa(bloqueiosDaSubarea(mapa, () => true), mapa.paredes);
  return { mapa, col, andar: (p: { x: number; y: number }, d: Direcao, n: number) => mover(p, d, n, col.bloqueado, g, col.parede) };
}
const tileDosPes = (p: { x: number; y: number }) => ({ x: Math.floor((p.x + g.quadro.w / 2) / T), y: Math.floor((p.y + g.pes.dy + g.pes.h / 2) / T) });

describe('BUG-120-02: a passagem de 2 tiles da Cozinha para a Lavanderia (colunas 3 e 4, linhas 2 e 3)', () => {
  const { mapa, andar } = ambiente('cozinha');

  it.each([3, 4])('o sobrinho atravessa em x = %i, de (x, 2) até a linha 3 ou além, com a caixa dos pés de 24 px', (x) => {
    let p = posicaoCentralizadaNoTile(x, 2, g);
    for (let i = 0; i < 80; i++) p = andar(p, 'baixo', 4);
    expect(tileDosPes(p).y).toBeGreaterThanOrEqual(3);
    expect(tileDosPes(p).x).toBe(x);
  });

  it.each([3, 4])('e volta, de (x, 3) até a linha 2', (x) => {
    let p = posicaoCentralizadaNoTile(x, 3, g);
    for (let i = 0; i < 80; i++) p = andar(p, 'cima', 4);
    expect(tileDosPes(p).y).toBeLessThanOrEqual(1);
  });

  it.each([2, 5])('em x = %i o muro e os móveis barram (o tile não é passagem)', (x) => {
    let p = posicaoCentralizadaNoTile(x, 2, g);
    for (let i = 0; i < 80; i++) p = andar(p, 'baixo', 4);
    expect(tileDosPes(p).y).toBeLessThanOrEqual(2);
  });

  it('os dados: as arestas entre as linhas 2 e 3 estão abertas só nas colunas 3 e 4', () => {
    const abertas = [0, 1, 2, 3, 4, 5].filter((x) => (mapa.paredes[2][x] & 4) === 0 && (mapa.paredes[3][x] & 1) === 0 && !mapa.colisao[2][x] && !mapa.colisao[3][x]);
    expect(abertas).toEqual([3, 4]);
  });

  it('a passagem termina na porta `cozinha-quartinho` em (3, 4): empurrar para baixo ali é a porta (fechada fora do modo de QA), não um "teletransporte" para (0, 0)', () => {
    const porta = objetosDoTipo(mapa, 'porta').find((o) => o.dados.id === 'cozinha-quartinho')!;
    expect({ x: porta.x, y: porta.y, lado: porta.dados.lado }).toEqual({ x: 3, y: 4, lado: 'baixo' });
    // O Quartinho recebe quem entra em (0, 0): é de lá que vem o "(0, 0)" visto pelo QA com as áreas abertas.
    const chegada = todos.get('quartinho')!.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === 'cozinha-quartinho')!;
    expect([chegada.x, chegada.y]).toEqual([0, 0]);
  });
});

describe('BUG-120-01: o A nas meias de Natal do Escritório', () => {
  const decoracao = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'maps', 'decoracao', 'escritorio.json'), 'utf-8')) as { enfeites: { id: string; x: number; y: number; examinar: string | null }[] };
  const escritorio = todos.get('escritorio')!;
  const meias = decoracao.enfeites.find((e) => e.id === 'escritorio_meias_1')!;

  it('as meias ficam num tile de cama com vizinho livre alcançável, e (6, 4) nem é piso', () => {
    expect([meias.x, meias.y]).toEqual([5, 3]);
    expect(escritorio.colisao[3][5]).toBe(true);
    expect(vizinhosLivresAlcancaveis(escritorio, 5, 3)).toEqual([{ x: 4, y: 3 }]);
    expect(escritorio.chao[4][6]).toBe(0);
  });

  it('todo enfeite examinável em tile bloqueado tem vizinho livre alcançável (E10), nas 5 áreas do modo', () => {
    for (const id of ['hall', 'sala', 'cozinha', 'quarto', 'escritorio']) {
      const area = todos.get(id)!;
      const dec = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'maps', 'decoracao', `${id}.json`), 'utf-8')) as typeof decoracao;
      for (const e of dec.enfeites.filter((x) => x.examinar !== null && area.colisao[x.y][x.x])) {
        expect(vizinhosLivresAlcancaveis(area, e.x, e.y).length, `${id}/${e.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('de (4, 3), virado para a direita, o A acha as meias; de (6, 4) (fora do piso) não há como ler', () => {
    const { col } = ambiente('escritorio');
    const objeto: ObjetoDoMapa = { tipo: 'examinavel', x: meias.x, y: meias.y, dados: { texto: meias.examinar!, nome: meias.id } };
    const parede = col.parede;
    const achado = alvoDoA([objeto], undefined, posicaoCentralizadaNoTile(4, 3, g), 'direita', g, parede);
    expect(achado).toEqual({ tipo: 'objeto', objeto });
  });
});

describe('A sobre o cacto: não faz nada nem trava o controle', () => {
  it('o móvel não está entre os objetos que respondem ao A; o alvo do A de frente para o cacto é vazio', () => {
    expect(TIPOS_INTERATIVOS.has('movel')).toBe(false);
    const sala = todos.get('sala')!;
    const interativos = sala.objetos.filter((o) => TIPOS_INTERATIVOS.has(o.tipo));
    expect(interativos.some((o) => o.tipo === 'movel')).toBe(false);
    const { col } = ambiente('sala');
    // (1, 3), olhando para a esquerda, de frente para o cacto (0, 3).
    expect(alvoDoA(interativos, undefined, posicaoCentralizadaNoTile(1, 3, g), 'esquerda', g, col.parede)).toBeUndefined();
  });

  it('o empurrão é só por andar contra: parado, encostado ao cacto, nada dispara; o A não é lido pelo empurrão', () => {
    const sala = todos.get('sala')!;
    const esp = espinhososDe(sala.objetos);
    expect(esp).toEqual([{ x: 0, y: 3, w: 1, h: 1 }]);
    // `espinhosoContra` só é consultado depois de um movimento (CasaScene.mover); sem direção empurrada ele não é chamado.
    const { col, andar } = ambiente('sala');
    let p = posicaoCentralizadaNoTile(1, 3, g);
    for (let i = 0; i < 40; i++) p = andar(p, 'esquerda', 1);
    expect(espinhosoContra(p, 'esquerda', g, esp)).toBe(true);
    expect(espinhosoContra(p, 'baixo', g, esp)).toBe(false);
    void col;
  });
});
