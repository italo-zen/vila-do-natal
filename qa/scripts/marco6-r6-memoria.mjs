// DS4 (critério alternativo): performance.memory a cada 30 s por 5 min de exploração, com a pausa abrindo e fechando 2 vezes. Crescimento ≤ 30 MB. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'mem' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
await irAteHall(p, 0); await irAtePainel(p); await digitar(p, '017'); await z();
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
const mem = () => p.evaluate(() => performance.memory ? performance.memory.usedJSHeapSize / 1048576 : -1);
const amostras = []; const t0 = Date.now(); let k = 0;
const areas = [['sala', 'P8'], ['hall', 'P8'], ['cozinha', 'P7'], ['sala', 'P7']];
while (Date.now() - t0 < 300000) {
  const m = await mem(); amostras.push([Math.round((Date.now() - t0) / 1000), +m.toFixed(1)]);
  if (k % 2 === 0) { const [mp, sp] = areas[(k / 2) % areas.length]; await p.evaluate(([a, s]) => window.__teleportar(a, s), [mp, sp]); }
  if (k === 4 || k === 12) { await tecla(p, 'p', { ms: 90, pausa: 600 }); await tecla(p, 'Escape', { ms: 90, pausa: 600 }); }
  k++;
  await sleep(30000);
}
const ini = amostras[0][1], fim = amostras[amostras.length - 1][1];
const max = Math.max(...amostras.map((a) => a[1]));
console.log(`${(fim - ini) <= 30 ? 'OK   ' : 'FALHA'} DS4 heap JS em 5 min: início ${ini} MB, fim ${fim} MB, máx ${max} MB, crescimento ${(fim - ini).toFixed(1)} MB (≤ 30): ${JSON.stringify(amostras)}`);
await c.close(); await b.close();
