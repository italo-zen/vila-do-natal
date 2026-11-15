import { describe, expect, it } from 'vitest';
import { duracaoDoTremor, repeticoesDoTremor, SETA_TREMIDAS, SETA_TREMOR_MEIO_CICLO_MS } from '../../src/presentation/nick/temporizacao';

/** Tremor da seta de farejar (GDD 16.17 (a)): 2 tremidas de 0,4 s, depois parada. Sem Phaser: confere a conta do tween. */
describe('tremor da seta de farejar (GDD 16.17 (a))', () => {
  it('são 2 tremidas de 0,4 s, ou seja 800 ms no total', () => {
    expect(SETA_TREMIDAS).toBe(2);
    expect(duracaoDoTremor(SETA_TREMIDAS, SETA_TREMOR_MEIO_CICLO_MS)).toBe(800);
  });

  it('com yoyo, cada repetição é ida e volta: a duração do tween é meio × 2 × (1 + repeat)', () => {
    const total = SETA_TREMOR_MEIO_CICLO_MS * 2 * (1 + repeticoesDoTremor(SETA_TREMIDAS));
    expect(total).toBe(duracaoDoTremor(SETA_TREMIDAS, SETA_TREMOR_MEIO_CICLO_MS));
  });

  it('uma tremida não repete; zero tremidas não treme', () => {
    expect(repeticoesDoTremor(1)).toBe(0);
    expect(repeticoesDoTremor(0)).toBe(0);
  });
});
