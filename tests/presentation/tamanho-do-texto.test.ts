import { describe, expect, it } from 'vitest';
import { FOLGA_MINIMA_DO_NOME, PISO_DE_TEXTO_JOGO, maiorTamanhoQueCabe, tamanhosAteOPiso } from '../../src/presentation/ui/tamanhoDoTexto';

/** Backlog 130 e 131 e GDD 19.4.1 (item 8): piso de 12 px e escolha do maior tamanho que cabe. */
describe('piso de texto (backlog 131)', () => {
  it('o piso é 12 px de jogo', () => {
    expect(PISO_DE_TEXTO_JOGO).toBe(12);
  });

  it('a partir do corpo 16, os candidatos são 16, 14 e 12', () => {
    expect(tamanhosAteOPiso(16)).toEqual([16, 14, 12]);
  });

  it('a partir do corpo abaixo do piso, o piso é o único candidato', () => {
    expect(tamanhosAteOPiso(8)).toEqual([]);
  });
});

describe('maiorTamanhoQueCabe (backlog 130)', () => {
  // Fonte pixel de largura fixa por caractere (Press Start 2P): medida = caracteres × tamanho.
  const medir = (n: number) => (t: number) => n * t;

  it('o nome que cabe no corpo inteiro fica no corpo', () => {
    expect(maiorTamanhoQueCabe([16, 14, 12], medir(4), 88)).toBe(16);
  });

  it('"DanDan" (6 letras) não cabe em 16 com a folga e reduz para 14 só nele', () => {
    // Cartão de 104 px, borda de foco de 4 px dos dois lados e folga de 4: limite = 104 − 2 × (4 + 4) = 88.
    const limite = 104 - 2 * (4 + FOLGA_MINIMA_DO_NOME);
    expect(maiorTamanhoQueCabe([16, 14, 12], medir(6), limite)).toBe(14);
  });

  it('com a folga de 4 px, a medida final deixa pelo menos 4 px de cada lado', () => {
    const cartao = 104;
    const borda = 4;
    const limite = cartao - 2 * (borda + FOLGA_MINIMA_DO_NOME);
    const t = maiorTamanhoQueCabe([16, 14, 12], medir(6), limite);
    const sobra = (cartao - 6 * t) / 2 - borda;
    expect(sobra).toBeGreaterThanOrEqual(FOLGA_MINIMA_DO_NOME);
  });

  it('se nada cabe, fica no piso (a cena decide o resto)', () => {
    expect(maiorTamanhoQueCabe([16, 14, 12], medir(20), 10)).toBe(12);
  });

  it('nunca devolve abaixo do piso, mesmo com lista vazia', () => {
    expect(maiorTamanhoQueCabe([], medir(1), 100)).toBe(PISO_DE_TEXTO_JOGO);
  });
});
