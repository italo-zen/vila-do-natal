// Garante que o gancho de QA (window.__estado, window.__teleportar) NÃO está num build de playtest ou de release.
// Uso: node tools/verificar-sem-gancho.mjs [caminho.html]   (padrão: dist-playtest/index.html)
// Sai com 1 se encontrar qualquer símbolo do gancho. Também usado por verificar-release.mjs.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { RAIZ, executadoDiretamente } from './comum.mjs';

export const SIMBOLOS_DO_GANCHO = ['__estado', '__teleportar', 'ganchoQa', 'Gancho de QA'];

/** Devolve os símbolos do gancho que aparecem no HTML (lista vazia = limpo). */
export function acharGancho(html) {
  return SIMBOLOS_DO_GANCHO.filter((p) => html.includes(p));
}

function main(argv) {
  const arquivo = argv[0] ? resolve(argv[0]) : join(RAIZ, 'dist-playtest', 'index.html');
  if (!existsSync(arquivo)) {
    console.error(`${arquivo} não existe: rode o build antes (npm run build:playtest ou build:release).`);
    return 1;
  }
  const achados = acharGancho(readFileSync(arquivo, 'utf-8'));
  if (achados.length > 0) {
    console.error(`O build contém o gancho de QA: ${achados.join(', ')} (${arquivo})`);
    return 1;
  }
  console.log(`Build sem gancho de QA: ${arquivo}`);
  return 0;
}

if (executadoDiretamente(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
