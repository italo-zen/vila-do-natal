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
const z = async () => { await p.keyboard.down('z'); await sl(80); await p.keyboard.up('z'); await sl(220); };
const SP = { sala: 'cozinha-sala', cozinha: 'cozinha-sala', escritorio: 'escritorio-sala', quarto: 'quarto-sala', quarto_casal: 'quarto_casal-sala' };
const N = Number(process.argv[2] ?? 3); const comeco = Number(process.argv[3] ?? 100);
const resumo = [];
for (let k = 0; k < N; k++) {
  const seed = comeco + k * 37; const pers = ['lolo', 'bibi', 'dandan', 'tutu'][k % 4];
  await p.evaluate(([a, s]) => { window.__novaPartida(a, s); window.__irPara('Casa', { modo: 'intro' }); }, [pers, seed]); await sl(1400);
  for (let i = 0; i < 14; i++) await z();
  const plano = await p.evaluate(() => window.__plano()); const linha = { seed, pers, passos: [], ok: [] };
  await p.evaluate(() => window.__irParaFase('parte1')); await sl(400);
  for (const peca of plano.pecas) {
    const fase = 'parte' + peca.ordem;
    let s0 = await est(); if (s0?.fase !== fase) { await p.evaluate((f) => window.__irParaFase(f), fase); await sl(400); }
    await p.evaluate(([m, s]) => window.__teleportar(m, s), [peca.mapa, SP[peca.mapa]]); await sl(800);
    let pegou = false;
    for (const [d, dx, dy] of [['direita', -1, 0], ['esquerda', 1, 0], ['baixo', 0, -1], ['cima', 0, 1]]) {
      await p.evaluate(([x, y, dd]) => window.__posicionar(x, y, dd), [peca.x + dx, peca.y + dy, d]); await sl(250);
      await z(); await sl(500);
      const s = await est();
      if (!s || s.travado || s.fase !== fase) { pegou = true; break; }
    }
    // acompanhar diálogos/conquista/condução e contar passos (trocas de tile em condução)
    let passos = 0, ultimo = '', emCond = false, i = 0;
    for (; i < 400; i++) {
      const s = await est();
      if (!s) { await sl(250); continue; }
      if (s.emConducao) { emCond = true; const t = s.mapa + s.tileX + ',' + s.tileY; if (t !== ultimo) { passos++; ultimo = t; } }
      else if (emCond) break;
      else if (s.travado) await z();
      if (!emCond && i > 60 && !s.travado) break;
      await sl(150);
    }
    const sf = await est();
    linha.passos.push(passos); linha.ok.push(`${peca.ordem}:${pegou ? 'pegou' : 'NAO'}:${emCond ? 'cond' : 'semcond'}:${sf?.fase}`);
  }
  console.log(JSON.stringify(linha));
}
console.log('erros', erros.length, erros.slice(0, 2));
await b.close();
