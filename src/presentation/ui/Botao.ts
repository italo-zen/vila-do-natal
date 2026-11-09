import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe } from './tema';

/** Tempo do estado pressionado (GDD 14.9.4). Tempo de jogo, não de arte. */
export const PRESSIONADO_MS = 150;

export interface OpcoesBotao {
  w: number;
  h: number;
  tamanho: number;
  /** ">" à esquerda quando tem foco (título e Como jogar). */
  marca?: boolean;
  /** Espessura da borda em foco. Padrão: perfil (botao.bordaFoco). Teclas do painel usam bordaFocoTecla. */
  bordaFoco?: number;
  /** Posição vertical do texto, se diferente do centro (cartões da seleção). */
  textoY?: number;
  /** Clique do mouse (só título e Como jogar). */
  mouse?: boolean;
  /** Profundidade base; o texto e a marca ficam 1 e 2 acima. Painel da porta usa 2010. */
  profundidade?: number;
}

/**
 * Botão com caixa e borda (GDD 14.9.4). Estados: normal, foco e pressionado (150 ms após A ou clique).
 * Cores, bordas e recuo da marca vêm do perfil (`tema` e `botao`). Texto informativo não usa esta classe.
 */
export class Botao {
  readonly zona: Phaser.GameObjects.Zone | null = null;
  private readonly fundo: Phaser.GameObjects.Graphics;
  private readonly texto: Phaser.GameObjects.Text;
  private readonly marca: Phaser.GameObjects.Text | null = null;
  private focado = false;
  private pressionadoAte = 0;

  /** (x, y) é o centro do botão. */
  constructor(
    private readonly cena: Phaser.Scene,
    private readonly x: number,
    private readonly y: number,
    rotulo: string,
    private readonly o: OpcoesBotao,
  ) {
    const p = perfilDe(cena);
    const base = o.profundidade ?? 10;
    // Fixo na tela (não acompanha a câmera da sala).
    this.fundo = cena.add.graphics().setScrollFactor(0).setDepth(base);
    this.texto = cena.add
      .text(x, o.textoY ?? y, rotulo, estilo(p, o.tamanho, p.tema.texto))
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(base + 1);
    if (o.marca) {
      this.marca = cena.add
        .text(x - o.w / 2 - p.botao.recuoMarca, y, '>', estilo(p, o.tamanho, p.tema.destaque))
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(base + 2)
        .setVisible(false);
    }
    if (o.mouse) {
      this.zona = cena.add.zone(x, y, o.w, o.h).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });
    }
    this.redesenhar();
  }

  destruir(): void {
    this.fundo.destroy();
    this.texto.destroy();
    this.marca?.destroy();
    this.zona?.destroy();
  }

  get sobreMouse(): Phaser.GameObjects.Zone | null {
    return this.zona;
  }

  setFoco(focado: boolean): void {
    this.focado = focado;
    this.redesenhar();
  }

  /** A, Z, Enter ou clique: fica pressionado por 150 ms e depois volta ao estado normal ou de foco. */
  pressionar(): void {
    this.pressionadoAte = this.cena.time.now + PRESSIONADO_MS;
    this.redesenhar();
    this.cena.time.delayedCall(PRESSIONADO_MS, () => this.redesenhar());
  }

  private redesenhar(): void {
    const p = perfilDe(this.cena);
    const { w, h } = this.o;
    const bordaFoco = this.o.bordaFoco ?? p.botao.bordaFoco;
    const pressionado = this.cena.time.now < this.pressionadoAte;
    let fundo = p.tema.caixa;
    let borda = p.tema.fraco;
    let espessura = p.botao.bordaNormal;
    let cor = p.tema.texto;
    if (pressionado) {
      fundo = p.tema.destaque;
      borda = p.tema.destaque;
      espessura = p.botao.bordaPressionada;
      cor = p.tema.fundo;
    } else if (this.focado) {
      borda = p.tema.destaque;
      espessura = bordaFoco;
      cor = p.tema.destaque;
    }
    const x0 = this.x - w / 2;
    const y0 = this.y - h / 2;
    this.fundo.clear();
    this.fundo.fillStyle(numeroDaCor(fundo), 1).fillRect(x0, y0, w, h);
    this.fundo.lineStyle(espessura, numeroDaCor(borda), 1).strokeRect(x0 + espessura / 2, y0 + espessura / 2, w - espessura, h - espessura);
    this.texto.setColor(cor);
    this.marca?.setVisible(this.focado);
  }
}
