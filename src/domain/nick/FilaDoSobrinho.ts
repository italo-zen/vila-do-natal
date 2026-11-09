import type { Tile } from '../shared/Tile';
import { CASAS_ATRAS_DO_NICK } from './constantes';

/**
 * Fila do sobrinho (ADR-005 seção 1.2): as últimas posições por onde ele passou nesta subárea, da mais antiga à mais
 * recente. O Nick ocupa a mais antiga (1 tile atrás, encostado: PT3, 2026-11-09). Enquanto a fila não está cheia, o Nick
 * fica na `semente` (ao acordar, o tile onde ele dormia).
 * Imutável: cada operação devolve uma fila nova.
 */
export class FilaDoSobrinho {
  private constructor(
    readonly entradas: readonly Tile[],
    readonly semente: Tile | undefined,
  ) {}

  static vazia(): FilaDoSobrinho {
    return new FilaDoSobrinho([], undefined);
  }

  /** Zera a fila e põe a semente (ADR-005 seção 1.2, `entrarNaArea`). */
  comSemente(semente: Tile | undefined): FilaDoSobrinho {
    return new FilaDoSobrinho([], semente);
  }

  /** Acrescenta a posição nova e mantém só as últimas `CASAS_ATRAS_DO_NICK + 1`. */
  comPasso(tile: Tile): FilaDoSobrinho {
    return new FilaDoSobrinho([...this.entradas, tile].slice(-(CASAS_ATRAS_DO_NICK + 1)), this.semente);
  }

  /** Onde o Nick deve estar: a entrada mais antiga quando a fila está cheia; senão, a semente (ADR-005 seção 1.2). */
  alvo(): Tile | undefined {
    if (this.entradas.length > CASAS_ATRAS_DO_NICK) return this.entradas[0];
    return this.semente;
  }
}
