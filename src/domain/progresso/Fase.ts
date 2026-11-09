/** Fases do GDD seção 3, em ordem. Os valores são ids estáveis (usados no save). */
export const FASES = [
  'introducao',
  'porta',
  'luzes',
  'parte1',
  'parte2',
  'parte3',
  'enfeites',
  'creditos',
] as const;
export type Fase = (typeof FASES)[number];

export const indiceDaFase = (f: Fase): number => FASES.indexOf(f);

export function ehFase(valor: unknown): valor is Fase {
  return typeof valor === 'string' && (FASES as readonly string[]).includes(valor);
}

export function proximaFase(f: Fase): Fase | null {
  return FASES[indiceDaFase(f) + 1] ?? null;
}
