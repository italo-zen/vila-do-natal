import Phaser from 'phaser';
import { imagensParaCarregar, sprites } from '../assets/registro';
import { PERSONAGEM_IDS } from '../../domain/personagem/PersonagemId';
import type { Direcao } from '../../application/mundo/movimento';
import { arteDe, perfilDe } from '../ui/tema';

const DIRECOES: Direcao[] = ['baixo', 'cima', 'esquerda', 'direita'];

/** Carrega as imagens do perfil, cria as animações e segue para o título. Não tem interface. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    for (const img of imagensParaCarregar(arteDe(this))) {
      if (img.tipo === 'imagem') this.load.image(img.chave, img.url);
      else this.load.spritesheet(img.chave, img.url, { frameWidth: img.quadro!.w, frameHeight: img.quadro!.h });
    }
  }

  create(): void {
    const corpo = perfilDe(this).corpos.sobrinho;
    for (const id of PERSONAGEM_IDS) {
      for (const dir of DIRECOES) {
        this.anims.create({
          key: sprites.animacaoDeAndar(id, dir),
          frames: this.anims.generateFrameNumbers(sprites.andar(id, dir), { start: 0, end: corpo.quadrosDeAndar - 1 }),
          frameRate: corpo.fpsAndar,
          repeat: -1,
        });
      }
    }
    this.scene.start('Titulo');
  }
}
