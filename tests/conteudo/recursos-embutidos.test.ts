import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { IMAGENS_DE_TELA } from '../../vite.recursos';

/** ADR-009 4 e 5; GDD 20.3, 20.4 e 20.7: imagens de tela nativas 480×352, PNG, ≤ 60 000 bytes cada. */
const RAIZ = join(__dirname, '..', '..');

function dimensoes(png: Buffer): { largura: number; altura: number } {
  // PNG: assinatura de 8 bytes; o IHDR traz largura e altura em big-endian nos bytes 16 a 23.
  return { largura: png.readUInt32BE(16), altura: png.readUInt32BE(20) };
}

describe('imagens de tela (GDD 20.3 e 20.4; ADR-009 5)', () => {
  for (const [chave, arquivo] of Object.entries(IMAGENS_DE_TELA)) {
    it(`${chave} (${arquivo}) é 480×352 e tem até 60 000 bytes`, () => {
      const caminho = join(RAIZ, 'assets', 'hd-480x352', arquivo);
      const png = readFileSync(caminho);
      expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
      expect(dimensoes(png)).toEqual({ largura: 480, altura: 352 });
      expect(statSync(caminho).size).toBeLessThanOrEqual(60_000);
    });
  }

  it('as duas chaves do título e do fim existem (TI1 e FI1)', () => {
    expect(Object.keys(IMAGENS_DE_TELA).sort()).toEqual(['fim', 'titulo']);
  });
});

describe('atlas de enfeites (ADR-010 3.8; GDD 20.7): dec_* somados ≤ 16 000 bytes', () => {
  it('a soma dos PNG dec_* é até 16 000 bytes brutos (E8)', () => {
    const sprites = JSON.parse(readFileSync(join(RAIZ, 'assets', 'hd-480x352', 'sprites.json'), 'utf-8')) as { imagens: { arquivo: string }[] };
    const decs = sprites.imagens.filter((i) => i.arquivo.startsWith('dec_'));
    const total = decs.reduce((s, i) => s + statSync(join(RAIZ, 'assets', 'hd-480x352', i.arquivo)).size, 0);
    expect(decs.length).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(16_000);
  });
});
