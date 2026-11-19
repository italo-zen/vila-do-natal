import { describe, expect, it } from 'vitest';
import {
  chaveDaPeca,
  chaveDoVidro,
  ehVidro,
  classificarArestas,
  extensaoDoMovel,
  limiteDeExtensao,
  pisoCobertoPelaFace,
  profundidadeDaAresta,
  profundidadeDoMovel,
  profundidadeDoPersonagem,
  recuoVertical,
  retanguloDaAresta,
} from '../../src/application/mundo/vista';
import { validarVista } from '../../src/application/arte/validarPerfilDeArte';
import type { PerfilDeArte, VistaDoPerfil } from '../../src/application/arte/PerfilDeArte';
import { areasReais, entradaReal } from '../helpers/areasReais';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validarVistaDaArte, type VistaDaArte } from '../../src/application/arte/VistaDaArte';
import { chavesDaParede } from '../../src/presentation/scenes/desenhoDaVista';
import { chegada, mapaDeTexto, porta } from '../helpers/mapasDeArestas';

/**
 * Visão 3/4 (ADR-012 seções 3, 4 e 6): classificação das arestas, a face nunca cobre piso, recuo vertical e profundidade.
 * Só funções puras sobre o mapa e o perfil. Nenhum número de arte aqui: tudo vem de `perfil.vista` do HD.
 */
const perfil = entradaReal().perfil;
const vista = perfil.vista as VistaDoPerfil;
const T = perfil.tile;
const { todos } = areasReais();

/** Sala 3×2 fechada. Cima: face; laterais: linha; baixo: nada. */
const SALA_3X2 = ['+-+-+-+', '|. . .|', '+ + + +', '|. . .|', '+-+-+-+'];

const contar = (tipo: string, m = todos) => [...m.values()].reduce((n, a) => n + classificarArestas(a).filter((x) => x.tipo === tipo).length, 0);

describe('o perfil HD tem o bloco vista (ADR-012 seção 2)', () => {
  it('constantes do perfil, validadas', () => {
    expect(vista).toMatchObject({ tipo: '3-4', faceNorte: 32, linhaLateral: 8, sombra: { dx: 6, dy: 6 }, recuoMaximo: 16 });
    expect(validarVista(vista, T)).toEqual([]);
    expect(perfil.barra.alturaPorLinhas['2']).toBe(48);
  });

  it('o validador recusa números fora das regras', () => {
    const ruim = (parcial: Record<string, unknown>) => validarVista({ ...vista, ...parcial }, T).join(' ');
    expect(ruim({ faceNorte: 12 })).toMatch(/múltiplo de 8/);
    expect(ruim({ faceNorte: 40 })).toMatch(/não pode passar do tile/);
    expect(ruim({ recuoMaximo: 40 })).toMatch(/recuoMaximo não pode passar/);
    expect(ruim({ linhaLateral: -1 })).toMatch(/linhaLateral precisa ser um inteiro ≥ 0/);
    expect(ruim({ sombra: { dx: 1.5, dy: 6 } })).toMatch(/sombra.dx/);
    expect(ruim({ tipo: 'topo' })).toMatch(/vista.tipo/);
    expect(ruim({ extensaoEmPisoAndavel: 40 })).toMatch(/extensaoEmPisoAndavel não pode passar/);
    expect(ruim({ provisorio: { face: 'azul', linha: '#000000', sombra: '#000000', alfaSombra: 0.25 } })).toMatch(/provisorio/);
    expect(validarVista('x', T)).toEqual(['vista precisa ser um objeto.']);
  });
});

describe('classificação das arestas (ADR-012 seção 3.1)', () => {
  const mapa = mapaDeTexto('s', SALA_3X2);
  const arestas = classificarArestas(mapa);

  it('norte com vazio acima: face; leste e oeste: linha; sul: nada', () => {
    expect(arestas.filter((a) => a.tipo === 'face_norte').map((a) => [a.x, a.y])).toEqual([[0, 0], [1, 0], [2, 0]]);
    expect(arestas.filter((a) => a.tipo === 'linha_v').map((a) => [a.x, a.y])).toEqual([[0, 0], [3, 0], [0, 1], [3, 1]]);
    expect(arestas.some((a) => a.tipo === 'linha_h')).toBe(false);
    // A aresta sul (y = 2) existe nos bits, mas não é desenhada.
    expect(arestas.some((a) => a.y === 2 && a.tipo !== 'linha_v')).toBe(false);
  });

  it('peça pelos vizinhos: meio, ponta e ilha; linha com topo, meio e fim; sombra só com piso a leste', () => {
    const f = arestas.filter((a) => a.tipo === 'face_norte').map(chaveDaPeca);
    expect(f).toEqual(['face_norte_esquerda', 'face_norte_meio', 'face_norte_direita']);
    const v = arestas.filter((a) => a.tipo === 'linha_v').map(chaveDaPeca);
    // Oeste: topo com face (a face está no alto, ao leste), com sombra (piso a leste); leste: sem piso a leste.
    expect(v).toEqual(['linha_v_topo_com_face_sombra', 'linha_v_topo_com_face', 'linha_v_fim_sombra', 'linha_v_fim']);
    const ilha = classificarArestas(mapaDeTexto('i', ['+-+', '|.|', '+-+']));
    expect(ilha.filter((a) => a.tipo === 'face_norte').map(chaveDaPeca)).toEqual(['face_norte_ilha']);
  });

  it('a linha vertical que encontra uma face no alto sobe até o topo dela (32 px)', () => {
    const topo = arestas.find((a) => a.tipo === 'linha_v' && a.x === 0 && a.y === 0)!;
    expect(topo.topoComFace).toBe(true);
    const r = retanguloDaAresta(topo, T, vista);
    expect(r).toMatchObject({ x: -vista.linhaLateral / 2, y: -vista.faceNorte, h: T + vista.faceNorte });
    const baixo = arestas.find((a) => a.tipo === 'linha_v' && a.x === 0 && a.y === 1)!;
    expect(baixo.topoComFace).toBe(false);
    expect(retanguloDaAresta(baixo, T, vista).y).toBe(T);
  });

  it('muro interno (piso nos dois lados) é linha fina, sem face; as duas pontas e o meio são peças diferentes', () => {
    const m = mapaDeTexto('c', ['+-+-+-+-+', '|. . . .|', '+-+-+-+ +', '|. . . .|', '+-+-+-+-+']);
    const linhas = classificarArestas(m).filter((a) => a.tipo === 'linha_h');
    expect(linhas.map((a) => [a.x, a.y])).toEqual([[0, 1], [1, 1], [2, 1]]);
    expect(linhas.map(chaveDaPeca)).toEqual(['linha_h_esquerda', 'linha_h_meio', 'linha_h_direita']);
    // Só o muro de cima das áreas tem face; o interno não.
    expect(classificarArestas(m).filter((a) => a.tipo === 'face_norte').map((a) => a.y)).toEqual([0, 0, 0, 0]);
    expect(retanguloDaAresta(linhas[0], T, vista).h).toBe(vista.linhaLateral);
  });

  it('a porta usa a mesma classificação e leva o id (norte, lateral)', () => {
    const m = mapaDeTexto('p', ['+-+D+-+', '|. . .D', '+-+-+-+'], [porta('a-b', 1, 0, 'cima', 'b'), porta('a-c', 2, 0, 'direita', 'c'), chegada('x', 0, 0, 'baixo')]);
    const a = classificarArestas(m);
    expect(a.find((x) => x.tipo === 'face_norte' && x.x === 1)?.porta).toBe('a-b');
    expect(a.find((x) => x.tipo === 'linha_v' && x.x === 3)?.porta).toBe('a-c');
    expect(a.filter((x) => x.porta)).toHaveLength(2);
  });
});

describe('a face nunca cobre piso (ADR-012 seção 3.1), nas 9 áreas reais', () => {
  it.each([...todos.keys()])('%s', (id) => {
    expect(pisoCobertoPelaFace(todos.get(id)!, T, vista)).toEqual([]);
  });

  it('detecta o erro quando uma face maior cairia sobre piso (piso, um tile vazio, piso)', () => {
    const separado = mapaDeTexto('e', ['+-+', '|.|', '+ +', '| |', '+ +', '|.|', '+-+']);
    expect(pisoCobertoPelaFace(separado, T, vista)).toEqual([]);
    expect(pisoCobertoPelaFace(separado, T, { ...vista, faceNorte: 2 * T })).toEqual([{ x: 0, y: 0 }]);
  });

  it('contagens sobre o content real (a Arte desenha só estas peças)', () => {
    expect(contar('face_norte')).toBe(48);
    expect(contar('linha_h')).toBe(4);
    expect(contar('linha_v')).toBe(84);
    const pecas = new Set([...todos.values()].flatMap((a) => classificarArestas(a).map(chaveDaPeca)));
    expect(pecas.size).toBe(17);
  });
});

describe('recuo vertical (ADR-012 seção 4)', () => {
  it('só a Sala recua, 16 px; as outras 8 áreas, 0', () => {
    for (const [id, area] of todos) expect(recuoVertical(area, perfil), id).toBe(id === 'sala' ? 16 : 0);
  });

  it('sem o bloco vista, nenhuma área recua (desenho de hoje)', () => {
    const sem = { ...perfil, vista: undefined } as PerfilDeArte;
    for (const area of todos.values()) expect(recuoVertical(area, sem)).toBe(0);
  });

  it('o recuo respeita a folga sob a barra e recuoMaximo', () => {
    const sala = todos.get('sala')!;
    // Barra de 56 px (antes da opção A): folga de 8 px, e o recuo cai para 8.
    const barra56 = { ...perfil, barra: { ...perfil.barra, alturaPorLinhas: { ...perfil.barra.alturaPorLinhas, '2': 56 } } } as PerfilDeArte;
    expect(recuoVertical(sala, barra56)).toBe(8);
    // recuoMaximo menor limita.
    const curto = { ...perfil, vista: { ...vista, recuoMaximo: 8 } } as PerfilDeArte;
    expect(recuoVertical(sala, curto)).toBe(8);
    // Sem folga alguma (barra de 64 px), não recua.
    const barra64 = { ...perfil, barra: { ...perfil.barra, alturaPorLinhas: { ...perfil.barra.alturaPorLinhas, '2': 64 } } } as PerfilDeArte;
    expect(recuoVertical(sala, barra64)).toBe(0);
  });

  it('uma área com espaço no alto (3 linhas livres) não recua', () => {
    expect(recuoVertical(mapaDeTexto('s', SALA_3X2), perfil)).toBe(0);
  });
});

describe('profundidade por base em px (ADR-012 seção 6)', () => {
  // Móvel 2×2 em (3, 3): base = (3 + 2) × 32 = 160. Personagem com quadro de 48 px e pés na base do tile.
  const baseDoMovel = profundidadeDoMovel(3, 2, T);

  it('ao norte do móvel, o personagem fica atrás; ao sul, na frente', () => {
    // Pés no tile (3, 2), logo ao norte: base do quadro = 3 × 32 = 96.
    expect(profundidadeDoPersonagem(3 * T - 48, 48)).toBeLessThan(baseDoMovel);
    // Pés no tile (3, 5), ao sul: base do quadro = 6 × 32 = 192.
    expect(profundidadeDoPersonagem(6 * T - 48, 48)).toBeGreaterThan(baseDoMovel);
  });

  it('empate: o personagem fica na frente', () => {
    expect(profundidadeDoPersonagem(baseDoMovel - 48, 48)).toBeGreaterThan(baseDoMovel);
  });

  it('face e sombra de parede ficam atrás de quem pisa na primeira linha; a linha horizontal vale aresta + 4', () => {
    const m = mapaDeTexto('s', SALA_3X2);
    const face = classificarArestas(m).find((a) => a.tipo === 'face_norte')!;
    expect(profundidadeDaAresta(face, T)).toBe(0);
    // Pés a 16 px da aresta (primeira linha): base do quadro = T → à frente da face.
    expect(profundidadeDoPersonagem(T - 48, 48)).toBeGreaterThan(profundidadeDaAresta(face, T));
    const muro = classificarArestas(mapaDeTexto('c', ['+-+-+', '|. .|', '+-+ +', '|. .|', '+-+-+'])).find((a) => a.tipo === 'linha_h')!;
    expect(profundidadeDaAresta(muro, T)).toBe(muro.y * T + 4);
  });

  it('a linha vertical vale a base do tile em que está; o móvel pela aresta sul da pegada', () => {
    const m = mapaDeTexto('s', SALA_3X2);
    const v = classificarArestas(m).find((a) => a.tipo === 'linha_v' && a.y === 1)!;
    expect(profundidadeDaAresta(v, T)).toBe(2 * T);
    expect(profundidadeDoMovel(0, 1, T)).toBe(T);
  });
});

describe('extensão do móvel (ADR-012 seções 5.1 e 5.3)', () => {
  it('E = altura do PNG − sombra − h × tile; o limite cai para 24 com piso andável ao norte', () => {
    // Geladeira 1×1 com H = 64 (E = 32): PNG de 64 + 6 = 70 de altura.
    expect(extensaoDoMovel(70, 1, T, vista)).toBe(32);
    expect(extensaoDoMovel(38, 1, T, vista)).toBe(0);
    expect(limiteDeExtensao(false, vista)).toBe(32);
    expect(limiteDeExtensao(true, vista)).toBe(24);
  });
});

describe('vidro da Sala (vista.json): só desenho, sem mudar a colisão', () => {
  const raiz = join(__dirname, '..', '..', 'assets', 'hd-480x352');
  const bruto = JSON.parse(readFileSync(join(raiz, 'vista.json'), 'utf-8'));
  const nomes = new Set((JSON.parse(readFileSync(join(raiz, 'sprites.json'), 'utf-8')) as { imagens: { arquivo: string }[] }).imagens.map((i) => i.arquivo));
  const r = validarVistaDaArte(bruto);
  const vista = (r.ok ? r.vista : {}) as VistaDaArte;

  it('o vista.json real é válido e tem o vidro da Sala em x = 0, y de 3 a 8', () => {
    expect(r.ok).toBe(true);
    expect(vista.vidro?.sala?.filter((v) => v.tipo === 'linha_v').map((v) => [v.x, v.y])).toEqual([[0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8]]);
    // 1.2.3: a quina do cacto também tem vidro na face norte, em (0, 3) e (1, 3).
    expect(vista.vidro?.sala?.filter((v) => v.tipo === 'face_norte').map((v) => [v.x, v.y])).toEqual([[0, 3], [1, 3]]);
  });

  it('toda aresta de vidro é uma linha vertical da Sala e a peça de vidro existe no sprites.json', () => {
    const sala = todos.get('sala')!;
    const arestas = classificarArestas(sala);
    for (const v of vista.vidro!.sala) {
      const a = arestas.find((x) => x.tipo === v.tipo && x.x === v.x && x.y === v.y);
      expect(a, `(${v.tipo} ${v.x}, ${v.y})`).toBeDefined();
      expect(ehVidro(a!, vista.vidro!.sala)).toBe(true);
      expect(nomes.has(`${chaveDoVidro(a!)}.png`), chaveDoVidro(a!)).toBe(true);
    }
  });

  it('mapeamento: a mesma peça da linha vertical, com o prefixo spr_parede_vidro_ e o fallback na peça normal', () => {
    const m = mapaDeTexto('s', ['+-+-+', '|. .|', '+ + +', '|. .|', '+-+-+']);
    const esq = classificarArestas(m).filter((a) => a.tipo === 'linha_v' && a.x === 0);
    expect(esq.map(chaveDaPeca)).toEqual(['linha_v_topo_com_face_sombra', 'linha_v_fim_sombra']);
    expect(esq.map((a) => chaveDoVidro(a))).toEqual(['spr_parede_vidro_topo_com_face_sombra', 'spr_parede_vidro_fim_sombra']);
    expect(chavesDaParede(esq[1], true)).toEqual(['spr_parede_vidro_fim_sombra', 'spr_parede_linha_v_fim_sombra', 'spr_parede_linha_v']);
    expect(chavesDaParede(esq[1], false)).toEqual(['spr_parede_linha_v_fim_sombra', 'spr_parede_linha_v']);
    // Linha horizontal interna não tem vidro.
    const interna = classificarArestas(mapaDeTexto('c', ['+-+-+', '|. .|', '+-+ +', '|. .|', '+-+-+'])).find((a) => a.tipo === 'linha_h')!;
    expect(chaveDoVidro(interna)).toBeUndefined();
    expect(ehVidro(interna, [{ tipo: 'face_norte', x: interna.x, y: interna.y }])).toBe(false);
  });

  it('arteDeParede: o mural de fotos da Sala em (9, 4), lado cima, fica na aresta norte de um tile de piso, com âncora (14, 23) no sprites.json', () => {
    expect(r.ok).toBe(true);
    const lista = vista.arteDeParede?.sala;
    expect(lista).toEqual([{ sprite: 'spr_mural_de_fotos', x: 9, y: 4, lado: 'cima' }]);
    const sala = todos.get('sala')!;
    expect(sala.chao[4][9]).not.toBe(0);
    // A aresta norte do tile é face (vazio acima): o mural fica sobre ela, sem mudar a colisão.
    expect(classificarArestas(sala).some((a) => a.tipo === 'face_norte' && a.x === 9 && a.y === 4)).toBe(true);
    const img = (JSON.parse(readFileSync(join(raiz, 'sprites.json'), 'utf-8')) as { imagens: { arquivo: string; ancora?: { x: number; y: number } }[] }).imagens.find((i) => i.arquivo === 'spr_mural_de_fotos.png');
    expect(img?.ancora).toEqual({ x: 14, y: 23 });
    // Posição pela âncora: x = tile × 32 + 16 − 14; y = tile × 32 − 23.
    expect({ x: 9 * 32 + 16 - img!.ancora!.x, y: 4 * 32 - img!.ancora!.y }).toEqual({ x: 290, y: 105 });
  });

  it('vidro e arteDeParede valem para TODAS as áreas do vista.json, não só a Sala (1.2.2)', () => {
    expect(Object.keys(vista.vidro ?? {}).sort()).toEqual(['cozinha', 'sala']);
    expect(Object.keys(vista.arteDeParede ?? {}).sort()).toEqual(['escritorio', 'quarto', 'quarto_casal', 'sala']);
    const imagens = (JSON.parse(readFileSync(join(raiz, 'sprites.json'), 'utf-8')) as { imagens: { arquivo: string; ancora?: unknown }[] }).imagens;
    for (const [area, lista] of Object.entries(vista.vidro ?? {})) {
      const arestas = classificarArestas(todos.get(area)!);
      for (const v of lista) {
        const a = arestas.find((x) => x.tipo === v.tipo && x.x === v.x && x.y === v.y);
        expect(a, `vidro ${area} (${v.x}, ${v.y})`).toBeDefined();
        expect(nomes.has(`${chaveDoVidro(a!)}.png`), `${area}: ${chaveDoVidro(a!)}`).toBe(true);
      }
    }
    for (const [area, lista] of Object.entries(vista.arteDeParede ?? {})) {
      const mapa = todos.get(area)!;
      const arestas = classificarArestas(mapa);
      for (const a of lista) {
        expect(mapa.chao[a.y][a.x], `${area} ${a.sprite} (${a.x}, ${a.y}) em piso`).not.toBe(0);
        // Lado cima: a aresta norte do tile é face de parede (vazio acima), onde o quadro fica preso.
        expect(arestas.some((e) => e.tipo === 'face_norte' && e.x === a.x && e.y === a.y), `${area} ${a.sprite}`).toBe(true);
        expect(imagens.find((i) => i.arquivo === `${a.sprite}.png`)?.ancora, `${a.sprite} com âncora`).toBeDefined();
      }
    }
  });

  it('vidro na face norte (1.2.3): mapeamento spr_parede_vidro_face_<posição> com fallback na face normal', () => {
    const m = mapaDeTexto('s', ['+-+-+-+', '|. . .|', '+-+-+-+']);
    const faces = classificarArestas(m).filter((a) => a.tipo === 'face_norte');
    expect(faces.map((a) => chaveDoVidro(a))).toEqual(['spr_parede_vidro_face_esquerda', 'spr_parede_vidro_face_meio', 'spr_parede_vidro_face_direita']);
    expect(chavesDaParede(faces[1], true)).toEqual(['spr_parede_vidro_face_meio', 'spr_parede_face_norte_meio', 'spr_parede_face_norte']);
    expect(chavesDaParede(faces[1], false)).toEqual(['spr_parede_face_norte_meio', 'spr_parede_face_norte']);
    const lista = [{ tipo: 'face_norte', x: 1, y: 0 }];
    expect(faces.map((a) => ehVidro(a, lista))).toEqual([false, true, false]);
    // `face_norte` na lista não vira vidro de uma linha vertical de mesmas coordenadas, e vice-versa.
    const v = classificarArestas(m).find((a) => a.tipo === 'linha_v' && a.x === 1 && a.y === 0);
    expect(v === undefined || !ehVidro(v, lista)).toBe(true);
    expect(ehVidro(faces[1], [{ tipo: 'linha_v', x: 1, y: 0 }])).toBe(false);
  });

  it('arteDeParede mal formada é recusada', () => {
    const base = { schemaVersion: 1 };
    expect(validarVistaDaArte({ ...base, arteDeParede: { sala: [{ sprite: 'spr_x', x: 1, y: 1, lado: 'cima' }] } }).ok).toBe(true);
    for (const ruim of [{ sprite: 'x', x: 1, y: 1, lado: 'cima' }, { sprite: 'spr_x', x: -1, y: 1, lado: 'cima' }, { sprite: 'spr_x', x: 1, y: 1, lado: 'norte' }, { sprite: 'spr_x', x: 1.5, y: 1, lado: 'cima' }]) {
      expect(validarVistaDaArte({ ...base, arteDeParede: { sala: [ruim] } }).ok, JSON.stringify(ruim)).toBe(false);
    }
    expect(validarVistaDaArte({ ...base, arteDeParede: [] }).ok).toBe(false);
    expect(validarVistaDaArte({ ...base, arteDeParede: { sala: 'x' } }).ok).toBe(false);
  });

  it('o vista.json mal formado é recusado', () => {
    expect(validarVistaDaArte({ schemaVersion: 2 }).ok).toBe(false);
    expect(validarVistaDaArte({ schemaVersion: 1, vidro: { sala: [{ tipo: 'linha_h', x: 0, y: 0 }] } }).ok).toBe(false);
    expect(validarVistaDaArte({ schemaVersion: 1, vidro: { sala: [{ tipo: 'face_norte', x: 0, y: 3 }] } }).ok).toBe(true);
    expect(validarVistaDaArte({ schemaVersion: 1, vidro: { sala: 'x' } }).ok).toBe(false);
    expect(validarVistaDaArte({ schemaVersion: 1 }).ok).toBe(true);
  });
});
