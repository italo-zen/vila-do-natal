// Marco 6, rodada 2: pausa (PS1 em 4 cômodos, PS4, PS6, PS8, PS10, PS13, PS5), PO1, PO2, DS1 e DS2, AU2 em telas, R134 (fade 5×). Só observa.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { tecla, irAtePainel, digitar } from './lib.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco6-r2'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const LOG = []; const erros = [];
const reg = (id, ok, nota = '') => { LOG.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
p.on('pageerror', (e) => erros.push('pageerror ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') erros.push('console ' + m.text()); });
await p.goto(url); await p.waitForSelector('canvas'); await real(2000);
const est = () => p.evaluate(() => window.__estado());
const al = () => p.evaluate(() => window.__alvosDeToque());
const txt = async () => p.evaluate(() => (window.__textos ?? []).splice(0).map((x) => x.t).join(' ').replace(/\s+/g, ' '));
const sh = (n) => p.screenshot({ path: join(EVID, `${n}.png`) });
const fechar = async () => { for (let i = 0; i < 8; i++) { const q = await est(); if (!q?.travado) return; await tecla(p, 'z', { ms: 90, pausa: 300 }); } };
// Início: título -> seleção (BiBi) -> introdução -> exploração
const z = (await al()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(700);
const cs = (await al()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao'));
await p.touchscreen.tap(cs[0].x + 20, cs[0].y + 20); await real(800);
for (let i = 0; i < 25; i++) { const st = await est(); if (st?.mapa && !st.travado) break; const a = (await al()).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); await real(300); }
await real(400);
// PS5 seleção e intro: P não abre (testado já na rodada 1 no título)
await sh('01-exploracao-hall');
// PS1: P em Hall, Sala, Cozinha, Quarto e Escritório
for (const [mapa, spawn, nome] of [['hall', 'P8', 'Hall'], ['sala', 'P8', 'Sala'], ['cozinha', 'P7', 'Cozinha'], ['quarto', 'P2', 'Quarto'], ['escritorio', 'P3', 'Escritório']]) {
  const fa = { quarto: 'parte2', escritorio: 'parte3' }[mapa]; if (fa) { await p.evaluate((f) => window.__irParaFase(f), fa); await real(500); }
  await p.evaluate(([m, s]) => window.__teleportar(m, s), [mapa, spawn]); await real(700);
  await fechar();
  await tecla(p, 'p', { ms: 90, pausa: 500 });
  const q = await est();
  reg(`PS1 P abre a pausa em ${nome} (foco em Continuar)`, q?.pausa?.aberta === true && q?.pausa?.foco === 0, JSON.stringify(q?.pausa));
  await tecla(p, 'z', { ms: 90, pausa: 400 });
}
// PS4: pausa congela (tile antes e depois de 1 s de seta com a pausa aberta)
await p.evaluate(() => window.__teleportar('hall', 'P8')); await real(700); await fechar();
const t0 = await est();
await tecla(p, 'p', { ms: 90, pausa: 400 });
await p.keyboard.down('ArrowRight'); await real(900); await p.keyboard.up('ArrowRight');
await p.keyboard.down('ArrowDown'); await real(500); await p.keyboard.up('ArrowDown');
await tecla(p, 'Escape', { ms: 90, pausa: 400 });
const t1 = await est();
reg('PS4 pausa congela: sobrinho não anda com setas durante a pausa', t0?.tileX === t1?.tileX && t0?.tileY === t1?.tileY, `antes=${t0?.tileX},${t0?.tileY} depois=${t1?.tileX},${t1?.tileY}`);
// PS6: Som (Z) alterna; Como jogar abre; X volta à pausa com foco em Como jogar
await tecla(p, 'p', { ms: 90, pausa: 400 });
const sb = (await est())?.audio?.mudo;
await tecla(p, 'ArrowDown', { ms: 90, pausa: 300 });
await tecla(p, 'z', { ms: 90, pausa: 400 });
const sa = (await est())?.audio?.mudo;
reg('PS6 Som (Z na linha Som) alterna o mudo', sa !== sb, `antes=${sb} depois=${sa}`);
await sh('02-pausa-som-desligado');
await tecla(p, 'z', { ms: 90, pausa: 400 });
await tecla(p, 'ArrowDown', { ms: 90, pausa: 300 });
await tecla(p, 'z', { ms: 90, pausa: 500 });
const cj = await est();
reg('PS6 "Como jogar" abre a tela', cj?.pausa?.visao !== 'pausa' && cj?.pausa?.aberta === true, JSON.stringify(cj?.pausa));
await sh('03-pausa-como-jogar');
await tecla(p, 'x', { ms: 90, pausa: 500 });
const back = await est();
reg('PS6 X volta à pausa com foco em "Como jogar"', back?.pausa?.visao === 'pausa' && back?.pausa?.foco === 2, JSON.stringify(back?.pausa));
// PS13: P e II na dica não fazem nada
await tecla(p, 'Escape', { ms: 90, pausa: 400 }); await fechar();
await tecla(p, 'h', { ms: 90, pausa: 500 });
await tecla(p, 'p', { ms: 90, pausa: 400 });
const dq = await est();
reg('PS13 P na dica não abre a pausa', dq?.pausa?.aberta === false, JSON.stringify(dq?.pausa));
await sh('04-dica-P-sem-efeito');
await tecla(p, 'x', { ms: 90, pausa: 400 });
// PS10: pausa + girar para retrato mostra o aviso e volta à pausa com o foco
await tecla(p, 'p', { ms: 90, pausa: 500 });
await p.setViewportSize({ width: 390, height: 844 }); await real(1000);
const av = await p.evaluate(() => { const el = document.getElementById('aviso-de-rotacao'); return el ? getComputedStyle(el).display : 'ausente'; });
await sh('05-pausa-girar-aviso');
await p.setViewportSize({ width: 844, height: 390 }); await real(900);
const vb = await est();
reg('PS10 girar com a pausa: aviso aparece e volta mostra a pausa', av !== 'none' && av !== 'ausente' && vb?.pausa?.aberta === true, `aviso=${av} pausa=${JSON.stringify(vb?.pausa)}`);
await sh('06-pausa-volta-paisagem');
await tecla(p, 'Escape', { ms: 90, pausa: 400 });
// PO2: DanDan (cartão 3) — captura da seleção em 844
await p.evaluate(() => window.__teleportar('hall', 'P8')); await real(500);
await ctx.close();
// Layout B: PS8/PS9 e captura de textos da pausa
const c2 = await b.newContext({ viewport: { width: 667, height: 375 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p2 = await c2.newPage(); await p2.goto(url); await p2.waitForSelector('canvas'); await real(2000);
const z2 = await p2.evaluate(() => window.__alvosDeToque().filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone'));
await p2.touchscreen.tap(z2[0].x + 20, z2[0].y + 20); await real(700);
const cs2 = await p2.evaluate(() => window.__alvosDeToque().filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao')));
await p2.screenshot({ path: join(EVID, '07-selecao-667-danDan-nome.png') });
await p2.touchscreen.tap(cs2[2].x + 20, cs2[2].y + 20); await real(800);
for (let i = 0; i < 25; i++) { const st = await p2.evaluate(() => window.__estado()); if (st?.mapa && !st.travado) break; const a = (await p2.evaluate(() => window.__alvosDeToque())).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await p2.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); await real(300); }
await p2.evaluate(() => window.__teleportar('hall', 'P8')); await real(700);
const ii2 = (await p2.evaluate(() => window.__alvosDeToque())).find((a) => a.nome === 'icone-pausa');
if (ii2) { await p2.touchscreen.tap(ii2.x + ii2.largura / 2, ii2.y + ii2.altura / 2); await real(500); const q2 = await p2.evaluate(() => window.__estado()); reg('PS9 667×375: pausa aberta por II, sem base do joystick', q2?.pausa?.aberta === true && !(await p2.evaluate(() => window.__alvosDeToque())).some((a) => a.nome === 'analogico'), JSON.stringify(q2?.pausa)); await p2.screenshot({ path: join(EVID, '08-pausa-667.png') }); }
else reg('PS9 667×375: II presente', false, 'sem icone-pausa');
await c2.close();
// DS2: título pronto em até 4 s com Fast 4G emulado
const c3 = await b.newContext({ viewport: { width: 844, height: 390 } });
const p3 = await c3.newPage(); const cdp3 = await c3.newCDPSession(p3);
await cdp3.send('Network.enable'); await cdp3.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
const t = Date.now(); await p3.goto(url); await p3.waitForSelector('canvas'); await p3.waitForFunction(() => !!window.__estado, null, { timeout: 15000 }).catch(() => null);
const dt = Date.now() - t;
reg('DS2 título pronto com Fast 4G emulado em ≤ 4 s', dt <= 4000, `${dt} ms (inclui o carregamento do HTML de 1,6 MB)`);
// DS1: CPU 4× por 10 s em exploração
await p3.evaluate(() => window.__teleportar && 0);
const cdp4 = await c3.newCDPSession(p3); await cdp4.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const fps = await p3.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const tick = () => { n++; if (performance.now() - t0 < 5000) requestAnimationFrame(tick); else res(n / 5); }; requestAnimationFrame(tick); }));
await cdp4.send('Emulation.setCPUThrottlingRate', { rate: 1 });
reg('DS1 quadros com CPU 4× (título, 5 s; exploração N/T)', fps >= 15, `fps médio ${fps.toFixed(0)} (CPU 4×; medida em título, não em exploração; ver nota)`);
await c3.close();
await b.close();
writeFileSync(join(EVID, 'log-r2.json'), JSON.stringify({ LOG, erros }, null, 1));
console.log('ERROS', erros.length, erros.slice(0, 6));
