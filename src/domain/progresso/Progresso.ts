import { DomainError } from '../shared/DomainError';
import { erro, ok, type Result } from '../shared/Result';
import type { Sobrinho } from '../personagem/Sobrinho';
import type { AvaliacaoDoCodigo } from '../porta/CodigoDaPorta';
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
 * Imutável: cada comportamento devolve um novo estado.
 */
export class Progresso {
  private constructor(
    public readonly sobrinho: Sobrinho,
    public readonly faseAtual: Fase,
    public readonly fasesConcluidas: readonly Fase[],
  ) {}

  static novo(sobrinho: Sobrinho): Progresso {
    return new Progresso(sobrinho, 'introducao', []);
  }

  concluidaFase(f: Fase): boolean {
    return this.fasesConcluidas.includes(f);
  }

  /** Conclui somente a fase atual e avança para a próxima (GDD 3, regra de ordem). */
  concluir(fase: Fase): Result<ResultadoDaConclusao, DomainError> {
    if (fase !== this.faseAtual) {
      return erro(new DomainError('fase_invalida', `Fase ${fase} não é a atual (${this.faseAtual})`));
    }
    const prox = proximaFase(fase);
    if (!prox) return erro(new DomainError('sem_proxima_fase', 'Não há próxima fase'));
    const novo = new Progresso(this.sobrinho, prox, [...this.fasesConcluidas, fase]);
    return ok({ progresso: novo, eventos: [{ tipo: 'FaseConcluida', fase }] });
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
