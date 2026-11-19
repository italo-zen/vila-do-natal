/**
 * Gerador de números pseudoaleatórios injetável (GDD 21.16.5; ADR-013 seção 2). Nenhum gerador global solto no código de jogo: o sorteio recebe
 * um `Rng`, e a mesma semente dá a mesma sequência em qualquer aparelho. Algoritmo fixo: mulberry32 (só aritmética de 32 bits).
 * Mudar o algoritmo muda todos os planos e exige novo ADR.
 */
export interface Rng {
  /** Próximo valor em [0, 1), com 32 bits de resolução. */
  proximo(): number;
  /** Inteiro em [0, n), n >= 1. Igual a floor(proximo() * n). */
  inteiro(n: number): number;
}

/**
 * Embaralha a semente antes do mulberry32 (finalizador do murmur3, só aritmética de 32 bits): sementes vizinhas (500, 501, 513...)
 * dão sequências sem relação. Sem isso, o primeiro sorteio de sementes próximas saía igual (achado do QA da 1.3.0).
 */
export function embaralharSemente(semente: number): number {
  let h = ((semente >>> 0) + 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

export function criarRng(semente: number): Rng {
  let estado = embaralharSemente(semente);
  const proximo = (): number => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t = t ^ (t + Math.imul(t ^ (t >>> 7), t | 61));
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    proximo,
    inteiro(n: number): number {
      if (!Number.isInteger(n) || n < 1) throw new Error(`Rng.inteiro: n precisa ser inteiro >= 1 (veio ${n}).`);
      return Math.floor(proximo() * n);
    },
  };
}
