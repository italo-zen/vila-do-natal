/**
 * Modo de sessão (ADR-010 1.1). `historia` é a partida normal; `explorar` é a casa livre depois da partida concluída.
 * Vive só na memória, como o mudo (ADR-002 seção 3): não é campo de `Progresso` e não é gravado. Função pura.
 */
export type ModoDeSessao = 'historia' | 'explorar';

export const MODO_DE_SESSAO_INICIAL: ModoDeSessao = 'historia';
