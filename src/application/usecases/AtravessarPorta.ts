import type { ObjetoDoMapa } from '../content/Mapa';
import { CONTEXTO_PADRAO, resolverPorta, type ContextoDeArea, type ResultadoDaPorta } from '../mundo/subarea';
import type { SessaoDeJogo } from '../SessaoDeJogo';

/**
 * Caso de uso: o jogador anda contra uma porta ou aperta A de frente para ela (ADR-011 seção 3.4). Devolve se a porta
 * está com código, fechada nesta missão (destino fora de `missions[].maps`) ou para onde levar (área e spawn de chegada). Não toca na apresentação.
 */
export class AtravessarPorta {
  constructor(private readonly sessao: SessaoDeJogo) {}

  executar(porta: ObjetoDoMapa, ctx: ContextoDeArea = CONTEXTO_PADRAO): ResultadoDaPorta {
    return resolverPorta(porta, (fase) => this.sessao.faseConcluida(fase), ctx);
  }
}
