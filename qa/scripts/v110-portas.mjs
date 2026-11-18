// QA 1.1.0: travessia das 4 portas abertas nos dois sentidos (andar contra, A), teclado e toque; fechadas; paredes; capturas.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const out = []; const log = (s) => { out.push(s); console.log(s); };
const SETA = { cima: 'ArrowUp', baixo: 'ArrowDown', esquerda: 'ArrowLeft', direita: 'ArrowRight' };
const portas = [
  ['hall', 'hall-sala', 'baixo', 'sala', 'hall-sala', 'cima'],
  ['cozinha', 'cozinha-sala', 'esquerda', 'sala', 'cozinha-sala', 'direita'],
  ['escritorio', 'escritorio-sala', 'esquerda', 'sala', 'escritorio-sala', 'esquerda'],
  ['quarto', 'quarto-sala', 'baixo', 'sala', 'quarto-sala', 'cima'],
];
const LADOS = { // lado da porta em cada mapa
  'hall:hall-sala': 'cima', 'sala:hall-sala': 'baixo', 'cozinha:cozinha-sala': 'esquerda', 'sala:cozinha-sala': 'direita',
  'escritorio:escritorio-sala': 'esquerda', 'sala:escritorio-sala': 'direita', 'quarto:quarto-sala': 'baixo', 'sala:quarto-sala': 'cima' };
for (const modo of (process.argv[2] ?? 'teclado,toque667,toque844').split(',')) {
  const [W, H] = modo === 'toque844' ? [844, 390] : modo === 'teclado' ? [960, 704] : [667, 375];
  const toque = modo !== 'teclado';
  const ctx = await b.newContext({ viewport: toque ? { width: W, height: H } : { width: 960, height: 704 }, hasTouch: toque, isMobile: toque, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const erros = [];
  p.on('pageerror', (e) => erros.push(String(e))); p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) erros.push(m.text()); });
  await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
  await p.evaluate(() => { window.__partidaConcluida('lolo', false); window.__irPara('Fim', {}); }); await sl(3200);
  const clic = async (x, y) => toque ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
  await clic(W / 2, H / 2); await sl(1500);
  const crz = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.origem === 'canvas' && a.nome === 'Creditos:Zone').sort((x, y) => x.y - y.y);
  await clic(crz[1].x + crz[1].largura / 2, crz[1].y + crz[1].altura / 2); await sl(1800);
  const est = () => p.evaluate(() => window.__estado());
  await sl(1500);
  let e = await est(); log(`[${modo}] início mapa=${e.mapa} modo=${e.modo}`);
  let cdp = toque ? await ctx.newCDPSession(p) : null;
  const mover = async (dir, ms) => {
    if (!toque) { await p.keyboard.down(SETA[dir]); await sl(ms); await p.keyboard.up(SETA[dir]); return; }
    const al = await p.evaluate(() => window.__alvosDeToque());
    const j = al.find((a) => a.nome === 'analogico') ?? al.find((a) => a.origem === 'dom');
    const cx = j.x + j.largura / 2, cy = j.y + j.altura / 2, d = Math.min(j.largura, j.altura) * 0.35;
    const v = { cima: [0, -d], baixo: [0, d], esquerda: [-d, 0], direita: [d, 0] }[dir];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 1 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + v[0], y: cy + v[1], id: 1 }] });
    await sl(ms);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  const apertarA = async () => {
    if (!toque) { await p.keyboard.down('z'); await sl(80); await p.keyboard.up('z'); return; }
    let a; for (let i = 0; i < 15 && !a; i++) { a = (await p.evaluate(() => window.__alvosDeToque())).find((q) => q.origem === 'dom' && q.nome === 'a'); if (!a) await sl(300); }
    if (!a) { log('SEM BOTAO A'); return; }
    await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2);
  };
  for (const [mA, id, , mB] of portas) {
    for (const [de, para] of [[mA, mB], [mB, mA]]) {
      for (const how of ['contra', 'A']) {
        await p.evaluate(([m, s]) => window.__teleportar(m, s), [de, id]); await sl(500);
        const lado = LADOS[`${de}:${id}`];
        let r;
        if (how === 'contra') await mover(lado, 1400);
        else { await mover(lado, 120); await sl(200); await apertarA(); }
        await sl(1800); e = await est();
        const ok1 = e.mapa === para;
        await sl(2500); const e2 = await est();
        const ok2 = e2.mapa === para && !e2.emFade;
        log(`${ok1 && ok2 ? 'OK  ' : 'FALHA'} [${modo}] ${de}->${para} ${how}: após=${e.mapa}(${e.tileX},${e.tileY}) 2.5s depois=${e2.mapa}(${e2.tileX},${e2.tileY}) fade=${e2.emFade} travado=${e2.travado}`);
      }
    }
  }
  // fechadas (só teclado/uma vez em toque): andar contra e A
  for (const [m, s, lado] of [['sala', 'quarto_casal-sala', 'esquerda'], ['quarto', 'banheiro1-quarto', 'cima'], ['escritorio', 'banheiro_escritorio-escritorio', 'direita'], ['cozinha', 'cozinha-quartinho', 'baixo']]) {
    await p.evaluate(([a, c]) => window.__teleportar(a, c), [m, s]); await sl(500);
    await mover(lado, 1200); await sl(300); await apertarA(); await sl(500);
    e = await est();
    const al = await p.evaluate(() => window.__alvosDeToque());
    const txt = al.filter((a) => a.origem === 'texto' && !/^Casa:(\?|II)/.test(a.nome)).map((a) => a.nome).join(' | ');
    await p.screenshot({ path: `qa/evidencias/v110/fechada-${s}-${modo}.png` });
    log(`${e.mapa === m ? 'OK  ' : 'FALHA'} [${modo}] fechada ${s}: mapa=${e.mapa} (${e.tileX},${e.tileY}) textos=${txt.slice(0, 140)}`);
  }
  // capturas por área
  for (const [m, s] of [['hall', 'elevador'], ['sala', 'cozinha-sala'], ['cozinha', 'cozinha-sala'], ['escritorio', 'escritorio-sala'], ['quarto', 'quarto-sala']]) {
    await p.evaluate(([a, c]) => window.__teleportar(a, c), [m, s]); await sl(700);
    await p.screenshot({ path: `qa/evidencias/v110/area-${m}-${modo}.png` });
  }
  log(`[${modo}] erros de console: ${erros.length} ${erros.slice(0, 3).join(' ; ')}`);
  await ctx.close();
}
await b.close();
