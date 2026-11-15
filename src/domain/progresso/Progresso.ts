import { DomainError } from '../shared/DomainError';
import { erro, ok, type Result } from '../shared/Result';
import type { Sobrinho } from '../personagem/Sobrinho';
import type { AvaliacaoDoCodigo } from '../porta/CodigoDaPorta';
import type { Nick } from '../nick/Nick';
import { proximaFase, type Fase } from './Fase';
import type { EventoDeDominio } from './eventos';

export interface ResultadoDaPorta {
  readonly avaliacao: AvaliacaoDoCodigo;
  readonly progresso: Progresso;
  readonly eventos: readonly EventoDeDominio[];
}

export interface ResultadoDaConclusao {
  readonly progresso: Progresso;
  readonly eventos: readonly EventoDeDominio[];
}

/**
 * Agregado raiz: a partida, só em memória (sem save, ADR-002 seção 3).
 * Os campos da fase são imutáveis: cada comportamento devolve um novo estado. O Nick (ADR-005 seção 1.2) é a única
 * parte mutável: é entidade da partida, e o agregado guarda a mesma referência em cada versão do estado.
 */
export class Progresso {
  private constructor(
    public readonly sobrinho: Sobrinho,
    public readonly faseAtual: Fase,
    public readonly fasesConcluidas: readonly Fase[],
    /** Nick da partida (ADR-005 seção 1.2). A invariante "acorda e muda de lugar só nas fases certas" fica aqui. */
    public readonly nick: Nick,
    /**
     * Caixa de enfeite liberada (ADR-006 seção 2.4): vira true no primeiro DevolverControle com a parte 3 concluída.
     * Vale uma vez por partida e não é gravado.
     */
    public readonly caixaLiberada: boolean = false,
  ) {}

  static novo(sobrinho: Sobrinho, nick: Nick): Progresso {
    return new Progresso(sobrinho, 'introducao', [], nick, false);
  }

  concluidaFase(f: Fase): boolean {
    return this.fasesConcluidas.includes(f);
  }

  /**
   * Conclui somente a fase atual e avança para a próxima (GDD 3, regra de ordem). A última fase (`enfeites`) pode ser
   * concluída: ela continua como atual e entra em `fasesConcluidas` (ADR-006 seção 1.2). Concluir de novo é erro.
   */
  concluir(fase: Fase): Result<ResultadoDaConclusao, DomainError> {
    if (fase !== this.faseAtual) {
      return erro(new DomainError('fase_invalida', `Fase ${fase} não é a atual (${this.faseAtual})`));
    }
    if (this.concluidaFase(fase)) {
      return erro(new DomainError('fase_invalida', `Fase ${fase} já foi concluída`));
    }
    const prox = proximaFase(fase) ?? fase;
    const novo = new Progresso(this.sobrinho, prox, [...this.fasesConcluidas, fase], this.nick, this.caixaLiberada);
    return ok({ progresso: novo, eventos: [{ tipo: 'FaseConcluida', fase }] });
  }

  /**
   * Libera a caixa de enfeite (ADR-006 seção 2.4). Só tem efeito depois da parte 3 concluída, e só uma vez: depois disso
   * devolve o mesmo estado.
   */
  liberarCaixa(): Progresso {
    if (this.caixaLiberada || !this.concluidaFase('parte3')) return this;
    return new Progresso(this.sobrinho, this.faseAtual, this.fasesConcluidas, this.nick, true);
  }

  /** Valida sempre o código do sobrinho deste agregado. Acerto conclui a fase "porta". */
  tentarPorta(tentativa: string): Result<ResultadoDaPorta, DomainError> {
    if (this.faseAtual !== 'porta') {
      return erro(new DomainError('fase_invalida', 'A porta só pode ser tentada na fase "porta"'));
    }
    const avaliacao = this.sobrinho.codigoDaPorta.avaliar(tentativa);
    if (avaliacao !== 'certo') return ok({ avaliacao, progresso: this, eventos: [] });
    const r = this.concluir('porta');
    if (!r.ok) return r;
    return ok({ avaliacao, progresso: r.valor.progresso, eventos: r.valor.eventos });
  }

  /** Só tem efeito na fase "luzes" (o interruptor principal). */
  acenderLuzes(): Result<ResultadoDaConclusao, DomainError> {
    return this.concluir('luzes');
  }
}
