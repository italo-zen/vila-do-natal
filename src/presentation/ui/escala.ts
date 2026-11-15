import type { PerfilDeArte } from '../../application/arte/PerfilDeArte';

/**
 * Fator de escala da tela no encaixe da janela (ADR-003 seção 9). Função pura, sem Phaser.
 * - `inteira` (v1): o maior inteiro ≥ minima que cabe.
 * - `hibrida` (HD): inteiro a partir de inteiraAPartirDe; abaixo disso, o fator fracionário exato.
 */
export function fatorDeEscala(
  escala: PerfilDeArte['escala'],
  base: { largura: number; altura: number },
  janela: { largura: number; altura: number },
): number {
  const f = Math.min(janela.largura / base.largura, janela.altura / base.altura);
  if (escala.modo === 'inteira') return Math.max(escala.minima, Math.floor(f));
  const inteiro = escala.inteiraAPartirDe ?? 2;
  return f >= inteiro ? Math.floor(f) : f;
}

/** Alvo mínimo de toque, em CSS px (ADR-007 seção 4.5; GDD 18.2). Código, não arte. */
export const ALVO_DE_TOQUE_CSS = 48;

/**
 * Área de toque de um alvo do canvas, em pixels de jogo (ADR-007 seção 4.5): o maior entre o desenho e o mínimo de
 * CSS px convertido pelo fator. Centrada no desenho pela cena. Função pura.
 */
export function areaDeToqueEmJogo(desenho: number, minimoCss: number, fator: number): number {
  return Math.max(desenho, Math.ceil(minimoCss / Math.max(fator, 1e-6)));
}
