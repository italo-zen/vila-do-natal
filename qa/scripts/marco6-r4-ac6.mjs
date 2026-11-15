// AC6 (toque): ícone de som liga e desliga o mudo; II abre a pausa (844×390 e 667×375). Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [W, H] of [[844, 390], [667, 375]]) {
  const c = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await c.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await real(2000);
  const al = () => p.evaluate(() => window.__alvosDeToque());
  const est = () => p.evaluate(() => window.__estado());
  const z = (await al()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
  await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(700);
  const cs = (await al()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao:Zone') && a.altura > 100);
  await p.touchscreen.tap(cs[0].x + 20, cs[0].y + 20); await real(800);
  for (let i = 0; i < 25; i++) { const st = await est(); if (st?.mapa && !st.travado) break; const a = (await al()).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); await real(300); }
  await p.evaluate(() => window.__teleportar('hall', 'P8')); await real(700);
  const sn = (await al()).find((a) => a.nome === 'icone-som');
  if (!sn) { console.log(`FALHA ${W}×${H} AC6 ícone de som ausente`); await c.close(); continue; }
  const m0 = (await est())?.audio?.mudo;
  await p.touchscreen.tap(sn.x + sn.largura / 2, sn.y + sn.altura / 2); await real(400);
  const m1 = (await est())?.audio?.mudo;
  console.log(`${m1 !== m0 ? 'OK   ' : 'FALHA'} AC6 ${W}×${H} toque no ícone de som alterna o mudo (${m0} → ${m1})`);
  await p.touchscreen.tap(sn.x + sn.largura / 2, sn.y + sn.altura / 2); await real(400);
  const ii = (await al()).find((a) => a.nome === 'icone-pausa');
  if (ii) { await p.touchscreen.tap(ii.x + ii.largura / 2, ii.y + ii.altura / 2); await real(500); const pa = (await est())?.pausa?.aberta; console.log(`${pa ? 'OK   ' : 'FALHA'} AC6 ${W}×${H} toque no II abre a pausa`); }
  await c.close();
}
await b.close();
