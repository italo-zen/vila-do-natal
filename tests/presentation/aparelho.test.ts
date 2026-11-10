import { describe, expect, it } from 'vitest';
import { aparelhoComToque, ehRetrato } from '../../src/presentation/input/aparelho';

/** ADR-007 seção 2 e 12.1: detecção de toque (três sinais) e de retrato pela área visível. */
describe('aparelho com toque (ADR-007 2.1)', () => {
  const nada = { maxTouchPoints: 0, temOntouchstart: false, ponteiroGrosso: false };

  it('cada sinal sozinho basta', () => {
    expect(aparelhoComToque({ ...nada, maxTouchPoints: 5 })).toBe(true);
    expect(aparelhoComToque({ ...nada, temOntouchstart: true })).toBe(true);
    expect(aparelhoComToque({ ...nada, ponteiroGrosso: true })).toBe(true);
  });

  it('nenhum sinal dá falso (computador sem tela de toque)', () => {
    expect(aparelhoComToque(nada)).toBe(false);
  });
});

describe('retrato pela área visível (ADR-007 2.2)', () => {
  it('390×844 é retrato; 844×390 não é', () => {
    expect(ehRetrato({ largura: 390, altura: 844 })).toBe(true);
    expect(ehRetrato({ largura: 844, altura: 390 })).toBe(false);
  });

  it('quadrado não é retrato (só altura maior que largura)', () => {
    expect(ehRetrato({ largura: 500, altura: 500 })).toBe(false);
  });
});
