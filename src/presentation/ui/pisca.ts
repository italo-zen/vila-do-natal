/** Ciclo de 2 s do halo da árvore (GDD 14.9.3): sobe em 0,8 s até 35%, desce em 0,8 s, apagado por 0,4 s. */
export const CICLO_PISCA_MS = 2000;
export const ALFA_PISCA = 0.35;

/** Opacidade do halo no instante `ms` desde o início do ciclo. Pura. */
export function alfaDoPisca(ms: number): number {
  const t = ms % CICLO_PISCA_MS;
  if (t < 800) return (ALFA_PISCA * t) / 800;
  if (t < 1600) return ALFA_PISCA * (1 - (t - 800) / 800);
  return 0;
}

/**
 * Períodos de todos os brilhos e pulsos do jogo (AC4 do Marco 6: nada pisca mais de 3 ciclos por segundo; WCAG 2.3.1).
 * Um ciclo é ida e volta: o período é 2 × a duração de cada tween `yoyo`. Os valores são os que já estavam no código.
 */
export const PERIODOS_DE_PULSO_MS = {
  /** Halo da árvore (GDD 14.9.3). */
  halo: CICLO_PISCA_MS,
  /** Brilho dourado da peça e da caixa (GDD 15.2.4; ADR-006 2.4). */
  brilhoDaPeca: 2000,
  /** Bilhete no Hall: alfa 1 a 0,6 (GDD 14.4). Tween de 900 ms por sentido. */
  bilhete: 1800,
  /** Seta de "próxima página" do diálogo: alfa 1 a 0,2. Tween de 450 ms por sentido. */
  setaDeDialogo: 900,
} as const;

/** Pisca de 3 ciclos por segundo: o período mínimo permitido (AC4). */
export const PERIODO_MINIMO_DE_PULSO_MS = 1000 / 3;
