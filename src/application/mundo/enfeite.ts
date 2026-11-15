/**
 * Fase e textos da caixa de enfeite (GDD 17; ADR-006). As regras (estado, bloqueio) estão em `domain/progresso/enfeite.ts`
 * e em `pecas.ts`; aqui ficam só as chaves de texto que a cena e a validação leem.
 */
export { FASE_DO_ENFEITE } from '../../domain/progresso/arvore';

/** Aviso da caixa escondida (GDD 17.3; ADR-006 seção 2.4): vale em qualquer estado das partes, sem número de parte. */
export const CHAVE_DO_AVISO_DO_ENFEITE = 'aviso.enfeite.antes3';

/** Diálogo final, depois do encaixe da caixa (GDD 17.4 item 5; ADR-006 seção 4, passo 6). */
export const CHAVE_DA_CHEGADA_FINAL = 'arvore.chegada.4';
