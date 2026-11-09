import Phaser from 'phaser';
import { ANIM_FUMACA, ANIM_NICK, CHAVE_FUMACA, CHAVE_NICK, imagensParaCarregar, sprites } from '../assets/registro';
import type { ArteDoPerfil } from '../../application/arte/ArteDoPerfil';
import { ACORDAR_MS, FAREJAR_MS, FELIZ_MS, FPS_ANDAR_DO_NICK, FPS_DORMIR_DO_NICK, FUMACA_MS } from '../nick/temporizacao';
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
    this.criarAnimacoesDoNick(arteDe(this));
    this.scene.start('Titulo');
  }

  /**
   * Animações do Nick e da fumaça (ADR-005 seção 7.2). Quantos quadros cada folha tem vem do sprites.json (campo
   * `quadros`), não de `quadrosDeAndar` do sobrinho. A duração de cada animação vem de temporizacao.ts.
   */
  private criarAnimacoesDoNick(arte: ArteDoPerfil): void {
    const quadros = (chave: string): number => arte.sprites.imagens.find((i) => i.arquivo === `${chave}.png`)?.quadros ?? 1;
    const todos = (chave: string, n: number) => this.anims.generateFrameNumbers(chave, { start: 0, end: n - 1 });
    const porDuracao = (n: number, ms: number) => (n * 1000) / ms;

    this.anims.create({ key: ANIM_NICK.dormir, frames: todos(CHAVE_NICK.dormir, quadros(CHAVE_NICK.dormir)), frameRate: FPS_DORMIR_DO_NICK, repeat: -1 });
    const qAcordar = quadros(CHAVE_NICK.acordar);
    this.anims.create({ key: ANIM_NICK.acordar, frames: todos(CHAVE_NICK.acordar, qAcordar), frameRate: porDuracao(qAcordar, ACORDAR_MS), repeat: 0 });
    const qFarejar = quadros(CHAVE_NICK.farejar);
    this.anims.create({ key: ANIM_NICK.farejar, frames: todos(CHAVE_NICK.farejar, qFarejar), frameRate: porDuracao(qFarejar, FAREJAR_MS), repeat: 0 });
    const qFeliz = quadros(CHAVE_NICK.feliz);
    this.anims.create({ key: ANIM_NICK.feliz, frames: todos(CHAVE_NICK.feliz, qFeliz), frameRate: porDuracao(qFeliz, FELIZ_MS), repeat: 0 });
    for (const dir of ['baixo', 'cima', 'esquerda', 'direita'] as const) {
      const chave = CHAVE_NICK.andar(dir);
      this.anims.create({ key: ANIM_NICK.andar(dir), frames: todos(chave, quadros(chave)), frameRate: FPS_ANDAR_DO_NICK, repeat: -1 });
    }
    const qFumaca = quadros(CHAVE_FUMACA);
    this.anims.create({ key: ANIM_FUMACA, frames: todos(CHAVE_FUMACA, qFumaca), frameRate: porDuracao(qFumaca, FUMACA_MS), repeat: 0 });
  }
}
