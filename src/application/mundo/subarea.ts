import type { MapaDoJogo, ObjetoDoMapa } from '../content/Mapa';
import type { Fase } from '../../domain/progresso/Fase';
import type { EstadoDoEnfeite } from '../../domain/progresso/enfeite';
import type { Direcao } from '../../domain/shared/Direcao';

/**
 * Deslocamento da subárea dentro da tela (ADR-004 seção 2): centralizada, em tiles, sem rolagem.
 * `tela` é `perfil.sala` (15×11 no HD). Tela e subárea estão em tiles.
 */
export function deslocamentoDaSubarea(mapa: MapaDoJogo, tela: { colunas: number; linhas: number }): { x: number; y: number } {
  return { x: Math.floor((tela.colunas - mapa.largura) / 2), y: Math.floor((tela.linhas - mapa.altura) / 2) };
}

/** Objetos da subárea em coordenadas da tela (local mais o deslocamento). Não muda o original. */
export function objetosNaTela(mapa: MapaDoJogo, desl: { x: number; y: number }): ObjetoDoMapa[] {
  return mapa.objetos.map((o) => ({ ...o, x: o.x + desl.x, y: o.y + desl.y }));
}

/** A fase já foi concluída na partida? (usada por portas trancadas). */
export type Concluida = (fase: Fase) => boolean;

/**
 * Estado de uma peça da árvore (GDD 15.2.3; ADR-004 seção 6). Vem do Progresso, nunca do mapa.
 * `visivel` bloqueia o tile; `escondida` e `encaixada` são chão livre.
 */
export type EstadoDaPeca = 'escondida' | 'visivel' | 'encaixada';

/**
 * Contexto da partida que o mapa consulta: quais subáreas estão abertas (a missão ativa, ADR-004 seção 9.1) e o
 * estado de cada peça. O padrão reproduz o conteúdo cru: tudo aberto, peças livres.
 */
export interface ContextoDeArea {
  areaAberta(subarea: string): boolean;
  estadoDaPeca(ordem: number): EstadoDaPeca;
  /** Estado da caixa de enfeite (ADR-006 seção 2.4). Só `visivel` bloqueia o tile. */
  estadoDoEnfeite(): EstadoDoEnfeite;
}

export const CONTEXTO_PADRAO: ContextoDeArea = {
  areaAberta: () => true,
  estadoDaPeca: () => 'escondida',
  estadoDoEnfeite: () => 'escondida',
};

/**
 * Bloqueios por tile da área em tempo de jogo (local): a colisão do conversor, mais a árvore (vira bloqueio, ADR-003
 * seção 5), o examinável e a peça visível (ADR-004 seção 6) e a caixa de enfeite visível. A porta e o bilhete não
 * bloqueiam tile (ADR-011 seção 3.4): a porta é uma aresta, e quem a barra é `paredes`. As arestas ficam em `arestas.ts`.
 */
export function bloqueiosDaSubarea(mapa: MapaDoJogo, _concluida: Concluida, ctx: ContextoDeArea = CONTEXTO_PADRAO): boolean[][] {
  const grade = mapa.colisao.map((linha) => [...linha]);
  for (const o of mapa.objetos) {
    if (o.tipo === 'arvore' || o.tipo === 'examinavel') grade[o.y][o.x] = true;
    if (o.tipo === 'peca' && ctx.estadoDaPeca(Number(o.dados.ordem)) === 'visivel') grade[o.y][o.x] = true;
    // Caixa de enfeite: bloqueia como a peça visível (ADR-006 seção 2.4; ADR-004 seção 6).
    if (o.tipo === 'enfeite' && ctx.estadoDoEnfeite() === 'visivel') grade[o.y][o.x] = true;
  }
  return grade;
}

/** Lado de uma porta ou de um bilhete (ADR-011 seção 3.2). */
export type LadoDaPorta = Direcao;

/** Lado (`lado`) de uma porta ou de um bilhete, lido do conteúdo. Sem lado válido: undefined. */
export function ladoDaPorta(objeto: { dados: Record<string, unknown> }): LadoDaPorta | undefined {
  const s = objeto.dados.lado;
  return s === 'cima' || s === 'baixo' || s === 'esquerda' || s === 'direita' ? s : undefined;
}

/** O estado de uma porta em tempo de jogo (ADR-011 seção 3.3): decidido pelo motor, nunca pelo mapa. */
export type EstadoDaPorta = 'aberta' | 'fechada' | 'trancada';

/**
 * Fechada se o destino não está em `missions[ativa].maps`; com código se tem `trancadaAte` e a fase não está concluída;
 * aberta nos demais casos. Fechada vence a trancada (a área do outro lado nem existe nesta missão).
 */
export function estadoDaPorta(o: ObjetoDoMapa, concluida: Concluida, ctx: ContextoDeArea = CONTEXTO_PADRAO): EstadoDaPorta {
  if (!ctx.areaAberta(String(o.dados.destino))) return 'fechada';
  if (o.dados.trancadaAte !== undefined && !concluida(String(o.dados.trancadaAte) as Fase)) return 'trancada';
  return 'aberta';
}

/**
 * Resultado de andar contra (ou apertar A de frente para) uma porta (ADR-011 seção 3.4). `fechada`: o destino não está
 * aberto nesta missão. `trancada`: falta o código. `entrar`: leva à outra área, ao spawn de chegada (o nome do spawn é o
 * id da porta).
 */
export type ResultadoDaPorta = { tipo: 'trancada' } | { tipo: 'fechada' } | { tipo: 'entrar'; mapa: string; spawn: string };

export function resolverPorta(o: ObjetoDoMapa, concluida: Concluida, ctx: ContextoDeArea = CONTEXTO_PADRAO): ResultadoDaPorta {
  const estado = estadoDaPorta(o, concluida, ctx);
  if (estado === 'fechada') return { tipo: 'fechada' };
  if (estado === 'trancada') return { tipo: 'trancada' };
  return { tipo: 'entrar', mapa: String(o.dados.destino), spawn: String(o.dados.spawnDestino) };
}

/** Distância euclidiana entre centros de tile, em tiles. */
export function distanciaEmTiles(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Posição, em px da tela, de um sprite ancorado pela base no tile (ADR-004 seção 6). A base do sprite cai na
 * base do tile e a imagem cresce para cima: é assim que a árvore (sprite mais alto que um tile) fica no chão.
 * `tile` é o tile em tiles da tela; `altura` é a altura do sprite em px.
 */
export function posicaoDoSpritePelaBase(tile: { x: number; y: number }, lado: number, altura: number): { x: number; y: number } {
  return { x: tile.x * lado, y: (tile.y + 1) * lado - altura };
}

/**
 * A caixa (px da tela) cabe na área de jogo: dentro da tela e acima da linha da barra, que é a última linha da
 * tela (GDD 14.8). Sprite que passa daí fica sob a barra de controles.
 */
export function caixaCabeNaAreaDeJogo(
  caixa: { x: number; y: number; w: number; h: number },
  tela: { colunas: number; linhas: number },
  lado: number,
): boolean {
  return caixa.x >= 0 && caixa.y >= 0 && caixa.x + caixa.w <= tela.colunas * lado && caixa.y + caixa.h <= (tela.linhas - 1) * lado;
}
