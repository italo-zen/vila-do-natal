// AC4 (pisca): quadros do canvas a cada 50 ms por 3 s em título, exploração e pausa; conta mudanças por segundo. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const c = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await c.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await real(2000);
const hash = () => p.evaluate(() => { const cv = document.querySelector('canvas'); return cv.toDataURL('image/png').length + ':' + cv.toDataURL('image/png').slice(-200); });
const amostra = async (nome) => { const hs = []; for (let i = 0; i < 60; i++) { hs.push(await hash()); await real(50); } let mud = 0; for (let i = 1; i < hs.length; i++) if (hs[i] !== hs[i - 1]) mud++; const pps = mud / 3; console.log(`${pps <= 3 ? 'OK   ' : 'FALHA'} AC4 ${nome}: mudanças de quadro = ${mud} em 3 s (≈ ${pps.toFixed(1)}/s; limite 3 ciclos/s)`); };
await amostra('título');
const z = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(800);
const cs = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao:Zone') && a.altura > 100);
await p.touchscreen.tap(cs[0].x + 20, cs[0].y + 20); await real(800);
for (let i = 0; i < 25; i++) { const st = await p.evaluate(() => window.__estado()); if (st?.mapa && !st.travado) break; const a = (await p.evaluate(() => window.__alvosDeToque())).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); await real(250); }
await p.evaluate(() => window.__teleportar('hall', 'P8')); await real(900);
await amostra('exploração (Hall)');
await p.touchscreen.tap(20, 360).catch(() => null);
await p.evaluate(() => window.__teleportar('sala', 'P8')); await real(700);
await amostra('exploração (Sala, com peças)');
await c.close(); await b.close();
