import type { ObjetoDoMapa } from '../content/Mapa';
import { mover, type Bloqueado, type Geometria, type Direcao, type ParedeNoTile, type Posicao } from './movimento';

/**
 * Móvel espinhoso (easter egg do Diretor): o cacto da Sala. Continua bloqueante como qualquer móvel; quando o jogador anda contra
 * ele, é devolvido 1 tile para onde veio e o móvel pisca por cerca de 1 s. Sem som, sem texto, sem efeito no estado. Vale para o
 * móvel com `espinhoso: true` nos dados ou com o id `cacto` (o schema 3 não muda; o conversor da Arte pode passar a emitir
 * `espinhoso`).
 */
export const ID_DO_MOVEL_ESPINHOSO = 'cacto';

export interface RetanguloEmTiles {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function ehEspinhoso(o: Pick<ObjetoDoMapa, 'tipo' | 'dados'>): boolean {
  return o.tipo === 'movel' && (o.dados.espinhoso === true || o.dados.id === ID_DO_MOVEL_ESPINHOSO);
}

/** Retângulos (em tiles, nas coordenadas dos objetos passados) dos móveis espinhosos. */
export function espinhososDe(objetos: readonly ObjetoDoMapa[]): RetanguloEmTiles[] {
  return objetos.filter(ehEspinhoso).map((o) => ({ x: o.x, y: o.y, w: Number(o.dados.w) || 1, h: Number(o.dados.h) || 1 }));
}

/** Folga, em px, até a qual a caixa dos pés "encosta" no espinhoso (o passo de 1 px pode parar a menos de 1 px da borda). */
const FOLGA_DO_ENCOSTO_PX = 1.5;
/**
 * A colisão por tile tolera até 1 px de sobreposição da caixa dos pés (BUG-M12-03): o jogador pode parar com a caixa 0,9 px dentro
 * do tile do móvel. Isso também é encostar.
 */
const LIMITE_DA_SOBREPOSICAO_PX = 1.01;
/** Sobreposição lateral mínima, em px, para contar como contra o móvel (como a colisão por tile). */
const SOBREPOSICAO_LATERAL_PX = 1;

/**
 * A caixa dos pés está encostada num espinhoso, empurrando contra ele na `direcao`? Só vale a direção do movimento: encostar de
 * lado, ou andar para longe, não conta.
 */
export function espinhosoContra(p: Posicao, direcao: Direcao, g: Geometria, espinhosos: readonly RetanguloEmTiles[]): boolean {
  const x0 = p.x + g.pes.dx;
  const y0 = p.y + g.pes.dy;
  const x1 = x0 + g.pes.w;
  const y1 = y0 + g.pes.h;
  const t = g.tile;
  return espinhosos.some((e) => {
    const ex0 = e.x * t;
    const ey0 = e.y * t;
    const ex1 = (e.x + e.w) * t;
    const ey1 = (e.y + e.h) * t;
    const sobreX = Math.min(x1, ex1) - Math.max(x0, ex0);
    const sobreY = Math.min(y1, ey1) - Math.max(y0, ey0);
    switch (direcao) {
      case 'direita':
        return sobreY >= SOBREPOSICAO_LATERAL_PX && ex0 - x1 >= -LIMITE_DA_SOBREPOSICAO_PX && ex0 - x1 < FOLGA_DO_ENCOSTO_PX;
      case 'esquerda':
        return sobreY >= SOBREPOSICAO_LATERAL_PX && x0 - ex1 >= -LIMITE_DA_SOBREPOSICAO_PX && x0 - ex1 < FOLGA_DO_ENCOSTO_PX;
      case 'baixo':
        return sobreX >= SOBREPOSICAO_LATERAL_PX && ey0 - y1 >= -LIMITE_DA_SOBREPOSICAO_PX && ey0 - y1 < FOLGA_DO_ENCOSTO_PX;
      case 'cima':
        return sobreX >= SOBREPOSICAO_LATERAL_PX && y0 - ey1 >= -LIMITE_DA_SOBREPOSICAO_PX && y0 - ey1 < FOLGA_DO_ENCOSTO_PX;
    }
  });
}

const OPOSTO: Record<Direcao, Direcao> = { cima: 'baixo', baixo: 'cima', esquerda: 'direita', direita: 'esquerda' };

/**
 * Para onde o jogador vai: 1 tile no sentido oposto ao do movimento, andando pelas mesmas regras de colisão (`mover`). Se algo
 * (tile bloqueado ou aresta de parede) corta o caminho, ele para antes: nunca entra em tile bloqueado nem atravessa parede.
 */
export function posicaoDoEmpurrao(p: Posicao, direcao: Direcao, bloqueado: Bloqueado, g: Geometria, parede?: ParedeNoTile): Posicao {
  return mover(p, OPOSTO[direcao], g.tile, bloqueado, g, parede);
}
