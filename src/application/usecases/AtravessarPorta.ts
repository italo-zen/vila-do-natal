import type { ObjetoDoMapa } from '../content/Mapa';
import { CONTEXTO_PADRAO, resolverPorta, type ContextoDeArea, type ResultadoDaPorta } from '../mundo/subarea';
import type { SessaoDeJogo } from '../SessaoDeJogo';

/**
 * Caso de uso: o jogador tenta passar por um gatilho de porta (ADR-004 seção 3). Devolve se a porta está
 * trancada (fica bloqueada), fechada nesta missão (par com destino fechado) ou para onde levar (subárea e spawn de
 * chegada). Não toca na apresentação.
 */
export class AtravessarPorta {
  constructor(private readonly sessao: SessaoDeJogo) {}

  executar(gatilho: ObjetoDoMapa, ctx: ContextoDeArea = CONTEXTO_PADRAO): ResultadoDaPorta {
    return resolverPorta(gatilho, (fase) => this.sessao.faseConcluida(fase), ctx);
  }
}
