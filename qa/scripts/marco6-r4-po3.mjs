// PO3 (rodada 4): "Voltar ao título" da seleção em 844×390 e 667×375: zona ≥ 48 px, sem tocar cartões, toque leva ao título. Só observa.
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
  const z = (await al()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
  await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(700);
  const alv = await al();
  const cart = alv.filter((a) => a.nome.startsWith('Selecao:Zone') && a.altura > 100);
  const vz = alv.filter((a) => a.origem === 'canvas' && a.largura > 300 && a.altura < 80)[0];
  const inv = vz ? cart.filter((k) => vz.x < k.x + k.largura && vz.x + vz.largura > k.x && vz.y < k.y + k.altura && vz.y + vz.altura > k.y).length : -1;
  if (W === 844) { console.log(vz ? 'INFO PO3 844: há zona larga' : 'OK   PO3 844×390: sem botão Voltar ao título (layout A, esperado)'); }
  const cartBottom = Math.max(...cart.map((k) => k.y + k.altura));
  if (W === 667) console.log(`${vz && vz.altura >= 48 && inv === 0 ? 'OK   ' : 'FALHA'} PO3 ${W}×${H}: zona ${vz ? `${vz.largura.toFixed(0)}x${vz.altura.toFixed(0)} y=${vz.y.toFixed(1)}` : 'ausente'} ; base dos cartões y=${cartBottom.toFixed(1)} ; cartões invadidos=${inv}`);
  if (vz && W === 667) { await p.touchscreen.tap(vz.x + vz.largura / 2, vz.y + vz.altura / 2); await real(700); const ok = (await al()).some((a) => a.nome === 'Titulo:Zone'); console.log(`${ok ? 'OK   ' : 'FALHA'} PO3 ${W}×${H}: toque na zona leva ao título`); }
  await p.screenshot({ path: join(RAIZ, 'qa', 'evidencias', 'marco6-r4', `po3-${W}x${H}.png`) }).catch(() => null);
  await c.close();
}
await b.close();
