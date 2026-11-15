/**
 * Condução automática (GDD 14.11.3; ADR-004 seção 11.3). Regra de jogo, não arte: fica no domínio.
 * O trajeto usa a velocidade normal do Sobrinho; passa a 2× só se a rota, do início ao fim, passa do limite.
 */
export const CONDUCAO_LIMITE_RAPIDO_TILES = 10;
export const CONDUCAO_FATOR_RAPIDO = 2;

/** Fator de velocidade do trajeto, decidido antes do primeiro passo (vale para o trajeto inteiro). */
export function fatorDaConducao(passos: number): number {
  return passos > CONDUCAO_LIMITE_RAPIDO_TILES ? CONDUCAO_FATOR_RAPIDO : 1;
}
