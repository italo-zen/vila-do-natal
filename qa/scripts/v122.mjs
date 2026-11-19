import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const log = (s) => console.log(s);
const AREAS = [['hall', 'elevador'], ['sala', 'cozinha-sala'], ['cozinha', 'cozinha-sala'], ['quarto', 'quarto-sala'], ['escritorio', 'escritorio-sala'], ['quarto_casal', 'quarto_casal-sala'], ['banheiro1', 'banheiro1-quarto'], ['banheiro_escritorio', 'banheiro_escritorio-escritorio'], ['quartinho', 'cozinha-quartinho']];
const K = { cima: 'ArrowUp', baixo: 'ArrowDown', esquerda: 'ArrowLeft', direita: 'ArrowRight' };
for (const [tag, W, H, toque] of [['960', 960, 704, false], ['667', 667, 375, true], ['844', 844, 390, true]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: toque, isMobile: toque });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', (e) => erros.push(String(e))); p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) erros.push(m.text()); });
  await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
  if (tag === '960') await p.screenshot({ path: 'qa/evidencias/v122/titulo.png' });
  await p.evaluate(() => { window.__partidaConcluida('lolo', false); window.__irPara('Fim', {}); }); await sl(3200);
  const clic = async (x, y) => toque ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
  await clic(W / 2, H / 2); await sl(1500);
  if (tag === '960') await p.screenshot({ path: 'qa/evidencias/v122/creditos.png' });
  const crz = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.nome === 'Creditos:Zone').sort((x, y) => x.y - y.y);
  await clic(crz[1].x + crz[1].largura / 2, crz[1].y + crz[1].altura / 2); await sl(1800);
  await p.evaluate(() => window.__abrirTodasAsAreas());
  const est = () => p.evaluate(() => window.__estado());
  const tele = async (m, s) => { await p.evaluate(([a, c]) => window.__teleportar(a, c), [m, s]); await sl(800); };
  const pos = async (x, y, d) => { await p.evaluate(([a, c, e]) => window.__posicionar(a, c, e), [x, y, d]); await sl(300); };
  const seg = async (k, ms) => { await p.keyboard.down(k); await sl(ms); await p.keyboard.up(k); await sl(300); };
  for (const [m, s] of AREAS) { await tele(m, s); const e = await est(); await p.screenshot({ path: `qa/evidencias/v122/area-${m}-${tag}.png` }); log(`${e.mapa === m ? 'OK  ' : 'FALHA'} [${tag}] ${m}`); }
  if (tag === '960') {
    const prof = async (nome, m, sp, x, y, d) => { await tele(m, sp); await pos(x, y, d); await p.screenshot({ path: `qa/evidencias/v122/prof-${nome}.png` }); };
    await prof('cozinha-fogao-sul', 'cozinha', 'cozinha-sala', 4, 1, 'cima'); await prof('cozinha-bancada', 'cozinha', 'cozinha-sala', 1, 3, 'esquerda'); await prof('quarto-cama', 'quarto', 'quarto-sala', 1, 2, 'cima'); await prof('quarto-comoda', 'quarto', 'quarto-sala', 2, 1, 'direita'); await prof('quarto-poltrona', 'quarto', 'quarto-sala', 3, 2, 'baixo'); await prof('casal-cama', 'quarto_casal', 'quarto_casal-sala', 2, 3, 'cima'); await prof('esc-cama', 'escritorio', 'escritorio-sala', 4, 3, 'direita');
    // colisão: cozinha aberturas colunas 3 e 4 e muro
    for (const [x, y, k, n] of [[1, 2, 'ArrowDown', 'muro col1'], [2, 2, 'ArrowDown', 'muro col2'], [5, 2, 'ArrowDown', 'muro col5'], [4, 2, 'ArrowDown', 'abertura col4 (esperado 4,3)'], [3, 2, 'ArrowDown', 'abertura col3 (desce)'], [4, 3, 'ArrowDown', 'lava-roupas (4,4)']]) { await tele('cozinha', 'cozinha-sala'); await pos(x, y, 'baixo'); await seg(k, 800); const e = await est(); log(`COL cozinha ${n} de ${x},${y}: ${e.mapa} ${e.tileX},${e.tileY}`); }
    for (const [m, sp, x, y, k, n] of [['quarto', 'quarto-sala', 1, 2, 'ArrowUp', 'cama Oli'], ['quarto', 'quarto-sala', 2, 1, 'ArrowRight', 'comoda Oli'], ['quarto', 'quarto-sala', 3, 2, 'ArrowDown', 'poltrona'], ['escritorio', 'escritorio-sala', 4, 3, 'ArrowRight', 'cama esc'], ['escritorio', 'escritorio-sala', 4, 1, 'ArrowUp', 'mesa esc'], ['sala', 'cozinha-sala', 5, 3, 'ArrowLeft', 'sofa'], ['sala', 'cozinha-sala', 7, 4, 'ArrowDown', 'mesa']]) { await tele(m, sp); await pos(x, y, 'baixo'); await seg(k, 800); const e = await est(); log(`COL ${n} de ${x},${y}: ${e.tileX},${e.tileY} ${e.tileX === x && e.tileY === y ? 'bloqueado' : 'MOVEU'}`); }
  }
  log(`[${tag}] erros: ${erros.length}`);
  await ctx.close();
}
await b.close();
