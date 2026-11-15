import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fatorDeEscala } from '../../src/presentation/ui/escala';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';

/** Escala híbrida (ADR-003 seção 9): casos da tabela do ADR, base 480×352 (HD). Função pura, sem Phaser. */
const hd: PerfilDeArte = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'art-profiles', 'hd-480x352.json'), 'utf-8'));
const base = { largura: 480, altura: 352 };
const v1Escala = { minima: 1, modo: 'inteira' as const };

describe('escala híbrida do HD (ADR-003 seção 9)', () => {
  it.each([
    [960, 640, 1.82],
    [1366, 657, 1.87],
    [844, 390, 1.11],
  ])('janela %i×%i: fator fracionário %s', (w, h, esperado) => {
    expect(fatorDeEscala(hd.escala, base, { largura: w, altura: h })).toBeCloseTo(esperado, 2);
  });

  it('1920×955 dá 2 (inteiro a partir de 2×)', () => {
    expect(fatorDeEscala(hd.escala, base, { largura: 1920, altura: 955 })).toBe(2);
  });

  it('a partir de 2× o fator é inteiro: janela 2000×1000 dá 2', () => {
    expect(fatorDeEscala(hd.escala, base, { largura: 2000, altura: 1000 })).toBe(2);
  });

  it('o tamanho desenhado segue a tabela: 960×640 dá 873×640 CSS px', () => {
    const f = fatorDeEscala(hd.escala, base, { largura: 960, altura: 640 });
    expect(Math.round(base.largura * f)).toBe(873);
    expect(Math.round(base.altura * f)).toBe(640);
  });
});

describe('escala inteira do v1 (sem mudança)', () => {
  const v1Base = { largura: 240, altura: 160 };
  it('960×640 dá 4×, e janela pequena não passa de 1×', () => {
    expect(fatorDeEscala(v1Escala, v1Base, { largura: 960, altura: 640 })).toBe(4);
    expect(fatorDeEscala(v1Escala, v1Base, { largura: 100, altura: 100 })).toBe(1);
  });
});
