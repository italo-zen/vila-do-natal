// Reconfirmação do P1 (título com imagem): título e fim de cada sobrinho em 667×375 e 844×390, playtest (file://) e QA; título depois dos créditos. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'triagem-r2'); mkdirSync(EVID, { recursive: true });
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const fora = async (p) => p.evaluate(() => { const cv = document.querySelector('canvas'); const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let k = 0; for (let i = 0; i < d.length; i += 4) if (d[i] !== 11 || d[i + 1] !== 16 || d[i + 2] !== 48) k++; return k; });
const res = [];
const pt = pathToFileURL(resolve(RAIZ, 'dist-playtest', 'index.html')).href;
const qa = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
for (const [nome, u] of [['playtest', pt], ['qa', qa]]) for (const [W, H] of [[667, 375], [844, 390]]) {
  const c = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const p = await c.newPage(); await p.goto(u); await p.waitForSelector('canvas'); await sl(4000);
  const n = await fora(p); res.push(`${nome} ${W}×${H} título: pixels fora do fundo = ${n}`);
  await p.screenshot({ path: join(EVID, `${nome}-${W}-titulo.png`) });
  if (nome === 'qa') {
    for (const pers of ['lolo', 'bibi', 'dandan', 'tutu']) {
      const q = await c.newPage(); await q.goto(u); await q.waitForSelector('canvas'); await sl(1500);
      await q.keyboard.press('KeyZ'); await sl(300);
      await q.evaluate((pe) => window.__partidaConcluida(pe, false), pers); await q.evaluate(() => window.__irPara('Fim', {})); await sl(3500);
      const f = await fora(q); res.push(`qa ${W}×${H} fim ${pers}: pixels fora do fundo = ${f}`);
      await q.screenshot({ path: join(EVID, `qa-${W}-fim-${pers}.png`) });
      await q.close();
    }
    // título depois dos créditos: fim → créditos → Voltar ao título
    const q = await c.newPage(); await q.goto(u); await q.waitForSelector('canvas'); await sl(1500);
    await q.keyboard.press('KeyZ'); await sl(300);
    await q.evaluate(() => window.__partidaConcluida('lolo', false)); await q.evaluate(() => window.__irPara('Fim', {})); await sl(3200);
    await q.touchscreen.tap(W / 2, H / 2); await sl(1500);
    await q.evaluate(() => window.__irPara('Titulo', {})); await sl(3500);
    const v = await fora(q); res.push(`qa ${W}×${H} título depois dos créditos: pixels fora do fundo = ${v}`);
    await q.screenshot({ path: join(EVID, `qa-${W}-titulo-depois-creditos.png`) });
    await q.close();
  }
  await c.close();
}
writeFileSync(join(EVID, 'p1-r2.txt'), res.join('\n'));
console.log(res.join('\n'));
await b.close();
