/**
 * Tamanho de texto no jogo (GDD 19.4.1, item 8; 19.11, k): piso de 12 px de jogo para qualquer texto. Funções puras,
 * sem Phaser: quem mede é a cena (Phaser `Text.width`), e aqui só se escolhe o maior tamanho que cabe.
 */

/** Piso de texto em px de jogo (GDD 19.4.1, item 8). Nenhum texto desenhado fica abaixo disso. */
export const PISO_DE_TEXTO_JOGO = 12;

/** Folga mínima, em px de jogo, entre o texto e a borda interna do cartão da seleção (backlog 130). */
export const FOLGA_MINIMA_DO_NOME = 4;

/**
 * Maior tamanho da lista (ordem de preferência, do maior para o menor) cuja medida cabe no limite. `medir(tamanho)` é
 * a largura do texto nesse tamanho, em px de jogo. Se nenhum cabe, devolve o piso (o texto fica no piso, mesmo sem
 * caber: quem decide o que fazer é a cena). Função pura.
 */
export function maiorTamanhoQueCabe(tamanhos: readonly number[], medir: (tamanho: number) => number, limite: number): number {
  const candidatos = tamanhos.filter((t) => t >= PISO_DE_TEXTO_JOGO);
  for (const t of candidatos) {
    if (medir(t) <= limite) return t;
  }
  return PISO_DE_TEXTO_JOGO;
}

/**
 * Tamanhos candidatos a partir do corpo: corpo, corpo − 2, … até o piso (em passos de 2). Ex.: 16 → [16, 14, 12].
 */
export function tamanhosAteOPiso(corpo: number): number[] {
  const out: number[] = [];
  for (let t = corpo; t >= PISO_DE_TEXTO_JOGO; t -= 2) out.push(t);
  return out;
}
