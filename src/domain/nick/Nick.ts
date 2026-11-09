import type { Direcao } from '../shared/Direcao';
import { ehVizinho, mesmoTile, type Tile } from '../shared/Tile';
import { FilaDoSobrinho } from './FilaDoSobrinho';

/**
 * Nick (ADR-005 seção 1.2; GDD 16). Entidade da partida, filha do agregado Progresso. Sem Phaser, sem relógio e sem
 * aleatoriedade. Só muda pelos métodos abaixo. Sem save: começa dormindo a cada carregamento (ADR-002 seção 3).
 */

export type EstadoDoNick = 'dormindo' | 'acordado';

export type ResultadoDoAcordar = { tipo: 'acordou'; primeiraVez: boolean } | { tipo: 'abanou' };

/** O que o Nick fez num passo do sobrinho: parou, andou um tile (vizinho) ou saltou (fila descontínua, ida e volta). */
export type MovimentoDoNick =
  | { tipo: 'parou' }
  | { tipo: 'andou'; direcao: Direcao; para: Tile }
  | { tipo: 'saltou'; direcao: Direcao; para: Tile };

export class Nick {
  private _estado: EstadoDoNick;
  private _tile: Tile;
  private _direcao: Direcao;
  private _fila: FilaDoSobrinho;
  private _jaAcordou: boolean;
  /** Acordado e ainda não revelado na subárea nova: fica fora da tela até o primeiro passo do sobrinho (PT3, 2026-11-09). */
  private _oculto: boolean;

  private constructor(estado: EstadoDoNick, tile: Tile, direcao: Direcao) {
    this._estado = estado;
    this._tile = tile;
    this._direcao = direcao;
    this._fila = FilaDoSobrinho.vazia();
    this._jaAcordou = false;
    this._oculto = false;
  }

  /** Nick dormindo no tile de dormir da fase (começo da partida, ou depois de `dormirEm`). */
  static dormindoEm(tile: Tile, direcao: Direcao): Nick {
    return new Nick('dormindo', tile, direcao);
  }

  get estado(): EstadoDoNick {
    return this._estado;
  }
  get dormindo(): boolean {
    return this._estado === 'dormindo';
  }
  get acordado(): boolean {
    return this._estado === 'acordado';
  }
  /** Tile onde o Nick está (ou, dormindo, onde dorme). A subárea é `tile.mapa`. */
  get tile(): Tile {
    return this._tile;
  }
  get direcao(): Direcao {
    return this._direcao;
  }
  get fila(): FilaDoSobrinho {
    return this._fila;
  }
  get jaAcordouNestaPartida(): boolean {
    return this._jaAcordou;
  }
  get oculto(): boolean {
    return this._oculto;
  }

  /**
   * Acorda (ADR-005 seção 1.2, 3.6). Dormindo vira acordado e devolve `primeiraVez` (mostra `nick.acordou`, uma vez por
   * partida). Acordado só abana, sem efeito de estado. `sobrinho` é o tile do sobrinho no momento: a fila começa com a
   * posição do Nick como semente (fica parado até a fila encher) e a do sobrinho como primeira entrada. Assim o Nick segue
   * sem salto, 1 tile atrás (PT3, 2026-11-09).
   */
  acordar(sobrinho: Tile): ResultadoDoAcordar {
    if (this._estado === 'acordado') return { tipo: 'abanou' };
    const primeiraVez = !this._jaAcordou;
    this._estado = 'acordado';
    this._jaAcordou = true;
    this._fila = FilaDoSobrinho.vazia().comSemente(this._tile).comPasso(sobrinho);
    return { tipo: 'acordou', primeiraVez };
  }

  /** Volta a dormir no `tile` e zera a fila (ADR-005 seção 3.5). Chamado no fim da fase. Não anda até lá (pergunta 33). */
  dormirEm(tile: Tile, direcao: Direcao): void {
    this._estado = 'dormindo';
    this._tile = tile;
    this._direcao = direcao;
    this._fila = FilaDoSobrinho.vazia();
    this._oculto = false;
  }

  /**
   * Sobrinho chegou a uma subárea pela porta (PT3, 2026-11-09: sem semente vizinha; o Nick entra no tile da chegada). Dormindo: não muda.
   * Acordado: o Nick vai para o tile da chegada, oculto (não desenhado), e a fila começa com a chegada. Ele só aparece no
   * passo que atinge o offset (1 tile): aí fica na chegada, e a partir daí segue o sobrinho. Nunca fica à frente dele.
   */
  entrarNaArea(chegada: Tile, direcao: Direcao): void {
    if (this._estado === 'dormindo') return;
    this._tile = chegada;
    this._oculto = true;
    this._direcao = direcao;
    this._fila = FilaDoSobrinho.vazia().comPasso(chegada);
  }

  /**
   * Um passo do sobrinho para o tile `sobrinho` (ADR-005 seção 3.1). Só com Nick acordado. Acrescenta à fila. Se o alvo
   * da fila é diferente do tile do sobrinho e do tile do Nick, o Nick anda um tile até ele (mesma velocidade). Se o alvo
   * é o próprio tile do sobrinho (ele voltou pelo mesmo caminho), o Nick fica onde está. Se o alvo não é vizinho (fila
   * descontínua, depois de ida e volta), o Nick salta até ele, sem atravessar o sobrinho.
   */
  registrarPasso(sobrinho: Tile, direcaoDoPasso: Direcao): MovimentoDoNick {
    if (this._estado !== 'acordado') return { tipo: 'parou' };
    this._fila = this._fila.comPasso(sobrinho);
    const alvo = this._fila.alvo();
    if (!alvo || mesmoTile(alvo, sobrinho)) return { tipo: 'parou' };
    if (mesmoTile(alvo, this._tile)) {
      if (this._oculto) {
        this._oculto = false;
        return { tipo: 'saltou', direcao: this._direcao, para: this._tile };
      }
      return { tipo: 'parou' };
    }
    const oculto = this._oculto;
    this._oculto = false;
    if (ehVizinho(this._tile, alvo) && !oculto) {
      const direcao = direcaoEntre(this._tile, alvo);
      this._tile = alvo;
      this._direcao = direcao;
      return { tipo: 'andou', direcao, para: alvo };
    }
    this._tile = alvo;
    this._direcao = direcaoDoPasso;
    return { tipo: 'saltou', direcao: direcaoDoPasso, para: alvo };
  }

  /** Bloqueio do tile (ADR-005 seção 3.4): só dormindo e só no tile dele. É a única regra de colisão do Nick. */
  bloqueia(tile: Tile): boolean {
    return this._estado === 'dormindo' && mesmoTile(tile, this._tile);
  }
}

/** Direção de um passo entre dois tiles vizinhos (a = origem). */
function direcaoEntre(a: Tile, b: Tile): Direcao {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 1) return 'direita';
  if (dx === -1) return 'esquerda';
  return dy > 0 ? 'baixo' : 'cima';
}
