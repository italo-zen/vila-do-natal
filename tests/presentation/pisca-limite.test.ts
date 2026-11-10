import { describe, expect, it } from 'vitest';
import { CICLO_PISCA_MS, PERIODOS_DE_PULSO_MS, PERIODO_MINIMO_DE_PULSO_MS } from '../../src/presentation/ui/pisca';

/** AC4 (GDD 19.9): nada pisca mais de 3 ciclos por segundo. Cada brilho e pulso do jogo tem período ≥ 1000/3 ms. */
describe('limite de piscar (AC4: no máximo 3 ciclos por segundo)', () => {
  it('o período mínimo é 1000/3 ms (3 ciclos por segundo)', () => {
    expect(PERIODO_MINIMO_DE_PULSO_MS).toBeCloseTo(333.33, 2);
  });

  it.each(Object.entries(PERIODOS_DE_PULSO_MS))('%s: período de pelo menos 1000/3 ms', (_nome, periodo) => {
    expect(periodo).toBeGreaterThanOrEqual(PERIODO_MINIMO_DE_PULSO_MS);
    expect(1000 / periodo).toBeLessThanOrEqual(3);
  });

  it('o halo da árvore segue o ciclo de 2 s (GDD 14.9.3)', () => {
    expect(CICLO_PISCA_MS).toBe(2000);
    expect(PERIODOS_DE_PULSO_MS.halo).toBe(CICLO_PISCA_MS);
  });
});
