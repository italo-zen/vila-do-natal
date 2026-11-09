/**
 * Geometria dos controles de toque (ADR-007 seções 4 e 6). Funções puras, em CSS px. A origem é o canto da área
 * visível (a janela, ou `visualViewport` quando há barra do navegador).
 */
import type { ToqueDoPerfil } from '../../../application/arte/PerfilDeArte';

export type Layout = 'A' | 'B';
export interface Caixa {
  x: number;
  y: number;
  largura: number;
  altura: number;
}
export interface Tamanho {
  largura: number;
  altura: number;
}

/** Caixa da tela do jogo dentro da área visível, em CSS px: centralizada, com a sobra na área. */
export function telaNaArea(area: Tamanho, base: Tamanho, fator: number): Caixa {
  const largura = base.largura * fator;
  const altura = base.altura * fator;
  return { x: (area.largura - largura) / 2, y: (area.altura - altura) / 2, largura, altura };
}

/**
 * Escolhe o layout (ADR-007 seção 4.1; GDD 18.2). Sem toque, nenhum. Com toque: A quando a menor faixa livre
 * (entre a borda da área e a tela) chega à faixa mínima; senão, B. Função pura.
 */
export function escolherLayout(tela: Caixa, area: Tamanho, comToque: boolean, faixaMinimaCss: number): Layout | null {
  if (!comToque) return null;
  const faixaLivre = Math.min(tela.x, area.largura - (tela.x + tela.largura));
  return faixaLivre >= faixaMinimaCss ? 'A' : 'B';
}

/** Posições dos controles: base do joystick (diâmetro `analogico.baseCss`), A e B (diâmetro do botão). */
export interface PosicoesDeToque {
  analogico: Caixa;
  a: Caixa;
  b: Caixa;
}

/**
 * Layout A (ADR-007 seção 4.2; GDD 18.19.2): base do joystick na faixa da esquerda, com a borda esquerda a `margemCss`
 * da borda da área e alinhada pela base com A e B; A e B na faixa da direita (B à esquerda de A, como em GDD 18.2).
 */
export function posicoesDoLayoutA(area: Tamanho, tela: Caixa, toque: ToqueDoPerfil): PosicoesDeToque {
  const base = toque.analogico.baseCss;
  const botao = toque.botaoCss;
  const parLargura = 2 * botao + toque.espacoEntreControlesCss;
  const faixaDireita = area.largura - (tela.x + tela.largura);
  const baseY = area.altura - toque.margemCss;
  const xDoPar = tela.x + tela.largura + (faixaDireita - parLargura) / 2;
  return {
    analogico: { x: toque.margemCss, y: baseY - base, largura: base, altura: base },
    b: { x: xDoPar, y: baseY - botao, largura: botao, altura: botao },
    a: { x: xDoPar + botao + toque.espacoEntreControlesCss, y: baseY - botao, largura: botao, altura: botao },
  };
}

/**
 * Layout B (ADR-007 seção 4.3; GDD 18.19.2): sobre a tela, nas linhas `layoutB.linhaDe` a `linhaAte` (inclusive). Base do
 * joystick do lado esquerdo da tela (a `margemCss` da borda), centrada na faixa vertical; A e B do lado direito.
 */
export function posicoesDoLayoutB(
  tela: Caixa,
  tile: number,
  fator: number,
  toque: ToqueDoPerfil,
  reserva?: { topo: number; fundo: number },
): PosicoesDeToque {
  const topo = tela.y + toque.layoutB.linhaDe * tile * fator;
  const fundo = tela.y + (toque.layoutB.linhaAte + 1) * tile * fator;
  const altura = fundo - topo;
  const base = toque.analogico.baseCss;
  const botao = toque.botaoCss;
  const margem = toque.margemCss;
  const xA = tela.x + tela.largura - margem - botao;
  const xB = xA - toque.espacoEntreControlesCss - botao;
  // A e B: no maior trecho da faixa que não é a caixa de diálogo (texto nunca coberto, ADR-007 4.7).
  let yBotoes = topo + (altura - botao) / 2;
  if (reserva) {
    const rTopo = tela.y + reserva.topo * fator;
    const rFundo = tela.y + reserva.fundo * fator;
    const trechos = [
      { inicio: topo, fim: Math.min(fundo, rTopo) },
      { inicio: Math.max(topo, rFundo), fim: fundo },
    ].filter((t) => t.fim - t.inicio >= botao);
    if (trechos.length > 0) {
      const maior = trechos.reduce((a, b) => (b.fim - b.inicio > a.fim - a.inicio ? b : a));
      yBotoes = maior.inicio + (maior.fim - maior.inicio - botao) / 2;
    }
  }
  return {
    analogico: { x: tela.x + margem, y: topo + (altura - base) / 2, largura: base, altura: base },
    b: { x: xB, y: yBotoes, largura: botao, altura: botao },
    a: { x: xA, y: yBotoes, largura: botao, altura: botao },
  };
}

/** Curso da bolinha (GDD 18.19.3): raio da base menos raio da bolinha. */
export function cursoDaBolinha(baseCss: number, bolinhaCss: number): number {
  return baseCss / 2 - bolinhaCss / 2;
}

/**
 * Posição do centro da bolinha, a partir do deslocamento do dedo (CSS px do centro da base). Dentro do curso, a bolinha
 * segue o dedo; fora dele, fica presa na borda, na direção do dedo (GDD 18.19.6). Função pura.
 */
export function deslocamentoDaBolinha(dx: number, dy: number, curso: number): { dx: number; dy: number } {
  const d = Math.hypot(dx, dy);
  if (d === 0) return { dx: 0, dy: 0 };
  const k = Math.min(1, curso / d);
  return { dx: dx * k, dy: dy * k };
}

/**
 * Caixa do botão "Voltar ao título" da seleção no layout B (pergunta 42, padrão aplicado). Fica no meio da faixa entre a
 * linha de baixo dos cartões e o topo do texto da barra (primeira linha), centralizado na largura. Função pura.
 * `faixaTopo`/`faixaFundo`: y dos cartões e y do texto da barra; `largura` e `altura`: do botão.
 */
export function caixaDoVoltarDaSelecao(larguraDaTela: number, faixaTopo: number, faixaFundo: number, largura: number, altura: number): Caixa {
  return { x: (larguraDaTela - largura) / 2, y: faixaTopo + (faixaFundo - faixaTopo - altura) / 2, largura, altura };
}
