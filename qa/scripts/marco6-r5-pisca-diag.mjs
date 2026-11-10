// Diagnóstico do pisca no Hall: onde os pixels mudam entre quadros (caixa de diferença). Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const c = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await c.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await real(2000);
const z = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(800);
const cs = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao:Zone') && a.altura > 100);
await p.touchscreen.tap(cs[0].x + 20, cs[0].y + 20); await real(800);
for (let i = 0; i < 25; i++) { const st = await p.evaluate(() => window.__estado()); if (st?.mapa && !st.travado) break; const a = (await p.evaluate(() => window.__alvosDeToque())).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); await real(250); }
await p.evaluate(() => window.__teleportar('hall', 'P8')); await real(900);
const grab = () => p.evaluate(() => { const cv = document.querySelector('canvas'); const c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height; c2.getContext('2d').drawImage(cv, 0, 0); return c2.getContext('2d').getImageData(0, 0, cv.width, cv.height).data.slice ? Array.from(c2.getContext('2d').getImageData(0, 0, cv.width, cv.height).data.slice(0, 0)) : null; });
const frames = [];
for (let i = 0; i < 6; i++) { frames.push(await p.evaluate(() => { const cv = document.querySelector('canvas'); const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; return Array.from(d); })); await real(120); }
let minx = 1e9, miny = 1e9, maxx = -1, maxy = -1, w = 0; const W = (await p.evaluate(() => document.querySelector('canvas').width));
for (let f = 1; f < frames.length; f++) { const a = frames[f - 1], bb = frames[f]; for (let i = 0; i < a.length; i += 4) { if (a[i] !== bb[i] || a[i + 1] !== bb[i + 1] || a[i + 2] !== bb[i + 2]) { const px = (i / 4) % W, py = Math.floor(i / 4 / W); minx = Math.min(minx, px); maxx = Math.max(maxx, px); miny = Math.min(miny, py); maxy = Math.max(maxy, py); w++; } } }
console.log(`diferenças entre quadros (canvas px): n=${w} caixa x=${minx}..${maxx} y=${miny}..${maxy} (canvas ${W} px de largura)`);
await c.close(); await b.close();
