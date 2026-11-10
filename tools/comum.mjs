// Utilitários dos scripts de release (ADR-002 seção 1). Sem dependências além da biblioteca padrão do Node.
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Raiz do repositório (a pasta acima de tools/). */
export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

/** True se o script foi chamado direto pelo Node (e não importado por outro script ou pelo Vitest). */
export function executadoDiretamente(importMetaUrl) {
  return Boolean(process.argv[1]) && importMetaUrl === pathToFileURL(resolve(process.argv[1])).href;
}

/** Tamanho em KB decimal (1 KB = 1000 bytes), como o GDD 19.2.6 usa. */
export const kb = (bytes) => `${(bytes / 1000).toFixed(1)} KB`;
