// Compara as capturas do smoke com a linha de base do item 014 (critério 2 do ADR-003), pixel a pixel.
// Uso: npm run comparar:capturas                       (dist-playtest/capturas x qa/baseline-014/capturas)
//      node tools/comparar-capturas.mjs <atual> <base>
// Saída: código 0 se os conjuntos de arquivos, as dimensões e todos os pixels (RGBA) são iguais; 1 caso contrário.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodificarPng } from './png.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const atual = resolve(process.argv[2] ?? join(RAIZ, 'dist-playtest', 'capturas'));
const base = resolve(process.argv[3] ?? join(RAIZ, 'qa', 'baseline-014', 'capturas'));

function sair(msg) {
  console.error(msg);
  process.exit(1);
}
if (!existsSync(atual)) sair(`Pasta de capturas atual não encontrada: ${atual} (rode npm run smoke:playtest antes).`);
if (!existsSync(base)) sair(`Linha de base não encontrada: ${base}`);

const lista = (pasta) => readdirSync(pasta).filter((n) => n.endsWith('.png')).sort();
const nAtual = lista(atual);
const nBase = lista(base);
const faltando = nBase.filter((n) => !nAtual.includes(n));
const sobrando = nAtual.filter((n) => !nBase.includes(n));
const diferentes = [];
const ilegiveis = [];

for (const n of nBase.filter((x) => nAtual.includes(x))) {
  let a;
  let b;
  try {
    a = decodificarPng(readFileSync(join(atual, n)));
    b = decodificarPng(readFileSync(join(base, n)));
  } catch (erro) {
    ilegiveis.push(`${n}: ${erro.message}`);
    continue;
  }
  if (a.w !== b.w || a.h !== b.h) {
    diferentes.push(`${n}: dimensões ${a.w}×${a.h} x ${b.w}×${b.h}`);
    continue;
  }
  let px = 0;
  for (let i = 0; i < a.rgba.length; i += 4) {
    if (a.rgba[i] !== b.rgba[i] || a.rgba[i + 1] !== b.rgba[i + 1] || a.rgba[i + 2] !== b.rgba[i + 2] || a.rgba[i + 3] !== b.rgba[i + 3]) px++;
  }
  if (px > 0) diferentes.push(`${n}: ${px} pixels diferentes`);
}

console.log(`Atual: ${atual} (${nAtual.length} PNG)`);
console.log(`Base:  ${base} (${nBase.length} PNG)`);
for (const f of faltando) console.log(`  falta na atual: ${f}`);
for (const s of sobrando) console.log(`  extra na atual: ${s}`);
for (const d of diferentes) console.log(`  diferente: ${d}`);
for (const i of ilegiveis) console.log(`  ilegível: ${i}`);
const ok = faltando.length === 0 && sobrando.length === 0 && diferentes.length === 0 && ilegiveis.length === 0;
console.log(ok ? `Idênticas pixel a pixel: ${nBase.length} de ${nBase.length}.` : `Diferenças: ${diferentes.length + faltando.length + sobrando.length + ilegiveis.length}.`);
process.exit(ok ? 0 : 1);
