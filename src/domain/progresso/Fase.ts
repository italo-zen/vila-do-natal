/**
 * Fases do GDD seção 3, em ordem. `creditos` não é fase (ADR-006 seção 1.1): os créditos não têm conquista, condução
 * nem chegada, e ficam fora de `Progresso`. Os valores são ids do domínio; não há save (ADR-002 seção 3).
 */
export const FASES = ['introducao', 'porta', 'luzes', 'parte1', 'parte2', 'parte3', 'enfeites'] as const;
export type Fase = (typeof FASES)[number];

export const indiceDaFase = (f: Fase): number => FASES.indexOf(f);

export function ehFase(valor: unknown): valor is Fase {
  return typeof valor === 'string' && (FASES as readonly string[]).includes(valor);
}

export function proximaFase(f: Fase): Fase | null {
  return FASES[indiceDaFase(f) + 1] ?? null;
}
