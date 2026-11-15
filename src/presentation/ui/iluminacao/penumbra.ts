export interface Faixa {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Retângulos escuros que deixam um círculo de luz (GDD 14.5), com borda em degraus de `passo` px.
 * Pura: a cena desenha as faixas com Graphics a cada quadro.
 */
export function faixasEscuras(
  cx: number,
  cy: number,
  raio: number,
  largura: number,
  altura: number,
  passo: number,
): Faixa[] {
  const out: Faixa[] = [];
  for (let y = 0; y < altura; y += passo) {
    const dy = y + passo / 2 - cy;
    if (Math.abs(dy) >= raio) {
      out.push({ x: 0, y, w: largura, h: passo });
      continue;
    }
    const meia = Math.floor(Math.sqrt(raio * raio - dy * dy) / passo) * passo;
    const esq = cx - meia;
    const dir = cx + meia;
    if (esq > 0) out.push({ x: 0, y, w: Math.min(esq, largura), h: passo });
    if (dir < largura) {
      const x = Math.max(dir, 0);
      out.push({ x, y, w: largura - x, h: passo });
    }
  }
  return out;
}
