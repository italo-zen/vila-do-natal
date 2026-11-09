/**
 * Tempos de animação do Nick, dos balões e da seta (ADR-005 seção 7.2). Tempo de apresentação, não regra de jogo: o
 * domínio não sabe quanto dura uma animação. Valores de GDD 16.3 a 16.8.
 */

/** Acordar: 4 quadros, cerca de 1,2 s (GDD 16.3). O balão "Au!" aparece no segundo quadro. */
export const ACORDAR_MS = 1200;
/** Farejar: 4 quadros, cerca de 1,2 s, antes da seta ou do "Au!" (GDD 16.5.3). */
export const FAREJAR_MS = 1200;
/** Balão "Au!" ou "zzz" sobre o Nick (GDD 16.5.4, 16.5.5). */
export const BALAO_MS = 1500;
/** Abanar (animação feliz, sem texto, GDD 16.3 e 16.5.6). */
export const ABANAR_MS = 1000;
/** Feliz depois de uma conquista: 4 quadros, 1,6 s (GDD 16.7). */
export const FELIZ_MS = 1600;
/** Fumacinha de dormir: 0,5 s (GDD 16.6). */
export const FUMACA_MS = 500;
/**
 * Seta de farejar (GDD 16.17 (a), 16.5.3, pergunta 35): ao aparecer (fim do farejando), 2 tremidas de 0,4 s cada, 2 px para
 * um lado e para o outro. Cada tremida são 2 meios-ciclos de 200 ms (ida e volta). Depois fica parada, amarela
 * (`spr_seta_farejar_*`, #f4d35e), até os 5 s. O sobe e desce saiu.
 */
export const SETA_TREMOR_PX = 2;
export const SETA_TREMOR_MEIO_CICLO_MS = 200;
/** Tremidas da seta ao aparecer (GDD 16.17 (a)). */
export const SETA_TREMIDAS = 2;

/**
 * Tween com `yoyo: true` faz, em cada repetição, ida e volta. Por isso `repeat` é `tremidas - 1` (e não 2 × tremidas − 1),
 * e a duração total é `meio × 2 × tremidas` = 800 ms. (Bug do PT3 v0.7.1: repeat 3 dava 4 tremidas, 1,6 s.)
 */
export function repeticoesDoTremor(tremidas: number): number {
  return Math.max(0, tremidas - 1);
}

/** Duração total do tremor, em ms: cada tremida é ida e volta de `meioCicloMs`. */
export function duracaoDoTremor(tremidas: number, meioCicloMs: number): number {
  return meioCicloMs * 2 * tremidas;
}
/** Fade de saída da seta quando o tempo acaba (GDD 16.5.3). */
export const SETA_FADE_MS = 500;
/** Quadros de andar por segundo do Nick (animação; o sobrinho usa o próprio fps do perfil). */
export const FPS_ANDAR_DO_NICK = 6;
/** Respiração de quem dorme. */
export const FPS_DORMIR_DO_NICK = 2;
