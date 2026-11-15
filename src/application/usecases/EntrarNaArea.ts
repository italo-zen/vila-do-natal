import type { Direcao } from '../../domain/shared/Direcao';
import type { SessaoDeJogo } from '../SessaoDeJogo';

/**
 * O sobrinho entrou numa subárea pela porta (PT3, 2026-11-09). O Nick acordado vai para o tile da chegada, oculto, e só
 * aparece no primeiro passo do sobrinho (GDD 16.4.2, ajustado). Dormindo, não muda de lugar. Não usa fade próprio.
 */
export class EntrarNaArea {
  constructor(private readonly sessao: SessaoDeJogo) {}

  /** `mapaId`: a subárea de chegada; `chegada`: o spawn, em tiles locais da subárea. */
  executar(mapaId: string, chegada: { x: number; y: number }, direcao: Direcao): void {
    this.sessao.progresso.nick.entrarNaArea({ mapa: mapaId, x: chegada.x, y: chegada.y }, direcao);
  }
}
