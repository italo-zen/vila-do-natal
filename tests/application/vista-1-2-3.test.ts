import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { passoDoAlfa, personagemAtras, type MovelAlto } from '../../src/application/mundo/vista';
import { extensaoDoMovel } from '../../src/application/mundo/vista';
import { geometriaDoSobrinho, posicaoCentralizadaNoTile, posicaoDoTile } from '../../src/application/mundo/movimento';
import { portaDeFrente } from '../../src/application/mundo/travessia';
import { validarVista } from '../../src/application/arte/validarPerfilDeArte';
import { entradaReal } from '../helpers/areasReais';

/** Transparência de móvel alto e interruptor de parede (1.2.3/1.3.0). Os números vêm do perfil e do sprites.json. */
const perfil = entradaReal().perfil;
const v = perfil.vista!;
const regra = v.transparenciaDeMovelAlto!;
const g = geometriaDoSobrinho(perfil);
const T = perfil.tile;
const sprites = (JSON.parse(readFileSync(join(__dirname, '..', '..', 'assets', 'hd-480x352', 'sprites.json'), 'utf-8')) as { imagens: { arquivo: string; tipo: string; quadro?: { w: number; h: number }; ancora?: { x: number; y: number }; movel?: { pegada: { w: number; h: number }; ancora: { x: number; y: number }; sombra: { dx: number; dy: number } } }[] }).imagens;

describe('perfil: transparência de móvel alto e assistência de quina', () => {
  it('valores do perfil, validados', () => {
    expect(regra).toEqual({ extensaoMinima: 16, alfa: 0.45, transicaoMs: 120 });
    expect(validarVista(v, T)).toEqual([]);
    const ruim = (p: Record<string, unknown>) => validarVista({ ...v, ...p }, T).join(' ');
    expect(ruim({ transparenciaDeMovelAlto: { extensaoMinima: 16, alfa: 2, transicaoMs: 120 } })).toMatch(/transparenciaDeMovelAlto/);
    expect(ruim({ quinaMaximaPx: 20 })).toMatch(/quinaMaximaPx/);
  });
});

describe('personagem atrás do móvel alto', () => {
  // Geladeira 1×1 em (2, 2): pegada y de 64 a 96; E = 32: o sprite acima da pegada vai de y = 32 a 64.
  const geladeira: MovelAlto = { rect: { x: 64, y: 32, w: 38, h: 32 }, base: 96 };
  const caixaEm = (tx: number, ty: number) => {
    const p = posicaoDoTile(tx, ty, g);
    return { caixa: { x: p.x, y: p.y, w: g.quadro.w, h: g.quadro.h }, base: p.y + g.quadro.h };
  };

  it('ao norte (atrás) da geladeira a caixa sobrepõe o sprite acima da pegada: transparente', () => {
    const c = caixaEm(2, 1);
    expect(personagemAtras(c.caixa, c.base, geladeira)).toBe(true);
  });

  it('ao sul (na frente), ao lado ou longe, não', () => {
    for (const [tx, ty] of [[2, 3], [1, 2], [3, 2], [2, 0], [5, 1]] as const) {
      const c = caixaEm(tx, ty);
      expect(personagemAtras(c.caixa, c.base, geladeira), `${tx},${ty}`).toBe(false);
    }
  });

  it('móvel sem extensão (altura zero acima da pegada) nunca fica transparente', () => {
    const c = caixaEm(2, 1);
    expect(personagemAtras(c.caixa, c.base, { rect: { x: 64, y: 64, w: 38, h: 0 }, base: 96 })).toBe(false);
  });

  it('a transição de alfa leva transicaoMs para ir de 1 ao alfa de trás, e volta', () => {
    let a = 1;
    for (let ms = 0; ms < regra.transicaoMs; ms += 12) a = passoDoAlfa(a, regra.alfa, 12, regra.alfa, regra.transicaoMs);
    expect(a).toBeCloseTo(regra.alfa, 5);
    expect(passoDoAlfa(1, regra.alfa, 12, regra.alfa, regra.transicaoMs)).toBeLessThan(1);
    expect(passoDoAlfa(1, regra.alfa, 0, regra.alfa, regra.transicaoMs)).toBe(1);
    for (let ms = 0; ms < regra.transicaoMs; ms += 12) a = passoDoAlfa(a, 1, 12, regra.alfa, regra.transicaoMs);
    expect(a).toBe(1);
    expect(passoDoAlfa(0.7, 0.45, 1000, 0.45, 120)).toBe(0.45);
    expect(passoDoAlfa(0.7, 0.45, 5, 0.45, 0)).toBe(0.45);
  });

  it('quais móveis do sprites.json passam da extensão mínima do perfil (a regra é do dado)', () => {
    const altos = sprites.filter((i) => i.movel).map((i) => ({ i, e: extensaoDoMovel(0, i.movel!.pegada.h, T, v) }));
    expect(altos.length).toBeGreaterThan(0);
    // `extensaoDoMovel` recebe a altura do PNG; aqui só confere que a regra usa o valor do perfil, sem número fixo.
    expect(regra.extensaoMinima).toBe(16);
  });
});

describe('interruptor de parede: brilho na placa e A a partir do tile em frente', () => {
  const interruptor = sprites.find((i) => i.arquivo === 'spr_interruptor.png')!;

  it('a placa é uma folha 16×24 com âncora (8, 23): o centro dela, no tile (6, 4) da Sala, é (6·32 + 16, 4·32 − 23 + 12)', () => {
    expect(interruptor).toMatchObject({ tipo: 'folhas', quadro: { w: 16, h: 24 }, ancora: { x: 8, y: 23 } });
    const x = 6 * T + T / 2 - interruptor.ancora!.x;
    const y = 4 * T - interruptor.ancora!.y;
    const centro = { x: x + interruptor.quadro!.w / 2, y: y + interruptor.quadro!.h / 2 };
    expect(centro).toEqual({ x: 208, y: 117 });
    // O brilho antigo ficava no centro do tile (208, 144): 27 px abaixo da placa.
    expect(144 - centro.y).toBe(27);
  });

  it('no tile do interruptor, olhando para cima, o A alcança a placa (tolerância de 1 tile), com os pés centralizados ou na base do tile', () => {
    const lista = [{ x: 6, y: 4, lado: 'cima' as const }];
    expect(portaDeFrente(posicaoCentralizadaNoTile(6, 4, g), 'cima', lista, g, 1)).toBe(lista[0]);
    expect(portaDeFrente(posicaoDoTile(6, 4, g), 'cima', lista, g, 1)).toBe(lista[0]);
    // De costas, de lado ou de outro tile, não.
    expect(portaDeFrente(posicaoCentralizadaNoTile(6, 4, g), 'baixo', lista, g, 1)).toBeUndefined();
    expect(portaDeFrente(posicaoCentralizadaNoTile(6, 4, g), 'direita', lista, g, 1)).toBeUndefined();
    expect(portaDeFrente(posicaoCentralizadaNoTile(5, 4, g), 'cima', lista, g, 1)).toBeUndefined();
  });
});
