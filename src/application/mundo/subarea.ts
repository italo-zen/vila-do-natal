import type { MapaDoJogo, ObjetoDoMapa } from '../content/Mapa';
import type { Fase } from '../../domain/progresso/Fase';
import type { EstadoDoEnfeite } from '../../domain/progresso/enfeite';

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
 * Bloqueios da subárea em tempo de jogo (local): a colisão do conversor, mais a árvore (vira bloqueio,
 * ADR-003 seção 5), a porta fechada, o examinável, o gatilho trancado, o par com destino fechado (age como porta
 * fechada, ADR-004 seção 3) e a peça visível (ADR-004 seção 6).
 */
export function bloqueiosDaSubarea(mapa: MapaDoJogo, concluida: Concluida, ctx: ContextoDeArea = CONTEXTO_PADRAO): boolean[][] {
  const grade = mapa.colisao.map((linha) => [...linha]);
  for (const o of mapa.objetos) {
    // Porta fechada, examinável e bilhete são tiles bloqueados pelo contrato do conversor (ADR-004 seção 6).
    if (o.tipo === 'arvore' || o.tipo === 'portaFechada' || o.tipo === 'examinavel' || o.tipo === 'bilhete') grade[o.y][o.x] = true;
    if (o.tipo === 'porta') {
      const trancada = o.dados.trancadaAte !== undefined && !concluida(String(o.dados.trancadaAte) as Fase);
      const fechadaPeloDestino = !ctx.areaAberta(String(o.dados.destino));
      if (trancada || fechadaPeloDestino) grade[o.y][o.x] = true;
    }
    if (o.tipo === 'peca' && ctx.estadoDaPeca(Number(o.dados.ordem)) === 'visivel') grade[o.y][o.x] = true;
    // Caixa de enfeite: bloqueia como a peça visível (ADR-006 seção 2.4; ADR-004 seção 6).
    if (o.tipo === 'enfeite' && ctx.estadoDoEnfeite() === 'visivel') grade[o.y][o.x] = true;
  }
  return grade;
}

/** Lado de saída de uma porta (ADR-004 seção 6; GDD 14.10.10). Vem do campo `saida` do conteúdo. */
export type LadoDaPorta = 'cima' | 'baixo' | 'esquerda' | 'direita';

/** Vetor de um tile para o lado de saída (y cresce para baixo, como no mapa). */
const VETOR_DA_SAIDA: Readonly<Record<LadoDaPorta, { x: number; y: number }>> = {
  cima: { x: 0, y: -1 },
  baixo: { x: 0, y: 1 },
  esquerda: { x: -1, y: 0 },
  direita: { x: 1, y: 0 },
};

/** Lado de saída de um gatilho ou de uma porta fechada, lido do campo `saida` (ADR-004 seção 13.18). */
export function ladoDaPorta(objeto: { dados: Record<string, unknown> }): LadoDaPorta | undefined {
  const s = objeto.dados.saida;
  return s === 'cima' || s === 'baixo' || s === 'esquerda' || s === 'direita' ? s : undefined;
}

/** Lado (cima, baixo, esquerda, direita) de um vetor de um tile. Vetor que não é de um tile não tem lado. */
export function ladoDoVetor(dx: number, dy: number): LadoDaPorta | undefined {
  if (dx === 0 && dy === -1) return 'cima';
  if (dx === 0 && dy === 1) return 'baixo';
  if (dx === -1 && dy === 0) return 'esquerda';
  if (dx === 1 && dy === 0) return 'direita';
  return undefined;
}

/**
 * Lado da aresta de um par fechado (ADR-004 seção 3, "Arestas"): o lado do gatilho voltado para a chegada, que é o
 * lado de dentro da área aberta. Para P3 é a esquerda (chegada em (7, 2)); para P2 é a baixo (chegada em (7, 2)).
 */
export function arestaDoParFechado(gatilho: { x: number; y: number }, chegada: { x: number; y: number }): LadoDaPorta | undefined {
  return ladoDoVetor(chegada.x - gatilho.x, chegada.y - gatilho.y);
}

/** Vetor de um tile até o lado de saída (ADR-004 seção 13.18). */
export function vetorDaSaida(lado: LadoDaPorta): { x: number; y: number } {
  return VETOR_DA_SAIDA[lado];
}

/**
 * Vão de uma porta (ADR-004 seções 3 e 13.18): o primeiro tile fora do gatilho, no lado de saída `saida` do conteúdo
 * (`porta.saida`). O motor não deriva mais a saída da chegada (G − S), porque o par com chegada declarada pode ter
 * chegada de lado. Vale em qualquer sistema de coordenadas (local ou de tela). Não é andável (ADR-004 seção 3).
 */
export function vaoDaPorta(gatilho: { x: number; y: number }, saida: LadoDaPorta): { x: number; y: number } {
  const v = VETOR_DA_SAIDA[saida];
  return { x: gatilho.x + v.x, y: gatilho.y + v.y };
}

/**
 * Resultado de andar sobre (ou apertar A na frente de) um gatilho de porta. `fechada` é o par cujo destino não
 * está aberto nesta missão: age como porta fechada, sem transição (ADR-004 seção 3).
 */
export type ResultadoDaPorta = { tipo: 'trancada' } | { tipo: 'fechada' } | { tipo: 'entrar'; mapa: string; spawn: string };

/**
 * Regra do gatilho (ADR-004 seção 3 e GDD 14.10.5): trancado, a passagem não acontece (o A abre o painel);
 * destino fechado nesta missão, nada acontece (porta fechada); senão, leva ao destino e ao spawn de chegada
 * (o nome do spawn é o id da porta).
 */
export function resolverPorta(o: ObjetoDoMapa, concluida: Concluida, ctx: ContextoDeArea = CONTEXTO_PADRAO): ResultadoDaPorta {
  const trancada = o.dados.trancadaAte !== undefined;
  if (trancada && !concluida(String(o.dados.trancadaAte) as Fase)) return { tipo: 'trancada' };
  if (!ctx.areaAberta(String(o.dados.destino))) return { tipo: 'fechada' };
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
