/**
 * Trava de reentrada (ADR-011 seção 3.4). Ao fim do fade de uma porta, o que está segurado (direções e A) fica travado:
 * conta como solto até a fonte (teclado ou joystick) realmente soltar. Quem segurou a direção durante a travessia continua
 * andando para dentro da área nova sem voltar; voltar exige soltar e apertar de novo. Sem Phaser, para ser testável.
 */
export class TravaDeEntrada<A extends string> {
  private readonly travadas = new Set<A>();

  /** Trava tudo o que está segurado agora. */
  travar(seguradas: Iterable<A>): void {
    for (const a of seguradas) this.travadas.add(a);
  }

  /**
   * O estado efetivo de uma ação, dado o estado real da fonte. Travada e ainda segurada: falso. Travada e solta: destrava
   * (a próxima vez que for segurada vale).
   */
  filtrar(acao: A, segurada: boolean): boolean {
    if (!this.travadas.has(acao)) return segurada;
    if (!segurada) this.travadas.delete(acao);
    return false;
  }

  /** Há alguma ação travada? */
  get ativa(): boolean {
    return this.travadas.size > 0;
  }

  limpar(): void {
    this.travadas.clear();
  }
}
