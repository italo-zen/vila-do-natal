import type { SessaoDeJogo } from '../SessaoDeJogo';
import { estadoDaArvore } from './pecas';

/**
 * Chegada da condução à árvore (GDD 14.9.3, 14.11.1 passos 4 a 6; casos D11 a D14 de 14.11.6). Decisão do Diretor
 * no PT2b (2026-11-08), escopo fechado pelo Produto: ao chegar, o diálogo da árvore começa sozinho, sem tecla;
 * terminado, o jogador fica livre; o diálogo automático acontece uma vez por partida. Regras puras (sem Phaser):
 * a cena só consulta e marca por estas funções.
 */

/** Duas páginas do diálogo automático de chegada (GDD 14.9.3, texto exato). Chaves em content/texts/pt-BR.json. */
export const CHAVES_DA_CHEGADA = ['arvore.nascer.1', 'arvore.nascer.2'] as const;

/** Marca de "árvore examinada": só o primeiro A do jogador na frente da árvore a marca (GDD 14.9.3). */
export const CHAVE_EXAMINADA = 'arvore.examinada';

/** Marca do diálogo automático: ele acontece uma vez por partida (GDD 14.11.6, D14). */
export const CHAVE_CHEGADA = 'arvore.chegada';

/** Devolve true só na primeira chegada da partida: é quando o diálogo automático deve abrir. */
export function deveAbrirChegada(sessao: SessaoDeJogo): boolean {
  return sessao.primeiraVez(CHAVE_CHEGADA);
}

/**
 * O halo pisca depois das luzes e até o primeiro exame do jogador (A na frente da árvore), e só enquanto a árvore
 * está desmontada (estado 0). O diálogo automático de chegada não conta como exame (GDD 14.9.3, "Para"; D13).
 * No Marco 2 (GDD 15.4) o pisca não volta: a primeira peça encaixada apaga o halo.
 */
export function haloDaArvoreVisivel(sessao: SessaoDeJogo): boolean {
  const estado = estadoDaArvore((f) => sessao.faseConcluida(f));
  return sessao.luzesAcesas() && !sessao.foiVisto(CHAVE_EXAMINADA) && estado === 0;
}
