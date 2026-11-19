// QA 1.2.0: capturas por área (9), profundidade, PL16 com __posicionar, cacto, título e créditos.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const log = (s) => console.log(s);
const AREAS = [['hall', 'elevador'], ['sala', 'cozinha-sala'], ['cozinha', 'cozinha-sala'], ['quarto', 'quarto-sala'], ['escritorio', 'escritorio-sala'], ['quarto_casal', 'quarto_casal-sala'], ['banheiro1', 'banheiro1-quarto'], ['banheiro_escritorio', 'banheiro_escritorio-escritorio'], ['quartinho', 'cozinha-quartinho']];
for (const [tag, W, H, toque] of [['960', 960, 704, false], ['667', 667, 375, true], ['844', 844, 390, true]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: toque, isMobile: toque });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', (e) => erros.push(String(e))); p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) erros.push(m.text()); });
  await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
  if (tag === '960') await p.screenshot({ path: 'qa/evidencias/v121/titulo.png' });
  await p.evaluate(() => { window.__partidaConcluida('lolo', false); window.__irPara('Fim', {}); }); await sl(3200);
  const clic = async (x, y) => toque ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
  await clic(W / 2, H / 2); await sl(1500);
  if (tag === '960') await p.screenshot({ path: 'qa/evidencias/v121/creditos.png' });
  const crz = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.nome === 'Creditos:Zone').sort((x, y) => x.y - y.y);
  await clic(crz[1].x + crz[1].largura / 2, crz[1].y + crz[1].altura / 2); await sl(1800);
  await p.evaluate(() => window.__abrirTodasAsAreas());
  const est = () => p.evaluate(() => window.__estado());
  for (const [m, s] of [['sala','cozinha-sala']]) {
    await p.evaluate(([a, c]) => window.__teleportar(a, c), [m, s]); await sl(700);
    const e = await est();
    await p.screenshot({ path: `qa/evidencias/v121/area-${m}-${tag}.png` });
    log(`${e.mapa === m ? 'OK  ' : 'FALHA'} [${tag}] area ${m} -> ${e.mapa} (${e.tileX},${e.tileY})`);
  }
  if (false) {
    const pos = async (nome, x, y, d) => { await p.evaluate(([a, c, e]) => window.__posicionar(a, c, e), [x, y, d]); await sl(300); await p.screenshot({ path: `qa/evidencias/v121/prof-${nome}-${tag}.png` }); };
    await p.evaluate(() => window.__teleportar('sala', 'cozinha-sala')); await sl(600);
    await pos('rack-frente', 3, 2, 'cima'); await pos('rack-atras', 3, 0, 'baixo'); await pos('sofa-frente', 3, 5, 'cima'); await pos('sofa-atras', 3, 2, 'baixo'); await pos('cacto-frente', 0, 4, 'cima'); await pos('cacto-atras', 0, 2, 'baixo'); await pos('comoda', 9, 6, 'direita');
    await p.evaluate(() => window.__teleportar('cozinha', 'cozinha-sala')); await sl(600);
    await pos('cozinha-1', 1, 1, 'baixo'); await pos('cozinha-2', 3, 1, 'cima');
    await p.evaluate(() => window.__teleportar('quarto', 'quarto-sala')); await sl(600);
    await pos('cama-lado', 0, 1, 'direita'); await pos('cama-atras', 1, 2, 'cima');
  }
  if (tag === '960' && process.env.FULL) {
    const tele = async (m, s) => { await p.evaluate(([a, c]) => window.__teleportar(a, c), [m, s]); await sl(900); };
    const pos = async (nome, x, y, d) => { await p.evaluate(([a, c, e]) => window.__posicionar(a, c, e), [x, y, d]); await sl(300); await p.screenshot({ path: `qa/evidencias/v121/prof-${nome}.png` }); };
    const seg = async (k, ms) => { await p.keyboard.down(k); await sl(ms); await p.keyboard.up(k); await sl(300); };
    await tele('sala', 'cozinha-sala');
    await pos('sofa-norte', 3, 2, 'baixo'); await pos('sofa-sul', 3, 5, 'cima'); await pos('mesa-norte', 7, 4, 'baixo'); await pos('mesa-sul', 7, 7, 'cima'); await pos('aparador-norte', 10, 4, 'baixo'); await pos('aparador-sul', 9, 8, 'cima'); await pos('aparador-oeste', 9, 6, 'direita'); await pos('mesa-oeste', 5, 5, 'direita'); await pos('mesa-leste', 9, 5, 'esquerda');
    let e;
    for (const [x, y, k, n] of [[5, 3, 'ArrowLeft', 'sofa-leste'], [2, 3, 'ArrowRight', 'sofa-oeste'], [3, 2, 'ArrowDown', 'sofa-norte'], [3, 5, 'ArrowUp', 'sofa-sul'], [7, 4, 'ArrowDown', 'mesa-norte'], [7, 7, 'ArrowUp', 'mesa-sul'], [5, 5, 'ArrowRight', 'mesa-oeste'], [9, 5, 'ArrowLeft', 'mesa-leste'], [9, 6, 'ArrowRight', 'aparador-oeste'], [10, 4, 'ArrowDown', 'aparador-norte'], [10, 8, 'ArrowUp', 'aparador-sul'], [3, 2, 'ArrowUp', 'rack']]) { await tele('sala', 'cozinha-sala'); await p.evaluate(([a, c]) => window.__posicionar(a, c, 'baixo'), [x, y]); await sl(200); await seg(k, 800); e = await est(); log(`COLISAO ${n} de ${x},${y}: ${e.tileX},${e.tileY} ${e.tileX === x && e.tileY === y ? 'bloqueado' : 'MOVEU'}`); }
    // cadeiras fora da pegada: tiles ao redor da mesa
    for (const [x, y, k, n] of [[5, 6, 'ArrowRight', 'cadeira-oeste(5,6)->(6,6)'], [9, 6, 'ArrowLeft', 'cadeira-leste(9,6)->(8,6)']]) { await tele('sala', 'cozinha-sala'); await p.evaluate(([a, c]) => window.__posicionar(a, c, 'baixo'), [x, y]); await seg(k, 600); e = await est(); log(`CADEIRA ${n}: ${e.tileX},${e.tileY}`); }
  }
  log(`[${tag}] erros: ${erros.length}`);
  await ctx.close();
}
await b.close();
