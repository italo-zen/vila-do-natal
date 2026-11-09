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
