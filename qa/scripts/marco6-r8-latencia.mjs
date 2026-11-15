// DS3: latência tecla → primeiro evento de som (gancho audio.ultimosEventos, marca com performance.now). Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, sleep } from './lib.mjs';
import { estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'lat' });
const p = await abrirJogo(c, url);
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 }); await sleep(300);
const lat = [];
for (let i = 0; i < 6; i++) {
  const t0 = await p.evaluate(() => Date.now());
  await tecla(p, 'KeyM', { ms: 60, pausa: 0 });
  let t1 = null;
  for (let k = 0; k < 60 && t1 === null; k++) {
    const ev = (await p.evaluate(() => window.__estado()))?.audio?.ultimosEventos ?? [];
    const novo = ev.find((e) => e.instante >= t0);
    if (novo) t1 = novo.instante; else await sleep(4);
  }
  if (t1 !== null) lat.push(Math.round(t1 - t0));
  await tecla(p, 'KeyM', { ms: 60, pausa: 150 });
}
const ok = lat.length >= 4 && Math.max(...lat) <= 100;
console.log(`${ok ? 'OK   ' : 'FALHA'} DS3 latência tecla → evento de som (gancho) ≤ 100 ms :: ${lat.join(',')} ms (${lat.length} de 6 medidas)`);
await c.close(); await b.close();
