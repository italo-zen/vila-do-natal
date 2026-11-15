import Phaser from 'phaser';
import { perfilDe } from '../tema';
import { areaDeToqueEmJogo, ALVO_DE_TOQUE_CSS } from '../escala';
import { comToqueDaCena, fatorDaCena } from '../toque/toqueDaCena';
import { PRESSIONADO_MS } from '../Botao';

/** Acima da penumbra, como o "?" (GDD 19.3.2; 16.8.1). */
const PROFUNDIDADE_ICONE = 905;

export type NomeDoIcone = 'pausa' | 'som';

/**
 * Ícone de 32 px de jogo no canto superior esquerdo (GDD 19.3.2; ADR-008 7.2): II (pausa) ou som (ligado ou desligado).
 * Toque e mouse: a área de toque é de 48 CSS px (ADR-007 4.5). Ao ser tocado, mostra a versão pressionada por 150 ms.
 * Registra-se no registro do Phaser (`icone:<nome>`) para o gancho de QA; sai do registro quando a cena encerra.
 */
export class IconeDeTela {
  private readonly imagem: Phaser.GameObjects.Image;
  private chaves: { repouso: string; pressionado: string };

  constructor(
    private readonly cena: Phaser.Scene,
    readonly nome: NomeDoIcone,
    x: number,
    y: number,
    chaves: { repouso: string; pressionado: string },
    private readonly aoAtivar: () => void,
  ) {
    this.chaves = chaves;
    const p = perfilDe(cena);
    const lado = p.tile;
    this.imagem = cena.add
      .image(x, y, chaves.repouso)
      .setOrigin(0, 0)
      .setDepth(PROFUNDIDADE_ICONE)
      .setScrollFactor(0)
      .setVisible(false);
    this.imagem.setData('icone', nome);
    if (comToqueDaCena(cena)) {
      const area = areaDeToqueEmJogo(lado, ALVO_DE_TOQUE_CSS, fatorDaCena(cena));
      const recuo = (area - lado) / 2;
      this.imagem.setInteractive(new Phaser.Geom.Rectangle(-recuo, -recuo, area, area), Phaser.Geom.Rectangle.Contains);
    } else {
      this.imagem.setInteractive({ useHandCursor: true });
    }
    this.imagem.disableInteractive();
    this.imagem.on('pointerdown', () => {
      if (!this.imagem.visible) return;
      this.mostrarPressionado();
      this.aoAtivar();
    });
    cena.registry.set(`icone:${nome}`, this);
    cena.events.once(Phaser.Scenes.Events.SHUTDOWN, () => cena.registry.set(`icone:${nome}`, null));
  }

  /** Mostra ou esconde. Escondido, não recebe toque. */
  setVisivel(visivel: boolean): void {
    if (this.imagem.visible === visivel) return;
    this.imagem.setVisible(visivel);
    if (visivel) this.imagem.setInteractive();
    else this.imagem.disableInteractive();
  }

  /** Troca o par de sprites (ex.: som ligado ou desligado). Não muda a posição nem a área. */
  trocarChaves(chaves: { repouso: string; pressionado: string }): void {
    if (chaves.repouso === this.chaves.repouso) return;
    this.chaves = chaves;
    this.imagem.setTexture(chaves.repouso);
  }

  get visivelNaTela(): boolean {
    return this.imagem.visible && this.imagem.input?.enabled === true;
  }

  /** Retângulo em px de jogo (para o gancho de QA e para medir a sobreposição). */
  get retangulo(): { x: number; y: number; largura: number; altura: number } {
    return { x: this.imagem.x, y: this.imagem.y, largura: this.imagem.displayWidth, altura: this.imagem.displayHeight };
  }

  private mostrarPressionado(): void {
    this.imagem.setTexture(this.chaves.pressionado);
    this.cena.time.delayedCall(PRESSIONADO_MS, () => {
      if (this.imagem.active) this.imagem.setTexture(this.chaves.repouso);
    });
  }

  destruir(): void {
    this.imagem.destroy();
  }
}

/** Pares de sprites do ícone de som (ADR-008 3.5): ligado e desligado (com o risco). */
export const CHAVES_DO_SOM = {
  ligado: { repouso: 'ctl_som_ligado', pressionado: 'ctl_som_ligado_pressionado' },
  desligado: { repouso: 'ctl_som_desligado', pressionado: 'ctl_som_desligado_pressionado' },
} as const;

export const CHAVES_DA_PAUSA = { repouso: 'ctl_pausa', pressionado: 'ctl_pausa_pressionado' } as const;
