// Lista as combinações de peça de parede que ocorrem nas áreas de content/ (ADR-012 seção 3.2): a Arte desenha só estas.
// Usa a mesma classificação do motor (src/application/mundo/vista.ts, carregada pelo Vite em modo SSR).
// Uso: node tools/listar-combinacoes-de-parede.mjs            (tabela por peça, com as áreas e a contagem)
//      node tools/listar-combinacoes-de-parede.mjs --por-area  (contagem por área)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const lerJson = (c) => JSON.parse(readFileSync(join(RAIZ, c), 'utf-8'));
const server = await createServer({ configFile: false, root: RAIZ, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false } });
const { classificarArestas, chaveDaPeca } = await server.ssrLoadModule('/src/application/mundo/vista.ts');
const { interpretarSubarea } = await server.ssrLoadModule('/src/application/content/interpretarSubarea.ts');
const manifesto = lerJson('content/manifest.json');

const porPeca = new Map();
const porArea = new Map();
for (const decl of manifesto.maps) {
  const mapa = interpretarSubarea(lerJson(`content/${decl.file}`), decl);
  const contagem = {};
  for (const a of classificarArestas(mapa)) {
    const nome = chaveDaPeca(a);
    contagem[nome] = (contagem[nome] ?? 0) + 1;
    const p = porPeca.get(nome) ?? { total: 0, areas: new Set(), comPorta: 0 };
    p.total++;
    p.areas.add(decl.id);
    if (a.porta) p.comPorta++;
    porPeca.set(nome, p);
  }
  porArea.set(decl.id, contagem);
}
await server.close();

if (process.argv.includes('--por-area')) {
  for (const [id, c] of porArea) console.log(`${id}: ${Object.entries(c).map(([k, n]) => `${k} ${n}`).join(', ')}`);
} else {
  console.log(`${porPeca.size} combinações de peça nas ${porArea.size} áreas:`);
  for (const [nome, p] of [...porPeca].sort()) console.log(`  ${nome.padEnd(28)} ${String(p.total).padStart(3)} arestas (${p.comPorta} com porta)  ${[...p.areas].join(', ')}`);
}
