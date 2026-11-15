/**
 * Regra de avanço da tela de fim (GDD 20.4; BUG-M7-01). Função pura, sem Phaser: avança só depois do fade de entrada e uma
 * vez, para que toque duplo ou tecla extra não pule os créditos.
 */
export function podeContinuarNaFim(pronta: boolean, saindo: boolean): boolean {
  return pronta && !saindo;
}
