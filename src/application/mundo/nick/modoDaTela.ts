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

export function podeAbrirDica(modo: ModoDaTela): boolean {
  return modo === 'exploracao';
}
