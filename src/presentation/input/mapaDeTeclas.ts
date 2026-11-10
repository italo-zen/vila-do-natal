/**
 * Mapa de teclas do jogo, sem Phaser (testável no Vitest). Usado por Controles (cenas) e pelo painel da porta.
 * Teclado: setas ou WASD movem; Z/Enter = A; X/Esc = B (GDD 5 e 14.8). Toque entra no Marco 5.
 */

/** Ações do jogo. `dica` é H (ADR-005 seção 5.2); B é farejar na exploração (ADR-005 seção 4.1). */
export type Acao = 'cima' | 'baixo' | 'esquerda' | 'direita' | 'a' | 'b' | 'dica';

/** Teclas de cada ação, pelo nome do Phaser (`Phaser.Input.Keyboard.KeyCodes`, nomes em maiúsculas). */
export const TECLAS: Record<Acao, string[]> = {
  cima: ['UP', 'W'],
  baixo: ['DOWN', 'S'],
  esquerda: ['LEFT', 'A'],
  direita: ['RIGHT', 'D'],
  a: ['Z', 'ENTER'],
  b: ['X', 'ESC'],
  dica: ['H'],
};

/** Teclas com nome diferente no navegador (KeyboardEvent.key) e no Phaser. Letras e dígitos são iguais. */
const NOME_NO_PHASER = new Map<string, string>([
  ['ArrowUp', 'UP'],
  ['ArrowDown', 'DOWN'],
  ['ArrowLeft', 'LEFT'],
  ['ArrowRight', 'RIGHT'],
  ['Enter', 'ENTER'],
  ['Escape', 'ESC'],
]);

/**
 * Ação do jogo para a tecla do navegador (KeyboardEvent.key). Letras valem em maiúscula e minúscula
 * (Shift ou Caps Lock). Retorna null para tecla sem ação (dígitos, Backspace, etc.).
 */
export function acaoDaTecla(tecla: string): Acao | null {
  const nome = NOME_NO_PHASER.get(tecla) ?? tecla.toUpperCase();
  for (const acao of Object.keys(TECLAS) as Acao[]) {
    if (TECLAS[acao].includes(nome)) return acao;
  }
  return null;
}

/** Efeito de uma tecla dentro do painel da porta. */
export type TeclaDoPainel =
  | { tipo: 'fechar' }
  | { tipo: 'mover'; acao: 'cima' | 'baixo' | 'esquerda' | 'direita' }
  | { tipo: 'digito'; valor: string }
  | { tipo: 'apagar' }
  | { tipo: 'apertar' };

/**
 * Teclas do painel da porta (GDD 14.1 e 14.8). Esc fecha (única tecla que fecha). Setas e WASD movem o foco
 * na grade (as mesmas ações do jogo). Dígitos digitam no campo. Backspace e X apagam (X é o B do jogo,
 * mas aqui apaga). Z e Enter apertam a tecla em foco. Movimento repete ao segurar a tecla; o resto não.
 * Retorna null quando a tecla não faz nada no painel.
 */
export function teclaDoPainel(tecla: string, repetida: boolean): TeclaDoPainel | null {
  if (tecla === 'Escape') return { tipo: 'fechar' };
  const acao = acaoDaTecla(tecla);
  if (acao === 'cima' || acao === 'baixo' || acao === 'esquerda' || acao === 'direita') return { tipo: 'mover', acao };
  if (repetida) return null;
  if (/^[0-9]$/.test(tecla)) return { tipo: 'digito', valor: tecla };
  if (tecla === 'Backspace' || acao === 'b') return { tipo: 'apagar' };
  if (acao === 'a') return { tipo: 'apertar' };
  return null;
}

/**
 * Quando a mensagem de erro do painel (GDD 14.1 e 19.11, j) some. No teclado, só com dígito, X ou Backspace (`apagar`).
 * No toque, com qualquer tecla da grade (dígito, Apagar, OK ou Fechar). Mover o foco e apertar Z ou Enter não somem com
 * a mensagem. Função pura.
 */
export function limpaMensagemDoPainel(origem: 'teclado' | 'toque', tipo: 'digito' | 'apagar' | 'ok' | 'fechar' | 'apertar' | 'mover'): boolean {
  if (origem === 'teclado') return tipo === 'digito' || tipo === 'apagar';
  return tipo === 'digito' || tipo === 'apagar' || tipo === 'ok' || tipo === 'fechar';
}
