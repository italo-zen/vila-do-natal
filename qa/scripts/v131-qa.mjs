import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const O = 'qa/evidencias/v131';
for (const pers of ['lolo', 'bibi', 'dandan', 'tutu']) {
  const ctx = await b.newContext({ viewport: { width: 960, height: 704 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', (e) => erros.push(String(e))); p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) erros.push(m.text()); });
  await p.goto(url); await p.waitForSelector('canvas'); await sl(1500);
  await p.evaluate((x) => { window.__partidaConcluida(x, true); window.__irPara('Casa', { modo: 'explorar' }); }, pers); await sl(1500);
  await p.evaluate(() => window.__teleportar('sala', 'cozinha-sala')); await sl(600);
  await p.screenshot({ path: `${O}/${pers}-sala-cheia.png` });
  for (const d of ['baixo', 'cima', 'esquerda', 'direita']) { await p.evaluate((x) => window.__posicionar(5, 5, x), d); await sl(250); const e = await p.evaluate(() => window.__estado()); await p.screenshot({ path: `${O}/${pers}-parado-${d}.png`, clip: { x: 400, y: 320, width: 160, height: 130 } }); }
  await p.evaluate(() => window.__posicionar(1, 4, 'direita'));
  await p.keyboard.down('ArrowRight'); const q = new Set(); const t0 = Date.now(); const seq = [];
  while (Date.now() - t0 < 900) { const im = await p.evaluate(() => window.__imagens('_walk_')); if (im[0]) { const f = String(im[0].quadro); if (seq[seq.length - 1] !== f) seq.push(f); q.add(f); } await sl(12); }
  await p.screenshot({ path: `${O}/${pers}-andando.png`, clip: { x: 200, y: 250, width: 400, height: 200 } });
  await p.keyboard.up('ArrowRight');
  console.log(pers, 'quadros distintos', [...q].join(','), 'sequência', seq.join('>').slice(0, 80));
  await p.evaluate((x) => window.__irPara('Fim', { personagem: x }), pers); await sl(3500); await p.screenshot({ path: `${O}/${pers}-fim.png` }); await p.evaluate(() => window.__irPara('Selecao', {})); await sl(1500); if (pers === 'lolo') await p.screenshot({ path: `${O}/selecao.png` });
  await p.evaluate(() => window.__teleportar('quarto_casal', 'quarto_casal-sala')); await sl(600); await p.screenshot({ path: `${O}/${pers}-casal.png` });
  console.log(pers, 'erros', erros.length, erros.slice(0, 2));
  await ctx.close();
}
await b.close();
