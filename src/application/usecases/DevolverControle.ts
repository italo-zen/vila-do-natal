import type { Direcao } from '../../domain/shared/Direcao';
import { ehDirecao } from '../../domain/shared/Direcao';
import type { Tile } from '../../domain/shared/Tile';
import type { MissaoCarregada } from '../mundo/missoes';
import { destinoDoNick } from '../mundo/nick/missaoDoNick';
import type { SessaoDeJogo } from '../SessaoDeJogo';

/**
 * Fim do diálogo de chegada, com o controle de volta ao sobrinho (ADR-005 seção 3.5, GDD 16.6). O Nick sai da fila e dorme
 * no tile da próxima fase. Devolve de onde saiu e onde dorme, para a fumacinha. Sem animação de caminhada (pergunta 33).
 * Também libera a caixa de enfeite na primeira vez com a parte 3 concluída (ADR-006 seção 2.4; GDD 17.2).
 */
export class DevolverControle {
  constructor(
    private readonly sessao: SessaoDeJogo,
    private readonly missoes: readonly MissaoCarregada[],
  ) {}

  executar(): { anterior: Tile; destino: Tile; direcao: Direcao } | undefined {
    this.sessao.definir(this.sessao.progresso.liberarCaixa());
    const d = destinoDoNick(this.missoes, (f) => this.sessao.faseConcluida(f));
    if (!d || !ehDirecao(d.direcao)) return undefined;
    const nick = this.sessao.progresso.nick;
    const anterior = nick.tile;
    nick.dormirEm({ mapa: d.mapa, x: d.x, y: d.y }, d.direcao);
    return { anterior, destino: nick.tile, direcao: d.direcao };
  }
}
