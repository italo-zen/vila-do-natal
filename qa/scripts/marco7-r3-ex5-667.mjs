// EX5 no modo explorar em 667×375 (toque): 5 min de passeio com teclado (joystick não é simulável neste roteiro), pausa, mudo, farejar e toques na base; erros e travas. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tecla, sleep } from './lib.mjs';
import { estado } from './lib-rota.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco7-r3', 'ex5-667'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await chromium.launch({ channel: 'chrome', headless: true });
const c = await b.newContext({ viewport: { width: 667, height: 375 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const erros = []; const p = await c.newPage();
p.on('pageerror', (e) => erros.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
await p.goto(url); await p.waitForSelector('canvas'); await sleep(1800);
const est = async () => { try { return await estado(p); } catch { return null; } };
await p.touchscreen.tap(20, 360); await sleep(300);
await p.evaluate(() => window.__partidaConcluida('lolo', false)); await p.evaluate(() => window.__irPara('Fim', {})); await sleep(3000);
await p.touchscreen.tap(333, 187); await sleep(1500);
const al = async () => p.evaluate(() => window.__alvosDeToque());
const cz = (await al()).filter((a) => a.origem === 'canvas' && a.nome === 'Creditos:Zone').sort((x, y) => x.y - y.y);
if (cz[1]) await p.touchscreen.tap(cz[1].x + cz[1].largura / 2, cz[1].y + cz[1].altura / 2);
await sleep(1500);
const t0 = Date.now(); let n = 0; const mapas = new Set(); const travas = []; let ult = null; let base = 0; let pausas = 0; let mudos = 0; let far = 0;
const dirs = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
while (Date.now() - t0 < 120000) {
  n++;
  const d = dirs[Math.floor(Math.random() * 4)];
  await tecla(p, d, { ms: 180 + Math.floor(Math.random() * 500), pausa: 120 });
  const q = await est(); if (q?.mapa) mapas.add(q.mapa);
  if (q?.mapa && ult && q.mapa === ult.mapa && q.tileX === ult.tileX && q.tileY === ult.tileY && n % 10 === 0) travas.push(`${q.mapa}:${q.tileX},${q.tileY}`);
  ult = q;
  const alv = await al(); if (alv.some((a) => a.nome === 'analogico')) base++;
  if (n % 15 === 0) { await tecla(p, 'p', { ms: 90, pausa: 400 }); pausas++; await tecla(p, 'Escape', { ms: 90, pausa: 300 }); }
  if (n % 20 === 0) { await tecla(p, 'm', { ms: 90, pausa: 250 }); mudos++; await tecla(p, 'm', { ms: 90, pausa: 250 }); }
  if (n % 9 === 0) { await tecla(p, 'x', { ms: 90, pausa: 250 }); far++; }
  if (n % 40 === 0) await p.screenshot({ path: join(EVID, `t${Math.round((Date.now() - t0) / 1000)}s.png`) });
}
const res = { minutos: ((Date.now() - t0) / 60000).toFixed(2), passos: n, areas: [...mapas], pausas, mudos, farejos: far, amostrasComBase: base, travasSuspeitas: travas.slice(0, 10), erros: erros.slice(0, 10) };
writeFileSync(join(RAIZ, 'qa', 'evidencias', 'marco7-r3', 'ex5-667-resultado.json'), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res));
await c.close(); await b.close();
