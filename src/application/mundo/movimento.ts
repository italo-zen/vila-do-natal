import type { PerfilDeArte, Dimensao } from '../arte/PerfilDeArte';
import type { ObjetoDoMapa } from '../content/Mapa';

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

function caixaBateEmParede(p: Posicao, bloqueado: Bloqueado, g: Geometria): boolean {
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
  return false;
}

/**
 * Move em uma direção (sem diagonal), pixel a pixel, parando na primeira parede.
 * Nunca atravessa parede e nunca fica preso: se não há colisão, anda a distância toda.
 */
export function mover(p: Posicao, direcao: Direcao, distancia: number, bloqueado: Bloqueado, g: Geometria): Posicao {
  const { dx, dy } = VETOR[direcao];
  let atual = { ...p };
  let restante = distancia;
  while (restante > 0) {
    const passo = Math.min(1, restante);
    const candidato = { x: atual.x + dx * passo, y: atual.y + dy * passo };
    if (caixaBateEmParede(candidato, bloqueado, g)) break;
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
): ObjetoDoMapa | undefined {
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
  constructor(grade: boolean[][]) {
    this.grade = grade.map((linha) => [...linha]);
  }
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
