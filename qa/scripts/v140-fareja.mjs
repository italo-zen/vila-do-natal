import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 704 } })).newPage();
const erros = []; p.on('pageerror', (e) => erros.push(String(e)));
await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
const est = () => p.evaluate(() => window.__estado()).catch(() => null);
const key = async (k, ms = 90) => { await p.keyboard.down(k); await sl(ms); await p.keyboard.up(k); await sl(250); };
const SP = { sala: 'cozinha-sala', cozinha: 'cozinha-sala', escritorio: 'escritorio-sala', quarto: 'quarto-sala', quarto_casal: 'quarto_casal-sala' };
for (let k = 0; k < Number(process.argv[2] ?? 6); k++) {
  const seed = 900 + k * 17;
  await p.evaluate((s) => { window.__novaPartida('lolo', s); window.__irPara('Casa', { modo: 'intro' }); }, seed); await sl(1400);
  for (let i = 0; i < 14; i++) await key('z', 80);
  const plano = await p.evaluate(() => window.__plano());
  for (const [fase, idx] of [['enfeites', 3]]) {
    await p.evaluate((f) => window.__irParaFase(f), fase); await sl(500);
    const nick = plano.nick[fase]; const peca = plano.caixa;
    await p.evaluate(([m, s]) => window.__teleportar(m, s), [nick.mapa, SP[nick.mapa]]); await sl(800);
    await p.evaluate(([x, y]) => window.__posicionar(x, y + 1, 'cima'), [nick.x, nick.y]); await sl(300);
    await key('z'); for (let i = 0; i < 6; i++) { const s = await est(); if (s && !s.travado) break; await key('z'); }
    await key('x', 120); await sl(2500);
    const s = await est();
    console.log(`seed ${seed} ${fase}: Nick ${nick.mapa}(${nick.x},${nick.y}) caixa ${plano.caixa.mapa}; estado nick=${s?.nick?.estado} farejo.ativo=${s?.farejo?.ativo} porta=${JSON.stringify(s?.farejo?.porta)}`);
    if (s?.farejo?.ativo) await p.screenshot({ path: `qa/evidencias/v140/fareja-${seed}-${fase}.png` });
  }
}
console.log('erros', erros.length, erros.slice(0, 2));
await b.close();
