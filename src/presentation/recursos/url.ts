/**
 * URL de um recurso da release (ADR-009 3): relativa à página, para servir em subcaminho (Pages, `/vila-do-natal/`) e na
 * raiz. Nenhum caminho começa com `/`. Função pura: a base é passada, em vez de lida de `document`.
 */
export function urlDoRecurso(caminho: string, base: string): string {
  return new URL(caminho, base).href;
}
