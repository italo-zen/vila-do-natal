import { parsePersonagemId } from '../../domain/personagem/PersonagemId';
import { sobrinhoPorId } from '../../domain/personagem/sobrinhos';
import { Progresso } from '../../domain/progresso/Progresso';
import { Nick } from '../../domain/nick/Nick';
import type { Plano } from '../../domain/plano/Plano';
import { ehDirecao } from '../../domain/shared/Direcao';
import { criarRng } from '../../domain/shared/Rng';
import type { MapaDoJogo } from '../content/Mapa';
import type { SessaoDeJogo } from '../SessaoDeJogo';
import type { MissaoCarregada } from '../mundo/missoes';
import { destinoInicialDoNick } from '../mundo/nick/missaoDoNick';
import { mapasComPlano } from '../plano/mapasComPlano';
import { sortearPlano, type EntradaDoPlano } from '../plano/sortearPlano';
import type { FonteDeSemente } from '../ports/FonteDeSemente';

/** O que o caso de uso precisa para planejar a partida (ADR-013 seção 3). */
export interface PlanejadorDaPartida {
  /** Mapas do conteúdo (sem peças); o plano injeta as peças. */
  todos: ReadonlyMap<string, MapaDoJogo>;
  fonte: FonteDeSemente;
  /** `areaAnteriorDaPeca1` só vem com semente da entropia (anti-repetição). */
  sortear(semente: number, areaAnteriorDaPeca1?: string): Plano;
}

/**
 * Escolha confirmada na seleção: sorteia o plano da partida (peças e Nick; só em memória), cria os mapas com as peças e começa a
 * partida na fase "introducao". O Nick começa dormindo no tile do plano para a missão inicial (ADR-005 seção 3.7; ADR-013).
 */
export class IniciarNovoJogo {
  /** Semente fixa da próxima partida (gancho de QA; zera ao usar). Sem ela, a semente vem da `FonteDeSemente`. */
  sementeDaProxima: number | undefined;
  /** Plano fixo para todas as partidas (só o gancho de QA: `?plano=referencia`, para o smoke com passos escritos à mão). Sem ele, sorteia. */
  planoFixo: Plano | undefined;

  constructor(
    private readonly sessao: SessaoDeJogo,
    private readonly missoes: readonly MissaoCarregada[],
    private readonly planejador: PlanejadorDaPartida,
  ) {}

  executar(personagemId: string, semente?: number): void {
    const id = parsePersonagemId(personagemId);
    if (!id.ok) throw id.erro;
    const fixa = semente ?? this.sementeDaProxima;
    this.sementeDaProxima = undefined;
    // Com semente fixa (QA), a mesma semente dá o mesmo plano: sem anti-repetição.
    const usada = fixa !== undefined ? fixa >>> 0 : this.planejador.fonte.nova() >>> 0;
    const plano = this.planoFixo ?? this.planejador.sortear(usada, fixa !== undefined ? undefined : this.sessao.areaDaPeca1Anterior);
    const dorme = destinoInicialDoNick(this.missoes, plano);
    if (!dorme || !ehDirecao(dorme.direcao)) throw new Error('Plano sem o tile de dormir do Nick para a missão inicial.');
    const nick = Nick.dormindoEm({ mapa: dorme.mapa, x: dorme.x, y: dorme.y }, dorme.direcao);
    this.sessao.iniciar(Progresso.novo(sobrinhoPorId(id.valor), nick), plano, mapasComPlano(this.planejador.todos, plano));
  }
}

/** Planejador padrão: sorteia com o RNG da semente sobre o conteúdo. */
export function planejadorDoConteudo(entrada: EntradaDoPlano, fonte: FonteDeSemente): PlanejadorDaPartida {
  return { todos: entrada.todos, fonte, sortear: (semente, anterior) => sortearPlano(entrada, criarRng(semente), semente, anterior) };
}
