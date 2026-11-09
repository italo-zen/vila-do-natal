import { estadoDaArvore } from '../../domain/progresso/arvore';
import type { SessaoDeJogo } from '../SessaoDeJogo';
import type { MissaoCarregada } from '../mundo/missoes';
import { dicaDaFase, type DicaDaFase } from '../mundo/nick/dica';

/** H ou o ícone "?" (ADR-005 seção 5). Leitura: não muda estado de jogo (GDD 16.8.5). */
export class MontarDica {
  constructor(
    private readonly sessao: SessaoDeJogo,
    private readonly missoes: readonly MissaoCarregada[],
  ) {}

  executar(): DicaDaFase | undefined {
    const concluida = (f: Parameters<SessaoDeJogo['faseConcluida']>[0]) => this.sessao.faseConcluida(f);
    return dicaDaFase(this.missoes, this.sessao.fase, this.sessao.progresso.nick.dormindo, estadoDaArvore(concluida));
  }
}
