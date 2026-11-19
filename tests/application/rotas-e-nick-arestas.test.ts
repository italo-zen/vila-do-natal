import { describe, expect, it } from 'vitest';
import { calcularRotaDeConducao } from '../../src/application/mundo/conducao';
import { arestaAberta, passosEntreTiles } from '../../src/application/mundo/arestas';
import { fatorDaConducao } from '../../src/domain/progresso/Conducao';
import { Nick } from '../../src/domain/nick/Nick';
import { ehVizinho, tile } from '../../src/domain/shared/Tile';
import { portaASeguir } from '../../src/application/mundo/nick/portaASeguir';
import { alvoDaInteracao, geometriaDoSobrinho, posicaoCentralizadaNoTile } from '../../src/application/mundo/movimento';
import { CONTEXTO_PADRAO, type ContextoDeArea } from '../../src/application/mundo/subarea';
import { validarNick } from '../../src/application/content/validarNick';
import { Textos } from '../../src/application/content/Textos';
import type { MissaoCarregada } from '../../src/application/mundo/missoes';
import type { MapaDoJogo } from '../../src/application/content/Mapa';
import { entradaReal } from '../helpers/areasReais';
import { chegada, mapaDeTexto, objeto, porta } from '../helpers/mapasDeArestas';

/** M7 (rota e condução), M8 (Nick) e M10 (farejar) do ADR-011 seção 8, com áreas escritas à mão. */

const sempre = () => true;
const mapasDe = (...ms: MapaDoJogo[]) => new Map(ms.map((m) => [m.id, m]));

describe('M7: rota e condução respeitam as arestas e as portas (ADR-011 seção 5.3)', () => {
  it('a rota contorna a parede e o custo é o do caminho aberto', () => {
    // 3×2 com parede só entre (0,0) e (1,0): ir de (0,0) a (2,0) exige descer, andar até x = 1 e subir.
    const a = mapaDeTexto('a', ['+-+-+-+', '|.|. .|', '+ + + +', '|. . .|', '+-+-+-+']);
    const r = calcularRotaDeConducao(mapasDe(a), { mapa: 'a', x: 0, y: 0 }, { mapa: 'a', x: 2, y: 0 }, sempre);
    expect(r?.passos).toBe(4);
    expect(r!.nos.map((n) => `${n.x},${n.y}`)).toEqual(['0,0', '0,1', '1,1', '1,0', '2,0']);
    // Cada passo do caminho cruza uma aresta aberta.
    for (let i = 1; i < r!.nos.length; i++) {
      const [p, q] = [r!.nos[i - 1], r!.nos[i]];
      const lado = q.x > p.x ? 'direita' : q.x < p.x ? 'esquerda' : q.y > p.y ? 'baixo' : 'cima';
      expect(arestaAberta(a.paredes, p.x, p.y, lado)).toBe(true);
    }
  });

  it('sem passagem aberta não há rota (devolve null, e a validação acusa erro de conteúdo)', () => {
    const a = mapaDeTexto('a', ['+-+-+', '|.|.|', '+-+-+']);
    expect(calcularRotaDeConducao(mapasDe(a), { mapa: 'a', x: 0, y: 0 }, { mapa: 'a', x: 1, y: 0 }, sempre)).toBeNull();
  });

  it('desempate: cima, baixo, esquerda, direita, sempre a mesma rota', () => {
    const a = mapaDeTexto('a', ['+-+-+', '|. .|', '+ + +', '|. .|', '+-+-+']);
    const rota = () => calcularRotaDeConducao(mapasDe(a), { mapa: 'a', x: 0, y: 0 }, { mapa: 'a', x: 1, y: 1 }, sempre)!.nos.map((n) => `${n.x},${n.y}`);
    expect(rota()).toEqual(['0,0', '0,1', '1,1']);
    expect(rota()).toEqual(rota());
  });

  describe('portas', () => {
    const A = mapaDeTexto('a', ['+-+-+-+-+-+', '|. . . . D', '+-+-+-+-+-+'], [porta('a-b', 4, 0, 'direita', 'b'), chegada('b-a', 4, 0, 'esquerda')]);
    const B = mapaDeTexto('b', ['+-+-+-+-+-+', 'D. . . . .|', '+-+-+-+-+-+'], [porta('a-b', 0, 0, 'esquerda', 'a'), chegada('a-b', 0, 0, 'direita')]);
    const mapas = mapasDe(A, B);

    it('de tile da porta a tile da porta custa 1, sem vão nem gatilho', () => {
      const r = calcularRotaDeConducao(mapas, { mapa: 'a', x: 4, y: 0 }, { mapa: 'b', x: 0, y: 0 }, sempre);
      expect(r?.passos).toBe(1);
      expect(r!.nos).toEqual([{ mapa: 'a', x: 4, y: 0 }, { mapa: 'b', x: 0, y: 0, spawn: 'a-b' }]);
    });

    it('a travessia no meio da rota é um nó de outra área (o fade acontece ali) e a rota continua', () => {
      const r = calcularRotaDeConducao(mapas, { mapa: 'a', x: 2, y: 0 }, { mapa: 'b', x: 2, y: 0 }, sempre)!;
      expect(r.passos).toBe(2 + 1 + 2);
      const i = r.nos.findIndex((n) => n.mapa === 'b');
      expect(r.nos[i].spawn).toBe('a-b');
      expect(r.nos.slice(i).every((n) => n.mapa === 'b')).toBe(true);
      expect(r.nos).toHaveLength(6);
    });

    it('11 passos pedem 2× (limiar do GDD 14.11.3), 10 não', () => {
      // 5 passos em A até a porta, 1 da porta e 5 em B = 11. Com 4 em B são 10.
      const r11 = calcularRotaDeConducao(mapas, { mapa: 'a', x: 0, y: 0 }, { mapa: 'b', x: 4, y: 0 }, sempre)!;
      expect(r11.passos).toBe(4 + 1 + 4);
      const longo = mapaDeTexto('b', ['+-+-+-+-+-+-+-+', 'D. . . . . . .|', '+-+-+-+-+-+-+-+'], [porta('a-b', 0, 0, 'esquerda', 'a'), chegada('a-b', 0, 0, 'direita')]);
      const r = calcularRotaDeConducao(mapasDe(A, longo), { mapa: 'a', x: 0, y: 0 }, { mapa: 'b', x: 6, y: 0 }, sempre)!;
      expect(r.passos).toBe(4 + 1 + 6);
      expect(fatorDaConducao(r.passos)).toBe(2);
      const r10 = calcularRotaDeConducao(mapasDe(A, longo), { mapa: 'a', x: 1, y: 0 }, { mapa: 'b', x: 6, y: 0 }, sempre)!;
      expect(r10.passos).toBe(3 + 1 + 6);
      expect(fatorDaConducao(r10.passos)).toBe(1);
    });

    it('porta fechada (área fora de `maps`) e porta com código não deixam passar', () => {
      const so = (id: string): ContextoDeArea => ({ ...CONTEXTO_PADRAO, areaAberta: (x) => x === id });
      expect(calcularRotaDeConducao(mapas, { mapa: 'a', x: 0, y: 0 }, { mapa: 'b', x: 2, y: 0 }, sempre, so('a'))).toBeNull();
      const comCodigo = mapasDe(
        mapaDeTexto('a', ['+-+-+-+-+-+', '|. . . . D', '+-+-+-+-+-+'], [porta('a-b', 4, 0, 'direita', 'b', { trancadaAte: 'porta' })]),
        B,
      );
      expect(calcularRotaDeConducao(comCodigo, { mapa: 'a', x: 0, y: 0 }, { mapa: 'b', x: 2, y: 0 }, () => false)).toBeNull();
      expect(calcularRotaDeConducao(comCodigo, { mapa: 'a', x: 0, y: 0 }, { mapa: 'b', x: 2, y: 0 }, () => true)).not.toBeNull();
    });
  });

  it('a peça visível e o Nick dormindo bloqueiam o tile; escondida, não', () => {
    const corredor = mapaDeTexto('a', ['+-+-+-+', '|. . .|', '+-+-+-+'], [objeto('peca', 1, 0, { ordem: 1 })]);
    const peca = (estado: 'visivel' | 'escondida'): ContextoDeArea => ({ ...CONTEXTO_PADRAO, estadoDaPeca: () => estado });
    expect(calcularRotaDeConducao(mapasDe(corredor), { mapa: 'a', x: 0, y: 0 }, { mapa: 'a', x: 2, y: 0 }, sempre, peca('visivel'))).toBeNull();
    expect(calcularRotaDeConducao(mapasDe(corredor), { mapa: 'a', x: 0, y: 0 }, { mapa: 'a', x: 2, y: 0 }, sempre, peca('escondida'))?.passos).toBe(2);
    // O Nick dormindo vira `colisao` na cópia do mapa (N009): a rota some.
    const comNick = { ...corredor, objetos: [], colisao: [[false, true, false]] };
    expect(calcularRotaDeConducao(mapasDe(comNick), { mapa: 'a', x: 0, y: 0 }, { mapa: 'a', x: 2, y: 0 }, sempre)).toBeNull();
  });
});

describe('M8: o Nick (ADR-011 seção 5.4)', () => {
  it('a fila só registra passos entre tiles vizinhos de aresta aberta: passeio aleatório com paredes', () => {
    // 4×3 com paredes internas; o sobrinho dá passos aleatórios válidos (só por arestas abertas) e, às vezes, na diagonal.
    const m = mapaDeTexto('a', ['+-+-+-+-+', '|. .|. .|', '+ +-+ + +', '|. . . .|', '+ + +-+ +', '|. .|. .|', '+-+-+-+-+']);
    let semente = 12345;
    const aleatorio = (n: number) => {
      semente = (semente * 1103515245 + 12345) & 0x7fffffff;
      return semente % n;
    };
    const visitados = new Set<string>(['0,0']);
    let sobrinho = { x: 0, y: 0 };
    const nick = Nick.dormindoEm(tile('a', 0, 0), 'baixo');
    nick.acordar(tile('a', 0, 0));
    for (let i = 0; i < 400; i++) {
      // Próximo tile: vizinho aberto ou, a cada 5 passos, um tile na diagonal alcançável por uma volta aberta.
      const lados = [['cima', 0, -1], ['baixo', 0, 1], ['esquerda', -1, 0], ['direita', 1, 0]] as const;
      const abertos = lados.filter(([l]) => arestaAberta(m.paredes, sobrinho.x, sobrinho.y, l)).map(([, dx, dy]) => ({ x: sobrinho.x + dx, y: sobrinho.y + dy }));
      let proximo = abertos[aleatorio(abertos.length)];
      if (i % 5 === 0) {
        const diag = { x: sobrinho.x + (aleatorio(2) ? 1 : -1), y: sobrinho.y + (aleatorio(2) ? 1 : -1) };
        if (m.chao[diag.y]?.[diag.x] && passosEntreTiles(m.paredes, sobrinho, diag).length === 2) proximo = diag;
      }
      for (const passo of passosEntreTiles(m.paredes, sobrinho, proximo)) {
        const antes = nick.tile;
        const mov = nick.registrarPasso(tile('a', passo.x, passo.y), 'baixo');
        visitados.add(`${passo.x},${passo.y}`);
        if (mov.tipo === 'andou') {
          expect(ehVizinho(antes, mov.para)).toBe(true);
          const lado = mov.para.x > antes.x ? 'direita' : mov.para.x < antes.x ? 'esquerda' : mov.para.y > antes.y ? 'baixo' : 'cima';
          expect(arestaAberta(m.paredes, antes.x, antes.y, lado), `passo ${i}`).toBe(true);
        }
        // O Nick só ocupa tiles por onde o sobrinho passou.
        expect(visitados.has(`${nick.tile.x},${nick.tile.y}`)).toBe(true);
      }
      sobrinho = proximo;
    }
  });

  it('mudança na diagonal vira o passo intermediário de arestas abertas; sem intermediário aberto, só o destino', () => {
    const livre = mapaDeTexto('a', ['+-+-+', '|. .|', '+ + +', '|. .|', '+-+-+']).paredes;
    expect(passosEntreTiles(livre, { x: 0, y: 0 }, { x: 1, y: 1 })).toHaveLength(2);
    const fechado = mapaDeTexto('a', ['+-+-+', '|.|.|', '+-+-+', '|.|.|', '+-+-+']).paredes;
    expect(passosEntreTiles(fechado, { x: 0, y: 0 }, { x: 1, y: 1 })).toEqual([{ x: 1, y: 1 }]);
  });

  it('seguir atravessa a porta: oculto na chegada e aparece no primeiro passo', () => {
    const nick = Nick.dormindoEm(tile('a', 4, 0), 'baixo');
    nick.acordar(tile('a', 3, 0));
    // O sobrinho passa pela porta e chega ao tile da porta de B (0, 0).
    nick.entrarNaArea(tile('b', 0, 0), 'direita');
    expect(nick.oculto).toBe(true);
    expect(nick.tile).toEqual(tile('b', 0, 0));
    const mov = nick.registrarPasso(tile('b', 1, 0), 'direita');
    expect(mov.tipo).toBe('saltou'); // aparece no tile da chegada
    expect(nick.oculto).toBe(false);
    expect(nick.tile).toEqual(tile('b', 0, 0));
    // Dali em diante, segue o sobrinho 1 tile atrás.
    nick.registrarPasso(tile('b', 2, 0), 'direita');
    expect(nick.tile).toEqual(tile('b', 1, 0));
  });

  describe('N005, N007 e N009 com arestas', () => {
    const base = (dorme: { x: number; y: number }, mapa: MapaDoJogo): string[] => {
      const missao: MissaoCarregada = {
        id: 'm',
        requires: [],
        maps: ['a'],
        final: false,
        missao: {
          id: 'm',
          inicio: { mapa: 'a', spawn: 'in', paginas: [] },
          conducao: { luzes: { mapa: 'a', x: 1, y: 1, direcao: 'baixo' } },
          conquistas: { luzes: 'x' },
          nick: { dorme: { mapa: 'a', ...dorme, direcao: 'baixo' }, alvo: 'a' },
          dica: {},
        },
      };
      return validarNick({ todos: mapasDe(mapa), missoes: [missao], textos: new Textos({}), perfil: entradaReal().perfil });
    };
    const com = (grade: string[], objs: MapaDoJogo['objetos'] = []) => mapaDeTexto('a', grade, [objeto('spawn', 0, 0, { nome: 'in', direcao: 'direita' }), ...objs]);

    it('N005: o tile de dormir não pode ser tile de porta', () => {
      const m = com(['+-+-+-+', '|. . .D', '+-+-+-+'], [porta('a-b', 2, 0, 'direita', 'b')]);
      expect(base({ x: 2, y: 0 }, m).join('\n')).toMatch(/N005.*sobre porta/);
    });

    it('N007: dois vizinhos livres só valem se a aresta está aberta', () => {
      // 3×2: o tile (1,1) tem 3 vizinhos livres; com parede dos dois lados, sobra o de cima.
      const aberto = com(['+-+-+-+', '|. . .|', '+ + + +', '|. . .|', '+-+-+-+']);
      expect(base({ x: 1, y: 1 }, aberto).join('\n')).not.toMatch(/N007/);
      const fechado = com(['+-+-+-+', '|. . .|', '+ + + +', '|.|.|.|', '+-+-+-+']);
      expect(base({ x: 1, y: 1 }, fechado).join('\n')).toMatch(/N007.*com 1 vizinho livre/);
    });

    it('N009: dormir num tile que é a única passagem corta a rota (aresta, não só tile)', () => {
      // 2×2 com parede entre (0,0) e (1,0): o único caminho de (0,0) a (1,1) passa por (0,1). Dormir em (0,1) corta.
      const m = com(['+-+-+', '|.|.|', '+ + +', '|. .|', '+-+-+']);
      expect(base({ x: 0, y: 1 }, m).join('\n')).toMatch(/N009.*dormir em \(0, 1\) corta a rota/);
      expect(base({ x: 1, y: 0 }, m).join('\n')).not.toMatch(/N009/);
    });
  });
});

describe('M9: objetos e arestas (ADR-011 seção 5.2)', () => {
  const g = geometriaDoSobrinho(entradaReal().perfil);
  const exame = objeto('examinavel', 1, 0, { texto: 'x' });

  it('o examinável do outro lado de um muro não é lido; sem o muro, é', () => {
    const aberta = mapaDeTexto('a', ['+-+-+', '|. #|', '+-+-+']);
    const fechada = mapaDeTexto('a', ['+-+-+', '|.|#|', '+-+-+']);
    const p = posicaoCentralizadaNoTile(0, 0, g);
    const parede = (m: MapaDoJogo) => (tx: number, ty: number, lado: 'cima' | 'baixo' | 'esquerda' | 'direita') => {
      const bit = { cima: 1, direita: 2, baixo: 4, esquerda: 8 }[lado];
      const linha = m.paredes[ty];
      return !linha || tx < 0 || tx >= linha.length ? true : (linha[tx] & bit) !== 0;
    };
    expect(alvoDaInteracao([exame], p, 'direita', g, parede(aberta))).toBe(exame);
    expect(alvoDaInteracao([exame], p, 'direita', g, parede(fechada))).toBeUndefined();
  });
});

describe('M10: farejar, a seta na porta certa e na direção de `lado`', () => {
  const A = mapaDeTexto('a', ['+-+-+-+', '|. . .D', '+-+-+-+'], [porta('a-b', 2, 0, 'direita', 'b')]);
  const B = mapaDeTexto('b', ['+-+-+-+-+', 'D. . . .D', '+-+-+-+-+'], [porta('a-b', 0, 0, 'esquerda', 'a'), porta('b-c', 3, 0, 'direita', 'c')]);
  const C = mapaDeTexto('c', ['+-+-+', 'D. .|', '+-+-+'], [porta('b-c', 0, 0, 'esquerda', 'b')]);
  const mapas = mapasDe(A, B, C);

  it('de A para C, a primeira porta do caminho é a a-b, com a seta para a direita no tile (2, 0)', () => {
    expect(portaASeguir(mapas, sempre, 'a', 'c')).toEqual({ mapa: 'a', id: 'a-b', tile: { x: 2, y: 0 }, lado: 'direita' });
  });
  it('de C para A, a seta fica na b-c, para a esquerda', () => {
    expect(portaASeguir(mapas, sempre, 'c', 'a')).toMatchObject({ mapa: 'c', id: 'b-c', lado: 'esquerda' });
  });
  it('área fechada não entra no caminho', () => {
    expect(portaASeguir(mapas, (id) => id !== 'b', 'a', 'c')).toBeUndefined();
  });
});
