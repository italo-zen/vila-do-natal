/**
 * Regra de abertura da pausa (GDD 19.3.1; PS5; ADR-010 2). Abre na exploração, e não na dica, que já congela o mundo
 * (16.8.5). No modo explorar também abre (EX4). Não depende do modo de sessão, por isso não é igual a `podeAbrirDica`
 * fora de `historia`. Função pura.
 */
import type { ModoDaTela } from '../../../application/mundo/nick/modoDaTela';

export function podeAbrirPausa(modo: ModoDaTela): boolean {
  return modo === 'exploracao';
}
