import type { ModoDaTela } from '../../../application/mundo/nick/modoDaTela';
import type { Direcao } from '../../input/direcaoDoAnalogico';

/** Modos da tela para o toque: os do ModoDaTela da aplicação (ADR-005 seção 1.4) mais o aviso de rotação (só apresentação). */
export type ModoDoToque = ModoDaTela | 'rotacao' | 'pausa' | 'pausaSair' | 'pausaComoJogar';

/** Controles de uma tela no toque (ADR-007 seção 6; GDD 18.4 e 18.19.9). `direcoes`: as que o joystick aceita na tela. */
export interface BotoesDaTela {
  direcoes: Direcao[];
  a: boolean;
  b: boolean;
}

const TODAS: Direcao[] = ['cima', 'baixo', 'esquerda', 'direita'];

const TABELA: Record<ModoDoToque, BotoesDaTela> = {
  titulo: { direcoes: ['cima', 'baixo'], a: true, b: false },
  comoJogar: { direcoes: [], a: true, b: true },
  selecao: { direcoes: ['esquerda', 'direita'], a: true, b: true },
  introducao: { direcoes: [], a: true, b: true },
  exploracao: { direcoes: TODAS, a: true, b: true },
  dialogo: { direcoes: [], a: true, b: true },
  painel: { direcoes: [], a: false, b: false },
  conquista: { direcoes: [], a: true, b: true },
  dica: { direcoes: [], a: true, b: true },
  conducao: { direcoes: [], a: false, b: false },
  fade: { direcoes: [], a: false, b: false },
  creditos: { direcoes: [], a: true, b: true },
  rotacao: { direcoes: [], a: false, b: false },
  // Pausa (ADR-008 7.3): menu de três visões. A pausa é menu, por isso tem joystick no layout A e borda de direção.
  pausa: { direcoes: ['cima', 'baixo'], a: true, b: true },
  pausaSair: { direcoes: ['esquerda', 'direita'], a: true, b: true },
  pausaComoJogar: { direcoes: [], a: true, b: true },
};

/**
 * Telas em que a base do joystick aparece no layout B, e nas quais o joystick não aparece (decisão 38; GDD 18.19.9 e
 * ADR-007 4.6). Os menus e o título ficam sem controle no layout B: o toque vai direto no item.
 */
const SEM_CONTROLE_NO_LAYOUT_B: ModoDoToque[] = ['titulo', 'comoJogar', 'selecao', 'conquista', 'dica', 'creditos', 'painel', 'conducao', 'fade', 'rotacao', 'pausa', 'pausaSair', 'pausaComoJogar'];

/** Nenhum controle de toque visível (joystick, A e B ocultos). A barra diz então o que tocar (chave `.toque.menu`). */
export function semBotoes(t: BotoesDaTela): boolean {
  return t.direcoes.length === 0 && !t.a && !t.b;
}

/**
 * Controles visíveis numa tela (tabela de GDD 18.4 e 18.19.9; ADR-007 seção 6). Função pura. Com `layout` B, as telas de
 * menu e de texto ficam sem controle (ver SEM_CONTROLE_NO_LAYOUT_B); a exploração e os diálogos mantêm os seus.
 */
export function botoesDaTela(modo: ModoDoToque, layout: 'A' | 'B' = 'A'): BotoesDaTela {
  if (layout === 'B' && SEM_CONTROLE_NO_LAYOUT_B.includes(modo)) return { direcoes: [], a: false, b: false };
  const t = TABELA[modo];
  return { direcoes: [...t.direcoes], a: t.a, b: t.b };
}

/**
 * Telas em que o joystick gera borda de direção (`apertada`), para os menus lerem (ADR-007 7.1). Só menus: título,
 * Como jogar e seleção. Fora deles o joystick só segura direção (exploração e demais telas).
 */
const MODOS_COM_BORDA: ModoDoToque[] = ['titulo', 'comoJogar', 'selecao', 'pausa', 'pausaSair', 'pausaComoJogar'];

export function temBordaDoJoystick(modo: ModoDoToque): boolean {
  return MODOS_COM_BORDA.includes(modo);
}
