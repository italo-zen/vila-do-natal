import { direcaoDoAnalogico, type Direcao } from './direcaoDoAnalogico';
import type { Acao } from './mapaDeTeclas';

/**
 * Fonte de toque (ADR-007 seções 1.1, 1.3 e 1.5; GDD 18.19). Guarda o joystick virtual e os botões A e B para a próxima
 * leitura. Sem Phaser e sem DOM: quem fala com o DOM é o `ControlesDeToque`, que chama estes métodos.
 *
 * - Joystick: um dono (o `pointerId` que começou dentro da base). Só ele comanda, até soltar. `segurada(d)` vale
 *   enquanto a direção engajada é `d`.
 * - Borda de direção (`apertada`): só no engajamento a partir do repouso, e só nas telas de menu (`definirBordas`).
 *   Segurar não gera borda; trocar de direção sem voltar à zona morta não gera borda (contrato de menu, ADR-007 7.1).
 * - A e B: borda de pressionar, uma por toque.
 */
export class FonteDeToque {
  private pendentes = new Set<Acao>();
  private bloqueada = false;
  private bordas = false;
  private dono: number | null = null;
  private direcao: Direcao | null = null;
  private dx = 0;
  private dy = 0;

  /** A ou B foi pressionado (borda). Ignorado enquanto a fonte está bloqueada (aviso de rotação). */
  pressionarBotao(acao: 'a' | 'b'): void {
    if (!this.bloqueada) this.pendentes.add(acao);
  }

  /**
   * Um dedo começou dentro da base. Vira o dono só se não há dono (o segundo dedo na base não muda nada, GDD 18.19.5).
   * Devolve true se o dedo passou a comandar, para o DOM capturar o ponteiro só nesse caso.
   */
  pressionarBase(id: number, dx: number, dy: number): boolean {
    if (this.bloqueada || this.dono !== null) return false;
    this.dono = id;
    this.dx = 0;
    this.dy = 0;
    this.aplicar(dx, dy);
    return true;
  }

  /** O dono moveu o dedo. Outro ponteiro não age. */
  moverBase(id: number, dx: number, dy: number): void {
    if (id !== this.dono) return;
    this.aplicar(dx, dy);
  }

  /** O dono soltou (ou perdeu a captura). Zera a direção; soltar não gera borda. Outro ponteiro não age. */
  soltarBase(id: number): void {
    if (id !== this.dono) return;
    this.dono = null;
    this.direcao = null;
    this.dx = 0;
    this.dy = 0;
  }

  /** Deslocamento atual do dono, em CSS px a partir do centro da base (0, 0 sem dono). */
  deslocamento(): { dx: number; dy: number } {
    return { dx: this.dx, dy: this.dy };
  }

  /** Dono atual (pointerId), ou null. Para o QA e o DOM. */
  donoAtual(): number | null {
    return this.dono;
  }

  /** Direção engajada agora, ou null. */
  direcaoAtual(): Direcao | null {
    return this.direcao;
  }

  /** Liga ou desliga a borda de direção (a tela atual é um menu que a lê). Desligada, o joystick só segura. */
  definirBordas(ligado: boolean): void {
    this.bordas = ligado;
  }

  segurada(acao: Acao): boolean {
    return this.direcao === acao;
  }

  /** Bordas de pressionar e de engajamento desde a última leitura. Esvazia a fila. */
  consumir(): Set<Acao> {
    const lidas = this.pendentes;
    this.pendentes = new Set();
    return lidas;
  }

  /** Descarta bordas que ainda não foram lidas (troca de cena). Não solta o dedo: o estado do joystick continua. */
  descartar(): void {
    this.pendentes.clear();
  }

  /** Solta o joystick e tira o dono (troca de tela, de layout ou de modo). Não gera borda. */
  soltarTudo(): void {
    this.dono = null;
    this.direcao = null;
    this.dx = 0;
    this.dy = 0;
  }

  /** Aviso de rotação: bloqueia e zera tudo, bordas incluídas. */
  bloquear(bloqueada: boolean): void {
    this.bloqueada = bloqueada;
    if (bloqueada) {
      this.pendentes.clear();
      this.soltarTudo();
    }
  }

  private aplicar(dx: number, dy: number): void {
    this.dx = dx;
    this.dy = dy;
    const nova = direcaoDoAnalogico(dx, dy, this.direcao);
    // Borda só no engajamento a partir do repouso (direção anterior nula). Trocar de direção não gera borda (ADR-007 7.1 M3).
    if (this.direcao === null && nova !== null && this.bordas) this.pendentes.add(nova);
    this.direcao = nova;
  }
}
