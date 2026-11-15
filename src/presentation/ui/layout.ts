/**
 * Helpers puros de posição (ADR-003 seção 6). Sem Phaser. Posições de UI saem de tokens do perfil
 * e destas regras relativas, nunca de px literal nas cenas.
 */

/** Início (x ou y) para centralizar um grupo de `tamanhoDoGrupo` px numa tela de `tamanhoDaTela` px. */
export function inicioCentrado(tamanhoDaTela: number, tamanhoDoGrupo: number): number {
  return (tamanhoDaTela - tamanhoDoGrupo) / 2;
}
