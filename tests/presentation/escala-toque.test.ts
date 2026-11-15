import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { areaDeToqueEmJogo, fatorDeEscala } from '../../src/presentation/ui/escala';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';

/** ADR-007 seção 3.1, 4.5 e 12.1: escala sobre a área visível e área de toque em pixels de jogo. */
const hd: PerfilDeArte = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'art-profiles', 'hd-480x352.json'), 'utf-8'));
const base = { largura: 480, altura: 352 };

describe('fator de escala no celular (ADR-007 3.1; GDD 18.9)', () => {
  it.each([
    [844, 390, 1.108],
    [932, 430, 1.222],
    [667, 375, 1.065],
    [1024, 768, 2],
    [1920, 955, 2],
  ])('janela %i×%i: fator %s', (w, h, esperado) => {
    expect(fatorDeEscala(hd.escala, base, { largura: w, altura: h })).toBeCloseTo(esperado, 2);
  });
});

describe('área de toque em pixels de jogo (ADR-007 4.5)', () => {
  it('fator 1: alvo de 48 px vira 48', () => {
    expect(areaDeToqueEmJogo(20, 48, 1)).toBe(48);
  });

  it('fator 0,909: alvo de 48 CSS px vale 53 px de jogo', () => {
    expect(areaDeToqueEmJogo(20, 48, 0.909)).toBe(53);
  });

  it('fator 2 com desenho de 64: fica com o desenho', () => {
    expect(areaDeToqueEmJogo(64, 48, 2)).toBe(64);
  });
});
