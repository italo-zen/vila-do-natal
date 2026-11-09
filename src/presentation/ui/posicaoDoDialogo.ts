/**
 * Posição da caixa de diálogo na tela. 'base' é o padrão (embaixo, acima da barra). 'topo' é usado só no diálogo
 * automático da chegada à árvore (BUG-R15-01, opção b do Diretor): a caixa sobe para não cobrir a árvore, o
 * sobrinho e o halo. A barra de controles continua embaixo nos dois casos.
 */
export type PosicaoDaCaixa = 'base' | 'topo';

/** Y da borda de cima da caixa, em px da tela. Função pura, sem Phaser. */
export function caixaYDoDialogo(alturaTela: number, alturaCaixa: number, posicao: PosicaoDaCaixa): number {
  return posicao === 'topo' ? 0 : alturaTela - alturaCaixa;
}
