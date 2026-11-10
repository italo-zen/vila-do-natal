// R134: base do joystick e ícones durante o fade de porta (Sala -> Escritório pela P3), 844×390 e 667×375. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { tecla } from './lib.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [W, H] of [[844, 390], [667, 375]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await real(2000);
  const est = () => p.evaluate(() => window.__estado());
  const al = () => p.evaluate(() => window.__alvosDeToque());
  const z = (await al()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
  await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(700);
  const cs = (await al()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao'));
  await p.touchscreen.tap(cs[1].x + 20, cs[1].y + 20); await real(800);
  for (let i = 0; i < 25; i++) { const st = await est(); if (st?.mapa && !st.travado) break; const a = (await al()).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); await real(300); }
  await p.evaluate(() => window.__teleportar('cozinha', 'P7')); await real(900);
  for (let i = 0; i < 5; i++) { const st = await est(); if (!st?.travado) break; await tecla(p, 'z', { ms: 90, pausa: 300 }); }
  await p.keyboard.down('ArrowLeft');
  let viu = false; let base = false; let icone = false; let amostras = 0;
  for (let i = 0; i < 90; i++) { const st = await est(); if (st?.emFade) { viu = true; amostras++; const a = await al(); if (a.some((q) => q.nome === 'analogico')) base = true; if (a.some((q) => q.nome.startsWith('icone-'))) { icone = true; if (amostras <= 3) console.log('  fade ícones:', a.filter((q) => q.nome.startsWith('icone-')).map((q) => q.nome).join(','), 'modo', JSON.stringify(st?.mapa)); } if (amostras === 1) await p.screenshot({ path: join(RAIZ, 'qa', 'evidencias', 'marco6-r1', `${W}x${H}-fade-porta.png`) }); } await real(30); }
  await p.keyboard.up('ArrowLeft');
  console.log(`${viu && !base ? 'OK   ' : viu ? 'FALHA' : 'N/T  '} ${W}x${H} R134 durante o fade de porta: viu=${viu} amostras=${amostras} base=${base} ícone=${icone}`);
  await ctx.close();
}
await b.close();
