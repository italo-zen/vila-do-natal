import { describe, expect, it } from 'vitest';
import { botoesDaTela, temBordaDoJoystick, type ModoDoToque } from '../../src/presentation/ui/toque/botoesDaTela';

/** ADR-007 seção 6 e 12.1: cada modo segue a tabela (13 linhas, GDD 18.4 e 18.19.9). `direcoes` é a lista de direções do joystick. */
const TABELA: [ModoDoToque, string[], boolean, boolean][] = [
  ['titulo', ['cima', 'baixo'], true, false],
  ['comoJogar', [], true, true],
  ['selecao', ['esquerda', 'direita'], true, true],
  ['introducao', [], true, true],
  ['exploracao', ['cima', 'baixo', 'esquerda', 'direita'], true, true],
  ['dialogo', [], true, true],
  ['painel', [], false, false],
  ['conquista', [], true, true],
  ['dica', [], true, true],
  ['conducao', [], false, false],
  ['fade', [], false, false],
  ['creditos', [], true, true],
  ['rotacao', [], false, false],
];

describe('botões visíveis por tela (ADR-007 seção 6)', () => {
  it.each(TABELA)('modo %s', (modo, direcoes, a, b) => {
    const t = botoesDaTela(modo);
    expect(t.direcoes).toEqual(direcoes);
    expect(t.a).toBe(a);
    expect(t.b).toBe(b);
  });

  it('tem exatamente as 13 linhas da tabela', () => {
    expect(TABELA).toHaveLength(13);
  });

  it('devolve cópia: mudar o resultado não muda a tabela', () => {
    botoesDaTela('exploracao').direcoes.pop();
    expect(botoesDaTela('exploracao').direcoes).toHaveLength(4);
  });
});

/** Layout B (pedido de 2026-11-09): menus e telas de texto sem controle; exploração e diálogos mantêm os seus. */
describe('layout B: telas de menu e texto sem controle sobre o texto', () => {
  it.each(['titulo', 'comoJogar', 'selecao', 'conquista', 'dica', 'creditos', 'painel', 'conducao', 'fade', 'rotacao'] as ModoDoToque[])(
    'modo %s em layout B não mostra controle',
    (modo) => {
      expect(botoesDaTela(modo, 'B')).toEqual({ direcoes: [], a: false, b: false });
    },
  );

  it('exploração em layout B mantém o joystick, A e B (pergunta 38)', () => {
    expect(botoesDaTela('exploracao', 'B')).toEqual({ direcoes: ['cima', 'baixo', 'esquerda', 'direita'], a: true, b: true });
  });

  it('diálogo e introdução em layout B mantêm A e B (sem joystick), para avançar sem tocar na caixa', () => {
    expect(botoesDaTela('dialogo', 'B')).toEqual({ direcoes: [], a: true, b: true });
    expect(botoesDaTela('introducao', 'B')).toEqual({ direcoes: [], a: true, b: true });
  });

  it('layout A não muda: título tem cima e baixo, e seleção tem esquerda e direita', () => {
    expect(botoesDaTela('titulo', 'A').direcoes).toEqual(['cima', 'baixo']);
    expect(botoesDaTela('selecao', 'A').direcoes).toEqual(['esquerda', 'direita']);
  });
});

import { semBotoes } from '../../src/presentation/ui/toque/botoesDaTela';

describe('semBotoes: a barra de menu entra quando não há botão visível', () => {
  it('título em layout B: sem botão', () => {
    expect(semBotoes(botoesDaTela('titulo', 'B'))).toBe(true);
  });
  it('exploração em layout B: tem botão', () => {
    expect(semBotoes(botoesDaTela('exploracao', 'B'))).toBe(false);
  });
  it('diálogo em layout B: tem A e B', () => {
    expect(semBotoes(botoesDaTela('dialogo', 'B'))).toBe(false);
  });
  it('título em layout A: tem cima, baixo e A', () => {
    expect(semBotoes(botoesDaTela('titulo', 'A'))).toBe(false);
  });
});

/** ADR-007 7.1 e 1.5: a borda do joystick (`apertada`) só nos menus; fora deles o joystick só segura direção. */
describe('temBordaDoJoystick: só nos menus', () => {
  it('título, Como jogar e seleção ligam a borda', () => {
    expect(temBordaDoJoystick('titulo')).toBe(true);
    expect(temBordaDoJoystick('comoJogar')).toBe(true);
    expect(temBordaDoJoystick('selecao')).toBe(true);
  });

  it('exploração, diálogo, introdução, conquista, dica, condução, fade, créditos, painel e rotação não', () => {
    for (const modo of ['exploracao', 'dialogo', 'introducao', 'conquista', 'dica', 'conducao', 'fade', 'creditos', 'painel', 'rotacao'] as const) {
      expect(temBordaDoJoystick(modo), modo).toBe(false);
    }
  });
});
