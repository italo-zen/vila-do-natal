import Phaser from 'phaser';
import type { Servicos } from '../application/Servicos';
import type { ArteDoPerfil } from '../application/arte/ArteDoPerfil';
import { telaDe } from './ui/tema';
import { fatorDeEscala } from './ui/escala';
import { BootScene } from './scenes/BootScene';
import { TituloScene } from './scenes/TituloScene';
import { ComoJogarScene } from './scenes/ComoJogarScene';
import { SelecaoScene } from './scenes/SelecaoScene';
import { CasaScene } from './scenes/CasaScene';
import { ConquistaScene } from './scenes/ConquistaScene';

/**
 * Cria o jogo na resolução do perfil de arte (sala × tile, ADR-003 seção 9). A escala é sempre um número
 * inteiro, feito aqui (não pelo Phaser), para o pixel art não borrar: o maior fator inteiro que cabe na
 * janela, a partir da escala mínima do perfil. Mouse só nos botões do título e de Como jogar (ver Menu).
 */
export function criarJogo(servicos: Servicos, arte: ArteDoPerfil, pai: HTMLElement): Phaser.Game {
  const perfil = servicos.conteudo.perfil;
  const { largura, altura } = telaDe(perfil);
  const jogo = new Phaser.Game({
    // Canvas 2D: pixel art é leve, e a captura do jogo (smoke) lê o canvas de forma confiável.
    type: Phaser.CANVAS,
    parent: pai,
    width: largura,
    height: altura,
    backgroundColor: perfil.tema.fundo,
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.NONE },
    input: { mouse: true, touch: false, gamepad: false },
    audio: { noAudio: true },
    scene: [BootScene, TituloScene, ComoJogarScene, SelecaoScene, CasaScene, ConquistaScene],
  });
  jogo.registry.set('servicos', servicos);
  jogo.registry.set('perfil', perfil);
  jogo.registry.set('arte', arte);

  const canvas = jogo.canvas;
  const ajustar = () => {
    const z = fatorDeEscala(perfil.escala, { largura, altura }, { largura: window.innerWidth, altura: window.innerHeight });
    canvas.style.width = `${largura * z}px`;
    canvas.style.height = `${altura * z}px`;
  };
  ajustar();
  window.addEventListener('resize', ajustar);
  return jogo;
}
