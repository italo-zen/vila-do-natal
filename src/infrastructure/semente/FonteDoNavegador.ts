import type { FonteDeSemente } from '../../application/ports/FonteDeSemente';

/** Semente nova de `crypto.getRandomValues`, com reserva no relógio (infraestrutura pode usar relógio; domínio e aplicação não). */
export function criarFonteDoNavegador(): FonteDeSemente {
  return {
    nova(): number {
      const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } }).crypto;
      if (c?.getRandomValues) return c.getRandomValues(new Uint32Array(1))[0];
      return Date.now() >>> 0;
    },
  };
}
