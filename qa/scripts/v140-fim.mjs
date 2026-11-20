import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 704 } })).newPage();
await p.goto(url); await p.waitForSelector('canvas'); await sl(1500);
for (const [pers, seed] of [['bibi', 537], ['tutu', 600], ['dandan', 700]]) {
  await p.evaluate(([a, s]) => { window.__novaPartida(a, s); window.__irPara('Casa', { modo: 'intro' }); }, [pers, seed]); await sl(1400);
  for (let i = 0; i < 14; i++) { await p.keyboard.press('z'); await sl(250); }
  await p.evaluate(() => window.__irParaFase('enfeites')); await sl(400);
  for (let t = 0; t < 10; t++) { const e = await p.evaluate(() => window.__estado()); if (e && !e.travado) break; await p.keyboard.press('z'); await sl(400); }
  const irc = await p.evaluate(() => window.__irACaixa()); await sl(300); await p.evaluate(() => window.__coletarPeca());
  const vistos = []; let ultimo = '';
  for (let t = 0; t < 120; t++) {
    await p.keyboard.press('z'); await sl(400);
    const nomes = await p.evaluate(() => [...new Set(window.__alvosDeToque().filter((a) => a.origem !== 'dom').map((a) => a.nome.split(':')[0]))].join('+')).catch(() => '');
    const c = await p.evaluate(() => window.__passosDaConducao());
    const tag = nomes + (c ? ` cond=${c.fase}:${c.passos}${c.dobro ? 'x2' : ''}` : '');
    if (tag !== ultimo) { vistos.push(`${t}:${tag}`); ultimo = tag; }
    if (/Creditos/.test(nomes)) break;
  }
  console.log(pers, seed, 'caixa ir=', irc && irc.mapa, '|', vistos.join(' > ').slice(0, 300));
}
await b.close();
