import type { Fase } from '../domain/progresso/Fase';
import { indiceDaFase } from '../domain/progresso/Fase';
import type { Progresso } from '../domain/progresso/Progresso';
import { Farejo } from '../domain/nick/Farejo';
import type { Plano } from '../domain/plano/Plano';
import type { MapaDoJogo } from './content/Mapa';
import { MODO_DE_SESSAO_INICIAL, type ModoDeSessao } from './sessao/modoDeSessao';

/** Estado da partida em memória. Só os casos de uso o alteram. Não é gravado (ADR-002 seção 3). */
export class SessaoDeJogo {
  private _progresso: Progresso | null = null;
  private erros = 0;
  private readonly vistos = new Set<string>();
  /** Seta de farejar da partida (ADR-005 seção 4.5). Vive na sessão, não no Nick: é só o que a seta mostra agora. */
  readonly farejo = new Farejo();
  /** Modo da sessão (ADR-010 1.1): `historia`, ou `explorar` depois da partida concluída. Só em memória. */
  private _modo: ModoDeSessao = MODO_DE_SESSAO_INICIAL;

  private _plano: Plano | null = null;
  private _mapas: Map<string, MapaDoJogo> | null = null;
  /** Área da peça 1 da partida anterior desta sessão (só em memória; anti-repetição, ADR-013 seção 3). */
  areaDaPeca1Anterior: string | undefined;

  /** Plano da partida (peças e Nick sorteados). Só em memória (ADR-002 seção 3). */
  get plano(): Plano {
    if (!this._plano) throw new Error('A partida não tem plano.');
    return this._plano;
  }
  /** Mapas da partida: os do conteúdo com as peças do plano injetadas (ADR-013 seção 3). A apresentação lê só estes. */
  get mapas(): Map<string, MapaDoJogo> {
    if (!this._mapas) throw new Error('A partida não tem mapas (sem plano).');
    return this._mapas;
  }

  get modo(): ModoDeSessao {
    return this._modo;
  }
  /**
   * Entra no modo explorar (ADR-010 1.2). Pré-condição: a partida concluída (a fase final, `enfeites`, está concluída).
   * Não altera o `Progresso`: nenhuma fase, conquista ou missão muda.
   */
  entrarNoModoExplorar(): void {
    if (!this.temPartida || !this.faseConcluida('enfeites')) throw new Error('Explorar a casa só depois da partida concluída (ADR-010 1.2).');
    this._modo = 'explorar';
  }

  get progresso(): Progresso {
    if (!this._progresso) throw new Error('Não há partida em andamento.');
    return this._progresso;
  }
  get temPartida(): boolean {
    return this._progresso !== null;
  }
  iniciar(p: Progresso, plano?: Plano, mapas?: Map<string, MapaDoJogo>): void {
    this._progresso = p;
    this._plano = plano ?? null;
    this._mapas = mapas ?? null;
    if (plano) this.areaDaPeca1Anterior = plano.pecas[0].area;
    this._modo = MODO_DE_SESSAO_INICIAL;
    this.erros = 0;
    this.vistos.clear();
    this.farejo.cancelar();
  }
  definir(p: Progresso): void {
    this._progresso = p;
  }
  get fase(): Fase {
    return this.progresso.faseAtual;
  }
  /**
   * Fase concluída na partida (portas trancadas, ADR-004 seção 3). Vem da lista de concluídas: a última fase
   * (`enfeites`) fica como atual depois de concluída (ADR-006 seção 1.2), e o índice não basta.
   */
  faseConcluida(fase: Fase): boolean {
    return this.progresso.concluidaFase(fase);
  }
  portaAberta(): boolean {
    return indiceDaFase(this.fase) > indiceDaFase('porta');
  }
  luzesAcesas(): boolean {
    return indiceDaFase(this.fase) > indiceDaFase('luzes');
  }
  /** Índice (0, 1, 2, 0, ...) da próxima mensagem de incentivo da porta (GDD 14.1, em ordem). */
  proximoIndiceDeErro(): number {
    const i = this.erros % 3;
    this.erros += 1;
    return i;
  }
  zerarErros(): void {
    this.erros = 0;
  }
  /** Consulta sem marcar. */
  foiVisto(chave: string): boolean {
    return this.vistos.has(chave);
  }
  /** Marca um aviso como visto. Devolve true só na primeira vez. */
  primeiraVez(chave: string): boolean {
    if (this.vistos.has(chave)) return false;
    this.vistos.add(chave);
    return true;
  }
}
