/** Valor de propriedade de um objeto de jogo (ADR-004 seção 6). */
export type ValorDeObjeto = string | number | boolean;

/**
 * Objeto de jogo de uma subárea, em tiles locais (ADR-004 seção 6). `tipo` é o da tabela de objetos
 * (porta, spawn, interruptor, bilhete, arvore, examinavel, movel, peca, enfeite). Os demais campos ficam em `dados`.
 */
export interface ObjetoDoMapa {
  tipo: string;
  x: number;
  y: number;
  dados: Record<string, ValorDeObjeto>;
}

/**
 * Uma área (ADR-004 seção 2 e ADR-011 seção 1): caixa de tiles com piso, colisão e objetos. `chao` tem o índice do tileset
 * (1 a N) ou 0 para sem piso; `colisao` é true para bloqueado. Coordenadas locais à caixa.
 */
export interface MapaDoJogo {
  id: string;
  tileset: string;
  /** Lado do tile em px (igual a perfil.tile; conferido em validarConteudo). */
  tile: number;
  largura: number;
  altura: number;
  /** Cômodo escuro até as luzes (GDD 14.5). */
  escuro: boolean;
  chao: number[][];
  colisao: boolean[][];
  /**
   * Máscara de paredes por aresta (ADR-011 seção 2.1), mesma forma de `chao` (`paredes[y][x]`). Bits: 1 cima, 2 direita,
   * 4 baixo, 8 esquerda. Completa: inclui muros, toda fronteira e as arestas das portas.
   */
  paredes: number[][];
  objetos: ObjetoDoMapa[];
}

/** Objetos de um tipo, na ordem do arquivo. */
export function objetosDoTipo(mapa: MapaDoJogo, tipo: string): ObjetoDoMapa[] {
  return mapa.objetos.filter((o) => o.tipo === tipo);
}
