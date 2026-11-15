import Phaser from 'phaser';
import { estilo, perfilDe } from '../ui/tema';
import { maiorTamanhoQueCabe, tamanhosAteOPiso } from '../ui/tamanhoDoTexto';

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
      // Piso de 12 px (backlog 131): o maior tamanho que cabe no balão com 4 px de folga de cada lado.
      const tamanho = maiorTamanhoQueCabe(tamanhosAteOPiso(p.fonte.corpo), (t) => this.larguraDoTexto(textoDoBalao, t), img.width - 8);
      this.texto = this.cena.add
        .text(cx, y - img.height / 2, textoDoBalao, estilo(p, tamanho, p.tema.fundo))
        .setOrigin(0.5)
        .setDepth(PROFUNDIDADE_BALAO + 1);
    }
  }

  private larguraDoTexto(texto: string, tamanho: number): number {
    const p = perfilDe(this.cena);
    const medida = this.cena.add.text(0, 0, texto, estilo(p, tamanho));
    const largura = medida.width;
    medida.destroy();
    return largura;
  }

  apagar(): void {
    this.imagem?.destroy();
    this.texto?.destroy();
    this.imagem = null;
    this.texto = null;
  }
}
