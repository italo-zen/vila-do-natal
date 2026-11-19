import type { Direcao } from '../../domain/shared/Direcao';
import { caixaCruzaAresta, centroDosPes, type Geometria, type ParedeNoTile, type Posicao } from './movimento';

/**
 * Travessia de porta por aresta (ADR-011 seção 3.4). Funções puras, em px, no mesmo sistema de coordenadas de `Posicao`
 * (a cena passa a porta já em tiles da tela). O teclado e o toque entregam direção e A; nada aqui os distingue.
 */

/** Uma porta como a travessia a vê: o tile da área em que ela está e o lado do outro lado. */
export interface PortaDeTile {
  x: number;
  y: number;
  lado: Direcao;
}

/** Tolerância de interação (GDD 14.9.2): 4 px no tile de 16, ou seja, 1/4 de tile. */
const TOLERANCIA_EM_TILES = 1 / 4;

const VETOR: Record<Direcao, { dx: number; dy: number }> = {
  cima: { dx: 0, dy: -1 },
  baixo: { dx: 0, dy: 1 },
  esquerda: { dx: -1, dy: 0 },
  direita: { dx: 1, dy: 0 },
};

/** Segmento de uma aresta, só da aresta de `lado` do tile (x, y): vira a "parede" única do teste de cruzamento. */
function soEstaAresta(porta: PortaDeTile): ParedeNoTile {
  return (tx, ty, lado) => {
    const v = VETOR[porta.lado];
    const oposto = { cima: 'baixo', baixo: 'cima', esquerda: 'direita', direita: 'esquerda' }[porta.lado];
    return (tx === porta.x && ty === porta.y && lado === porta.lado) || (tx === porta.x + v.dx && ty === porta.y + v.dy && lado === oposto);
  };
}

/** Tile onde está o centro dos pés. */
function tileDosPes(p: Posicao, g: Geometria): { x: number; y: number } {
  const c = centroDosPes(p, g);
  return { x: Math.floor(c.x / g.tile), y: Math.floor(c.y / g.tile) };
}

/**
 * Andar contra a porta: o movimento na direção de `lado` é barrado pela aresta da porta (a caixa dos pés encosta na linha:
 * mais 1 px nessa direção a cruzaria), e o centro dos pés está no tile da porta. Passar rente à parede em outro tile,
 * encostar de lado ou andar em outra direção não dispara. `direcao` é a direção em que o sobrinho está empurrando.
 */
export function portaContraAoAndar<T extends PortaDeTile>(p: Posicao, direcao: Direcao, portas: readonly T[], g: Geometria): T | undefined {
  const t = tileDosPes(p, g);
  const v = VETOR[direcao];
  const candidato = { x: p.x + v.dx, y: p.y + v.dy };
  return portas.find((porta) => {
    if (porta.lado !== direcao || porta.x !== t.x || porta.y !== t.y) return false;
    const x0 = candidato.x + g.pes.dx;
    const y0 = candidato.y + g.pes.dy;
    return caixaCruzaAresta(x0, y0, x0 + g.pes.w, y0 + g.pes.h, g.tile, soEstaAresta(porta));
  });
}

/**
 * Distância, em px, da caixa dos pés até a linha da porta (0 = encostada). Negativa se a caixa já passou da linha
 * (não acontece com a parede valendo).
 */
export function distanciaDosPesAteAPorta(p: Posicao, porta: PortaDeTile, g: Geometria): number {
  const x0 = p.x + g.pes.dx;
  const y0 = p.y + g.pes.dy;
  const x1 = x0 + g.pes.w;
  const y1 = y0 + g.pes.h;
  const t = g.tile;
  switch (porta.lado) {
    case 'cima':
      return y0 - porta.y * t;
    case 'baixo':
      return (porta.y + 1) * t - y1;
    case 'esquerda':
      return x0 - porta.x * t;
    case 'direita':
      return (porta.x + 1) * t - x1;
  }
}

/**
 * A de frente: `direcao` igual ao `lado`, centro dos pés no tile da porta e distância dos pés até a linha dentro da
 * tolerância de interação (GDD 14.9.2). De costas ou de lado, não.
 */
export function portaDeFrente<T extends PortaDeTile>(p: Posicao, direcao: Direcao, portas: readonly T[], g: Geometria): T | undefined {
  const t = tileDosPes(p, g);
  const tolerancia = g.tile * TOLERANCIA_EM_TILES;
  return portas.find((porta) => {
    if (porta.lado !== direcao || porta.x !== t.x || porta.y !== t.y) return false;
    const d = distanciaDosPesAteAPorta(p, porta, g);
    return d >= -1e-9 && d <= tolerancia + 1e-9;
  });
}

/**
 * Bilhete de parede (ADR-011 seção 3.2): o A de frente para a parede do `lado`, no tile do bilhete, com os pés dentro da
 * tolerância de interação. Mesma regra de `portaDeFrente`.
 */
export const bilheteDeFrente = portaDeFrente;
