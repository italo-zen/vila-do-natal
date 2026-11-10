/**
 * Liberação do áudio no primeiro gesto (ADR-008 2.1; GDD 19.2.3). Função pura: o navegador só deixa tocar depois de um
 * gesto do jogador. `Esc` não conta (o navegador não o trata como gesto). O gesto libera uma vez só.
 */
export const GESTOS_QUE_LIBERAM = ['pointerdown', 'pointerup', 'touchend', 'mousedown', 'click', 'keydown'] as const;

/** true se o evento do navegador é um gesto que libera o som (tipo e, para teclado, a tecla). */
export function gestoLibera(tipo: string, tecla?: string): boolean {
  if (!(GESTOS_QUE_LIBERAM as readonly string[]).includes(tipo)) return false;
  if (tipo === 'keydown' && (tecla === 'Escape' || tecla === 'Esc')) return false;
  return true;
}

/** Controle de uma vez só: `tentar` devolve true apenas no primeiro gesto que libera. */
export class LiberacaoDoSom {
  private liberado = false;

  tentar(tipo: string, tecla?: string): boolean {
    if (this.liberado || !gestoLibera(tipo, tecla)) return false;
    this.liberado = true;
    return true;
  }

  estaLiberado(): boolean {
    return this.liberado;
  }
}
