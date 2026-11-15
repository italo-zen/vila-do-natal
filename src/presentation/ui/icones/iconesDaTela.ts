/**
 * Ícones de pausa e de som na tela (GDD 19.3.2; ADR-008 7.3 e 7.4). Não são controles de jogo: ficam fora da tabela de
 * `botoesDaTela` (ADR-008 7.4), e este arquivo diz em quais telas aparecem. Função pura.
 */
import { podeAbrirPausa } from '../pausa/podeAbrirPausa';
import type { ModoDaTela } from '../../../application/mundo/nick/modoDaTela';

export interface IconesVisiveis {
  /** II (pausa): só onde a pausa abre, a exploração (PS5; 19.3.1). */
  pausa: boolean;
  /** Som: no título e na exploração (19.3.2). Não aparece em outras telas. */
  som: boolean;
}

export function iconesDaTela(modo: ModoDaTela | 'titulo'): IconesVisiveis {
  return {
    pausa: modo !== 'titulo' && podeAbrirPausa(modo),
    som: modo === 'titulo' || modo === 'exploracao',
  };
}

/**
 * Posição x, em px de jogo, dos ícones no canto superior esquerdo (linha 0, GDD 16.8.1): o II primeiro e o som ao lado
 * dele na exploração; o som sozinho no título. `margem` é o espaço pequeno do perfil; `lado` é o tile (32 px).
 */
export function xDoIcone(icone: 'pausa' | 'som', modo: ModoDaTela | 'titulo', margem: number, lado: number): number {
  if (icone === 'pausa') return margem;
  return iconesDaTela(modo).pausa ? margem + lado + margem : margem;
}
