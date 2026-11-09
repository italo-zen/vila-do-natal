/**
 * Validação do bloco `toque` do perfil de arte (ADR-007 seção 5.2 e 5.3). Função pura: recebe o perfil já lido
 * (com `sala`, `tile`, `barra` e `painel`) e devolve os erros em português, sem parar no primeiro.
 *
 * Os mínimos de usabilidade são código, não arte: o perfil só pode ir acima deles (ADR-007 seção 5.2).
 */

/** Alvo mínimo de toque, em CSS px (GDD 18.2; style-guide). */
export const ALVO_MINIMO_CSS = 48;
/** Espaço mínimo entre alvos separados, em CSS px (GDD 18.13, regra 1). */
export const ESPACO_MINIMO_CSS = 8;
/** Janela de referência do GDD 18.9. O fator de referência sai dela: 375 / 352 ≈ 1,065. */
export const JANELA_DE_REFERENCIA_TOQUE = { largura: 667, altura: 375 } as const;
/** Teclas da grade do painel no toque: 1 a 9, 0, Apagar, OK e Fechar (ADR-007 seção 8.2). */
export const TECLAS_DO_PAINEL_NO_TOQUE = 13;
/** Altura da barra de duas linhas: o painel e a grade não podem passar dela (ADR-007 seção 5.3). */
const CHAVE_DA_BARRA_DE_DUAS_LINHAS = '2';

/** Sprites de controle que o perfil precisa ter (ADR-007 seção 5.5): joystick (base, bolinha, setores), botões e celular. */
export const SPRITES_DE_CONTROLE = [
  'ctl_analogico_base.png',
  'ctl_analogico_bolinha.png',
  'ctl_analogico_bolinha_pressionada.png',
  'ctl_analogico_brilho_cima.png',
  'ctl_analogico_brilho_baixo.png',
  'ctl_analogico_brilho_esquerda.png',
  'ctl_analogico_brilho_direita.png',
  'ctl_botao_a.png',
  'ctl_botao_b.png',
  'ctl_botao_a_pressionado.png',
  'ctl_botao_b_pressionado.png',
  'ctl_celular.png',
] as const;

/** Faixa aceita da base do joystick, em CSS px (GDD 18.19.3). */
export const BASE_MINIMA_CSS = 96;
export const BASE_MAXIMA_CSS = 120;
/** Bolinha: visual, não alvo (GDD 18.19.3). */
export const BOLINHA_MINIMA_CSS = 40;
/** Curso mínimo: o engajamento (20) precisa caber dentro do curso (ADR-007 5.3). Cópia de `LIMIAR_CSS` (presentation). */
export const LIMIAR_DO_CURSO_CSS = 20;
/** Campos da cruz que saíram do bloco `toque` (ADR-007 5.1, revisão 2). Se estiverem no perfil, o validador acusa. */
const CAMPOS_REMOVIDOS = ['cruzCss', 'cursoCss'] as const;

interface PerfilLido {
  tile: number;
  sala: { colunas: number; linhas: number };
  barra: { alturaPorLinhas: Record<string, number> };
  [chave: string]: unknown;
}

const ehNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Fator de referência (CSS px por pixel de jogo) na janela de 667×375 do GDD 18.9. */
export function fatorDeReferencia(perfil: Pick<PerfilLido, 'tile' | 'sala'>): number {
  return JANELA_DE_REFERENCIA_TOQUE.altura / (perfil.sala.linhas * perfil.tile);
}

/** Erros do bloco `toque` contra os limites de usabilidade e a geometria da tela. Lista vazia = válido. */
export function validarToque(toque: unknown, perfil: PerfilLido): string[] {
  const erros: string[] = [];
  if (!ehObjeto(toque)) return ['toque ausente ou inválido no perfil (ADR-007 seção 5.1).'];

  const t = toque as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  for (const campo of CAMPOS_REMOVIDOS) {
    if (campo in t) erros.push(`toque.${campo}: campo removido (joystick, ADR-007 5.1); retirar do perfil.`);
  }
  if (!ehObjeto(t.analogico)) {
    erros.push('toque.analogico precisa de baseCss e bolinhaCss (joystick, ADR-007 5.1).');
  } else {
    const { baseCss, bolinhaCss } = t.analogico;
    if (!ehNumero(baseCss)) erros.push('toque.analogico.baseCss precisa ser um número.');
    else if (baseCss < BASE_MINIMA_CSS || baseCss > BASE_MAXIMA_CSS) {
      erros.push(`toque.analogico.baseCss (${baseCss}) fora da faixa de ${BASE_MINIMA_CSS} a ${BASE_MAXIMA_CSS} CSS px (GDD 18.19.3).`);
    }
    if (!ehNumero(bolinhaCss)) erros.push('toque.analogico.bolinhaCss precisa ser um número.');
    else if (bolinhaCss < BOLINHA_MINIMA_CSS) erros.push(`toque.analogico.bolinhaCss (${bolinhaCss}) abaixo de ${BOLINHA_MINIMA_CSS} CSS px.`);
    if (ehNumero(baseCss) && ehNumero(bolinhaCss)) {
      if (bolinhaCss >= baseCss) erros.push('toque.analogico.bolinhaCss precisa ser menor que baseCss.');
      else if (baseCss / 2 - bolinhaCss / 2 < LIMIAR_DO_CURSO_CSS) {
        erros.push(`curso da bolinha (${baseCss / 2 - bolinhaCss / 2}) abaixo de ${LIMIAR_DO_CURSO_CSS} CSS px: o engajamento não cabe no curso.`);
      }
    }
  }
  const numeros: [string, unknown][] = [
    ['toque.botaoCss', t.botaoCss],
    ['toque.espacoEntreControlesCss', t.espacoEntreControlesCss],
    ['toque.margemCss', t.margemCss],
    ['toque.faixaMinimaCss', t.faixaMinimaCss],
  ];
  for (const [caminho, valor] of numeros) {
    if (!ehNumero(valor) || valor < 0) erros.push(`${caminho} precisa ser um número ≥ 0.`);
  }
  if (ehNumero(t.botaoCss) && t.botaoCss < ALVO_MINIMO_CSS) erros.push(`toque.botaoCss (${t.botaoCss}) abaixo do alvo mínimo de ${ALVO_MINIMO_CSS} CSS px.`);
  if (ehNumero(t.espacoEntreControlesCss) && t.espacoEntreControlesCss < ESPACO_MINIMO_CSS) {
    erros.push(`toque.espacoEntreControlesCss (${t.espacoEntreControlesCss}) abaixo do espaço mínimo de ${ESPACO_MINIMO_CSS} CSS px.`);
  }
  // Layout A cabe na faixa (ADR-007 5.3): a base com a margem, e A e B lado a lado.
  if (ehNumero(t.faixaMinimaCss) && ehNumero(t.margemCss) && ehNumero(t.analogico?.baseCss)) {
    if (t.analogico.baseCss + 2 * t.margemCss > t.faixaMinimaCss) {
      erros.push(`layout A: base (${t.analogico.baseCss}) + 2 × margem (${t.margemCss}) passa da faixa de ${t.faixaMinimaCss} CSS px.`);
    }
  }
  if (ehNumero(t.faixaMinimaCss) && ehNumero(t.botaoCss) && ehNumero(t.espacoEntreControlesCss) && 2 * t.botaoCss + t.espacoEntreControlesCss > t.faixaMinimaCss) {
    erros.push(`layout A: A e B (${2 * t.botaoCss + t.espacoEntreControlesCss} CSS px) passam da faixa de ${t.faixaMinimaCss} CSS px.`);
  }

  if (!ehObjeto(t.opacidade)) erros.push('toque.opacidade precisa ser um objeto com layoutA, layoutB e pressionado.');
  else {
    for (const campo of ['layoutA', 'layoutB', 'pressionado'] as const) {
      const v = t.opacidade[campo];
      if (!ehNumero(v) || v <= 0 || v > 1) erros.push(`toque.opacidade.${campo} precisa estar em (0, 1].`);
    }
  }

  if (!ehObjeto(t.layoutB)) erros.push('toque.layoutB precisa de linhaDe e linhaAte.');
  else {
    const linhaDe: unknown = t.layoutB.linhaDe;
    const linhaAte: unknown = t.layoutB.linhaAte;
    if (!Number.isInteger(linhaDe) || (linhaDe as number) < 1) erros.push('toque.layoutB.linhaDe precisa ser inteiro ≥ 1 (a linha 0 é do "?").');
    if (!Number.isInteger(linhaAte) || (linhaAte as number) > perfil.sala.linhas - 3) {
      erros.push(`toque.layoutB.linhaAte precisa ser ≤ ${perfil.sala.linhas - 3} (sala.linhas − 3: a barra e o "?" ficam de fora).`);
    }
    if (Number.isInteger(linhaDe) && Number.isInteger(linhaAte) && (linhaDe as number) > (linhaAte as number)) {
      erros.push('toque.layoutB.linhaDe não pode ser maior que linhaAte.');
    }
  }

  if (!ehObjeto(t.rotacao) || !ehNumero(t.rotacao.tamanhoCss) || t.rotacao.tamanhoCss <= 0) {
    erros.push('toque.rotacao.tamanhoCss precisa ser um número > 0.');
  }

  if (!ehObjeto(t.painel)) erros.push('toque.painel precisa de colunas, topo, passoX, passoY, larguraTecla e alturaTecla.');
  else {
    const p = t.painel;
    const campos = ['topo', 'passoX', 'passoY', 'larguraTecla', 'alturaTecla'] as const;
    for (const c of campos) if (!ehNumero(p[c]) || p[c] < 0) erros.push(`toque.painel.${c} precisa ser um número ≥ 0.`);
    const colunasLidas: unknown = p.colunas;
    if (!Number.isInteger(colunasLidas) || (colunasLidas as number) < 1) erros.push('toque.painel.colunas precisa ser inteiro ≥ 1.');
    else if (ehNumero(p.passoX) && ehNumero(p.passoY) && ehNumero(p.larguraTecla) && ehNumero(p.alturaTecla) && ehNumero(p.topo)) {
      const colunas = colunasLidas as number;
      const f = fatorDeReferencia(perfil);
      const linhas = Math.ceil(TECLAS_DO_PAINEL_NO_TOQUE / colunas);
      if (p.alturaTecla * f < ALVO_MINIMO_CSS) erros.push(`toque.painel.alturaTecla (${p.alturaTecla} px de jogo) vale menos de ${ALVO_MINIMO_CSS} CSS px no fator de referência.`);
      if ((p.passoX - p.larguraTecla) * f < ESPACO_MINIMO_CSS) erros.push('toque.painel: o espaço entre colunas fica abaixo de 8 CSS px.');
      if ((p.passoY - p.alturaTecla) * f < ESPACO_MINIMO_CSS) erros.push('toque.painel: o espaço entre linhas fica abaixo de 8 CSS px.');
      const barraDeDuas = perfil.barra?.alturaPorLinhas?.[CHAVE_DA_BARRA_DE_DUAS_LINHAS] ?? 0;
      const limite = perfil.sala.linhas * perfil.tile - barraDeDuas;
      const fundoDaGrade = p.topo + (linhas - 1) * p.passoY + p.alturaTecla;
      if (fundoDaGrade > limite) {
        erros.push(`toque.painel: a grade de ${p.colunas} colunas × ${linhas} linhas termina em y ${fundoDaGrade}, acima da barra (começa em ${limite}).`);
      }
      if ((colunas - 1) * p.passoX + p.larguraTecla > perfil.sala.colunas * perfil.tile) {
        erros.push('toque.painel: a grade é mais larga que a tela.');
      }
    }
  }

  return erros;
}

/** Sprites de controle no sprites.json do perfil (ADR-007 seção 5.5). Só presença; as dimensões são do validar:perfil. */
export function validarSpritesDeControle(arquivos: readonly string[]): string[] {
  return SPRITES_DE_CONTROLE.filter((a) => !arquivos.includes(a)).map((a) => `sprite de controle "${a}" ausente em sprites.json (ADR-007 seção 5.5).`);
}
