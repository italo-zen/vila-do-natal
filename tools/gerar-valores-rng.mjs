// Segunda implementação independente do mulberry32 (não importa código do jogo). Grava tests/fixtures/rng-mulberry32.json.
import { writeFileSync } from 'node:fs';
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Embaralhamento da semente (murmur3 fmix32 de semente + 0x9e3779b9), independente do código do jogo.
function embaralhar(s) {
  let h = (s + 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}
const out = {};
for (const s of [0, 1, 123456789]) { const r = mulberry32(embaralhar(s)); out[s] = Array.from({ length: 10 }, () => r()); }
writeFileSync(new URL('../tests/fixtures/rng-mulberry32.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log('ok');
