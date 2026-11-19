import type Phaser from 'phaser';
import type { ArteDoPerfil } from '../../application/arte/ArteDoPerfil';
import type { Ancora } from '../../application/arte/SpritesDoPerfil';
import type { PerfilDeArte } from '../../application/arte/PerfilDeArte';
import type { MapaDoJogo } from '../../application/content/Mapa';
import { chaveDaPeca, chaveDoVidro, classificarArestas, ehVidro, profundidadeDaAresta, retanguloDaAresta, type ArestaDesenhada } from '../../application/mundo/vista';
import { numeroDaCor } from '../ui/tema';

/**
 * Desenho das paredes na visão 3/4 (ADR-012 seções 3 e 6). A classificação e as medidas vêm de `application/mundo/vista.ts` e do
 * perfil (`vista`); a imagem de cada peça vem de `spr_parede_<peça>` no `sprites.json` (âncora opcional). Enquanto o kit da Arte
 * não existe, a peça sai num desenho provisório com as cores de `vista.provisorio`.
 */

/** Chave do sprite de uma peça de parede (ex.: `spr_parede_face_norte_meio`); cai na peça sem sufixo (`spr_parede_face_norte`). */
export function chavesDaParede(a: ArestaDesenhada, vidro = false): string[] {
  const normais = [`spr_parede_${chaveDaPeca(a)}`, `spr_parede_${a.tipo}`];
  // Vidro (vista.json): a peça de vidro primeiro, com a peça normal como fallback.
  const doVidro = vidro ? chaveDoVidro(a) : undefined;
  return doVidro ? [doVidro, ...normais] : normais;
}

export function ancoraDaImagem(arte: ArteDoPerfil, chave: string): Ancora | undefined {
  return arte.sprites.imagens.find((i) => i.arquivo === `${chave}.png`)?.ancora;
}

/**
 * Posição (canto de cima, origem 0,0) de um sprite com `movel.ancora` no `sprites.json` (ADR-012 seção 5.4): a âncora cai no
 * canto sudoeste da pegada. `tx, ty` = tile do canto noroeste da pegada, em tiles da tela. Sem `movel`, undefined (cai no
 * comportamento anterior da cena: canto de cima do PNG no tile, ou ancoragem pela base).
 */
export function posicaoPelaAncora(arte: ArteDoPerfil, chave: string, tx: number, ty: number, tile: number, alturaDaPegada?: number): { x: number; y: number; h: number } | undefined {
  const m = arte.sprites.imagens.find((i) => i.arquivo === `${chave}.png`)?.movel;
  if (!m) return undefined;
  const h = alturaDaPegada ?? m.pegada.h;
  return { x: tx * tile - m.ancora.x, y: (ty + h) * tile - m.ancora.y, h };
}

/** Ponto de ancoragem de uma aresta, em px da área: centro da aresta horizontal ou da vertical. */
export function pontoDaAresta(a: ArestaDesenhada, tile: number): { x: number; y: number } {
  return a.tipo === 'linha_v' ? { x: a.x * tile, y: a.y * tile + tile / 2 } : { x: a.x * tile + tile / 2, y: a.y * tile };
}

/**
 * Desenha as paredes da área na visão 3/4 e devolve os objetos criados (para a cena registrar e destruir). `desl` é o
 * deslocamento da área na tela, em tiles. `deixarPortaDesenhar`: arestas com porta não levam parede (a porta 3/4 as substitui).
 */
export function desenharParedesEm34(
  cena: Phaser.Scene,
  mapa: MapaDoJogo,
  desl: { x: number; y: number },
  perfil: PerfilDeArte,
  arte: ArteDoPerfil,
  deixarPortaDesenhar: boolean,
  /** Peça cujo topo (px do mundo) é igual ou maior que isto fica inteira sob a barra e não é desenhada. */
  limiteY = Infinity,
  /** Arestas de vidro desta área (`vista.json`). */
  vidroDaArea?: readonly { tipo: string; x: number; y: number }[],
): Phaser.GameObjects.GameObject[] {
  const v = perfil.vista;
  if (!v) return [];
  const tile = perfil.tile;
  const origem = { x: desl.x * tile, y: desl.y * tile };
  const criados: Phaser.GameObjects.GameObject[] = [];
  for (const a of classificarArestas(mapa)) {
    if (a.porta && deixarPortaDesenhar) continue;
    if (origem.y + retanguloDaAresta(a, tile, v).y >= limiteY) continue;
    const profundidade = profundidadeDaAresta(a, tile) + origem.y;
    const chave = chavesDaParede(a, ehVidro(a, vidroDaArea)).find((c) => cena.textures.exists(c));
    if (chave) {
      const ancora = ancoraDaImagem(arte, chave);
      const ponto = pontoDaAresta(a, tile);
      const r = retanguloDaAresta(a, tile, v);
      const x = ancora ? ponto.x - ancora.x : r.x;
      const y = ancora ? ponto.y - ancora.y : r.y;
      criados.push(cena.add.image(origem.x + x, origem.y + y, chave).setOrigin(0, 0).setDepth(profundidade));
      continue;
    }
    // Provisório: retângulos com as cores do perfil.
    const cores = v.provisorio;
    if (!cores) continue;
    const r = retanguloDaAresta(a, tile, v);
    const g = cena.add.graphics().setDepth(profundidade);
    if (a.tipo === 'face_norte') {
      g.fillStyle(numeroDaCor(cores.face), 1).fillRect(origem.x + r.x, origem.y + r.y, r.w, v.faceNorte);
      g.fillStyle(numeroDaCor(cores.sombra), cores.alfaSombra).fillRect(origem.x + r.x, origem.y + a.y * tile, tile, v.sombra.dy);
    } else {
      const larguraDaLinha = a.tipo === 'linha_v' ? v.linhaLateral : r.w;
      g.fillStyle(numeroDaCor(cores.linha), 1).fillRect(origem.x + r.x, origem.y + r.y, a.tipo === 'linha_v' ? larguraDaLinha : r.w, a.tipo === 'linha_v' ? r.h : r.h);
      if (a.tipo === 'linha_v' && a.pisoALeste) {
        g.fillStyle(numeroDaCor(cores.sombra), cores.alfaSombra).fillRect(origem.x + r.x + v.linhaLateral, origem.y + a.y * tile, v.sombra.dx, tile);
      }
    }
    criados.push(g);
  }
  return criados;
}
