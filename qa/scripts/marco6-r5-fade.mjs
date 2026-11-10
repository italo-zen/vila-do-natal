// R134: 10 tentativas de fade (Cozinha → Hall pela P7, 667×375), quadro a quadro: ícone ou base listados no gancho durante o fade. Só observa.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { tecla } from './lib.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco6-r5'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const res = [];
for (let t = 1; t <= 10; t++) {
  const c = await b.newContext({ viewport: { width: 667, height: 375 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await c.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await real(1800);
  const al = () => p.evaluate(() => window.__alvosDeToque());
  const est = () => p.evaluate(() => window.__estado());
  const z = (await al()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
  await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(600);
  const cs = (await al()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao:Zone') && a.altura > 100);
  await p.touchscreen.tap(cs[t % 4].x + 20, cs[t % 4].y + 20); await real(700);
  for (let i = 0; i < 25; i++) { const st = await est(); if (st?.mapa && !st.travado) break; const a = (await al()).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); await real(250); }
  await p.evaluate(() => window.__teleportar('cozinha', 'P7')); await real(800);
  for (let i = 0; i < 4; i++) { const st = await est(); if (!st?.travado) break; await tecla(p, 'z', { ms: 90, pausa: 250 }); }
  await p.keyboard.down('ArrowLeft');
  let viu = false; let icone = []; let base = false; let quadro = 0; let captura = null;
  for (let i = 0; i < 160; i++) {
    const st = await est();
    if (st?.emFade) { viu = true; quadro++; const a = await al(); const ic = a.filter((q) => q.nome.startsWith('icone-')).map((q) => q.nome); const bs = a.some((q) => q.nome === 'analogico'); if (ic.length || bs) { icone = ic; base = bs; captura = join(EVID, `t${t}-fade-q${quadro}.png`); await p.screenshot({ path: captura }); break; } }
    await real(20);
  }
  await p.keyboard.up('ArrowLeft');
  res.push(`t${t}: fade=${viu} q=${quadro} ícones=${icone.join('|') || '-'} base=${base}`);
  console.log(res[res.length - 1]);
  await c.close();
}
const achados = res.filter((r) => !/ícones=-\s+base=false/.test(r)).length;
console.log(`${achados === 0 ? 'OK   ' : 'FALHA'} R134 10 tentativas: quadros com ícone ou base listados no gancho durante o fade = ${achados}`);
await b.close();
