// Lê a seção de uma versão do CHANGELOG.md (formato Keep a Changelog, GDD 19.7.2 item 4).
// Uso: node tools/changelog.mjs --versao 1.0.0   (imprime o corpo da seção, sem o cabeçalho; sai com 1 se faltar)
// Usado por verificar-release.mjs e pelo workflow de release (texto da GitHub Release).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, executadoDiretamente } from './comum.mjs';

/** Cabeçalho de versão aceito: "## [1.0.0] - 2026-11-09". A data é obrigatória. */
export const CABECALHO = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})\s*$/;

/**
 * Devolve as linhas da seção da versão (cabeçalho incluído), ou null se a versão não tiver seção com data.
 * A seção termina no próximo "## " (outra versão ou "Não lançado").
 */
export function secaoDaVersao(texto, versao) {
  const linhas = texto.split('\n');
  const inicio = linhas.findIndex((l) => {
    const m = CABECALHO.exec(l);
    return m !== null && m[1] === versao;
  });
  if (inicio < 0) return null;
  let fim = linhas.length;
  for (let i = inicio + 1; i < linhas.length; i++) {
    if (linhas[i].startsWith('## ')) {
      fim = i;
      break;
    }
  }
  return linhas.slice(inicio, fim).join('\n').trimEnd() + '\n';
}

function main(argv) {
  const i = argv.indexOf('--versao');
  const versao = i >= 0 ? argv[i + 1] : undefined;
  if (!versao || !/^\d+\.\d+\.\d+$/.test(versao)) {
    console.error('Uso: node tools/changelog.mjs --versao X.Y.Z');
    return 2;
  }
  const arquivo = join(RAIZ, 'CHANGELOG.md');
  if (!existsSync(arquivo)) {
    console.error('CHANGELOG.md não existe na raiz.');
    return 1;
  }
  const secao = secaoDaVersao(readFileSync(arquivo, 'utf-8'), versao);
  if (secao === null) {
    console.error(`CHANGELOG.md sem seção "## [${versao}] - AAAA-MM-DD".`);
    return 1;
  }
  // Sem o cabeçalho: a GitHub Release já mostra o número da versão no título.
  process.stdout.write(secao.split('\n').slice(1).join('\n').replace(/^\n+/, ''));
  return 0;
}

if (executadoDiretamente(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
