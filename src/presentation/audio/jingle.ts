/**
 * Jingles de conquista e de créditos (ADR-008 5.1 e 5.2; GDD 19.2.7). Constantes e funções puras: o relógio é o do motor
 * (segundos), sem timers de JavaScript. O `Som` aplica os resultados com o motor.
 */

/** Constantes de código (ADR-008 5.2). Um teste confere que batem com o GDD 19.2.7 (jingle.test.ts). */
export const DUCKING_CONQUISTA_DB = -8;
export const ENTRADA_CONQUISTA_S = 0.3;
export const SAIDA_CONQUISTA_S = 0.5;
export const DUCKING_CREDITOS_DB = -10;
export const ENTRADA_CREDITOS_S = 0.5;
export const SAIDA_CREDITOS_S = 0.5;
/** Teto de espera do jingle de conquista por um efeito em curso (S04, S05 ou S06). */
export const ESPERA_MAXIMA_S = 1.5;
/** Rampa de corte (Continuar, X, B ou sair dos créditos), sem clique. */
export const RAMPA_DE_CORTE_S = 0.03;

export const CONSTANTES_DO_JINGLE = {
  duckingConquistaDb: DUCKING_CONQUISTA_DB,
  entradaConquistaS: ENTRADA_CONQUISTA_S,
  saidaConquistaS: SAIDA_CONQUISTA_S,
  duckingCreditosDb: DUCKING_CREDITOS_DB,
  entradaCreditosS: ENTRADA_CREDITOS_S,
  saidaCreditosS: SAIDA_CREDITOS_S,
  esperaMaximaS: ESPERA_MAXIMA_S,
  rampaDeCorteS: RAMPA_DE_CORTE_S,
} as const;

export type EstadoDoJingle = 'ocioso' | 'esperando' | 'tocando' | 'saindo';

/** Fim de um efeito em curso: só o instante de término importa para a espera. */
export interface EfeitoEmCurso {
  fimEm: number;
}

/**
 * Quando o jingle de conquista começa (5.2). Se um efeito S04, S05 ou S06 está tocando, o jingle espera o fim dele, com
 * teto de 1,5 s. A tela não espera: só o som. Retorna o início e o fim previsto no relógio do motor.
 */
export function planejarConquista(duracaoS: number, agora: number, efeitoEmCurso: EfeitoEmCurso | null): { inicioEm: number; fimPrevisto: number } {
  const inicioEm = efeitoEmCurso && efeitoEmCurso.fimEm > agora ? Math.min(efeitoEmCurso.fimEm, agora + ESPERA_MAXIMA_S) : agora;
  return { inicioEm, fimPrevisto: inicioEm + duracaoS };
}

/** Estado de um jingle no instante `agora`, derivado dos instantes (sem estado oculto). */
export interface JingleNoTempo {
  inicioEm: number;
  fimEm: number;
  saidaS: number;
  /** Instante do corte (Continuar, X, B ou sair dos créditos); nulo se não houve. */
  cortadoEm: number | null;
}

export function estadoDoJingle(j: JingleNoTempo, agora: number): EstadoDoJingle {
  if (j.cortadoEm !== null) {
    // Cortado antes de começar: nunca tocou.
    if (agora < j.inicioEm) return 'ocioso';
    return agora < j.cortadoEm + RAMPA_DE_CORTE_S ? 'saindo' : 'ocioso';
  }
  if (agora < j.inicioEm) return 'esperando';
  if (agora < j.fimEm) return 'tocando';
  if (agora < j.fimEm + j.saidaS) return 'saindo';
  return 'ocioso';
}
