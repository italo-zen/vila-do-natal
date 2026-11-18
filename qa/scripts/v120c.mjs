// QA 1.2.0: capturas por área (9), profundidade, PL16 com __posicionar, cacto, título e créditos.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const log = (s) => console.log(s);
const AREAS = [['hall', 'elevador'], ['sala', 'cozinha-sala'], ['cozinha', 'cozinha-sala'], ['quarto', 'quarto-sala'], ['escritorio', 'escritorio-sala'], ['quarto_casal', 'quarto_casal-sala'], ['banheiro1', 'banheiro1-quarto'], ['banheiro_escritorio', 'banheiro_escritorio-escritorio'], ['quartinho', 'cozinha-quartinho']];
for (const [tag, W, H, toque] of [['960', 960, 704, false]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: toque, isMobile: toque });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', (e) => erros.push(String(e))); p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) erros.push(m.text()); });
  await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
  if (tag === '960') await p.screenshot({ path: 'qa/evidencias/v120/titulo.png' });
  await p.evaluate(() => { window.__partidaConcluida('lolo', false); window.__irPara('Fim', {}); }); await sl(3200);
  const clic = async (x, y) => toque ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
  await clic(W / 2, H / 2); await sl(1500);
  if (tag === '960') await p.screenshot({ path: 'qa/evidencias/v120/creditos.png' });
  const crz = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.nome === 'Creditos:Zone').sort((x, y) => x.y - y.y);
  await clic(crz[1].x + crz[1].largura / 2, crz[1].y + crz[1].altura / 2); await sl(1800);
  await p.evaluate(() => window.__abrirTodasAsAreas());
  const est = () => p.evaluate(() => window.__estado());
  for (const [m, s] of []) {
    await p.evaluate(([a, c]) => window.__teleportar(a, c), [m, s]); await sl(700);
    const e = await est();
    await p.screenshot({ path: `qa/evidencias/v120/area-${m}-${tag}.png` });
    log(`${e.mapa === m ? 'OK  ' : 'FALHA'} [${tag}] area ${m} -> ${e.mapa} (${e.tileX},${e.tileY})`);
  }
  if (false) {
    const pos = async (nome, x, y, d) => { await p.evaluate(([a, c, e]) => window.__posicionar(a, c, e), [x, y, d]); await sl(300); await p.screenshot({ path: `qa/evidencias/v120/prof-${nome}-${tag}.png` }); };
    await p.evaluate(() => window.__teleportar('sala', 'cozinha-sala')); await sl(600);
    await pos('rack-frente', 3, 2, 'cima'); await pos('rack-atras', 3, 0, 'baixo'); await pos('sofa-frente', 3, 5, 'cima'); await pos('sofa-atras', 3, 2, 'baixo'); await pos('cacto-frente', 0, 4, 'cima'); await pos('cacto-atras', 0, 2, 'baixo'); await pos('comoda', 9, 6, 'direita');
    await p.evaluate(() => window.__teleportar('cozinha', 'cozinha-sala')); await sl(600);
    await pos('cozinha-1', 1, 1, 'baixo'); await pos('cozinha-2', 3, 1, 'cima');
    await p.evaluate(() => window.__teleportar('quarto', 'quarto-sala')); await sl(600);
    await pos('cama-lado', 0, 1, 'direita'); await pos('cama-atras', 1, 2, 'cima');
  }
  if (tag === '960') {
    const textos = async () => (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.origem === 'texto' && /Casa:/.test(a.nome) && !/Z:|X:|\?|II/.test(a.nome)).map((a) => a.nome).join('|');
    const tele = async (m, s) => { await p.evaluate(([a, c]) => window.__teleportar(a, c), [m, s]); await sl(900); };
    const pos = async (x, y, d) => { await p.evaluate(([a, c, e]) => window.__posicionar(a, c, e), [x, y, d]); await sl(300); };
    const seg = async (k, ms) => { await p.keyboard.down(k); await sl(ms); await p.keyboard.up(k); await sl(300); };
    let e;
    const lerA = async (m, sp, x, y, d, nome) => { await tele(m, sp); await pos(x, y, d); await seg({cima:'ArrowUp',baixo:'ArrowDown',esquerda:'ArrowLeft',direita:'ArrowRight'}[d], 200); await seg('z', 90); const t = await textos(); const e = await est(); await p.screenshot({ path: `qa/evidencias/v120/r2-${nome}.png` }); log(`LER ${nome} de ${x},${y} ${d}: tile ${e.tileX},${e.tileY} texto=${t.replace(/\n/g,' ').slice(0,90)}`); for (let i = 0; i < 6 && (await est()).travado; i++) await seg('x', 90); };
    await lerA('escritorio', 'escritorio-sala', 4, 3, 'direita', 'meias-esc');
    await lerA('escritorio', 'escritorio-sala', 6, 4, 'cima', 'meias-esc-sul(nao deve)');
    await lerA('quarto', 'quarto-sala', 2, 0, 'esquerda', 'presente-2-0');
    await lerA('quarto', 'quarto-sala', 1, 2, 'cima', 'presente-1-2');
    await lerA('sala', 'cozinha-sala', 1, 3, 'esquerda', 'cacto-A');
    // profundidade: capturas prof-*
    const prof = async (nome, m, sp, x, y, d) => { await tele(m, sp); await pos(x, y, d); await p.screenshot({ path: `qa/evidencias/v120/r2-prof-${nome}.png` }); };
    await prof('rack-atras', 'sala', 'cozinha-sala', 3, 0, 'baixo'); await prof('sofa-atras', 'sala', 'cozinha-sala', 3, 2, 'baixo'); await prof('sofa-frente', 'sala', 'cozinha-sala', 3, 5, 'cima');
    await prof('geladeira', 'cozinha', 'cozinha-sala', 5, 0, 'baixo'); await prof('lavaroupas', 'cozinha', 'cozinha-sala', 4, 3, 'baixo'); await prof('lavaroupas-atras', 'cozinha', 'cozinha-sala', 4, 2, 'baixo');
    await prof('cama-oli', 'quarto', 'quarto-sala', 1, 2, 'cima'); await prof('cama-esc', 'escritorio', 'escritorio-sala', 4, 2, 'direita');
    // paredes da Sala
    for (const [x, y, k, n] of [[1, 8, 'ArrowLeft', 'oeste'], [1, 8, 'ArrowDown', 'sul'], [10, 8, 'ArrowDown', 'sul-leste'], [10, 2, 'ArrowRight', 'leste(10,2)'], [1, 3, 'ArrowUp', 'norte(1,3)'], [3, 2, 'ArrowUp', 'rack'], [9, 5, 'ArrowRight', 'comoda']]) { await tele('sala', 'cozinha-sala'); await pos(x, y, 'baixo'); await seg(k, 900); e = await est(); log(`PAREDE ${n} de ${x},${y}: ${e.mapa} ${e.tileX},${e.tileY}`); }
  }
  log(`[${tag}] erros: ${erros.length}`);
  await ctx.close();
}
await b.close();
