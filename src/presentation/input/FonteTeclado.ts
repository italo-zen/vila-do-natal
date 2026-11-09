import Phaser from 'phaser';
import { TECLAS, type Acao } from './mapaDeTeclas';

/**
 * Fonte de teclado de uma cena (ADR-007 seção 1.1): as teclas do Phaser, sem mudança de comportamento em relação
 * ao Controles anterior. `atualizar()` lê as bordas de pressionar uma vez por quadro (JustDown consome a tecla).
 */
export class FonteTeclado {
  private readonly teclas: Record<Acao, Phaser.Input.Keyboard.Key[]>;

  constructor(cena: Phaser.Scene) {
    const teclado = cena.input.keyboard!;
    this.teclas = { cima: [], baixo: [], esquerda: [], direita: [], a: [], b: [], dica: [] };
    for (const acao of Object.keys(TECLAS) as Acao[]) {
      this.teclas[acao] = TECLAS[acao].map((nome) => teclado.addKey(nome, true));
    }
  }

  /** Ações cuja tecla foi apertada neste quadro. */
  atualizar(): Set<Acao> {
    const apertadas = new Set<Acao>();
    for (const acao of Object.keys(this.teclas) as Acao[]) {
      if (this.teclas[acao].some((k) => Phaser.Input.Keyboard.JustDown(k))) apertadas.add(acao);
    }
    return apertadas;
  }

  segurada(acao: Acao): boolean {
    return this.teclas[acao].some((k) => k.isDown);
  }
}
