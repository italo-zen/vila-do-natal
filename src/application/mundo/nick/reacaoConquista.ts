import type { Nick } from '../../../domain/nick/Nick';

/**
 * Reação do Nick à chegada da árvore com uma conquista (GDD 16.7; ADR-005 seção 3). Nick acordado faz "feliz" (1,6 s) e um
 * "Au!" uma vez; dormindo não reage. Regra pura: a cena só executa o que esta função devolve.
 */
export type ReacaoDoNickNaConquista = 'feliz-e-au' | 'nenhuma';

export function reacaoDoNickNaConquista(nick: Pick<Nick, 'acordado'>): ReacaoDoNickNaConquista {
  return nick.acordado ? 'feliz-e-au' : 'nenhuma';
}
