import Phaser from 'phaser';
import { estilo, perfilDe } from '../ui/tema';

/** Profundidade dos balões: acima da penumbra (800), abaixo da barra e dos diálogos (ADR-005 seção 6, GDD 16.5.3). */
const PROFUNDIDADE_BALAO = 860;

/**
 * Balão sobre o Nick (ADR-005 seção 7.1; GDD 16.5.4, 16.5.5, 16.3). O balão é sprite; o texto "Au!" vem de
 * `nick.latido` (conteúdo) e é desenhado por cima. A cena apaga o balão pelo seu próprio tempo de jogo (pausa com a dica).
 */
export class BalaoDoNick {
  private imagem: Phaser.GameObjects.Image | null = null;
  private texto: Phaser.GameObjects.Text | null = null;

  constructor(private readonly cena: Phaser.Scene) {}

  /** `x`, `y`: canto do quadro do Nick, em px da tela. `chave`: CHAVE_BALAO.au ou .zzz. */
  mostrar(chave: string, x: number, y: number, quadroW: number, textoDoBalao?: string): void {
    this.apagar();
    const p = perfilDe(this.cena);
    const img = this.cena.add.image(0, 0, chave).setOrigin(0.5, 1).setDepth(PROFUNDIDADE_BALAO);
    const cx = x + quadroW / 2;
    img.setPosition(cx, y);
    this.imagem = img;
    if (textoDoBalao) {
      this.texto = this.cena.add
        .text(cx, y - img.height / 2, textoDoBalao, estilo(p, p.fonte.grade, p.tema.fundo))
        .setOrigin(0.5)
        .setDepth(PROFUNDIDADE_BALAO + 1);
    }
  }

  apagar(): void {
    this.imagem?.destroy();
    this.texto?.destroy();
    this.imagem = null;
    this.texto = null;
  }
}
