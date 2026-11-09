import Phaser from 'phaser';
import { TECLAS, type Acao } from './mapaDeTeclas';

export type { Acao };

/**
 * Entrada de uma cena. Chame `atualizar()` uma vez por quadro, no início do update:
 * depois, `apertada(acao)` vale só para o quadro atual (sem repetição de tecla).
 * O mapa de teclas está em `mapaDeTeclas.ts` (também usado pelo painel da porta).
 */
export class Controles {
  private readonly teclas: Record<Acao, Phaser.Input.Keyboard.Key[]>;
  private apertadas = new Set<Acao>();

  constructor(cena: Phaser.Scene) {
    const teclado = cena.input.keyboard!;
    this.teclas = {
      cima: [],
      baixo: [],
      esquerda: [],
      direita: [],
      a: [],
      b: [],
      dica: [],
    };
    for (const acao of Object.keys(TECLAS) as Acao[]) {
      this.teclas[acao] = TECLAS[acao].map((nome) => teclado.addKey(nome, true));
    }
  }

  atualizar(): void {
    this.apertadas.clear();
    for (const acao of Object.keys(this.teclas) as Acao[]) {
      if (this.teclas[acao].some((k) => Phaser.Input.Keyboard.JustDown(k))) this.apertadas.add(acao);
    }
  }

  segurada(acao: Acao): boolean {
    return this.teclas[acao].some((k) => k.isDown);
  }

  apertada(acao: Acao): boolean {
    return this.apertadas.has(acao);
  }
}
