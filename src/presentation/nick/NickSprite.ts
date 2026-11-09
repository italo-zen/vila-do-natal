import Phaser from 'phaser';
import type { PerfilDeArte } from '../../application/arte/PerfilDeArte';
import type { Direcao, Geometria } from '../../application/mundo/movimento';
import { posicaoDoTile, profundidadeDoQuadro } from '../../application/mundo/movimento';
import { ANIM_NICK, CHAVE_NICK } from '../assets/registro';
import { geometriaDoNick } from './geometriaDoNick';

/** Profundidade do Nick: a mesma regra do sobrinho (base do quadro), um pouco atrás dele quando se sobrepõem (GDD 16.4.3). */
const RECUO_ATRAS_DO_SOBRINHO = 0.5;

/**
 * Sprite do Nick (ADR-005 seção 7.2). Só desenha: a cena diz o que ele faz (dormir, acordar, andar, farejar, feliz) e onde
 * está. Animações criadas no BootScene. Nenhuma regra aqui.
 */
export class NickSprite {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly geo: Geometria;

  constructor(cena: Phaser.Scene, perfil: PerfilDeArte) {
    this.geo = geometriaDoNick(perfil);
    this.sprite = cena.add.sprite(0, 0, CHAVE_NICK.dormir, 0).setOrigin(0, 0).setVisible(false);
  }

  /** Posiciona pelo tile (coordenadas da tela, já com o deslocamento da subárea). */
  posicionar(tx: number, ty: number, visivel: boolean): void {
    const p = posicaoDoTile(tx, ty, this.geo);
    this.sprite.setPosition(p.x, p.y).setDepth(profundidadeDoQuadro(p, this.geo) - RECUO_ATRAS_DO_SOBRINHO).setVisible(visivel);
  }

  /** Move a imagem para um ponto em px (passo de andar, com tween feito pela cena). */
  moverPx(x: number, y: number): void {
    this.sprite.setPosition(x, y).setDepth(profundidadeDoQuadro({ x, y }, this.geo) - RECUO_ATRAS_DO_SOBRINHO);
  }

  visivel(v: boolean): void {
    this.sprite.setVisible(v);
  }

  dormir(): void {
    this.sprite.anims.stop();
    this.sprite.setTexture(CHAVE_NICK.dormir, 0).play(ANIM_NICK.dormir, true);
  }

  acordar(): void {
    this.sprite.anims.stop();
    this.sprite.play(ANIM_NICK.acordar, true);
  }

  /** Parado: pose da última direção (GDD 16.4.1). */
  parado(dir: Direcao): void {
    if (this.sprite.anims.isPlaying) this.sprite.anims.stop();
    this.sprite.setTexture(CHAVE_NICK.parado(dir));
  }

  andar(dir: Direcao): void {
    const chave = ANIM_NICK.andar(dir);
    if (this.sprite.anims.currentAnim?.key !== chave) this.sprite.play(chave, true);
  }

  farejar(): void {
    this.sprite.anims.stop();
    this.sprite.play(ANIM_NICK.farejar, true);
  }

  feliz(): void {
    this.sprite.anims.stop();
    this.sprite.play(ANIM_NICK.feliz, true);
  }

  pausar(): void {
    this.sprite.anims.pause();
  }

  retomar(): void {
    this.sprite.anims.resume();
  }

  destruir(): void {
    this.sprite.destroy();
  }
}

