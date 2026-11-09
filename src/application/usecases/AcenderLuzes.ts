import type { SessaoDeJogo } from '../SessaoDeJogo';

/** Interruptor principal (GDD 4.3). Conclui a fase "luzes". */
export class AcenderLuzes {
  constructor(private readonly sessao: SessaoDeJogo) {}

  /** @returns true se acendeu agora; false se já estava acesa ou fora da fase. */
  executar(): boolean {
    const r = this.sessao.progresso.acenderLuzes();
    if (!r.ok) return false;
    this.sessao.definir(r.valor.progresso);
    return true;
  }
}
