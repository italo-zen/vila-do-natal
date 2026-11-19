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
    const A = async () => { await p.keyboard.down('z'); await sl(80); await p.keyboard.up('z'); await sl(500); };
    const fecha = async () => { for (let i = 0; i < 8; i++) { const e = await est(); if (!e.travado) return; await p.keyboard.down('x'); await sl(90); await p.keyboard.up('x'); await sl(450); } log('DIALOGO NAO FECHOU'); };
    for (const [nome, m, s, x, y, d] of [['rack-guirlanda', 'sala', 'cozinha-sala', 2, 2, 'cima'], ['rack-luz', 'sala', 'cozinha-sala', 4, 2, 'cima'], ['rack-meias', 'sala', 'cozinha-sala', 5, 2, 'cima'], ['comoda-vela', 'sala', 'cozinha-sala', 9, 6, 'direita'], ['comoda-arvore', 'sala', 'cozinha-sala', 9, 7, 'direita'], ['esc-luz', 'escritorio', 'escritorio-sala', 4, 1, 'cima'], ['esc-meias', 'escritorio', 'escritorio-sala', 6, 4, 'cima'], ['quarto-presente', 'quarto', 'quarto-sala', 0, 0, 'direita'], ['esc-arvore-nao', 'escritorio', 'escritorio-sala', 5, 1, 'direita'], ['sala-pano?', 'cozinha', 'cozinha-sala', 1, 1, 'cima']]) {
      await p.evaluate(([a, c]) => window.__teleportar(a, c), [m, s]); await sl(600);
      await p.evaluate(([a, c, e]) => window.__posicionar(a, c, e), [x, y, d]); await sl(300);
      await A(); const t = await textos(); const e = await est(); log(`  travado=${e.travado}`);
      await p.screenshot({ path: `qa/evidencias/v120/exame-${nome}.png` });
      log(`EXAME ${nome} (${e.tileX},${e.tileY}) texto=${t.replace(/\n/g, ' ').slice(0, 110)}`); await fecha();
    }
    // cacto
    await p.evaluate(() => window.__teleportar('sala', 'cozinha-sala')); await sl(600);
    for (let i = 0; i < 3; i++) {
      await p.evaluate(() => window.__posicionar(1, 3, 'esquerda')); await sl(200);
      await p.keyboard.down('ArrowLeft'); await sl(250); const e1 = await est(); if (i === 0) await p.screenshot({ path: 'qa/evidencias/v120/cacto-empurrao.png' }); await sl(300); await p.keyboard.up('ArrowLeft'); await sl(500); const e = await est();
      log(`CACTO ${i + 1}: durante ${e1.tileX},${e1.tileY} depois ${e.tileX},${e.tileY} (esperado fora de 0,3; nunca em parede/móvel)`);
    }
    // cacto contra o sofá: (1,3) empurra p/ direita? e A de frente
    await p.evaluate(() => window.__posicionar(1, 3, 'esquerda')); await sl(200); await A(); let e = await est(); log(`CACTO A de frente: travado=${e.travado} texto=${await textos()} tile ${e.tileX},${e.tileY}`);
    for (const [x, y, d, k] of [[0, 4, 'cima', 'ArrowUp'], [0, 2, 'baixo', 'ArrowDown']]) { await p.evaluate(([a, c, f]) => window.__posicionar(a, c, f), [x, y, d]); await sl(200); await p.keyboard.down(k); await sl(500); await p.keyboard.up(k); await sl(400); e = await est(); log(`CACTO ${d} de ${x},${y}: ${e.tileX},${e.tileY}`); }
    // paredes: bordas da Sala e muro da Cozinha com posicionar
    await p.evaluate(() => window.__teleportar('cozinha', 'cozinha-sala')); await sl(600);
    for (const x of [1, 2, 3, 5, 4]) { await p.evaluate((a) => window.__posicionar(a, 2, 'baixo'), x); await sl(200); await p.keyboard.down('ArrowDown'); await sl(700); await p.keyboard.up('ArrowDown'); await sl(200); e = await est(); log(`MURO cozinha coluna ${x}: tile ${e.tileX},${e.tileY} ${e.tileY >= 3 ? 'PASSOU' : 'bloqueado'}`); }
    await p.evaluate(() => window.__teleportar('sala', 'cozinha-sala')); await sl(600);
    for (const [x, y, k, n] of [[5, 3, 'ArrowLeft', 'sofá'], [7, 4, 'ArrowDown', 'mesa'], [3, 2, 'ArrowUp', 'rack'], [9, 4, 'ArrowDown', 'cômoda?(9,5 livre)']]) { await p.evaluate(([a, c]) => window.__posicionar(a, c, 'baixo'), [x, y]); await sl(200); await p.keyboard.down(k); await sl(700); await p.keyboard.up(k); await sl(200); e = await est(); log(`MOVEL ${n} de ${x},${y}: ${e.tileX},${e.tileY}`); }
  }
  log(`[${tag}] erros: ${erros.length} ${erros.slice(0, 3).join(';')}`);
  await ctx.close();
}
await b.close();
