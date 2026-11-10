import { describe, expect, it } from 'vitest';
import { LIMITE_DE_VOZES, Vozes } from '../../../src/presentation/audio/vozes';

/** ADR-008 R7 e 9.1 (AU5): o quarto efeito para o mais antigo; nunca mais de 3 vozes. */
describe('limite de três efeitos (AU5)', () => {
  it('o limite é 3', () => {
    expect(LIMITE_DE_VOZES).toBe(3);
  });

  it('o quarto efeito faz parar o mais antigo', () => {
    const v = new Vozes<string>();
    expect(v.registrar('a')).toEqual([]);
    expect(v.registrar('b')).toEqual([]);
    expect(v.registrar('c')).toEqual([]);
    expect(v.registrar('d')).toEqual(['a']);
    expect(v.total()).toBe(3);
  });

  it('nunca há mais de 3 vozes, mesmo com 100 efeitos seguidos', () => {
    const v = new Vozes<number>();
    for (let i = 0; i < 100; i++) {
      v.registrar(i);
      expect(v.total()).toBeLessThanOrEqual(3);
    }
  });

  it('uma voz que termina sai da conta', () => {
    const v = new Vozes<string>();
    v.registrar('a');
    v.registrar('b');
    v.remover('a');
    expect(v.total()).toBe(1);
    expect(v.registrar('c')).toEqual([]);
    expect(v.total()).toBe(2);
  });
});
