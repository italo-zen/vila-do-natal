import type { PerfilDeArte, Dimensao } from '../arte/PerfilDeArte';
import type { ObjetoDoMapa } from '../content/Mapa';
import { paredeNoTile } from './arestas';

// Direção vive no domínio (ADR-005 seção 1.2); reexportada aqui para os imports existentes.
export type { Direcao } from '../../domain/shared/Direcao';
import type { Direcao } from '../../domain/shared/Direcao';
/** Canto superior esquerdo do sprite do Sobrinho, em px da tela (câmera do cômodo). */
export interface Posicao {
  x: number;
  y: number;
}
export type Bloqueado = (tx: number, ty: number) => boolean;
/**
 * O tile (tx, ty) tem parede no `lado` (bit de `paredes`, ADR-011 seção 2.1)? Opcional: sem ela, só vale a colisão por tile.
 * Tile fora da caixa deve devolver true.
 */
export type ParedeNoTile = (tx: number, ty: number, lado: Direcao) => boolean;

/**
 * Geometria que o movimento lê do perfil de arte (ADR-003 seções 4 e 5). Todas as medidas em px,
 * exceto a grade de tiles. Nenhum número de arte aqui: o perfil é a fonte.
 */
export interface Geometria {
  tile: number;
  quadro: Dimensao;
  /** Caixa dos pés: dx e dy a partir do canto do quadro. */
  pes: { dx: number; dy: number; w: number; h: number };
}

/** Geometria do Sobrinho a partir do perfil. Centralizada na horizontal e alinhada à base do quadro. */
export function geometriaDoSobrinho(perfil: PerfilDeArte): Geometria {
  const corpo = perfil.corpos.sobrinho;
  return {
    tile: perfil.tile,
    quadro: corpo.quadro,
    pes: {
      dx: (corpo.quadro.w - corpo.pes.w) / 2,
      dy: corpo.quadro.h - corpo.pes.h,
      w: corpo.pes.w,
      h: corpo.pes.h,
    },
  };
}

/** Tolerância do "encostado" (GDD 14.9.2): 4 px no v1 = 1/4 de tile. Regra de jogo, em fração de tile. */
const ENCOSTADO_EM_TILES = 1 / 4;

const VETOR: Record<Direcao, { dx: number; dy: number }> = {
  cima: { dx: 0, dy: -1 },
  baixo: { dx: 0, dy: 1 },
  esquerda: { dx: -1, dy: 0 },
  direita: { dx: 1, dy: 0 },
};

/** Posição do sprite para o tile (tx, ty): os pés ficam dentro da linha ty (ADR-003 seção 4). */
export function posicaoDoTile(tx: number, ty: number, g: Geometria): Posicao {
  return { x: tx * g.tile, y: (ty + 1) * g.tile - (g.pes.dy + g.pes.h) };
}

/**
 * Posição do sprite com o centro dos pés no centro do tile (chegada por porta, ADR-011 seção 3.4): os pés ficam a
 * `(tile − altura dos pés) / 2` de cada linha do tile, 8 px no perfil HD.
 */
export function posicaoCentralizadaNoTile(tx: number, ty: number, g: Geometria): Posicao {
  return { x: tx * g.tile + (g.tile - g.quadro.w) / 2, y: ty * g.tile + g.tile / 2 - (g.pes.dy + g.pes.h / 2) };
}

/** Centro dos pés: usado para cômodo atual, luz e interação. */
export function centroDosPes(p: Posicao, g: Geometria): { x: number; y: number } {
  return { x: p.x + g.quadro.w / 2, y: p.y + g.pes.dy + g.pes.h / 2 };
}

/** Centro do quadro inteiro (luz e outros efeitos centrados no personagem). */
export function centroDoQuadro(p: Posicao, g: Geometria): { x: number; y: number } {
  return { x: p.x + g.quadro.w / 2, y: p.y + g.quadro.h / 2 };
}

/** Profundidade de ordenação do sprite: a base do quadro. */
export function profundidadeDoQuadro(p: Posicao, g: Geometria): number {
  return p.y + g.quadro.h;
}

/**
 * Sobreposição mínima, em px, para a caixa dos pés contar como colisão com um tile. Abaixo disso é ruído de
 * ponto flutuante (ex.: 0,002 px além da borda), e não pode bloquear o movimento: antes, qualquer fração
 * encostava no tile de baixo e o personagem não andava de lado (BUG-M12-03).
 */
const SOBREPOSICAO_MINIMA_PX = 1;

function caixaBateEmParede(p: Posicao, bloqueado: Bloqueado, g: Geometria, parede?: ParedeNoTile): boolean {
  const x0 = p.x + g.pes.dx;
  const y0 = p.y + g.pes.dy;
  const x1 = x0 + g.pes.w;
  const y1 = y0 + g.pes.h;
  const t = g.tile;
  for (let ty = Math.floor(y0 / t); ty < Math.ceil(y1 / t); ty++) {
    const sobreY = Math.min(y1, (ty + 1) * t) - Math.max(y0, ty * t);
    if (sobreY < SOBREPOSICAO_MINIMA_PX) continue;
    for (let tx = Math.floor(x0 / t); tx < Math.ceil(x1 / t); tx++) {
      const sobreX = Math.min(x1, (tx + 1) * t) - Math.max(x0, tx * t);
      if (sobreX < SOBREPOSICAO_MINIMA_PX) continue;
      if (bloqueado(tx, ty)) return true;
    }
  }
  return parede ? caixaCruzaAresta(x0, y0, x1, y1, t, parede) : false;
}

/**
 * Tolerância de ponto flutuante, em px, no comprimento da caixa sobre um segmento de aresta (BUG-M12-03: 0,002 px de ruído
 * não pode bloquear o movimento de lado). Não é folga de jogo: na direção em que a caixa cruza a linha a regra é estrita.
 */
const EPSILON_DA_ARESTA_PX = 0.01;

/**
 * Colisão por aresta (ADR-011 seção 5.1). Cada bit ligado é um segmento de grade de espessura zero e comprimento `t`. A
 * caixa dos pés não pode cruzar o interior de um segmento: vertical em X = c, de ya a yb, bloqueia se x0 < c < x1 e a caixa
 * cobre [ya, yb] por mais que o epsilon; o horizontal é análogo. Encostar (x1 = c) não bloqueia. Uma aresta é parede se um dos
 * dois tiles que a dividem tem o bit ligado.
 */
export function caixaCruzaAresta(x0: number, y0: number, x1: number, y1: number, t: number, parede: ParedeNoTile): boolean {
  // Linhas verticais da grade estritamente dentro da caixa: x = k·t, x0 < k·t < x1.
  for (let k = Math.floor(x0 / t) + 1; k * t < x1; k++) {
    if (k * t <= x0) continue;
    for (let ty = Math.floor(y0 / t); ty * t < y1; ty++) {
      const sobre = Math.min(y1, (ty + 1) * t) - Math.max(y0, ty * t);
      if (sobre <= EPSILON_DA_ARESTA_PX) continue;
      if (parede(k - 1, ty, 'direita') || parede(k, ty, 'esquerda')) return true;
    }
  }
  // Linhas horizontais: y = k·t, y0 < k·t < y1.
  for (let k = Math.floor(y0 / t) + 1; k * t < y1; k++) {
    if (k * t <= y0) continue;
    for (let tx = Math.floor(x0 / t); tx * t < x1; tx++) {
      const sobre = Math.min(x1, (tx + 1) * t) - Math.max(x0, tx * t);
      if (sobre <= EPSILON_DA_ARESTA_PX) continue;
      if (parede(tx, k - 1, 'baixo') || parede(tx, k, 'cima')) return true;
    }
  }
  return false;
}

/**
 * Assistência de quina (como nos jogos de Pokémon): o avanço na direção (dx, dy) está barrado. Procura o menor deslocamento lateral
 * s (1 a `quina` px, para um lado ou o outro) em que o caminho lateral inteiro está livre e o avanço, dali, também. Devolve a
 * posição depois de 1 px de deslize para esse lado, ou undefined se não há saída. Sem saída em ≤ `quina` px (parede reta), nada muda.
 */
function deslizeDeQuina(atual: Posicao, dx: number, dy: number, passo: number, quina: number, bloqueado: Bloqueado, g: Geometria, parede?: ParedeNoTile): Posicao | undefined {
  const px = dx === 0 ? 1 : 0;
  const py = dy === 0 ? 1 : 0;
  for (let s = 1; s <= quina; s++) {
    for (const lado of [1, -1]) {
      let livre = true;
      for (let k = 1; k <= s && livre; k++) livre = !caixaBateEmParede({ x: atual.x + px * lado * k, y: atual.y + py * lado * k }, bloqueado, g, parede);
      if (!livre) continue;
      const alvo = { x: atual.x + px * lado * s + dx * passo, y: atual.y + py * lado * s + dy * passo };
      if (!caixaBateEmParede(alvo, bloqueado, g, parede)) return { x: atual.x + px * lado, y: atual.y + py * lado };
    }
  }
  return undefined;
}

/**
 * Move em uma direção (sem diagonal), pixel a pixel, parando na primeira parede (de tile ou de aresta).
 * Nunca atravessa parede e nunca fica preso: se não há colisão, anda a distância toda.
 */
export function mover(p: Posicao, direcao: Direcao, distancia: number, bloqueado: Bloqueado, g: Geometria, parede?: ParedeNoTile, quina = 0): Posicao {
  const { dx, dy } = VETOR[direcao];
  let atual = { ...p };
  let restante = distancia;
  while (restante > 0) {
    const passo = Math.min(1, restante);
    const candidato = { x: atual.x + dx * passo, y: atual.y + dy * passo };
    if (caixaBateEmParede(candidato, bloqueado, g, parede)) {
      // Assistência de quina: barrado por uma quina de até `quina` px, desliza 1 px para o lado livre (nunca atravessa parede nem
      // móvel: cada passo lateral e o avanço depois dele passam pela mesma colisão).
      const deslize = quina > 0 ? deslizeDeQuina(atual, dx, dy, passo, quina, bloqueado, g, parede) : undefined;
      if (!deslize) break;
      atual = deslize;
      restante -= passo;
      continue;
    }
    atual = candidato;
    restante -= passo;
  }
  return atual;
}

/**
 * Alvo da ação A (GDD 14.9.2). Os objetos vêm em tiles (Mapa.ts); a geometria de interação é em px,
 * derivada do tile: quadrado de 1 tile à frente do centro dos pés, e "encostado" a até 1/4 de tile.
 * Ordem: (1) na frente, o quadrado de interação toca o objeto; (2) se nada está na frente, o objeto
 * encostado (num lado, sem diagonal) aciona, qualquer que seja a direção; (3) senão, nada.
 * Desempates: mais próximo do centro do quadrado (na frente) ou da caixa dos pés (encostado);
 * se ainda empatar, o primeiro da lista.
 */
export function alvoDaInteracao(
  objetos: readonly ObjetoDoMapa[],
  p: Posicao,
  direcao: Direcao,
  g: Geometria,
  parede?: ParedeNoTile,
): ObjetoDoMapa | undefined {
  // Parede entre o tile do sobrinho e o do objeto: não lê (ADR-011 seção 5.2).
  if (parede) {
    const c0 = centroDosPes(p, g);
    const tp = { x: Math.floor(c0.x / g.tile), y: Math.floor(c0.y / g.tile) };
    objetos = objetos.filter((o) => ligadoPorAresta(tp, o, parede));
  }
  // Cada objeto de jogo ocupa 1 tile (ADR-004 seção 6); a árvore também é um tile.
  const emPx = objetos.map((o) => ({ o, x: o.x * g.tile, y: o.y * g.tile, w: g.tile, h: g.tile }));
  const c = centroDosPes(p, g);
  const { dx, dy } = VETOR[direcao];
  const qx = c.x + dx * g.tile;
  const qy = c.y + dy * g.tile;
  const meia = g.tile / 2;

  const naFrente = emPx.filter(
    (o) => qx - meia < o.x + o.w && qx + meia > o.x && qy - meia < o.y + o.h && qy + meia > o.y,
  );
  if (naFrente.length > 0) {
    return escolherMenor(naFrente, (o) => Math.hypot(qx - (o.x + o.w / 2), qy - (o.y + o.h / 2)))?.o;
  }

  const x0 = p.x + g.pes.dx;
  const x1 = x0 + g.pes.w;
  const y0 = p.y + g.pes.dy;
  const y1 = y0 + g.pes.h;
  const encostadoMax = g.tile * ENCOSTADO_EM_TILES;
  const encostados: { o: ObjetoDoMapa; folga: number }[] = [];
  for (const o of emPx) {
    const mesmaAltura = y0 < o.y + o.h && y1 > o.y;
    const mesmaLargura = x0 < o.x + o.w && x1 > o.x;
    const folgas: number[] = [];
    if (mesmaAltura) folgas.push(x0 - (o.x + o.w), o.x - x1); // esquerda, direita
    if (mesmaLargura) folgas.push(y0 - (o.y + o.h), o.y - y1); // cima, baixo
    const validas = folgas.filter((f) => f >= 0 && f <= encostadoMax);
    if (validas.length > 0) encostados.push({ o: o.o, folga: Math.min(...validas) });
  }
  if (encostados.length === 0) return undefined;
  return escolherMenor(encostados, (e) => e.folga)?.o;
}

/**
 * O objeto no tile `o` é alcançável a partir do tile `de` sem cruzar parede? Mesmo tile: sim. Vizinho: se a aresta está
 * aberta. Diagonal: se um dos dois caminhos de duas arestas está aberto. Mais longe: sim (o quadrado de interação nunca
 * chega lá, a regra de proximidade já decide).
 */
function ligadoPorAresta(de: { x: number; y: number }, o: { x: number; y: number }, parede: ParedeNoTile): boolean {
  const dx = o.x - de.x;
  const dy = o.y - de.y;
  const aberta = (x: number, y: number, lado: Direcao): boolean => {
    const v = VETOR[lado];
    return !parede(x, y, lado) && !parede(x + v.dx, y + v.dy, OPOSTO[lado]);
  };
  if (dx === 0 && dy === 0) return true;
  if (Math.abs(dx) + Math.abs(dy) === 1) return aberta(de.x, de.y, dx === 1 ? 'direita' : dx === -1 ? 'esquerda' : dy === 1 ? 'baixo' : 'cima');
  if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
    const lx: Direcao = dx > 0 ? 'direita' : 'esquerda';
    const ly: Direcao = dy > 0 ? 'baixo' : 'cima';
    return (aberta(de.x, de.y, lx) && aberta(de.x + dx, de.y, ly)) || (aberta(de.x, de.y, ly) && aberta(de.x, de.y + dy, lx));
  }
  return true;
}

const OPOSTO: Record<Direcao, Direcao> = { cima: 'baixo', baixo: 'cima', esquerda: 'direita', direita: 'esquerda' };

/** Menor valor; em empate, o primeiro da lista (Array.prototype.sort é estável). */
function escolherMenor<T>(itens: readonly T[], valor: (t: T) => number): T | undefined {
  let melhor: T | undefined;
  let melhorValor = Infinity;
  for (const it of itens) {
    const v = valor(it);
    if (v < melhorValor) {
      melhor = it;
      melhorValor = v;
    }
  }
  return melhor;
}

/** Grade de colisão em tiles, com tiles liberáveis (ex.: a porta, depois de aberta). */
export class ColisaoDoMapa {
  private readonly grade: boolean[][];
  private readonly paredes: readonly (readonly number[])[];
  /** `paredes`: máscara por aresta (ADR-011 seção 2.1); sem ela, só há colisão por tile. */
  constructor(grade: boolean[][], paredes: readonly (readonly number[])[] = []) {
    this.grade = grade.map((linha) => [...linha]);
    this.paredes = paredes;
  }
  /** O tile tem parede no lado? Sem máscara, nunca; tile fora da caixa, sempre (a colisão por tile já barra). */
  parede = (tx: number, ty: number, lado: Direcao): boolean => {
    if (this.paredes.length === 0) return false;
    return paredeNoTile(this.paredes, tx, ty, lado);
  };
  bloqueado = (tx: number, ty: number): boolean => {
    const linha = this.grade[ty];
    if (!linha || tx < 0 || tx >= linha.length) return true;
    return linha[tx];
  };
  /** Libera todos os tiles cobertos pelo retângulo, em tiles. */
  liberarRetangulo(tx: number, ty: number, tw: number, th: number): void {
    for (let r = ty; r < ty + th; r++) {
      for (let c = tx; c < tx + tw; c++) {
        if (this.grade[r] && c >= 0 && c < this.grade[r].length) this.grade[r][c] = false;
      }
    }
  }
}
