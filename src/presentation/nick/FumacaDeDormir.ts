import Phaser from 'phaser';
import { ANIM_FUMACA, CHAVE_FUMACA } from '../assets/registro';

/** Profundidade da fumacinha: acima da penumbra (GDD 16.6). */
const PROFUNDIDADE_FUMACA = 860;

/**
 * Fumacinha de 0,5 s quando o Nick vai dormir (GDD 16.6). Animação de 3 quadros, sem regra. Some sozinha ao acabar.
 * O quadro do sprite é de 32×32, sobre o tile do Nick.
 */
export function fumacaDeDormir(cena: Phaser.Scene, x: number, y: number): void {
  const s = cena.add.sprite(x, y, CHAVE_FUMACA, 0).setOrigin(0, 0).setDepth(PROFUNDIDADE_FUMACA);
  s.play(ANIM_FUMACA);
  s.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => s.destroy());
}
