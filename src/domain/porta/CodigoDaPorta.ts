import { DomainError } from '../shared/DomainError';

export type AvaliacaoDoCodigo = 'incompleto' | 'errado' | 'certo';

/** Value object: 3 dígitos. Sem limite de tentativas e sem estado de erro. */
export class CodigoDaPorta {
  static readonly TAMANHO = 3;
  private constructor(public readonly valor: string) {}

  static criar(valor: string): CodigoDaPorta {
    if (!/^\d{3}$/.test(valor)) {
      throw new DomainError('codigo_invalido', `Código da porta precisa ter 3 dígitos: ${valor}`);
    }
    return new CodigoDaPorta(valor);
  }

  confere(tentativa: string): boolean {
    return tentativa === this.valor;
  }

  avaliar(tentativa: string): AvaliacaoDoCodigo {
    if (!/^\d*$/.test(tentativa) || tentativa.length < CodigoDaPorta.TAMANHO) return 'incompleto';
    return this.confere(tentativa) ? 'certo' : 'errado';
  }

  equals(outro: CodigoDaPorta): boolean {
    return outro.valor === this.valor;
  }
}
