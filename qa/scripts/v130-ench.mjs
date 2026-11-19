import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 704 } })).newPage();
await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
await p.evaluate(() => { window.__partidaConcluida('lolo', false); window.__irPara('Fim', {}); }); await sl(3200);
await p.mouse.click(480, 352); await sl(1500);
const crz = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.nome === 'Creditos:Zone').sort((x, y) => x.y - y.y);
await p.mouse.click(crz[1].x + crz[1].largura / 2, crz[1].y + crz[1].altura / 2); await sl(1800);
const est = () => p.evaluate(() => window.__estado());
const key = async (k, ms = 90) => { await p.keyboard.down(k); await sl(ms); await p.keyboard.up(k); await sl(250); };
const tx = async () => (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.origem === 'texto' && /Casa:/.test(a.nome) && !/Z:|X:|\?|II/.test(a.nome)).map((a) => a.nome).join('|');
const L = { cima: 'ArrowUp', baixo: 'ArrowDown', esquerda: 'ArrowLeft', direita: 'ArrowRight' };
for (const [n, m, s, x, y, d] of [['banheiro1-vela', 'banheiro1', 'banheiro1-quarto', 1, 1, 'baixo'], ['casal-meias', 'quarto_casal', 'quarto_casal-sala', 1, 3, 'cima'], ['casal-presente', 'quarto_casal', 'quarto_casal-sala', 2, 3, 'cima'], ['banheiro1-pano(nao)', 'banheiro1', 'banheiro1-quarto', 2, 1, 'baixo']]) {
  await p.evaluate(([a, c]) => window.__teleportar(a, c), [m, s]); await sl(800);
  await p.evaluate(([a, c, e]) => window.__posicionar(a, c, e), [x, y, d]); await sl(300);
  await key(L[d], 200); await key('z'); await sl(400);
  const t = await tx(); const e = await est(); await p.screenshot({ path: `qa/evidencias/v130/ench-${n}.png` });
  console.log(n, `(${e.tileX},${e.tileY})`, 'texto=', t.replace(/\n/g, ' ').slice(0, 90));
  for (let i = 0; i < 6 && (await est()).travado; i++) await key('x');
}
await b.close();
