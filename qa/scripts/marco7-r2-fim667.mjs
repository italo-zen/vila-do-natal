// Diagnóstico: na tela de fim em 667×375 (toque), quais controles existem e se o toque avança. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [W, H] of [[667, 375]]) {
  const c = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await c.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await sl(2000);
  await p.touchscreen.tap(20, 360); await sl(300);
  await p.evaluate(() => window.__partidaConcluida('lolo', false)); await p.evaluate(() => window.__irPara('Fim', {})); await sl(3500);
  const al = await p.evaluate(() => window.__alvosDeToque());
  console.log(`${W}x${H} alvos no fim: ${al.map((a) => a.origem + ':' + a.nome).join(' | ')}`);
  const a = al.find((q) => q.origem === 'dom' && q.nome === 'a');
  if (a) { await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); } else { const tx = al.find((q) => /Toque para continuar/.test(q.nome)); console.log('texto alvo:', JSON.stringify(tx)); if (tx) await p.touchscreen.tap(tx.x + 5, tx.y + 5); else await p.touchscreen.tap(W / 2, H / 2); }
  await sl(1200);
  const alv2 = await p.evaluate(() => window.__alvosDeToque());
  console.log(`${W}x${H} após toque no fim: créditos=${alv2.some((q) => q.nome.startsWith('Creditos'))} alvos=${alv2.length}`);
  await c.close();
}
await b.close();
