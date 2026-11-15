import Phaser from 'phaser';
import type { PortaASeguir } from '../../domain/nick/PortaASeguir';
import { CHAVE_SETA_FAREJAR } from '../assets/registro';
import { repeticoesDoTremor, SETA_FADE_MS, SETA_TREMIDAS, SETA_TREMOR_MEIO_CICLO_MS, SETA_TREMOR_PX } from './temporizacao';

/** Profundidade da seta: acima da penumbra (800), porque a porta já é conhecida (GDD 16.5.3). */
const PROFUNDIDADE_SETA = 850;

/**
 * Seta dourada sobre o gatilho da porta a seguir (GDD 16.5.3; ADR-005 seção 4.5). Só desenho: quem decide se a seta
 * existe é o Farejo, na sessão. A cena passa a porta e o deslocamento da subárea.
 */
export class SetaDeFarejar {
  private imagem: Phaser.GameObjects.Image | null = null;
  private oscilacao: Phaser.Tweens.Tween | null = null;

  constructor(private readonly cena: Phaser.Scene) {}

  /** Mostra (ou troca) a seta da porta. `desl`: deslocamento da subárea na tela, em tiles. `tile`: lado do tile em px. */
  mostrar(porta: PortaASeguir, desl: { x: number; y: number }, tile: number): void {
    const chave = CHAVE_SETA_FAREJAR(porta.saida);
    if (!this.cena.textures.exists(chave)) return;
    if (this.imagem && this.imagem.texture.key === chave) return;
    this.apagar();
    const x = (desl.x + porta.gatilho.x) * tile;
    const y = (desl.y + porta.gatilho.y) * tile;
    this.imagem = this.cena.add.image(x, y, chave).setOrigin(0, 0).setDepth(PROFUNDIDADE_SETA);
    // Duas tremidas (PT3) e depois fixa: o tween termina e a seta fica amarela, parada, até acabar o tempo.
    this.oscilacao = this.cena.tweens.add({
      targets: this.imagem,
      x: x + SETA_TREMOR_PX,
      duration: SETA_TREMOR_MEIO_CICLO_MS,
      yoyo: true,
      repeat: repeticoesDoTremor(SETA_TREMIDAS),
      ease: 'Linear',
      onComplete: () => {
        this.oscilacao = null;
      },
    });
  }

  /** Some com fade de 0,5 s (GDD 16.5.3). Sem seta, sem efeito. */
  apagar(comFade = false): void {
    const img = this.imagem;
    this.oscilacao?.stop();
    this.oscilacao = null;
    this.imagem = null;
    if (!img) return;
    if (!comFade) {
      img.destroy();
      return;
    }
    this.cena.tweens.add({ targets: img, alpha: 0, duration: SETA_FADE_MS, onComplete: () => img.destroy() });
  }

  get visivel(): boolean {
    return this.imagem !== null;
  }
}
