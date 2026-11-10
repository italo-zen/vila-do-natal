// Última rodada: TQ27 (joystick ausente nas telas sem controle), anel só nas direções da tela (ANEL-T/S), REG-V (velocidade joystick × teclado). Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tecla, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-final2'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const reg = (id, ok, n = '') => console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${n}`);
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [W, H] of [[844, 390], [667, 375]]) {
  const tag = `${W}x${H}`;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await real(2200);
  const cdp = await ctx.newCDPSession(p);
  const alvos = () => p.evaluate(() => window.__alvosDeToque());
  const temBase = async () => (await alvos()).some((a) => a.nome === 'analogico');
  const est = () => estado(p).catch(() => null);
  const shot = (n) => p.screenshot({ path: join(EVID, `${tag}-${n}.png`) });
  const tocarNome = async (nome) => { const a = (await alvos()).find((q) => q.origem === 'dom' && q.nome === nome); if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); return !!a; };
  const tocarZona = async (pref, i = 0) => { const z = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome.startsWith(pref)); if (z[i]) await p.touchscreen.tap(z[i].x + z[i].largura / 2, z[i].y + z[i].altura / 2); await real(700); };
  // título: anel (esquerda/direita sem setor)
  const bt = (await alvos()).find((a) => a.nome === 'analogico');
  if (bt) {
    const c = { x: bt.x + bt.largura / 2, y: bt.y + bt.altura / 2 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] });
    await real(60);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: c.x - 40, y: c.y, id: 1 }] });
    await real(250);
    const a = await p.evaluate(() => window.__analogico());
    await shot('ANEL-T-titulo-esquerda');
    reg(`${tag} ANEL-T título: empurrão para a esquerda não acende setor (direcao=${a?.direcao})`, a?.direcao === null, JSON.stringify(a).slice(0, 80));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await real(200);
  } else reg(`${tag} ANEL-T título: base presente (menus)`, null, 'layout B: sem base nos menus');
  // seleção
  await tocarZona('Titulo:Zone', 0); await real(400);
  const bs = (await alvos()).find((a) => a.nome === 'analogico');
  if (bs) {
    const c = { x: bs.x + bs.largura / 2, y: bs.y + bs.altura / 2 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 2 }] });
    await real(60);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: c.x, y: c.y - 40, id: 2 }] });
    await real(250);
    const a = await p.evaluate(() => window.__analogico());
    await shot('ANEL-S-selecao-cima');
    reg(`${tag} ANEL-S seleção: empurrão para cima não acende setor`, a?.direcao === null, JSON.stringify(a).slice(0, 80));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await real(200);
  } else reg(`${tag} ANEL-S seleção: base presente`, null, 'layout B: sem base nos menus');
  await tocarZona('Selecao:Zone', 1); await real(900); // BiBi
  // TQ27 introdução
  reg(`${tag} TQ27-INT introdução sem base`, !(await temBase()), '');
  await shot('TQ27-introducao');
  // avança a introdução com A (toque no A se existir)
  for (let i = 0; i < 25; i++) { const e = await est(); if (e && !e.travado && e.mapa) break; await tocarNome('a'); await real(300); }
  await real(400);
  reg(`${tag} exploração: base presente (controle de movimento)`, await temBase(), '');
  // TQ27-DIC: dica por H (teclado) — a base some na dica
  await tecla(p, 'h', { ms: 90, pausa: 500 });
  reg(`${tag} TQ27-DIC dica sem base`, !(await temBase()), '');
  await shot('TQ27-dica');
  await tecla(p, 'x', { ms: 90, pausa: 400 });
  // TQ27-PAI painel (teclado, lib)
  await p.evaluate(() => window.__teleportar('hall', 'P8')); await real(600);
  for (let i = 0; i < 4; i++) { const e = await est(); if (!e?.travado) break; await tecla(p, 'z', { ms: 90, pausa: 300 }); }
  try { await irAtePainel(p); } catch (e) { console.log('irAtePainel', e.message.slice(0, 80)); }
  const e = await est();
  reg(`${tag} TQ27-PAI painel de código aberto e sem base`, e?.travado === true && !(await temBase()), `travado=${e?.travado}`);
  await shot('TQ27-painel');
  await tecla(p, 'x', { ms: 90, pausa: 400 });
  // TQ27-CON / CND / FAD: peça 1 (Sala) via keyboard até (2,4), luzes antes
  await p.evaluate(() => window.__irParaFase('luzes')); await p.evaluate(() => window.__teleportar('sala', 'P8')); await real(500);
  for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await tecla(p, 'z', { ms: 90, pausa: 300 }); }
  await p.evaluate(() => window.__irParaFase('parte1')); await p.evaluate(() => window.__teleportar('sala', 'P8')); await real(500);
  for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await tecla(p, 'z', { ms: 90, pausa: 300 }); }
  try { await irPara(p, 'sala', 2, 4); } catch (er) { console.log('rota', er.message.slice(0, 60)); }
  await tecla(p, 'ArrowLeft', { ms: 260, pausa: 200 });
  await tecla(p, 'z', { ms: 90, pausa: 500 });
  await real(500);
  reg(`${tag} TQ27-CON conquista sem base`, !(await temBase()), '');
  await shot('TQ27-conquista');
  await tecla(p, 'z', { ms: 90, pausa: 400 });
  // condução
  let vistoCond = false; let baseCond = false;
  for (let i = 0; i < 25; i++) { const q = await est(); if (q?.emConducao) { vistoCond = true; if (await temBase()) baseCond = true; if (i === 3) await shot('TQ27-conducao'); } await real(200); }
  reg(`${tag} TQ27-CND condução sem base`, vistoCond ? !baseCond : null, `viu condução=${vistoCond}`);
  // fade: andar pela porta P3 (Sala (8,2) → Escritório)
  await p.evaluate(() => window.__teleportar('sala', 'P3')); await real(600);
  for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await tecla(p, 'z', { ms: 90, pausa: 300 }); }
  let fadeBase = false; let viuFade = false;
  const p3 = { x: 0, y: 0 };
  tecla(p, 'ArrowRight', { ms: 400, pausa: 0 }).catch(() => null);
  for (let i = 0; i < 20; i++) { const q = await est(); if (q?.emFade) { viuFade = true; if (await temBase()) fadeBase = true; await shot('TQ27-fade'); break; } await real(60); }
  await real(1200);
  reg(`${tag} TQ27-FAD fade sem base`, viuFade ? !fadeBase : null, `viu fade=${viuFade}`);
  await ctx.close();
}
// REG-V: velocidade do joystick (base para a esquerda 1 s) × teclado (ArrowLeft 1 s), corredor livre
{
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await real(2200);
  const cdp = await ctx.newCDPSession(p);
  const alvos = () => p.evaluate(() => window.__alvosDeToque());
  const z = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
  await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(700);
  const cs = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao'));
  await p.touchscreen.tap(cs[0].x + 20, cs[0].y + 20); await real(800);
  for (let i = 0; i < 25; i++) { const st = await estado(p).catch(() => null); if (st && !st.travado && st.mapa) break; const a = (await alvos()).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); await real(300); }
  const medir = async (acao) => { await p.evaluate(() => window.__teleportar('sala', 'P8')); await real(1500); for (let i = 0; i < 5; i++) { const q = await estado(p).catch(() => null); if (!q?.travado) break; await tecla(p, 'z', { ms: 90, pausa: 300 }); } await real(300); const a0 = await estado(p); const d = await acao(); const a1 = await estado(p); return Math.hypot(a1.centroX - a0.centroX, a1.centroY - a0.centroY); };
  const dJoy = await medir(async () => {
    const bs = (await alvos()).find((a) => a.nome === 'analogico'); const c = { x: bs.x + bs.largura / 2, y: bs.y + bs.altura / 2 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 7 }] }); await real(60);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: c.x - 30, y: c.y, id: 7 }] });
    await real(1000);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await real(200); return 0;
  });
  const dKey = await medir(async () => { await p.keyboard.down('ArrowLeft'); await real(1000); await p.keyboard.up('ArrowLeft'); await real(200); return 0; });
  reg('REG-V velocidade do joystick × teclado (1 s, corredor livre, esquerda)', Math.abs(dJoy - dKey) <= 0.15 * dKey + 4, `joystick=${dJoy.toFixed(0)} px teclado=${dKey.toFixed(0)} px`);
  await ctx.close();
}
await b.close();
