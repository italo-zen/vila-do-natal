import { parsePersonagemId } from '../../domain/personagem/PersonagemId';
import { sobrinhoPorId } from '../../domain/personagem/sobrinhos';
import { Progresso } from '../../domain/progresso/Progresso';
import type { SessaoDeJogo } from '../SessaoDeJogo';

/** Escolha confirmada na seleção: começa a partida em memória, na fase "introducao". */
export class IniciarNovoJogo {
  constructor(private readonly sessao: SessaoDeJogo) {}

  executar(personagemId: string): void {
    const id = parsePersonagemId(personagemId);
    if (!id.ok) throw id.erro;
    this.sessao.iniciar(Progresso.novo(sobrinhoPorId(id.valor)));
  }
}
