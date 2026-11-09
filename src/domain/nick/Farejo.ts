import { DURACAO_DA_SETA_MS } from './constantes';
import type { PortaASeguir } from './PortaASeguir';

/**
 * Farejo (ADR-005 seção 1.2 e 4.5): a seta de farejar, por 5 s. Entidade de sessão, sem Phaser e sem relógio: o tempo
 * entra como `ms` em `avancar`. A cena não chama `avancar` na pausa da dica nem durante a animação de farejar.
 */
export class Farejo {
  private _porta: PortaASeguir | undefined = undefined;
  private _restanteMs = 0;

  /** Mostra a seta da porta. Se já estava visível, reinicia os 5 s (F2). */
  mostrar(porta: PortaASeguir): void {
    this._porta = porta;
    this._restanteMs = DURACAO_DA_SETA_MS;
  }

  /** Passa o tempo. Ao chegar a zero, a seta some. Sem efeito se não há seta. */
  avancar(ms: number): void {
    if (!this.ativo) return;
    this._restanteMs = Math.max(0, this._restanteMs - ms);
    if (this._restanteMs === 0) this._porta = undefined;
  }

  /** Apaga a seta (trocar de subárea, 16.5.3). */
  cancelar(): void {
    this._porta = undefined;
    this._restanteMs = 0;
  }

  get ativo(): boolean {
    return this._porta !== undefined && this._restanteMs > 0;
  }

  get porta(): PortaASeguir | undefined {
    return this._porta;
  }

  get restanteMs(): number {
    return this._restanteMs;
  }
}
