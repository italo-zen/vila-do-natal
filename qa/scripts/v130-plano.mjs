import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 704 } })).newPage();
const erros = []; p.on('pageerror', (e) => erros.push(String(e))); p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) erros.push(m.text()); });
await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
const planos = [];
for (let i = 1; i <= 40; i++) {
  const pers = ['lolo', 'bibi', 'dandan', 'tutu'][i % 4];
  const r = await p.evaluate(([a, s]) => { window.__novaPartida(a, s); return window.__plano(); }, [pers, i * 101 + 7]);
  planos.push(r);
}
console.log(JSON.stringify(planos[0]).slice(0, 1500));
const r2 = await p.evaluate(() => { window.__novaPartida('bibi', 108); return window.__plano(); });
console.log('repete semente:', JSON.stringify(r2) === JSON.stringify(planos[0]));
console.log('erros', erros.length, erros.slice(0, 2));
import { writeFileSync } from 'node:fs'; writeFileSync('qa/evidencias/v140/planos.json', JSON.stringify(planos, null, 1));
await b.close();
