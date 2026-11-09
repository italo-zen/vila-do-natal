import { CodigoDaPorta } from '../porta/CodigoDaPorta';
import type { PersonagemId } from './PersonagemId';

export type Genero = 'menina' | 'menino';

/**
 * A escolha do sobrinho é cosmética (GDD 4.8): os quatro compartilham exatamente
 * estas habilidades. Não existe atributo de habilidade por sobrinho.
 */
export const HABILIDADES_DOS_SOBRINHOS = Object.freeze({
  velocidadeTilesPorSegundo: 4,
  interacoes: Object.freeze(['examinar', 'abrir_porta', 'acender_luz'] as const),
});

export class Sobrinho {
  constructor(
    public readonly id: PersonagemId,
    public readonly nome: string,
    public readonly genero: Genero,
    public readonly codigoDaPorta: CodigoDaPorta,
  ) {}

  get habilidades(): typeof HABILIDADES_DOS_SOBRINHOS {
    return HABILIDADES_DOS_SOBRINHOS;
  }
}
