import { describe, expect, it } from 'vitest';
// @ts-expect-error: módulo .mjs das ferramentas, sem tipos
import { codificarPngIndexado, coresDistintas, decodificarPng, dimensoesDoPng, tipoDoPng } from '../../tools/png.mjs';
import { validarMoveisDoPerfil, validarSprites, type ImagemDoPerfil, type MedidaDoPng } from '../../src/application/arte/SpritesDoPerfil';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';
import { entradaReal } from '../helpers/areasReais';

/**
 * `sprites.json` da visão 3/4 (ADR-012 seção 8) com PNGs de teste indexados: pegada, âncora, sombra, extensão E, cores e
 * indexado. Os PNGs são fabricados aqui; nada depende da arte da Arte (E1).
 */
const perfil: PerfilDeArte = entradaReal().perfil;

/** PNG indexado w×h com `cores` cores opacas distintas (mais o índice 0 transparente). */
function pngDeTeste(w: number, h: number, cores: number): Buffer {
  const indices = new Uint8Array(w * h);
  for (let i = 0; i < indices.length; i++) indices[i] = i % (cores + 1);
  const paleta: [number, number, number, number][] = [[0, 0, 0, 0]];
  for (let c = 1; c <= cores; c++) paleta.push([c * 7, 255 - c * 5, c * 3, 255]);
  return codificarPngIndexado(w, h, indices, paleta);
}

function medir(buf: Buffer): MedidaDoPng {
  const { w, h } = dimensoesDoPng(buf);
  const t = tipoDoPng(buf);
  return { w, h, cores: coresDistintas(decodificarPng(buf).rgba).size, indexado: t.bitDepth === 8 && t.colorType === 3 };
}

const movel = (arquivo: string, w: number, h: number, ancoraY: number, extra: Partial<NonNullable<ImagemDoPerfil['movel']>> = {}): ImagemDoPerfil => ({
  arquivo,
  tipo: 'imagem',
  movel: { pegada: { w, h }, ancora: { x: 0, y: ancoraY }, sombra: { dx: 6, dy: 6 }, ...extra },
});
const conteudo = new Map([
  ['geladeira', { w: 1, h: 1, norteAndavel: false }],
  ['cacto', { w: 1, h: 1, norteAndavel: true }],
]);

describe('PNGs de teste (tools/png.mjs com indexado)', () => {
  it('lê dimensões, tipo e cores de um PNG indexado', () => {
    const buf = pngDeTeste(38, 70, 10);
    expect(dimensoesDoPng(buf)).toEqual({ w: 38, h: 70 });
    expect(tipoDoPng(buf)).toEqual({ bitDepth: 8, colorType: 3 });
    expect(medir(buf)).toEqual({ w: 38, h: 70, cores: 10, indexado: true });
  });
});

describe('validarMoveisDoPerfil', () => {
  // Geladeira 1×1 com H = 64: PNG de (32 + 6) × (64 + 6) = 38 × 70; âncora no canto sudoeste da pegada: y = 64.
  const bom = pngDeTeste(38, 70, 12);

  it('um móvel certo passa, sem erro nem aviso', () => {
    const r = validarMoveisDoPerfil([movel('spr_geladeira.png', 1, 1, 64)], { 'spr_geladeira.png': medir(bom) }, perfil, conteudo);
    expect(r).toEqual({ erros: [], avisos: [] });
  });

  it('largura diferente de w × tile + sombra.dx, altura menor que o mínimo', () => {
    const e = (buf: Buffer, h = 1) => validarMoveisDoPerfil([movel('spr_geladeira.png', 1, h, 30)], { 'spr_geladeira.png': medir(buf) }, perfil, conteudo).erros.join(' ');
    expect(e(pngDeTeste(40, 70, 5))).toMatch(/largura 40; esperado 38/);
    expect(e(pngDeTeste(38, 30, 5))).toMatch(/altura 30; o mínimo é 38/);
  });

  it('âncora fora da imagem, extensão acima de faceNorte, sombra diferente do perfil', () => {
    const med = { 'spr_geladeira.png': medir(bom) };
    expect(validarMoveisDoPerfil([movel('spr_geladeira.png', 1, 1, 90)], med, perfil, conteudo).erros.join(' ')).toMatch(/ancora \(0, 90\) fora da imagem 38×70/);
    const alto = pngDeTeste(38, 90, 5); // E = 90 − 6 − 32 = 52
    expect(validarMoveisDoPerfil([movel('spr_geladeira.png', 1, 1, 84)], { 'spr_geladeira.png': medir(alto) }, perfil, conteudo).erros.join(' ')).toMatch(/extensão E 52 passa de faceNorte 32/);
    expect(validarMoveisDoPerfil([movel('spr_geladeira.png', 1, 1, 64, { sombra: { dx: 4, dy: 4 } })], med, perfil, conteudo).erros.join(' ')).toMatch(/sombra 4\/4 difere de vista.sombra 6\/6/);
  });

  it('cores: no máximo 16 por móvel e 32 por imagem; PNG precisa ser indexado', () => {
    const med = (buf: Buffer) => ({ 'spr_geladeira.png': medir(buf) });
    expect(validarMoveisDoPerfil([movel('spr_geladeira.png', 1, 1, 64)], med(pngDeTeste(38, 70, 20)), perfil, conteudo).erros.join(' ')).toMatch(/20 cores; o máximo por móvel é 16/);
    expect(validarMoveisDoPerfil([movel('spr_geladeira.png', 1, 1, 64)], med(pngDeTeste(38, 70, 40)), perfil, conteudo).erros.join(' ')).toMatch(/40 cores; o máximo por imagem é 32/);
    expect(validarMoveisDoPerfil([movel('spr_geladeira.png', 1, 1, 64)], { 'spr_geladeira.png': { ...medir(bom), indexado: false } }, perfil, conteudo).erros.join(' ')).toMatch(/precisa ser indexado/);
  });

  it('pegada diferente do móvel do conteúdo; E acima de 24 com piso andável ao norte é aviso', () => {
    const med = { 'spr_geladeira.png': medir(bom) };
    expect(validarMoveisDoPerfil([movel('spr_geladeira.png', 2, 1, 64)], med, perfil, conteudo).erros.join(' ')).toMatch(/pegada 2×1 difere do móvel "geladeira" do conteúdo \(1×1\)/);
    // Cacto 1×1 com E = 32 e piso andável ao norte: aviso (o limite é 24).
    const r = validarMoveisDoPerfil([movel('spr_cacto.png', 1, 1, 64)], { 'spr_cacto.png': medir(bom) }, perfil, conteudo);
    expect(r.erros).toEqual([]);
    expect(r.avisos.join(' ')).toMatch(/extensão E 32 sobre piso andável ao norte; o limite é 24/);
  });

  it('peça de parede ou porta com âncora: dentro da imagem; sem vista no perfil é erro', () => {
    const folha: ImagemDoPerfil = { arquivo: 'spr_porta_norte.png', tipo: 'folhas', quadro: { w: 32, h: 38 }, quadros: 3, ancora: { x: 16, y: 32 } };
    const png = pngDeTeste(96, 38, 8);
    expect(validarMoveisDoPerfil([folha], { 'spr_porta_norte.png': medir(png) }, perfil, conteudo).erros).toEqual([]);
    expect(validarMoveisDoPerfil([{ ...folha, ancora: { x: 200, y: 0 } }], { 'spr_porta_norte.png': medir(png) }, perfil, conteudo).erros.join(' ')).toMatch(/fora da imagem/);
    const sem = { ...perfil, vista: undefined } as PerfilDeArte;
    expect(validarMoveisDoPerfil([folha], { 'spr_porta_norte.png': medir(png) }, sem, conteudo).erros.join(' ')).toMatch(/não tem o bloco vista/);
  });

  it('sem `movel` nem `ancora` o sprite é ignorado (desenho de hoje)', () => {
    const r = validarMoveisDoPerfil([{ arquivo: 'spr_sofa.png', tipo: 'imagem' }], { 'spr_sofa.png': medir(pngDeTeste(70, 70, 5)) }, perfil, conteudo);
    expect(r).toEqual({ erros: [], avisos: [] });
  });
});

describe('validarSprites: campos novos opcionais', () => {
  const base = (img: Record<string, unknown>) => ({ schemaVersion: 1, perfil: 'hd-480x352', imagens: [{ arquivo: 'spr_x.png', tipo: 'imagem', ...img }] });

  it('aceita o sprites.json sem os campos (como hoje) e com eles', () => {
    expect(validarSprites(base({}), perfil).ok).toBe(true);
    expect(validarSprites(base({ movel: { pegada: { w: 1, h: 1 }, ancora: { x: 0, y: 64 }, sombra: { dx: 6, dy: 6 } } }), perfil).ok).toBe(true);
    expect(validarSprites(base({ ancora: { x: 16, y: 32 } }), perfil).ok).toBe(true);
  });

  it('recusa campos mal formados', () => {
    const erros = (img: Record<string, unknown>) => {
      const r = validarSprites(base(img), perfil);
      return r.ok ? '' : r.erros.join(' ');
    };
    expect(erros({ ancora: { x: 1.5, y: 0 } })).toMatch(/ancora precisa ter x e y inteiros/);
    expect(erros({ movel: { pegada: { w: 0, h: 1 }, ancora: { x: 0, y: 0 }, sombra: { dx: 6, dy: 6 } } })).toMatch(/pegada precisa de w e h inteiros positivos/);
    expect(erros({ movel: { pegada: { w: 1, h: 1 }, ancora: { x: 0 }, sombra: { dx: 6, dy: 6 } } })).toMatch(/movel.ancora/);
    expect(erros({ movel: { pegada: { w: 1, h: 1 }, ancora: { x: 0, y: 0 } } })).toMatch(/movel.sombra/);
  });
});
