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
