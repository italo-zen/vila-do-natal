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
import { CreditosScene } from './scenes/CreditosScene';
import { aparelhoComToque, ehRetrato, sinaisDoNavegador } from './input/aparelho';
import { instalarGestosDoNavegador } from './input/gestos';
import { ControlesDeToque, type AreaDeToque } from './ui/toque/ControlesDeToque';
import { AvisoDeRotacao } from './ui/toque/AvisoDeRotacao';
import { telaNaArea } from './ui/toque/layout';

/** Área visível em px da janela: o `visualViewport` (sem a barra do navegador) ou a janela inteira (GDD 18.9). */
export function areaVisivel(janela: Window = window): AreaDeToque {
  const vv = janela.visualViewport;
  if (vv) return { origem: { x: vv.offsetLeft, y: vv.offsetTop }, tamanho: { largura: vv.width, altura: vv.height } };
  return { origem: { x: 0, y: 0 }, tamanho: { largura: janela.innerWidth, altura: janela.innerHeight } };
}

/**
 * Cria o jogo na resolução do perfil de arte (sala × tile, ADR-003 seção 9). A escala é sempre um número
 * inteiro, feito aqui (não pelo Phaser), para o pixel art não borrar: o maior fator inteiro que cabe na
 * janela, a partir da escala mínima do perfil. Mouse só nos botões do título e de Como jogar (ver Menu).
 *
 * Com toque (ADR-007): entrada de toque no Phaser (alvos do canvas), controles em DOM (ControlesDeToque), aviso de
 * rotação em retrato e gestos do navegador desligados. Sem toque, nada disso é criado: o computador não muda.
 */
export function criarJogo(servicos: Servicos, arte: ArteDoPerfil, pai: HTMLElement): Phaser.Game {
  const perfil = servicos.conteudo.perfil;
  const { largura, altura } = telaDe(perfil);
  const comToque = aparelhoComToque(sinaisDoNavegador());
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
    // Toque sempre ligado: num computador comum não chega nenhum evento de toque, e o mouse segue igual (ADR-007 1.7).
    input: { mouse: true, touch: true, activePointers: 3, gamepad: false },
    audio: { noAudio: true },
    scene: [BootScene, TituloScene, ComoJogarScene, SelecaoScene, CasaScene, ConquistaScene, CreditosScene],
  });
  jogo.registry.set('servicos', servicos);
  jogo.registry.set('perfil', perfil);
  jogo.registry.set('arte', arte);
  jogo.registry.set('comToque', comToque);
  jogo.registry.set('fatorEscala', 1);

  const textos = servicos.conteudo.textos;
  const toque = comToque ? new ControlesDeToque(document, perfil, arte.urls) : null;
  const quadrosDoCelular = arte.sprites.imagens.find((i) => i.arquivo === 'ctl_celular.png')?.quadros ?? 1;
  const aviso = comToque
    ? new AvisoDeRotacao(document, perfil, arte.urls, { linha1: textos.t('rotacao.1'), linha2: textos.t('rotacao.2') }, quadrosDoCelular)
    : null;
  jogo.registry.set('toque', toque);
  if (comToque) instalarGestosDoNavegador(document);

  const canvas = jogo.canvas;
  const base = { largura, altura };
  const ajustar = () => {
    const area = areaVisivel();
    const f = fatorDeEscala(perfil.escala, base, area.tamanho);
    const tela = telaNaArea(area.tamanho, base, f);
    canvas.style.width = `${tela.largura}px`;
    canvas.style.height = `${tela.altura}px`;
    pai.style.left = `${area.origem.x}px`;
    pai.style.top = `${area.origem.y}px`;
    pai.style.width = `${area.tamanho.largura}px`;
    pai.style.height = `${area.tamanho.altura}px`;
    jogo.registry.set('fatorEscala', f);
    // O Phaser recalcula os limites de entrada depois de mudar o CSS do canvas; sem isso, o toque cai deslocado (ADR-007 R1).
    if (jogo.isBooted) jogo.scale.refresh();
    if (!toque || !aviso) return;
    toque.atualizar(area, tela, perfil.tile, f);
    const retrato = ehRetrato(area.tamanho);
    aviso.atualizar(area, retrato);
    toque.mostrarRotacao(retrato);
    // Congela o mundo no aviso e retoma sem reiniciar (ADR-007 seção 10.3). Phaser suaviza o delta depois do sleep.
    if (retrato && jogo.loop.running) jogo.loop.sleep();
    if (!retrato && !jogo.loop.running && jogo.isBooted && !document.hidden) {
      jogo.loop.wake();
      toque.fonte.descartar();
    }
  };
  ajustar();
  window.addEventListener('resize', ajustar);
  window.visualViewport?.addEventListener('resize', ajustar);
  window.visualViewport?.addEventListener('scroll', ajustar);
  return jogo;
}
