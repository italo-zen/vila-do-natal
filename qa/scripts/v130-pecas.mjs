import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import fs from 'node:fs';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 704 } })).newPage();
const erros = []; p.on('pageerror', (e) => erros.push(String(e)));
await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
const est = () => p.evaluate(() => window.__estado());
const seg = async (k, ms) => { await p.keyboard.down(k); await sl(ms); await p.keyboard.up(k); await sl(250); };
const SP = { sala: 'cozinha-sala', cozinha: 'cozinha-sala', escritorio: 'escritorio-sala', quarto: 'quarto-sala', quarto_casal: 'quarto_casal-sala' };
const K = { cima: 'ArrowUp', baixo: 'ArrowDown', esquerda: 'ArrowLeft', direita: 'ArrowRight' };
for (const seed of [11, 22, 33]) {
  await p.evaluate((s) => { window.__novaPartida('lolo', s); window.__irPara('Casa', { modo: 'intro' }); }, seed); await sl(1500); for (let i = 0; i < 14; i++) { await seg('z', 90); await sl(250); }
  let e = await est(); console.log('seed', seed, 'apos Casa:', e.mapa, e.fase, e.travado);
  await p.evaluate(() => window.__irParaFase('parte1')); await sl(300);
  const plano = await p.evaluate(() => window.__plano());
  for (const peca of plano.pecas) {
    await p.evaluate((m) => window.__irParaFase(m === 1 ? 'parte1' : m === 2 ? 'parte2' : 'parte3'), peca.ordem); await sl(300);
    await p.evaluate(([m, s]) => window.__teleportar(m, s), [peca.mapa, SP[peca.mapa] ?? 'cozinha-sala']); await sl(800);
    let ok = false;
    for (const [d, dx, dy] of [['direita', -1, 0], ['esquerda', 1, 0], ['baixo', 0, -1], ['cima', 0, 1]]) {
      await p.evaluate(([x, y, dd]) => window.__posicionar(x, y, dd), [peca.x + dx, peca.y + dy, d]); await sl(200);
      await seg(K[d], 120); await seg('z', 90); await sl(600);
      for (let i = 0; i < 8; i++) { const s = await est(); if (!s.travado) break; await seg('z', 90); await sl(300); }
      const s2 = await p.evaluate(() => window.__estado());
      ok = (s2.fase !== `parte${peca.ordem}`) ; if (ok) break;
    }
    const s3 = await est(); console.log(' peca', peca.ordem, peca.mapa, peca.x, peca.y, 'fase agora', s3.fase, ok ? 'coletada/avancou' : 'SEM EFEITO');
  }
}
console.log('erros', erros.length, erros.slice(0, 2));
await b.close();
