import Phaser from 'phaser';
import { CHAVE_ICONE_DICA } from '../assets/registro';
import { perfilDe, telaDe } from './tema';

/** Acima da penumbra, abaixo da caixa de diálogo (1000) e da tela de dica. */
const PROFUNDIDADE_ICONE = 905;

/**
 * Ícone "?" da dica, no canto superior direito (GDD 16.8.1): 32×32 px (um tile do perfil). Clique abre a dica, quando a
 * cena deixa (`podeAbrirDica`). Só aparece na exploração; a cena decide a visibilidade.
 */
export class IconeDeDica {
  private readonly imagem: Phaser.GameObjects.Image;

  constructor(cena: Phaser.Scene, aoClicar: () => void) {
    const p = perfilDe(cena);
    const { largura } = telaDe(p);
    const lado = p.tile;
    this.imagem = cena.add
      .image(largura - lado - p.espaco.pequeno, p.espaco.pequeno, CHAVE_ICONE_DICA)
      .setOrigin(0, 0)
      .setDepth(PROFUNDIDADE_ICONE)
      .setVisible(false);
    this.imagem.setInteractive({ useHandCursor: true });
    this.imagem.on('pointerdown', () => {
      if (this.imagem.visible) aoClicar();
    });
  }

  setVisible(v: boolean): void {
    this.imagem.setVisible(v);
    if (v) this.imagem.setInteractive({ useHandCursor: true });
    else this.imagem.disableInteractive();
  }

  destruir(): void {
    this.imagem.destroy();
  }
}
