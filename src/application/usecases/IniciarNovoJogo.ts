import { parsePersonagemId } from '../../domain/personagem/PersonagemId';
import { sobrinhoPorId } from '../../domain/personagem/sobrinhos';
import { Progresso } from '../../domain/progresso/Progresso';
import { Nick } from '../../domain/nick/Nick';
import { ehDirecao } from '../../domain/shared/Direcao';
import type { SessaoDeJogo } from '../SessaoDeJogo';
import type { MissaoCarregada } from '../mundo/missoes';
import { destinoInicialDoNick } from '../mundo/nick/missaoDoNick';

/** Escolha confirmada na seleção: começa a partida em memória, na fase "introducao". O Nick começa dormindo na Sala (ADR-005 seção 3.7). */
export class IniciarNovoJogo {
  constructor(
    private readonly sessao: SessaoDeJogo,
    private readonly missoes: readonly MissaoCarregada[],
  ) {}

  executar(personagemId: string): void {
    const id = parsePersonagemId(personagemId);
    if (!id.ok) throw id.erro;
    const dorme = destinoInicialDoNick(this.missoes);
    if (!dorme || !ehDirecao(dorme.direcao)) throw new Error('Missão inicial sem o tile de dormir do Nick (conteúdo nick.dorme).');
    const nick = Nick.dormindoEm({ mapa: dorme.mapa, x: dorme.x, y: dorme.y }, dorme.direcao);
    this.sessao.iniciar(Progresso.novo(sobrinhoPorId(id.valor), nick));
  }
}
