import { describe, expect, it } from 'vitest';
import { podeContinuarNaFim } from '../../src/presentation/scenes/transicaoDaFim';

/** BUG-M7-01 (GDD 20.4): a tela de fim avança por toque no layout B; avança uma vez, e só depois do fade. */
describe('tela de fim: quando o avanço vale', () => {
  it('não avança durante o fade de entrada (antes de pronta)', () => {
    expect(podeContinuarNaFim(false, false)).toBe(false);
  });
  it('avança depois do fade', () => {
    expect(podeContinuarNaFim(true, false)).toBe(true);
  });
  it('um toque duplo não avança duas vezes (já saindo)', () => {
    let saindo = false;
    let avancos = 0;
    for (let i = 0; i < 2; i++) {
      if (podeContinuarNaFim(true, saindo)) {
        saindo = true;
        avancos++;
      }
    }
    expect(avancos).toBe(1);
  });
});
