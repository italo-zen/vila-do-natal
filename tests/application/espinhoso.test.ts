import { describe, expect, it } from 'vitest';
import { ColisaoDoMapa, geometriaDoSobrinho, mover, posicaoCentralizadaNoTile, type Direcao, type Posicao } from '../../src/application/mundo/movimento';
import { ehEspinhoso, espinhosoContra, espinhososDe, posicaoDoEmpurrao } from '../../src/application/mundo/espinhoso';
import { bloqueiosDaSubarea } from '../../src/application/mundo/subarea';
import { areasReais, entradaReal } from '../helpers/areasReais';
import { mapaDeTexto, objeto } from '../helpers/mapasDeArestas';

/**
 * Cacto da Sala (easter egg do Diretor): andar contra o móvel espinhoso devolve o jogador 1 tile para onde veio, sem nunca
 * entrar em tile bloqueado nem atravessar parede. O desenho que pisca é da cena (verificado na captura do smoke).
 */
const g = geometriaDoSobrinho(entradaReal().perfil);
const t = g.tile;

/** 5×5 aberta; o cacto fica no tile (2, 2), que é bloqueado. */
const GRADE = ['+-+-+-+-+-+', '|. . . . .|', '+ + + + + +', '|. . . . .|', '+ + + + + +', '|. . # . .|', '+ + + + + +', '|. . . . .|', '+ + + + + +', '|. . . . .|', '+-+-+-+-+-+'];

function ambiente(extra: Parameters<typeof mapaDeTexto>[2] = []) {
  const mapa = mapaDeTexto('s', GRADE, [objeto('movel', 2, 2, { id: 'cacto', nome: 'Cacto', w: 1, h: 1 }), ...extra]);
  const col = new ColisaoDoMapa(bloqueiosDaSubarea(mapa, () => true), mapa.paredes);
  return { mapa, col, esp: espinhososDe(mapa.objetos) };
}

describe('móvel espinhoso: quem é', () => {
  it('o id `cacto` ou a propriedade `espinhoso` marcam o móvel; os outros móveis, não', () => {
    expect(ehEspinhoso(objeto('movel', 0, 0, { id: 'cacto' }))).toBe(true);
    expect(ehEspinhoso(objeto('movel', 0, 0, { id: 'planta', espinhoso: true }))).toBe(true);
    expect(ehEspinhoso(objeto('movel', 0, 0, { id: 'sofa' }))).toBe(false);
    expect(ehEspinhoso(objeto('peca', 0, 0, { id: 'cacto' }))).toBe(false);
  });

  it('o conteúdo real tem o cacto da Sala em (0, 3), bloqueante pela colisão do conversor', () => {
    const sala = areasReais().todos.get('sala')!;
    expect(espinhososDe(sala.objetos)).toEqual([{ x: 0, y: 3, w: 1, h: 1 }]);
    expect(sala.colisao[3][0]).toBe(true);
  });
});

describe('móvel espinhoso: o empurrão', () => {
  const lados: [Direcao, number, number][] = [['direita', 1, 2], ['esquerda', 3, 2], ['baixo', 2, 1], ['cima', 2, 3]];

  it.each(lados)('andando para %s contra o cacto: detecta o encosto e devolve 1 tile para onde veio', (dir, tx, ty) => {
    const e = ambiente();
    let p: Posicao = posicaoCentralizadaNoTile(tx, ty, g);
    const dv = { direita: [1, 0], esquerda: [-1, 0], baixo: [0, 1], cima: [0, -1] }[dir];
    let tocou = false;
    for (let i = 0; i < 200 && !tocou; i++) {
      p = mover(p, dir, 1.7, e.col.bloqueado, g, e.col.parede);
      tocou = espinhosoContra(p, dir, g, e.esp);
    }
    expect(tocou).toBe(true);
    const antes = p;
    const depois = posicaoDoEmpurrao(p, dir, e.col.bloqueado, g, e.col.parede);
    expect(depois.x - antes.x).toBeCloseTo(-dv[0] * t, 5);
    expect(depois.y - antes.y).toBeCloseTo(-dv[1] * t, 5);
  });

  it('a colisão tolera 0,9 px de sobreposição: a caixa parada assim, com 0,9 px dentro do cacto, também está encostada', () => {
    const e = ambiente();
    const base = posicaoCentralizadaNoTile(3, 2, g);
    // Borda esquerda dos pés a 0,9 px dentro do tile do cacto (x de 2·t a 3·t).
    const p = { x: 3 * t - 0.9 - g.pes.dx, y: base.y };
    expect(espinhosoContra(p, 'esquerda', g, e.esp)).toBe(true);
    expect(espinhosoContra(p, 'direita', g, e.esp)).toBe(false);
  });

  it('não dispara de lado, andando para longe, nem longe do cacto', () => {
    const e = ambiente();
    // Encostado por baixo do cacto: empurrar para os lados ou para baixo não é contra ele.
    let p = posicaoCentralizadaNoTile(2, 3, g);
    for (let i = 0; i < 100; i++) p = mover(p, 'cima', 1, e.col.bloqueado, g, e.col.parede);
    expect(espinhosoContra(p, 'cima', g, e.esp)).toBe(true);
    for (const d of ['baixo', 'esquerda', 'direita'] as Direcao[]) expect(espinhosoContra(p, d, g, e.esp), d).toBe(false);
    expect(espinhosoContra(posicaoCentralizadaNoTile(0, 0, g), 'direita', g, e.esp)).toBe(false);
  });

  it('o empurrão nunca entra em tile bloqueado: com um móvel logo atrás, para encostado nele', () => {
    const e = ambiente();
    e.mapa.colisao[2][4] = true; // bloqueio atrás de quem vem da direita, a 1 tile do cacto
    const col = new ColisaoDoMapa(e.mapa.colisao, e.mapa.paredes);
    let p = posicaoCentralizadaNoTile(3, 2, g);
    for (let i = 0; i < 100; i++) p = mover(p, 'esquerda', 1, col.bloqueado, g, col.parede);
    const depois = posicaoDoEmpurrao(p, 'esquerda', col.bloqueado, g, col.parede);
    const x1 = depois.x + g.pes.dx + g.pes.w;
    expect(x1).toBeLessThanOrEqual(4 * t + 1e-9); // não entra no tile (4, 2)
    expect(depois.x).toBeGreaterThanOrEqual(p.x);
  });

  it('o empurrão nunca atravessa parede: com parede atrás, o jogador fica do lado de cá', () => {
    const e = ambiente();
    // Parede entre (3, 2) e (4, 2): quem vem de (3, 2) para o cacto é devolvido só até a parede.
    e.mapa.paredes[2][3] |= 2;
    e.mapa.paredes[2][4] |= 8;
    const col = new ColisaoDoMapa(e.mapa.colisao, e.mapa.paredes);
    let p = posicaoCentralizadaNoTile(3, 2, g);
    for (let i = 0; i < 100; i++) p = mover(p, 'esquerda', 1, col.bloqueado, g, col.parede);
    const depois = posicaoDoEmpurrao(p, 'esquerda', col.bloqueado, g, col.parede);
    expect(depois.x + g.pes.dx + g.pes.w).toBeLessThanOrEqual(4 * t + 1e-9);
  });

  it('em passos de 1 px por quadro, andar contra o cacto repetidamente nunca deixa o jogador preso nem dentro dele', () => {
    const e = ambiente();
    let p: Posicao = posicaoCentralizadaNoTile(3, 2, g);
    let pausa = 0;
    let empurroes = 0;
    for (let quadro = 0; quadro < 600; quadro++) {
      if (quadro < pausa) continue;
      p = mover(p, 'esquerda', 2, e.col.bloqueado, g, e.col.parede);
      if (espinhosoContra(p, 'esquerda', g, e.esp)) {
        p = posicaoDoEmpurrao(p, 'esquerda', e.col.bloqueado, g, e.col.parede);
        pausa = quadro + 18; // ~0,3 s a 60 quadros/s
        empurroes++;
      }
      const x0 = p.x + g.pes.dx;
      expect(x0).toBeGreaterThanOrEqual(3 * t - 1e-9 - t); // nunca entra no tile do cacto (x de 2·t a 3·t) além da borda
      expect(x0 >= 3 * t - 1e-9 || x0 + g.pes.w <= 2 * t + 1e-9).toBe(true);
    }
    expect(empurroes).toBeGreaterThan(3);
  });
});
