/**
 * Limite de efeitos simultâneos (ADR-008 R7; GDD 19.2.2; AU5). No máximo 3 efeitos ao mesmo tempo: o quarto para o mais
 * antigo. A música não entra nesta conta. Função de estado, sem Phaser e sem Web Audio (o chamador para a voz devolvida).
 */
export const LIMITE_DE_VOZES = 3;

export class Vozes<T> {
  private ativas: T[] = [];

  constructor(private readonly limite = LIMITE_DE_VOZES) {}

  /** Registra uma voz nova. Devolve as vozes que precisam parar (as mais antigas além do limite). */
  registrar(voz: T): T[] {
    this.ativas.push(voz);
    const paradas: T[] = [];
    while (this.ativas.length > this.limite) paradas.push(this.ativas.shift()!);
    return paradas;
  }

  /** A voz acabou (fim do arquivo ou parada). */
  remover(voz: T): void {
    this.ativas = this.ativas.filter((v) => v !== voz);
  }

  total(): number {
    return this.ativas.length;
  }

  limpar(): T[] {
    const todas = this.ativas;
    this.ativas = [];
    return todas;
  }
}
