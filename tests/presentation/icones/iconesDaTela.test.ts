import { describe, expect, it } from 'vitest';
import { podeAbrirDica, type ModoDaTela } from '../../../src/application/mundo/nick/modoDaTela';
import { iconesDaTela, xDoIcone } from '../../../src/presentation/ui/icones/iconesDaTela';
import { botoesDaTela } from '../../../src/presentation/ui/toque/botoesDaTela';

/** GDD 19.3.2 e 19.3.1; ADR-008 7.3 e 7.4: ícones de pausa e de som por tela, fora da tabela de controles de jogo. */
const MODOS: ModoDaTela[] = ['exploracao', 'dialogo', 'painel', 'conquista', 'conducao', 'fade', 'dica', 'titulo', 'selecao', 'introducao', 'comoJogar', 'creditos'];

describe('ícones de tela (GDD 19.3.2)', () => {
  it('o II (pausa) só aparece onde a pausa abre: a exploração (PS5)', () => {
    expect(MODOS.filter((m) => iconesDaTela(m).pausa)).toEqual(['exploracao']);
    expect(MODOS.filter((m) => podeAbrirDica(m))).toEqual(['exploracao']);
  });

  it('o som aparece só no título e na exploração', () => {
    expect(MODOS.filter((m) => iconesDaTela(m).som).sort()).toEqual(['exploracao', 'titulo']);
    expect(iconesDaTela('titulo').som).toBe(true);
    expect(iconesDaTela('exploracao').som).toBe(true);
    expect(iconesDaTela('dialogo').som).toBe(false);
    expect(iconesDaTela('selecao').som).toBe(false);
  });

  it('ícones não são controles de jogo: a tabela de botões não os lista (ADR-008 7.4)', () => {
    for (const m of ['titulo', 'exploracao'] as const) {
      const t = botoesDaTela(m);
      expect(Object.keys(t).sort()).toEqual(['a', 'b', 'direcoes']);
    }
  });

  it('no canto superior esquerdo: o II na margem; na exploração, o som ao lado dele; no título, o som na margem', () => {
    expect(xDoIcone('pausa', 'exploracao', 8, 32)).toBe(8);
    expect(xDoIcone('som', 'exploracao', 8, 32)).toBe(48);
    expect(xDoIcone('som', 'titulo', 8, 32)).toBe(8);
  });
});
