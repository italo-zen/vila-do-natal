import { describe, expect, it } from 'vitest';
import { intervaloDoLaco } from '../../../src/presentation/audio/laco';

/** ADR-008 1.4 e AU11: o laço é decidido em segundos. Com o buffer a 22.050, 44.100 ou 48.000 Hz, o laço cobre a faixa. */
const info = { atrasoInicial: 1105, preenchimentoFinal: 551, amostrasNoArquivo: 795456, amostras: 793800, taxaHz: 22050 };
const duracaoFaixa = 793800 / 22050;

describe('laço da música (ADR-008 1.4)', () => {
  it('a 22.050 Hz, sem aparar: laço de 1105 a 794905 (loopSeNaoAparado)', () => {
    expect(intervaloDoLaco(795456, 22050, info)).toEqual({ inicio: 1105, fim: 794905 });
  });

  it('a 22.050 Hz, aparado: laço da faixa inteira de 0 a 793800 (loopSeAparado)', () => {
    expect(intervaloDoLaco(793800, 22050, info)).toEqual({ inicio: 0, fim: 793800 });
  });

  it.each([44100, 48000])('a %i Hz (decodificado pelo navegador), sem aparar: o laço cobre a faixa inteira', (taxa) => {
    const comprimento = Math.round(795456 * (taxa / 22050));
    const { inicio, fim } = intervaloDoLaco(comprimento, taxa, info);
    expect(inicio / taxa).toBeCloseTo(1105 / 22050, 3);
    expect(fim / taxa).toBeCloseTo((795456 - 551) / 22050, 3);
    expect(fim / taxa).toBeGreaterThan(duracaoFaixa);
  });

  it.each([44100, 48000])('a %i Hz, aparado: o laço é a faixa inteira (não 18 s)', (taxa) => {
    const comprimento = Math.round(793800 * (taxa / 22050));
    const { inicio, fim } = intervaloDoLaco(comprimento, taxa, info);
    expect(inicio).toBe(0);
    expect(fim / taxa).toBeCloseTo(duracaoFaixa, 2);
  });
});
