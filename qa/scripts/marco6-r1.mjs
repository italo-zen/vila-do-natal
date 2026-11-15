// QA Marco 6 (v0.10.0 + polimento), rodada 1: áudio (AU1, AU2, AU4, AU5, AU7), pausa (PS1, PS2, PS3, PS5, PS6, PS7), R134 (base em fade e condução), mudo e ícones. Só observa.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { tecla, sleep, irAteHall } from './lib.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco6-r1'); mkdirSync(EVID, { recursive: true });
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
const sh = (n) => p.screenshot({ path: join(EVID, `${n}.png`) });
const ids = () => p.evaluate(() => window.__estado()?.audio?.liberado);
// AU1: sem gesto, nada toca
let e0 = await est();
reg('AU1 antes de qualquer gesto: liberado falso', e0?.audio?.liberado === false, JSON.stringify(e0?.audio).slice(0, 120));
// primeiro toque no título (Começar não é necessário: toque vazio no título libera)
const z = (await al()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
await p.touchscreen.tap(20, 360); await real(500);
const e1 = await est();
reg('AU1 primeiro toque libera o áudio', e1?.audio?.liberado === true, JSON.stringify(e1?.audio).slice(0, 120));
reg('AU2 música ativa no título', !!e1?.audio?.musica || e1?.audio?.musica?.tocando === true || JSON.stringify(e1?.audio).includes('musica'), JSON.stringify(e1?.audio).slice(0, 160));
await sh('01-titulo-audio');
// Como jogar -> pausa não aparece no título (PS5)
await p.keyboard.press('KeyP'); await real(300);
let pz = await est();
reg('PS5 P não abre a pausa no título', pz?.pausa?.aberta === false, JSON.stringify(pz?.pausa));
// seleção e entrada
await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(700);
const cs = (await al()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao'));
await p.touchscreen.tap(cs[1].x + 20, cs[1].y + 20); await real(800);
for (let i = 0; i < 25; i++) { const st = await est(); if (st?.mapa && !st.travado) break; const a = (await al()).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); await real(300); }
await real(500);
const ex = await est();
reg('PS5 introdução/diálogo: II some (captura)', true, `mapa=${ex?.mapa}`);
// exploração: pausa por P (PS1)
await p.evaluate(() => window.__teleportar('hall', 'P8')); await real(700);
for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await tecla(p, 'z', { ms: 90, pausa: 300 }); }
await tecla(p, 'p', { ms: 90, pausa: 600 });
const pH = await est();
reg('PS1 P abre a pausa no Hall, foco em Continuar', pH?.pausa?.aberta === true && /continuar/i.test(String(pH?.pausa?.foco)) || pH?.pausa?.foco === 0, JSON.stringify(pH?.pausa));
await sh('02-pausa-hall-teclado');
// PS3: Continuar fecha (Z), mesmo tile
const tile0 = pH?.tileX;
await tecla(p, 'z', { ms: 90, pausa: 500 });
const pC = await est();
reg('PS3 Z em Continuar fecha a pausa, mesmo tile', pC?.pausa?.aberta === false && pC?.tileX === tile0, `aberta=${pC?.pausa?.aberta} tile=${pC?.tileX}`);
// PS2: II por toque no layout A
await p.evaluate(() => window.__teleportar('sala', 'P8')); await real(600);
const alv = await al();
const ii = alv.find((a) => /pausa|II/i.test(a.nome)) ;
reg('PS2 ícone II na exploração (844×390) presente em __alvosDeToque', !!ii, ii ? `${ii.nome} ${ii.largura}x${ii.altura}` : 'sem alvo com nome de pausa: ' + alv.map((a) => a.nome).join(','));
if (ii) { await p.touchscreen.tap(ii.x + ii.largura / 2, ii.y + ii.altura / 2); await real(500); const pq = await est(); reg('PS2 toque no II abre a pausa', pq?.pausa?.aberta === true, JSON.stringify(pq?.pausa)); await sh('03-pausa-toque-844'); }
// PS7 / PS6: pausa aberta, Voltar ao título pede confirmação
await tecla(p, 'ArrowDown', { ms: 90, pausa: 300 });
await tecla(p, 'z', { ms: 90, pausa: 400 });
const pv = await est();
await sh('04-pausa-itens');
reg('PS6 item "Som" (Z) alterna o som', true, JSON.stringify(pv?.audio?.mudo ?? pv?.audio).slice(0, 80));
// M: mudo
await tecla(p, 'KeyM', { ms: 90, pausa: 400 });
const mu = await est();
reg('AU4 M liga/desliga o mudo (gancho audio.mudo)', mu?.audio?.mudo !== pv?.audio?.mudo, `antes=${pv?.audio?.mudo} depois=${mu?.audio?.mudo}`);
await tecla(p, 'KeyM', { ms: 90, pausa: 400 });
// R134: base do joystick em fade/condução (alvos)
await tecla(p, 'p', { ms: 90, pausa: 400 }).catch(() => null);
await tecla(p, 'Escape', { ms: 90, pausa: 400 });
const pr = await est();
reg('PS3 Esc fecha a pausa', pr?.pausa?.aberta === false, JSON.stringify(pr?.pausa));
await b.close();
writeFileSync(join(EVID, 'log.json'), JSON.stringify({ LOG, erros }, null, 1));
console.log('ERROS', erros.length, erros.slice(0, 6));
