/**
 * Detecção de aparelho com toque e de retrato (ADR-007 seção 2). Funções puras: os sinais entram por parâmetro,
 * para o Vitest testar sem navegador. `sinaisDoNavegador` é a única parte que lê o navegador, e roda uma vez no boot.
 */
export interface SinaisDeToque {
  maxTouchPoints: number;
  temOntouchstart: boolean;
  ponteiroGrosso: boolean;
}

/** Aparelho com toque: qualquer um dos três sinais basta (ADR-007 seção 2.1). Computador sem tela de toque: falso. */
export function aparelhoComToque(sinais: SinaisDeToque): boolean {
  return sinais.maxTouchPoints > 0 || sinais.temOntouchstart || sinais.ponteiroGrosso;
}

/** Retrato: a área visível é mais alta que larga (ADR-007 seção 2.2). */
export function ehRetrato(area: { largura: number; altura: number }): boolean {
  return area.altura > area.largura;
}

export function sinaisDoNavegador(janela: Window = window): SinaisDeToque {
  return {
    maxTouchPoints: janela.navigator.maxTouchPoints ?? 0,
    temOntouchstart: 'ontouchstart' in janela,
    ponteiroGrosso: typeof janela.matchMedia === 'function' && janela.matchMedia('(any-pointer: coarse)').matches,
  };
}
