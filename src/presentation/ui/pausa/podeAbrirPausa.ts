/**
 * Regra de abertura da pausa (GDD 19.3.1; ADR-008 6.1; PS5). Abre exatamente onde o "?" abre (ADR-005 1.4), e não abre
 * na dica, que já congela o mundo (16.8.5). Função pura.
 */
import { podeAbrirDica, type ModoDaTela } from '../../../application/mundo/nick/modoDaTela';

export function podeAbrirPausa(modo: ModoDaTela): boolean {
  return podeAbrirDica(modo);
}
