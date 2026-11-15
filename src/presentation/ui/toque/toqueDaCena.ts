import type Phaser from 'phaser';
import type { ControlesDeToque } from './ControlesDeToque';

/** Controles de toque do jogo (um só, criado no boot em aparelho com toque). Null sem toque. */
export function toqueDaCena(cena: Phaser.Scene): ControlesDeToque | null {
  return (cena.registry.get('toque') as ControlesDeToque | null | undefined) ?? null;
}

/** Aparelho com toque, lido do registro (uma vez no boot; ADR-007 seção 2.1). */
export function comToqueDaCena(cena: Phaser.Scene): boolean {
  return cena.registry.get('comToque') === true;
}

/** Fator de escala atual (CSS px por pixel de jogo), atualizado a cada ajuste de tela. */
export function fatorDaCena(cena: Phaser.Scene): number {
  return (cena.registry.get('fatorEscala') as number | undefined) ?? 1;
}
