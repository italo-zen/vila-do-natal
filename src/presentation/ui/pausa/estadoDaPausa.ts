/**
 * Estado da tela de pausa (GDD 19.3.3 e 19.3.4; ADR-008 6.3). Função pura: sem Phaser e sem som. A cena lê o estado,
 * desenha a visão e chama as transições. Foco sem volta nos limites (ADR-007 M5).
 */
export type VisaoDaPausa = 'pausa' | 'confirmacao' | 'comoJogar';

export interface EstadoDaPausa {
  visao: VisaoDaPausa;
  foco: number;
}

/** Índices dos itens de cada visão (ordem de GDD 19.3.3 e 19.3.4). */
export const ITEM = {
  continuar: 0,
  som: 1,
  comoJogar: 2,
  sair: 3,
  sim: 0,
  nao: 1,
  voltar: 0,
} as const;

/** Quantos itens tem cada visão. */
export function itensDaVisao(visao: VisaoDaPausa): number {
  return visao === 'pausa' ? 4 : visao === 'confirmacao' ? 2 : 1;
}

/** Estado ao abrir: visão da pausa, foco em "Continuar" (GDD 19.3.3, item 1). */
export function estadoInicialDaPausa(): EstadoDaPausa {
  return { visao: 'pausa', foco: ITEM.continuar };
}

/** Setas e WASD trocam o foco dentro da visão. Nos limites, o foco para (ADR-007 M5). */
export function moverFoco(estado: EstadoDaPausa, delta: number): EstadoDaPausa {
  const ultimo = itensDaVisao(estado.visao) - 1;
  return { ...estado, foco: Math.min(ultimo, Math.max(0, estado.foco + delta)) };
}

/** Efeito de confirmar um item. `som` alterna o mudo e fica na pausa; os demais mudam de visão ou saem. */
export type AcaoDaPausa = { tipo: 'nenhuma' } | { tipo: 'continuar' } | { tipo: 'som' } | { tipo: 'sair' };

export function confirmarItem(estado: EstadoDaPausa): { acao: AcaoDaPausa; estado: EstadoDaPausa } {
  if (estado.visao === 'pausa') {
    switch (estado.foco) {
      case ITEM.continuar:
        return { acao: { tipo: 'continuar' }, estado };
      case ITEM.som:
        return { acao: { tipo: 'som' }, estado };
      case ITEM.comoJogar:
        // PS6: "Como jogar" abre a lista dentro da pausa, com foco no único item (Voltar).
        return { acao: { tipo: 'nenhuma' }, estado: { visao: 'comoJogar', foco: ITEM.voltar } };
      case ITEM.sair:
        // PS7: "Voltar ao título" pede confirmação, com "Não" em foco (GDD 19.3.4).
        return { acao: { tipo: 'nenhuma' }, estado: { visao: 'confirmacao', foco: ITEM.nao } };
    }
  }
  if (estado.visao === 'confirmacao') {
    if (estado.foco === ITEM.sim) return { acao: { tipo: 'sair' }, estado };
    // PS7: "Não" volta à pausa, com foco em "Voltar ao título".
    return { acao: { tipo: 'nenhuma' }, estado: { visao: 'pausa', foco: ITEM.sair } };
  }
  // PS6: "Voltar" da lista volta à pausa, com foco em "Como jogar", não ao título.
  return { acao: { tipo: 'nenhuma' }, estado: { visao: 'pausa', foco: ITEM.comoJogar } };
}

/** X, Esc ou P: fecha a visão atual. Na pausa, continua o jogo. Nas outras visões, volta à pausa com o foco de origem. */
export function voltarDaPausa(estado: EstadoDaPausa): { acao: AcaoDaPausa; estado: EstadoDaPausa } {
  if (estado.visao === 'pausa') return { acao: { tipo: 'continuar' }, estado };
  if (estado.visao === 'confirmacao') return { acao: { tipo: 'nenhuma' }, estado: { visao: 'pausa', foco: ITEM.sair } };
  return { acao: { tipo: 'nenhuma' }, estado: { visao: 'pausa', foco: ITEM.comoJogar } };
}
