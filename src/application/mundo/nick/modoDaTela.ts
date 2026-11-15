import type { ModoDeSessao } from '../../sessao/modoDeSessao';

/**
 * Modo da tela (ADR-005 seção 1.4): a fonte dos bloqueios de B (farejar) e H (dica). Só `exploracao` deixa farejar e
 * abrir a dica. Função pura: a cena calcula o modo e pergunta aqui.
 */
export type ModoDaTela =
  | 'exploracao'
  | 'dialogo'
  | 'painel'
  | 'conquista'
  | 'conducao'
  | 'fade'
  | 'dica'
  | 'titulo'
  | 'selecao'
  | 'introducao'
  | 'comoJogar'
  | 'creditos';

export function podeFarejar(modo: ModoDaTela): boolean {
  return modo === 'exploracao';
}

/**
 * Dica e "?" (ADR-005 1.4; ADR-010 2). Só na exploração da partida normal (`historia`). No modo explorar não há dica,
 * nem "?" nem H (GDD 16.8.6, 20.5). O padrão `historia` mantém a regra de antes para quem não passa a sessão.
 */
export function podeAbrirDica(modo: ModoDaTela, sessao: ModoDeSessao = 'historia'): boolean {
  return modo === 'exploracao' && sessao === 'historia';
}
