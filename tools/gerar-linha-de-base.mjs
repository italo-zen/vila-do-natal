// Gera tests/fixtures/colisao-1.1.0.json: sha256 de cada content/maps/**/*.json (exceto decoracao/) da planta nova
// (ADR-011 seção 8, V4). Cada arquivo traz colisão, `paredes`, portas, spawns e objetos. Rode só quando o Diretor aprovar
// uma mudança de mapa (decisions.md): a linha de base é o que o EN1 (ADR-010) compara.
// Uso: node tools/gerar-linha-de-base.mjs
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAPAS = join(RAIZ, 'content', 'maps');

const listar = (pasta) =>
  readdirSync(pasta).flatMap((n) => {
    const c = join(pasta, n);
    return statSync(c).isDirectory() ? listar(c) : [c];
  });

const mapas = {};
for (const f of listar(MAPAS).filter((n) => n.endsWith('.json') && !/[\\/]decoracao[\\/]/.test(n)).sort()) {
  mapas[relative(join(RAIZ, 'content'), f).split('\\').join('/')] = createHash('sha256').update(readFileSync(f)).digest('hex');
}
const manifesto = JSON.parse(readFileSync(join(RAIZ, 'content', 'manifest.json'), 'utf-8'));
const saida = {
  versao: manifesto.contentVersion,
  descricao:
    'sha256 de cada content/maps/**/*.json (exceto decoracao/) da planta por áreas (schema 3): colisão, paredes por aresta, portas, spawns e objetos (ADR-011 seção 8, V4; ADR-010 9, EN1). Qualquer mudança em um mapa reprova.',
  mapas,
};
writeFileSync(join(RAIZ, 'tests', 'fixtures', 'colisao-1.1.0.json'), `${JSON.stringify(saida, null, 2)}\n`);
console.log(`colisao-1.1.0.json: ${Object.keys(mapas).length} mapas`);
