import { ehFase } from '../../domain/progresso/Fase';

/** Início da partida: subárea, spawn e as páginas da introdução (ADR-002, missions/marco1.json). */
export interface Inicio {
  mapa: string;
  spawn: string;
  paginas: string[];
}
/**
 * Destino da condução automática depois de uma fase (ADR-002 seção 2; ADR-004 seção 11.1). Não é spawn:
 * é um tile andável da subárea, com a direção de chegada.
 */
export interface Destino {
  mapa: string;
  x: number;
  y: number;
  direcao: 'cima' | 'baixo' | 'esquerda' | 'direita';
}
/** Texto da dica de uma fase: um valor vale para os dois estados do Nick, ou um objeto com um valor por estado. */
export type DicaPorEstado = string | { dormindo: string; acordado: string };

/**
 * Campo `dica` de uma missão (ADR-005 seção 2.2): chave por fase (`porta`, `luzes`, `parte1`, `parte2`, `parte3`,
 * `enfeites`). Não tem `livre` (ADR-006 seção 6; N014). Os valores são chaves de `content/texts/pt-BR.json`.
 */
export type DicaDaMissao = Record<string, DicaPorEstado>;

export interface Missao {
  id: string;
  /** Só a missão de início (marco1) tem inicio; as partes começam pela condução (ADR-002, seção 2.2). */
  inicio?: Inicio;
  /** Chaves são ids de fase do domínio (minúsculas, ex.: "luzes"). */
  conducao: Record<string, Destino>;
  /** Chave de texto da tela de conquista de cada fase (ADR-002 seção 2). */
  conquistas: Record<string, string>;
  // `nick` (dorme e alvo) saiu das missões: é do plano sorteado (ADR-013). Presente no arquivo, é erro N015.
  /** Dica da missão (ADR-005 seção 2). Obrigatória nas missões de fase; a validação (N001, N014) confere. */
  dica?: DicaDaMissao;
}

const DIRECOES = ['cima', 'baixo', 'esquerda', 'direita'];

export function interpretarMissao(bruto: unknown): Missao {
  const m = bruto as Partial<Missao> | null;
  if (
    !m ||
    typeof m.id !== 'string' ||
    (m.inicio !== undefined && (typeof m.inicio.mapa !== 'string' || typeof m.inicio.spawn !== 'string' || !Array.isArray(m.inicio.paginas))) ||
    !m.conducao ||
    typeof m.conducao !== 'object' ||
    !m.conquistas ||
    typeof m.conquistas !== 'object'
  ) {
    throw new Error('Missão inválida: precisa de id, conducao e conquistas (inicio só na missão de início).');
  }
  if ('nascimentoPorFase' in m) {
    throw new Error(`Missão "${m.id}": nascimentoPorFase foi substituído por conducao e conquistas (ADR-002, revisão de 2026-11-08).`);
  }
  for (const [fase, d] of Object.entries(m.conducao)) {
    if (!ehFase(fase)) throw new Error(`Missão "${m.id}": conducao tem a fase "${fase}", que não existe no domínio.`);
    if (typeof d?.mapa !== 'string' || !Number.isInteger(d.x) || !Number.isInteger(d.y) || !DIRECOES.includes(d.direcao)) {
      throw new Error(`Missão "${m.id}": conducao.${fase} precisa de mapa, x, y inteiros e direcao (cima, baixo, esquerda ou direita).`);
    }
  }
  for (const fase of Object.keys(m.conquistas)) {
    if (!ehFase(fase)) throw new Error(`Missão "${m.id}": conquistas tem a fase "${fase}", que não existe no domínio.`);
  }
  // `nick` e `dica` são lidos como vierem: a forma e os valores são conferidos em validarConteudo (N001 a N014), para que
  // o erro chegue com código e mensagem de conteúdo, não como exceção de leitura.
  return m as Missao;
}
