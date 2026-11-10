import { describe, expect, it } from 'vitest';
import { podeAbrirDica, type ModoDaTela } from '../../../src/application/mundo/nick/modoDaTela';
import { podeAbrirPausa } from '../../../src/presentation/ui/pausa/podeAbrirPausa';

/** GDD 19.3.1; ADR-008 6.1; PS5 e PS13: abre exatamente onde o "?" abre, nos 12 modos. */
const MODOS: ModoDaTela[] = ['exploracao', 'dialogo', 'painel', 'conquista', 'conducao', 'fade', 'dica', 'titulo', 'selecao', 'introducao', 'comoJogar', 'creditos'];

describe('podeAbrirPausa (PS5)', () => {
  it.each(MODOS)('modo %s: igual ao "?" (podeAbrirDica)', (modo) => {
    expect(podeAbrirPausa(modo)).toBe(podeAbrirDica(modo));
  });

  it('só a exploração abre a pausa', () => {
    expect(MODOS.filter((m) => podeAbrirPausa(m))).toEqual(['exploracao']);
  });
});
