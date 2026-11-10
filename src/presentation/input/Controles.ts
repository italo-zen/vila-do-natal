import Phaser from 'phaser';
import type { Acao } from './mapaDeTeclas';
import { FonteTeclado } from './FonteTeclado';
import type { FonteDeToque } from './FonteDeToque';
import { toqueDaCena } from '../ui/toque/toqueDaCena';

export type { Acao };

/**
 * Entrada de uma cena (ADR-007 seção 1.1). Compõe duas fontes com o mesmo tipo `Acao`: o teclado (sempre) e o toque
 * (só em aparelho com toque). Chame `atualizar()` uma vez por quadro, no início do update: depois, `apertada(acao)`
 * vale só para o quadro atual. `segurada(d)` é o OU das duas fontes. Criar o Controles descarta toques pendentes
 * (um toque dado na cena anterior não dispara esta).
 */
export class Controles {
  private readonly teclado: FonteTeclado;
  private readonly toque: FonteDeToque | null;
  private apertadas = new Set<Acao>();
  /** Tecla P (pausa, ADR-008 6.1): fora do mapa de ações, lida só por `atalhoApertado('pausa')`. */
  private readonly teclaPausa: Phaser.Input.Keyboard.Key | null;
  private pausaApertada = false;

  constructor(cena: Phaser.Scene) {
    this.teclado = new FonteTeclado(cena);
    this.toque = toqueDaCena(cena)?.fonte ?? null;
    this.toque?.descartar();
    this.teclaPausa = cena.input.keyboard?.addKey('P', true) ?? null;
  }

  atualizar(): void {
    const doTeclado = this.teclado.atualizar();
    const doToque = this.toque?.consumir() ?? new Set<Acao>();
    this.apertadas = new Set([...doTeclado, ...doToque]);
    this.pausaApertada = this.teclaPausa !== null && Phaser.Input.Keyboard.JustDown(this.teclaPausa);
  }

  /** Atalho de ação fora do mapa de jogo: hoje só 'pausa' (tecla P, ADR-008 6.1). Vale só no quadro da leitura. */
  atalhoApertado(nome: 'pausa'): boolean {
    return nome === 'pausa' && this.pausaApertada;
  }

  segurada(acao: Acao): boolean {
    return this.teclado.segurada(acao) || (this.toque?.segurada(acao) ?? false);
  }

  apertada(acao: Acao): boolean {
    return this.apertadas.has(acao);
  }

  /** Descarta bordas pendentes de qualquer fonte (fim do aviso de rotação, por exemplo). */
  descartarEntradas(): void {
    this.apertadas.clear();
    this.toque?.descartar();
  }
}
