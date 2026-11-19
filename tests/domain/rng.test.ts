import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { criarRng } from '../../src/domain/shared/Rng';

const conhecidos = JSON.parse(readFileSync(new URL('../fixtures/rng-mulberry32.json', import.meta.url), 'utf-8')) as Record<string, number[]>;

describe('Rng mulberry32 (ADR-013 seção 2)', () => {
  for (const [semente, esperado] of Object.entries(conhecidos)) {
    it(`semente ${semente}: 10 valores iguais aos da segunda implementação`, () => {
      const r = criarRng(Number(semente));
      expect(esperado.map(() => r.proximo())).toEqual(esperado);
    });
  }
  it('mesma semente, mesma sequência; sementes diferentes, sequências diferentes', () => {
    const a = criarRng(7), b = criarRng(7), c = criarRng(8);
    const sa = Array.from({ length: 20 }, () => a.proximo());
    expect(Array.from({ length: 20 }, () => b.proximo())).toEqual(sa);
    expect(Array.from({ length: 20 }, () => c.proximo())).not.toEqual(sa);
  });
  it('inteiro(n) fica em [0, n) e cobre todos os valores', () => {
    for (const n of [1, 2, 7, 60]) {
      const r = criarRng(n * 31);
      const vistos = new Set<number>();
      for (let i = 0; i < 100000; i++) {
        const v = r.inteiro(n);
        expect(v >= 0 && v < n && Number.isInteger(v)).toBe(true);
        vistos.add(v);
      }
      expect(vistos.size).toBe(n);
    }
  });
  it('inteiro recusa n inválido', () => {
    expect(() => criarRng(1).inteiro(0)).toThrow();
    expect(() => criarRng(1).inteiro(1.5)).toThrow();
  });
});
