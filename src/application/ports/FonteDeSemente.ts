/** Fonte de uma semente nova para o sorteio da partida (ADR-013 seção 2). O adaptador do navegador usa `crypto`; o teste injeta uma fixa. */
export interface FonteDeSemente {
  /** Inteiro de 32 bits sem sinal. */
  nova(): number;
}
