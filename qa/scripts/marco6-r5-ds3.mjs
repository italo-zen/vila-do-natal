// DS3: latência tecla → som, medida no navegador (performance.now): keydown de M → primeiro evento de som novo (gancho) detectado por rAF. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, sleep } from './lib.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'ds3' });
const p = await abrirJogo(c, url);
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 }); await sleep(300);
await p.evaluate(() => {
  window.__lat = []; window.__tecla = null;
  window.addEventListener('keydown', (e) => { if (e.code === 'KeyM') window.__tecla = performance.now(); }, true);
  let base = -1;
  const tick = () => {
    const ev = window.__estado()?.audio?.ultimosEventos ?? [];
    const n = ev.length;
    if (window.__tecla !== null && n !== base && base !== -1) { window.__lat.push(Math.round(performance.now() - window.__tecla)); window.__tecla = null; }
    base = n;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
for (let i = 0; i < 6; i++) { await tecla(p, 'KeyM', { ms: 60, pausa: 400 }); }
const lat = await p.evaluate(() => window.__lat);
const ok = lat.length >= 4 && Math.max(...lat) <= 100;
console.log(`${ok ? 'OK   ' : 'FALHA'} DS3 tecla M → evento de som (performance.now, rAF) ≤ 100 ms :: ${lat.join(',')} ms (${lat.length} medidas de 6)`);
await c.close(); await b.close();
