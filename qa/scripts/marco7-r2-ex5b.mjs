// EX5 (complemento): andar 35 s em cada área do modo explorar (Hall, Sala, Cozinha, Quarto, Escritório), com pausa, mudo e farejar; erro de console e captura por área. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, sleep } from './lib.mjs';
import { estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco7-r2', 'ex5'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'ex5b' });
const erros = []; const p = await abrirJogo(c, url);
p.on('pageerror', (e) => erros.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
const est = async () => { try { return await estado(p); } catch { return null; } };
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 });
await p.evaluate(() => window.__partidaConcluida('lolo', false));
await p.evaluate(() => window.__irPara('Fim', {})); await sleep(3000);
await tecla(p, 'KeyZ', { ms: 90, pausa: 900 }); await tecla(p, 'ArrowDown', { ms: 90, pausa: 400 }); await tecla(p, 'KeyZ', { ms: 90, pausa: 1500 });
const res = [];
for (const [m, s] of [['hall', 'P8'], ['sala', 'P8'], ['cozinha', 'P7'], ['quarto', 'P2'], ['escritorio', 'P3']]) {
  await p.evaluate(([a, sp]) => window.__teleportar(a, sp), [m, s]); await sleep(700);
  const t0 = Date.now(); const vis = new Set(); let n = 0; const dirs = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  while (Date.now() - t0 < 35000) {
    n++; const d = dirs[(n * 7) % 4];
    await p.keyboard.down(d); await sleep(260); await p.keyboard.up(d); await sleep(100);
    const q = await est(); if (q?.tileX !== undefined) vis.add(`${q.tileX},${q.tileY}`);
    if (n % 12 === 0) { await tecla(p, 'KeyX', { ms: 90, pausa: 250 }); }
    if (n % 16 === 0) { await tecla(p, 'KeyP', { ms: 90, pausa: 400 }); await tecla(p, 'Escape', { ms: 90, pausa: 300 }); }
    if (n % 25 === 0) { await tecla(p, 'KeyM', { ms: 90, pausa: 250 }); await tecla(p, 'KeyM', { ms: 90, pausa: 250 }); }
  }
  const q = await est();
  await p.screenshot({ path: join(EVID, `ex5-${m}.png`) });
  res.push({ area: m, mapa: q?.mapa, passos: n, tilesVisitados: vis.size, travado: q?.travado });
}
writeFileSync(join(RAIZ, 'qa', 'evidencias', 'marco7-r2', 'ex5b-resultado.json'), JSON.stringify({ areas: res, erros: erros.slice(0, 10) }, null, 1));
console.log(JSON.stringify(res)); console.log('erros de console:', erros.length, erros.slice(0, 3));
await c.close(); await b.close();
