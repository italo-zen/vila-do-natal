import Phaser from 'phaser';
import { CHAVE_ICONE_DICA } from '../assets/registro';
import { perfilDe, telaDe } from './tema';
import { areaDeToqueEmJogo, ALVO_DE_TOQUE_CSS } from './escala';
import { comToqueDaCena, fatorDaCena } from './toque/toqueDaCena';

/** Acima da penumbra, abaixo da caixa de diálogo (1000) e da tela de dica. */
const PROFUNDIDADE_ICONE = 905;

/**
 * Ícone "?" da dica, no canto superior direito (GDD 16.8.1): 32×32 px (um tile do perfil). Clique abre a dica, quando a
 * cena deixa (`podeAbrirDica`). Só aparece na exploração; a cena decide a visibilidade.
 */
export class IconeDeDica {
  private readonly imagem: Phaser.GameObjects.Image;
  /** Área de toque: com toque, pelo menos 48 CSS px, centrada no desenho (ADR-007 seção 4.5). Sem toque, o próprio desenho. */
  private readonly areaDeToque: Phaser.Geom.Rectangle | null = null;

  constructor(cena: Phaser.Scene, aoClicar: () => void) {
    const p = perfilDe(cena);
    const { largura } = telaDe(p);
    const lado = p.tile;
    this.imagem = cena.add
      .image(largura - lado - p.espaco.pequeno, p.espaco.pequeno, CHAVE_ICONE_DICA)
      .setOrigin(0, 0)
      .setDepth(PROFUNDIDADE_ICONE)
      .setVisible(false);
    if (comToqueDaCena(cena)) {
      const area = areaDeToqueEmJogo(lado, ALVO_DE_TOQUE_CSS, fatorDaCena(cena));
      const recuo = (area - lado) / 2;
      this.areaDeToque = new Phaser.Geom.Rectangle(-recuo, -recuo, area, area);
    }
    this.ativar();
    this.imagem.on('pointerdown', () => {
      if (this.imagem.visible) aoClicar();
    });
  }

  private ativar(): void {
    if (this.areaDeToque) this.imagem.setInteractive(this.areaDeToque, Phaser.Geom.Rectangle.Contains);
    else this.imagem.setInteractive({ useHandCursor: true });
  }

  setVisible(v: boolean): void {
    this.imagem.setVisible(v);
    if (v) this.ativar();
    else this.imagem.disableInteractive();
  }

  destruir(): void {
    this.imagem.destroy();
  }
}
