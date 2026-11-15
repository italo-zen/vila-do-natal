import type { Fase } from './Fase';

export interface FaseConcluida {
  readonly tipo: 'FaseConcluida';
  readonly fase: Fase;
}
export type EventoDeDominio = FaseConcluida;
