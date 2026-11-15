import { imagens, modo, ordem } from 'virtual:recursos';
import { criarRecursos, type Recursos } from './recursos';

/** Busca um arquivo da release. Só `fetch` relativo (ADR-009 5). Não existe no playtest: a função não é referenciada lá. */
async function buscarArquivo(url: string): Promise<ArrayBuffer> {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return resposta.arrayBuffer();
}

/**
 * Recursos do build atual (ADR-009 4.6). Modo e lista vêm do módulo virtual `virtual:recursos`; a base é a da página.
 * No modo `embutido` a função de busca é `undefined`: o bundle do playtest não carrega `fetch` (ADR-008 8.4), porque o
 * ramo de rede é morto e some na montagem.
 */
export function recursosDaBuild(): Recursos {
  const buscar = modo === 'externo' ? buscarArquivo : undefined;
  return criarRecursos({ modo, imagens, ordem }, document.baseURI, buscar ?? (async () => new ArrayBuffer(0)));
}
