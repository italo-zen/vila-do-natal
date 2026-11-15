import type { ResultadoDoAcordar } from '../../domain/nick/Nick';
import type { Tile } from '../../domain/shared/Tile';
import type { SessaoDeJogo } from '../SessaoDeJogo';

/** A em frente do Nick dormindo (ou com o sobrinho encostado, GDD 16.3): acorda. Sem efeito se já está acordado (abana). */
export class AcordarNick {
  constructor(private readonly sessao: SessaoDeJogo) {}

  executar(sobrinho: Tile): ResultadoDoAcordar {
    return this.sessao.progresso.nick.acordar(sobrinho);
  }
}
