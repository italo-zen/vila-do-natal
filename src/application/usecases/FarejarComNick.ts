import type { PortaASeguir } from '../../domain/nick/PortaASeguir';
import type { MapaDoJogo } from '../content/Mapa';
import type { SessaoDeJogo } from '../SessaoDeJogo';
import type { MissaoCarregada } from '../mundo/missoes';
import { alvoDaFase } from '../mundo/nick/missaoDoNick';
import { portaASeguir } from '../mundo/nick/portaASeguir';
import { contextoDaPartida } from '../mundo/pecas';

/** Resultado do B (ADR-005 seção 4.1), na ordem de decisão. */
export type ResultadoDoFarejar =
  | { tipo: 'dormindo' }
  | { tipo: 'mesmoComodo' }
  | { tipo: 'porta'; porta: PortaASeguir }
  | { tipo: 'semAlvo' };

/**
 * B na exploração (GDD 16.5). Com Nick dormindo: "zzz". Acordado sem alvo (depois da parte 3): abana. Alvo no mesmo
 * cômodo: "Au!". Alvo em outro cômodo: a porta a seguir, que vira a seta por 5 s (o Farejo cuida do tempo).
 */
export class FarejarComNick {
  constructor(
    private readonly sessao: SessaoDeJogo,
    private readonly missoes: readonly MissaoCarregada[],
    private readonly mapas: ReadonlyMap<string, MapaDoJogo>,
  ) {}

  /** `mapaDoSobrinho`: a subárea onde o sobrinho está agora (o cômodo do farejar, ADR-005 seção 4.3). */
  executar(mapaDoSobrinho: string): ResultadoDoFarejar {
    const nick = this.sessao.progresso.nick;
    if (nick.dormindo) return { tipo: 'dormindo' };
    const concluida = (f: Parameters<SessaoDeJogo['faseConcluida']>[0]) => this.sessao.faseConcluida(f);
    const alvo = alvoDaFase(this.missoes, concluida);
    if (!alvo) return { tipo: 'semAlvo' };
    if (alvo === mapaDoSobrinho) return { tipo: 'mesmoComodo' };
    const aberta = contextoDaPartida(this.missoes, concluida).areaAberta;
    const porta = portaASeguir(this.mapas, aberta, mapaDoSobrinho, alvo);
    if (!porta) return { tipo: 'semAlvo' };
    this.sessao.farejo.mostrar(porta);
    return { tipo: 'porta', porta };
  }
}
