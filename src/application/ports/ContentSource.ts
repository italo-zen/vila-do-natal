/**
 * Porta de conteúdo (ADR-001). Devolve JSON bruto; a validação é da aplicação.
 * Os ids referem-se às entradas do manifesto (ADR-002 seção 2).
 */
export interface ContentSource {
  manifesto(): Promise<unknown>;
  /** JSON do perfil de arte (content/art-profiles/<id>.json). Só o perfil ativo está disponível na build. */
  perfilDeArte(id: string): Promise<unknown>;
  mapa(id: string): Promise<unknown>;
  textos(locale: string): Promise<unknown>;
  missao(id: string): Promise<unknown>;
}
