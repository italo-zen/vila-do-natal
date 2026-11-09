import type { Fase } from '../../domain/progresso/Fase';
import type { SessaoDeJogo } from '../SessaoDeJogo';

/** Conclui a fase atual (ex.: introdução terminada -> "porta"). Fase que não é a atual é ignorada. */
export class ConcluirFase {
  constructor(private readonly sessao: SessaoDeJogo) {}

  /** @returns true se avançou; false se a fase não era a atual. */
  executar(fase: Fase): boolean {
    const r = this.sessao.progresso.concluir(fase);
    if (!r.ok) return false;
    this.sessao.definir(r.valor.progresso);
    return true;
  }
}
