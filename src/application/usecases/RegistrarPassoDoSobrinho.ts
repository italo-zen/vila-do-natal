import type { MovimentoDoNick } from '../../domain/nick/Nick';
import type { Direcao } from '../../domain/shared/Direcao';
import type { Tile } from '../../domain/shared/Tile';
import type { SessaoDeJogo } from '../SessaoDeJogo';

/** Cada tile novo do sobrinho, também na condução (ADR-005 seção 3.1). O Nick acordado segue; dormindo, não se mexe. */
export class RegistrarPassoDoSobrinho {
  constructor(private readonly sessao: SessaoDeJogo) {}

  executar(tile: Tile, direcao: Direcao): MovimentoDoNick {
    return this.sessao.progresso.nick.registrarPasso(tile, direcao);
  }
}
