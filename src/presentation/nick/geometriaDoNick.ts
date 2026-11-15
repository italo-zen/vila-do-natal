import type { PerfilDeArte } from '../../application/arte/PerfilDeArte';
import type { Geometria } from '../../application/mundo/movimento';

/**
 * Geometria do Nick a partir de `corpos.nick` do perfil (ADR-003, ADR-005 seção 7.1). Quadro e caixa dos pés vêm do perfil.
 * Sem `pes` declarado, a caixa é o quadro inteiro. O Nick fica alinhado à base do tile (o quadro cabe no tile).
 */
export function geometriaDoNick(p: PerfilDeArte): Geometria {
  const corpo = p.corpos.nick;
  if (!corpo) throw new Error('Perfil de arte sem corpos.nick (ADR-005 seção 7.1).');
  const quadro = corpo.quadro;
  const pes = corpo.pes ?? quadro;
  return { tile: p.tile, quadro, pes: { dx: (quadro.w - pes.w) / 2, dy: quadro.h - pes.h, w: pes.w, h: pes.h } };
}
