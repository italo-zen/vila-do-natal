import { describe, expect, it } from 'vitest';
import { CONDUCAO_FATOR_RAPIDO, CONDUCAO_LIMITE_RAPIDO_TILES, fatorDaConducao } from '../../src/domain/progresso/Conducao';

/** Velocidade da condução (GDD 14.11.3; ADR-004 seção 11.3): 10 passos é normal; 11 passa a 2×. */
describe('velocidade da condução', () => {
  it('limite e fator são as constantes do domínio', () => {
    expect(CONDUCAO_LIMITE_RAPIDO_TILES).toBe(10);
    expect(CONDUCAO_FATOR_RAPIDO).toBe(2);
  });
  it('até 10 passos: normal', () => {
    expect(fatorDaConducao(1)).toBe(1);
    expect(fatorDaConducao(10)).toBe(1);
  });
  it('11 passos ou mais: 2×, do início ao fim', () => {
    expect(fatorDaConducao(11)).toBe(2);
    expect(fatorDaConducao(40)).toBe(2);
  });
});
