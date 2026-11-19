import { describe, expect, it } from 'vitest';
import { validarConteudo, type EntradaDeConteudo } from '../../src/application/content/validarConteudo';
import { Textos } from '../../src/application/content/Textos';
import type { MapaDoJogo, ObjetoDoMapa } from '../../src/application/content/Mapa';
import type { MissaoCarregada } from '../../src/application/mundo/missoes';
import { calcularRotaDeConducao } from '../../src/application/mundo/conducao';
import { portaASeguir } from '../../src/application/mundo/nick/portaASeguir';
import { entradaReal } from '../helpers/areasReais';
import { chegada, mapaDeTexto, objeto, porta } from '../helpers/mapasDeArestas';

/**
 * V2 e V3 (ADR-011 seção 8): `validarConteudo` com áreas escritas à mão. Cada caso mexe numa regra da seção 7 e confere que o
 * erro certo aparece (e que o par válido não tem nenhum). Não depende do conteúdo gerado pela Arte.
 */

const perfil = entradaReal().perfil;

/** O par mínimo de duas áreas e uma porta (V3): `a` (3×1) e `b` (3×1), porta `a-b` na aresta entre elas. */
function par(): [MapaDoJogo, MapaDoJogo] {
  const a = mapaDeTexto('a', ['+-+-+-+', '|. . .D', '+-+-+-+'], [porta('a-b', 2, 0, 'direita', 'b'), chegada('a-b', 2, 0, 'esquerda')]);
  const b = mapaDeTexto('b', ['+-+-+-+', 'D. . .|', '+-+-+-+'], [porta('a-b', 0, 0, 'esquerda', 'a'), chegada('a-b', 0, 0, 'direita')]);
  return [a, b];
}

function entrada(areas: MapaDoJogo[], missoes: MissaoCarregada[] = []): EntradaDeConteudo {
  return {
    manifesto: { schemaVersion: 4, contentVersion: 'teste', locale: 'pt-BR', sorteio: 'sorteio.json', maps: areas.map((m) => ({ id: m.id, file: `${m.id}.json`, tileset: 'tiles_casa' })), missions: [], texts: [] },
    todos: new Map(areas.map((m) => [m.id, m])),
    missoes,
    textos: new Textos({ x: 'texto de teste' }),
    perfil,
  };
}

/** Erros que falam das áreas de teste (o conjunto mínimo não tem peças, caixa nem missões, e a validação global reclama disso). */
const erros = (areas: MapaDoJogo[], missoes?: MissaoCarregada[]): string[] =>
  validarConteudo(entrada(areas, missoes)).filter((e) => /[Ss]ubárea ["']?(a|b)["']?|Porta a-b|[Ss]ubárea '(a|b)'/.test(e));

const copia = (m: MapaDoJogo): MapaDoJogo => JSON.parse(JSON.stringify(m)) as MapaDoJogo;
const com = (m: MapaDoJogo, fn: (c: MapaDoJogo) => void): MapaDoJogo => {
  const c = copia(m);
  fn(c);
  return c;
};

describe('V3: duas áreas e uma porta entram sem mexer no motor (ADR-002 seção 2)', () => {
  it('o par mínimo não tem erro', () => {
    expect(erros(par())).toEqual([]);
  });

  it('a rota de condução e a seta do farejar atravessam o par com as mesmas funções do jogo', () => {
    const [a, b] = par();
    const mapas = new Map([['a', a], ['b', b]]);
    const r = calcularRotaDeConducao(mapas, { mapa: 'a', x: 0, y: 0 }, { mapa: 'b', x: 2, y: 0 }, () => true);
    expect(r?.passos).toBe(2 + 1 + 2);
    expect(portaASeguir(mapas, () => true, 'a', 'b')).toMatchObject({ mapa: 'a', id: 'a-b', tile: { x: 2, y: 0 }, lado: 'direita' });
  });
});

describe('V2: 4′ simetria da porta', () => {
  it('sem a porta de mesmo id na outra área', () => {
    const [a, b] = par();
    expect(erros([a, com(b, (c) => { c.objetos = c.objetos.filter((o) => o.tipo !== 'porta'); })]).join('\n')).toMatch(/Porta a-b.*não há porta de mesmo id/);
  });
  it('a porta de lá não aponta de volta', () => {
    const [a, b] = par();
    expect(erros([a, com(b, (c) => { c.objetos[0].dados.destino = 'b'; })]).join('\n')).toMatch(/não aponta de volta/);
  });
  it('o lado de lá não é o oposto', () => {
    const [a, b] = par();
    const e = erros([a, com(b, (c) => { c.objetos[0].dados.lado = 'direita'; })]);
    expect(e.join('\n')).toMatch(/deveria ser o oposto de "direita"/);
  });
  it('a chegada não existe', () => {
    const [a, b] = par();
    expect(erros([a, com(b, (c) => { c.objetos = c.objetos.filter((o) => o.tipo !== 'spawn'); })]).join('\n')).toMatch(/spawnDestino "a-b" não existe em "b"/);
  });
  it('a chegada fora do tile da porta, ou olhando para fora', () => {
    const [a, b] = par();
    expect(erros([a, com(b, (c) => { c.objetos[1].x = 1; })]).join('\n')).toMatch(/precisa estar no tile da porta/);
    expect(erros([a, com(b, (c) => { c.objetos[1].dados.direcao = 'esquerda'; })]).join('\n')).toMatch(/olha para "esquerda", deveria olhar para "direita"/);
  });
  it('vale também para áreas fechadas (não olha missions)', () => {
    const [a, b] = par();
    expect(erros([a, com(b, (c) => { c.objetos = []; })]).length).toBeGreaterThan(0);
  });
});

describe('V2: 23 a 25 máscara de paredes', () => {
  it('23: tamanho, faixa de 0 a 15 e 0 em tile sem piso', () => {
    const [a, b] = par();
    expect(erros([com(a, (c) => { c.paredes = [[0, 0]]; }), b]).join('\n')).toMatch(/paredes precisa ter o tamanho de chao.*item 23/);
    expect(erros([com(a, (c) => { c.paredes[0][0] = 16; }), b]).join('\n')).toMatch(/vale 16.*item 23/);
    expect(erros([com(a, (c) => { c.paredes[0][0] = -1; }), b]).join('\n')).toMatch(/vale -1.*item 23/);
    expect(erros([com(a, (c) => { c.paredes[0][0] = 1.5; }), b]).join('\n')).toMatch(/item 23/);
    expect(erros([com(a, (c) => { c.chao[0][1] = 0; c.colisao[0][1] = true; }), b]).join('\n')).toMatch(/num tile sem piso.*item 23/);
  });
  it('24: simetria interna (os dois tiles da aresta têm o mesmo bit)', () => {
    const [a, b] = par();
    expect(erros([com(a, (c) => { c.paredes[0][0] |= 2; }), b]).join('\n')).toMatch(/assimétrica.*item 24/);
  });
  it('25: fronteira com o vazio é parede', () => {
    const [a, b] = par();
    expect(erros([com(a, (c) => { c.paredes[0][0] &= ~1; }), b]).join('\n')).toMatch(/dá para fora do piso e não tem parede.*item 25/);
    // Tile sem piso no meio: o vizinho de piso precisa da parede.
    const furado = com(a, (c) => { c.chao[0][1] = 0; c.colisao[0][1] = true; c.paredes[0][1] = 0; c.paredes[0][0] &= ~2; c.paredes[0][2] &= ~8; });
    expect(erros([furado, b]).join('\n')).toMatch(/item 25/);
  });
});

describe('V2: 26 porta', () => {
  it('lado inválido', () => {
    const [a, b] = par();
    expect(erros([com(a, (c) => { c.objetos[0].dados.lado = 'norte'; }), b]).join('\n')).toMatch(/sem lado válido/);
  });
  it('a aresta do lado precisa ter o bit ligado', () => {
    const [a, b] = par();
    expect(erros([com(a, (c) => { c.paredes[0][2] &= ~2; }), b]).join('\n')).toMatch(/precisa ter o bit de parede ligado/);
  });
  it('o vizinho do lado não pode ser piso da própria área', () => {
    const [a, b] = par();
    expect(erros([com(a, (c) => { c.objetos[0].dados.lado = 'esquerda'; c.paredes[0][2] |= 8; c.paredes[0][1] |= 2; }), b]).join('\n')).toMatch(/é piso da própria área/);
  });
  it('tile da porta precisa ser piso livre', () => {
    const [a, b] = par();
    expect(erros([com(a, (c) => { c.colisao[0][2] = true; }), b]).join('\n')).toMatch(/precisa estar em piso livre/);
  });
  it('id repetido e (x, y, lado) repetido na área', () => {
    const [a, b] = par();
    const dupla = com(a, (c) => { c.objetos.push(porta('a-b', 2, 0, 'direita', 'b')); });
    expect(erros([dupla, b]).join('\n')).toMatch(/repetido/);
    expect(erros([dupla, b]).join('\n')).toMatch(/com o mesmo lado/);
  });
  it('duas portas no mesmo tile, em lados diferentes, são permitidas (a chegada coincide)', () => {
    const [a, b] = par();
    // Segunda porta de `a` para `b`, com id próprio, para cima, no mesmo tile (2,0).
    const a2 = com(a, (c) => { c.objetos.push(porta('a-b-2', 2, 0, 'cima', 'b'), chegada('a-b-2', 2, 0, 'baixo')); });
    const e = erros([a2, b]).filter((x) => !/a-b-2/.test(x));
    expect(e).toEqual([]);
  });
  it('trancadaAte precisa ser fase', () => {
    const [a, b] = par();
    expect(erros([com(a, (c) => { c.objetos[0].dados.trancadaAte = 'xyz'; }), b]).join('\n')).toMatch(/trancadaAte "xyz" não é uma fase/);
  });
  it('destino que não existe', () => {
    const [a] = par();
    expect(erros([a]).join('\n')).toMatch(/leva a "b", que não existe/);
  });
});

describe('V2: 27 bilhete', () => {
  const bilhete = (extra: Partial<ObjetoDoMapa['dados']>) => objeto('bilhete', 0, 0, { texto: 'x', lado: 'cima', ...extra });
  it('de frente para uma parede, passa', () => {
    const [a, b] = par();
    expect(erros([com(a, (c) => { c.objetos.push(bilhete({})); }), b]).filter((e) => /bilhete/.test(e))).toEqual([]);
  });
  it('lado para aresta aberta, sem lado, ou para a aresta de uma porta', () => {
    const [a, b] = par();
    const c2 = (fn: (c: MapaDoJogo) => void) => erros([com(a, fn), b]).join('\n');
    expect(c2((c) => { c.objetos.push(bilhete({ lado: 'direita' })); })).toMatch(/aresta sem parede.*item 27/);
    expect(c2((c) => { c.objetos.push(bilhete({ lado: undefined })); })).toMatch(/sem lado válido/);
    expect(c2((c) => { c.objetos.push(objeto('bilhete', 2, 0, { texto: 'x', lado: 'direita' })); })).toMatch(/aresta de uma porta.*item 27/);
  });
  it('tile bloqueado não serve de bilhete', () => {
    const [a, b] = par();
    expect(erros([com(a, (c) => { c.colisao[0][0] = true; c.objetos.push(bilhete({})); }), b]).join('\n')).toMatch(/bilhete.*precisa estar em piso livre/);
  });
});

describe('V2: 28 conexidade', () => {
  it('uma parede que isola parte da área é erro; a passagem de 1 tile (Cozinha e Lavanderia) passa', () => {
    const [, b] = par();
    // Duas fileiras de 3 tiles, ligadas por uma única abertura em x = 1.
    const passagem = ['+-+-+-+', '|. . .|', '+-+ +-+', '|. . .|', '+-+-+-+'];
    expect(erros([mapaDeTexto('a', passagem), b]).filter((e) => /item 28/.test(e))).toEqual([]);
    // Fechando a abertura, as duas fileiras ficam isoladas.
    const fechada = passagem.map((l, i) => (i === 2 ? '+-+-+-+' : l));
    expect(erros([mapaDeTexto('a', fechada), b]).join('\n')).toMatch(/área não conexa pelas arestas abertas.*item 28/);
  });
  it('a árvore não pode cortar a área em duas', () => {
    const [, b] = par();
    const corredor = mapaDeTexto('a', ['+-+-+-+', '|. . .|', '+-+-+-+'], [objeto('arvore', 1, 0)]);
    expect(erros([corredor, b]).join('\n')).toMatch(/item 28/);
  });
});

describe('V2: 5, 6, 16 e 17 com aresta fechada', () => {
  it('5: o examinável precisa de vizinho livre alcançável (parede entre os dois não vale)', () => {
    const [, b] = par();
    const livre = mapaDeTexto('a', ['+-+-+', '|# .|', '+-+-+'], [objeto('examinavel', 0, 0, { texto: 'x' })]);
    expect(erros([livre, b]).filter((e) => /examinavel/.test(e))).toEqual([]);
    const fechado = mapaDeTexto('a', ['+-+-+', '|#|.|', '+-+-+'], [objeto('examinavel', 0, 0, { texto: 'x' })]);
    expect(erros([fechado, b]).join('\n')).toMatch(/examinavel.*vizinho livre alcançável/);
  });
  it('5: spawn e interruptor em piso livre', () => {
    const [, b] = par();
    const m = mapaDeTexto('a', ['+-+-+', '|# .|', '+-+-+'], [objeto('interruptor', 0, 0)]);
    expect(erros([m, b]).join('\n')).toMatch(/interruptor.*piso livre/);
  });
  it('6: nada andável na linha da barra', () => {
    const [, b] = par();
    // Área de 11 linhas centralizada na tela de 11: a última linha (y = 10) é a barra.
    const grade = ['+-+'];
    for (let i = 0; i < 11; i++) grade.push('|.|', '+-+');
    const alta = mapaDeTexto('a', grade);
    expect(erros([alta, b]).join('\n')).toMatch(/linha da barra/);
  });
  it('16: a peça precisa de vizinho livre alcançável e não pode ficar em tile de porta', () => {
    const [a, b] = par();
    const peca = (x: number) => objeto('peca', x, 0, { ordem: 1, id: 'peca1', estadoInicial: 'visivel' });
    expect(erros([com(a, (c) => { c.objetos.push(peca(1)); }), b]).filter((e) => /peça 1/.test(e))).toEqual([]);
    // Parede dos dois lados da peça em (1,0): sem vizinho alcançável.
    const encerrada = com(a, (c) => { c.paredes[0][0] |= 2; c.paredes[0][1] |= 8 | 2; c.paredes[0][2] |= 8; c.objetos.push(peca(1)); });
    expect(erros([encerrada, b]).join('\n')).toMatch(/peca peca1.*sem vizinho livre alcançável/);
    expect(erros([com(a, (c) => { c.objetos.push(peca(2)); }), b]).join('\n')).toMatch(/peça 1 em tile de porta|cai em tile de porta/);
  });
  it('17: a peça não fica sobre nem encostada no interruptor', () => {
    const [a, b] = par();
    const m = com(a, (c) => { c.objetos.push(objeto('peca', 0, 0, { ordem: 1, id: 'peca1', estadoInicial: 'visivel' }), objeto('interruptor', 1, 0)); });
    expect(erros([m, b]).join('\n')).toMatch(/sobre ou encostada no interruptor/);
  });
});

describe('V2: 11 interruptor fora do círculo de luz da entrada no escuro', () => {
  it('a Sala vinda do Hall (hall-sala) é a entrada no escuro: interruptor a 3 tiles ou menos é erro', () => {
    const sala = mapaDeTexto('sala', ['+-+-+-+-+', '|. . . .|', '+-+-+-+-+'], [chegada('hall-sala', 0, 0, 'direita'), objeto('interruptor', 3, 0)]);
    const e = validarConteudo(entrada([sala])).filter((x) => /interruptor em/.test(x));
    expect(e.join('\n')).toMatch(/a 3\.00 tiles do spawn "hall-sala"; precisa ser mais de 3/);
    const longe = mapaDeTexto('sala', ['+-+-+-+-+-+', '|. . . . .|', '+-+-+-+-+-+'], [chegada('hall-sala', 0, 0, 'direita'), objeto('interruptor', 4, 0)]);
    expect(validarConteudo(entrada([longe])).filter((x) => /interruptor em/.test(x))).toEqual([]);
  });
});

describe('V2: 12 rota de condução respeita as arestas', () => {
  it('destino atrás de uma parede, sem passagem, não tem rota', () => {
    const [, b] = par();
    const muro = mapaDeTexto('a', ['+-+-+-+', '|. . .|', '+-+-+-+'], [objeto('spawn', 0, 0, { nome: 'in', direcao: 'direita' })]);
    // Parede entre (1,0) e (2,0): a linha é um corredor cortado.
    muro.paredes[0][1] |= 2;
    muro.paredes[0][2] |= 8;
    const missao: MissaoCarregada = {
      id: 'marco1',
      requires: [],
      maps: ['a', 'b'],
      final: false,
      missao: { id: 'marco1', inicio: { mapa: 'a', spawn: 'in', paginas: [] }, conducao: { luzes: { mapa: 'a', x: 2, y: 0, direcao: 'baixo' } }, conquistas: { luzes: 'x' } },
    };
    expect(validarConteudo(entrada([muro, b], [missao])).join('\n')).toMatch(/conducao\.luzes: destino a \(2, 0\) sem rota a partir do início/);
  });
});
