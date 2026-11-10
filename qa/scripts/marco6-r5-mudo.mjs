// AU4 aprofundado: M liga o mudo; a música para? Lê o estado a cada 250 ms por 2 s e o evento S12. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { tecla } from './lib.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 640 } })).newPage();
await p.goto(url); await p.waitForSelector('canvas'); await real(2000);
await tecla(p, 'KeyZ', { ms: 90, pausa: 300 });
await real(800);
const s0 = await p.evaluate(() => window.__estado()?.audio);
console.log('antes  :', JSON.stringify({ liberado: s0?.liberado, musica: s0?.musica, mudo: s0?.mudo }));
await tecla(p, 'KeyM', { ms: 90, pausa: 0 });
for (let i = 0; i < 8; i++) { await real(250); const s = await p.evaluate(() => window.__estado()?.audio); console.log(`t=${(i + 1) * 250}ms`, JSON.stringify({ musica: s?.musica, mudo: s?.mudo, ev: (s?.ultimosEventos ?? []).slice(-1)[0]?.evento })); }
await b.close();
