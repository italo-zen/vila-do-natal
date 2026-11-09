// Garante que o gancho de QA (window.__estado, window.__teleportar) NÃO está no build de playtest.
// Roda ao fim de `npm run build:playtest`. Sai com 1 se encontrar qualquer símbolo do gancho.
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const arquivo = join(RAIZ, 'dist-playtest', 'index.html');
if (!existsSync(arquivo)) {
  console.error('dist-playtest/index.html não existe: rode npm run build:playtest.');
  process.exit(1);
}
const html = readFileSync(arquivo, 'utf-8');
const proibidos = ['__estado', '__teleportar', 'ganchoQa', 'Gancho de QA'];
const achados = proibidos.filter((p) => html.includes(p));
if (achados.length > 0) {
  console.error(`O build de playtest contém o gancho de QA: ${achados.join(', ')}`);
  process.exit(1);
}
console.log('Build de playtest sem gancho de QA.');
