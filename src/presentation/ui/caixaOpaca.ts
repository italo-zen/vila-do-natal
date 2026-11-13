import Phaser from 'phaser';
import { numeroDaCor, perfilDe } from './tema';

/**
 * Caixa de fundo opaco com contorno externo escuro de 1 px (GDD 20.3, TI1): usada sobre a imagem de tela para o texto
 * ter contraste. Cor da caixa: `tema.caixa`. Contorno: `tema.fundo`. Borda interna: `tema.fraco`.
 */
export function caixaOpaca(cena: Phaser.Scene, x: number, y: number, w: number, h: number, profundidade: number): Phaser.GameObjects.Graphics {
  const p = perfilDe(cena);
  const g = cena.add.graphics().setDepth(profundidade);
  g.fillStyle(numeroDaCor(p.tema.fundo), 1).fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle(numeroDaCor(p.tema.caixa), 1).fillRect(x, y, w, h);
  g.lineStyle(1, numeroDaCor(p.tema.fraco), 1).strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  return g;
}
