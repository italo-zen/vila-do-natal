/**
 * Constantes do Nick (ADR-005 seções 1.2 e 4.5). Regras de jogo: ficam no domínio, nunca no perfil de arte.
 * Tempos de animação não estão aqui (são da apresentação, `presentation/nick/temporizacao.ts`).
 */

/**
 * O Nick anda 1 tile atrás do sobrinho, encostado, pelo caminho dele (ajuste do PT3, 2026-11-09; antes eram 2, GDD 16.4.1).
 * A fila guarda `CASAS_ATRAS_DO_NICK + 1` posições.
 */
export const CASAS_ATRAS_DO_NICK = 1;

/** Quanto tempo a seta de farejar fica na tela (GDD 16.5.3). Sem cooldown e sem limite (pilares 1 e 2). */
export const DURACAO_DA_SETA_MS = 5000;
