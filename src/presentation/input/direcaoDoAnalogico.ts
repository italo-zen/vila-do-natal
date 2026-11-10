/**
 * Direção do joystick virtual (GDD 18.19.4; ADR-007 seção 1.3). Função pura, sem DOM e sem Phaser: recebe o
 * deslocamento do dedo a partir do centro da base (CSS px) e a direção que valia antes, e devolve a direção que vale
 * agora (ou nenhuma). Substitui a antiga pilha de direções da cruz, que saiu do código (ADR-007 1.3).
 */
export type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita';

/** Distância `≤ 12` solta a direção (zona morta, GDD 18.19.4). */
export const ZONA_MORTA_CSS = 12;
/** Distância `≥ 20` engaja a direção, mas só a partir do repouso (histerese: depois, vale até 12). */
export const LIMIAR_CSS = 20;

/**
 * Ordem de decisão (GDD 18.19.4): (1) distância `≤ 12`: nenhuma. (2) Em repouso e distância menor que 20: nenhuma.
 * (3) Empate exato dos eixos: a anterior, ou nenhuma. (4) Eixo dominante decide a direção. Distância euclidiana.
 * Y cresce para baixo, como na tela.
 */
export function direcaoDoAnalogico(dx: number, dy: number, anterior: Direcao | null): Direcao | null {
  const distancia = Math.hypot(dx, dy);
  if (distancia <= ZONA_MORTA_CSS) return null;
  if (anterior === null && distancia < LIMIAR_CSS) return null;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax === ay) return anterior;
  if (ax > ay) return dx > 0 ? 'direita' : 'esquerda';
  return dy > 0 ? 'baixo' : 'cima';
}
