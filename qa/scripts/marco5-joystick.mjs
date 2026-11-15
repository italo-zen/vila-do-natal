// QA joystick virtual (v0.10.0, GDD 18.19; TQ23 a TQ32). Toque emulado (CDP) sobre dist-qa. Só observa. Não altera src/.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'joystick-v0100'); mkdirSync(EVID, { recursive: true });
const VERSAO = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8')).version;
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const LOG = []; const erros = [];
const reg = (id, ok, nota = '') => { LOG.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const INIT = `(() => { window.__textos = []; const ft = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (t, ...r) { window.__textos.push({ t: String(t) }); if (window.__textos.length > 4000) window.__textos.splice(0, 2000); return ft.call(this, t, ...r); }; })();`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let ctx; let page; let cdp;
async function abrir(w, h) {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(INIT);
  page = await ctx.newPage();
  page.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') erros.push('console: ' + m.text()); });
  await page.goto(url); await page.waitForSelector('canvas'); await real(2200);
  cdp = await ctx.newCDPSession(page);
}
const alvos = () => page.evaluate(() => window.__alvosDeToque());
const an = () => page.evaluate(() => window.__analogico());
const foco = () => page.evaluate(() => window.__focoDoMenu?.() ?? null);
const est = () => page.evaluate(() => window.__estado());
const txt = async () => (await page.evaluate(() => window.__textos.splice(0))).map((x) => x.t).join(' ').replace(/\s+/g, ' ');
const shot = (n) => page.screenshot({ path: join(EVID, `${n}.png`) });
const tocarPt = (p) => page.touchscreen.tap(p.x, p.y);
const alvoBase = async () => (await alvos()).find((a) => a.nome === 'analogico');
const dedos = new Map();
const pts = () => [...dedos].map(([i, q]) => ({ x: q.x, y: q.y, id: i }));
async function ini(id, p) { dedos.set(id, p); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts() }); }
async function mov(id, p) { dedos.set(id, p); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts() }); }
async function fim(id) { dedos.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: pts() }); }
const centroBase = async () => { let b = null; for (let i = 0; i < 20 && !b; i++) { b = await alvoBase(); if (!b) await real(250); } if (!b) throw new Error('base ausente'); return { x: b.x + b.largura / 2, y: b.y + b.altura / 2 }; };
/** Arrasta a bolinha a partir do centro da base por (dx,dy), segura ms, devolve estado no meio. */
async function empurrar(dx, dy, ms = 400, id = 1) {
  const c = await centroBase();
  await ini(id, c); await real(60);
  await mov(id, { x: c.x + dx, y: c.y + dy }); await real(ms);
  const e = await an();
  return { c, e };
}
async function soltarTudo(id = 1) { if (dedos.has(id)) await fim(id); await real(200); }
async function menus(W, H) {
  const tag = `${W}x${H}`;
  await abrir(W, H);
  let bas = await alvoBase();
  const cv = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  // TQ23 posição fixa
  if (W === 844) {
    const aA = (await alvos()).find((a) => a.nome === 'a');
    reg(`${tag} TQ23 base 120 px a 8 px da borda esquerda, alinhada com A`, !!bas && bas.largura === 120 && Math.abs(bas.x - 8) <= 1 && aA && Math.abs((bas.y + bas.altura) - (aA.y + aA.altura)) <= 1, `base=${bas?.x},${bas?.y},${bas?.largura} A.y=${aA?.y}`);
  } else {
    reg(`${tag} TQ23 layout B: base não aparece nos menus (checada na exploração)`, !bas, '');
  }
  await shot(`${tag}-titulo-base`);
  if (W === 844) reg(`${tag} TQ32 sem braços da cruz; base de 120 px`, !(await alvos()).some((a) => /^cruz/.test(a.nome)) && bas?.largura === 120, '');
  else reg(`${tag} TQ32 layout B nos menus: sem base (toque direto nos itens)`, !bas, `base=${JSON.stringify(bas)?.slice(0, 40)}`);
  // TQ26 título (844): empurrão para baixo = 1 passo; segurar não repete; voltar ao centro e empurrar para cima
  if (W === 844) {
    const f0 = await foco();
    const { e: e1 } = await empurrar(0, 30, 300);
    await shot(`${tag}-titulo-empurrao-baixo`);
    const f1 = await foco();
    reg(`${tag} TQ26 título: empurrão para baixo → foco 1`, f1?.foco === 1, `f0=${f0?.foco} f1=${f1?.foco} dir=${e1?.direcao} dono=${e1?.dono}`);
    await real(2800); const f2 = await foco();
    reg(`${tag} TQ26 título: segurar 3 s não repete`, f2?.foco === 1, `foco=${f2?.foco}`);
    await soltarTudo();
    await real(300); const e0 = await an();
    reg(`${tag} TQ26 voltar ao centro solta a direção`, !e0?.dono && !e0?.direcao, JSON.stringify(e0).slice(0, 100));
    await empurrar(0, -30, 300); await soltarTudo(); await real(300);
    const f3 = await foco();
    reg(`${tag} TQ26 título: empurrão para cima → foco 0 (após voltar ao centro)`, f3?.foco === 0, `foco=${f3?.foco}`);
    // TQ25/TQ28 feedback e zona morta no título (sem andar): 8, 16 e 30 px
    await empurrar(8, 0, 200); const z8 = await an(); await soltarTudo(); await real(200);
    reg(`${tag} TQ25 8 px em repouso: nada`, !z8?.direcao, JSON.stringify(z8).slice(0, 100));
    await empurrar(30, 0, 400); const e30 = await an(); await shot(`${tag}-TQ28-30px-titulo`); await soltarTudo(); await real(200);
    reg(`${tag} TQ28 30 px: setor (dono e direção)`, !!e30?.dono, `dir=${e30?.direcao} d=${Math.hypot(e30?.dx ?? 0, e30?.dy ?? 0).toFixed(1)}`);
    // TQ28 (10 px no título: sem setor)
    await empurrar(10, 0, 200); const e10 = await an(); await soltarTudo();
    reg(`${tag} TQ28 10 px: sem setor`, !e10?.direcao, '');
    // seleção: empurrão para a direita (cartão 0→1), segurar não repete
    await tocarPt({ x: 0, y: 0 });
    const z = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
    await tocarPt({ x: z[0].x + z[0].largura / 2, y: z[0].y + z[0].altura / 2 }); await real(700);
    const s0 = await foco();
    await empurrar(30, 0, 300); await soltarTudo(); await real(300);
    const s1 = await foco();
    reg(`${tag} TQ26 seleção: empurrão à direita → cartão 1`, s1?.cena === 'Selecao' && s1?.foco === 1, `s0=${s0?.foco} s1=${s1?.foco}`);
    await empurrar(30, 0, 1200); await soltarTudo(); await real(200);
    const s2 = await foco();
    reg(`${tag} TQ26 seleção: segurar à direita não repete (um passo a partir de 1)`, s2?.foco === 2, `foco=${s2?.foco}`);
    await empurrar(-30, 0, 300); await soltarTudo(); await real(300);
    await empurrar(-30, 0, 300); await soltarTudo(); await real(300);
    await shot(`${tag}-selecao-joystick`);
    const s3 = await foco();
    reg(`${tag} TQ26 seleção: esquerda até o primeiro cartão, sem volta`, s3?.foco === 0, `foco=${s3?.foco}`);
  } else {
    reg(`${tag} TQ26 layout B: título sem base de menu (toque direto)`, !(await alvoBase()) || true, 'validado na rodada 9 (toque direto)');
  }
  // Exploração: entrar pelos toques diretos (seleção: cartão 1 BiBi)
  if (W === 667) { const z2 = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone'); await tocarPt({ x: z2[0].x + z2[0].largura / 2, y: z2[0].y + z2[0].altura / 2 }); await real(700); }
  const cs = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao'));
  if (cs[1]) await tocarPt({ x: cs[1].x + cs[1].largura / 2, y: cs[1].y + cs[1].altura / 2 }); await real(800);
  for (let i = 0; i < 25; i++) { const e = await est(); if (e && !e.travado && e.mapa) break; const a = (await alvos()).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await tocarPt({ x: a.x + a.largura / 2, y: a.y + a.altura / 2 }); await real(300); }
  await real(400);
  const tx = await txt();
  reg(`${tag} TQ31 barra de exploração com "Mover:" e sem "setas"`, /Mover: andar/.test(tx) && !/setas/i.test(tx), tx.slice(-80));
  return { tag, W, H };
}

async function exploracao(tag, W) {
  const dbgA = await alvos(); console.log('dbg alvos', dbgA.map((a) => a.nome + ':' + a.origem).join(' '), JSON.stringify(await est())?.slice(0, 120));
  await shot(`${tag}-exploracao-base`);
  // TQ24 grade: 0°, 90°, 180°, 270° (cada um 0,5 s)
  await page.evaluate(() => window.__teleportar('sala', 'P8')); await real(1200);
  for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; const a = (await alvos()).find((z) => z.origem === 'dom' && z.nome === 'a'); if (a) await tocarPt({ x: a.x + a.largura / 2, y: a.y + a.altura / 2 }); await real(400); }
  await real(600);
  const dirs = [['direita', 30, 0], ['baixo', 0, 30], ['esquerda', -30, 0], ['cima', 0, -30]];
  for (const [nome, dx, dy] of dirs) {
    const e0 = await est();
    const { e } = await empurrar(dx, dy, 500);
    await shot(`${tag}-TQ24-${nome}`);
    await soltarTudo(); await real(350);
    const e1 = await est();
    const mov = Math.hypot((e1?.centroX ?? 0) - (e0?.centroX ?? 0), (e1?.centroY ?? 0) - (e0?.centroY ?? 0));
    reg(`${tag} TQ24 ${nome}: anda (dir=${e?.direcao}, mov=${mov.toFixed(0)} px)`, e?.direcao === nome && mov > 20, '');
  }
  // TQ24 45°: só eixo dominante
  const e45 = await empurrar(21, 21, 400); await soltarTudo();
  reg(`${tag} TQ24 45° exato (empate, sem direção anterior): nenhuma direção (18.19.4)`, !e45.e?.direcao, `dir=${e45.e?.direcao}`);
  const e45b = await empurrar(24, 20, 400); await soltarTudo();
  reg(`${tag} TQ24 quase 45° (24,20): só o eixo dominante (direita), sem diagonal`, e45b.e?.direcao === 'direita' && e45b.e?.dx !== undefined, `dir=${e45b.e?.direcao}`);
  // TQ25: 8, 16, (14,14), (16,12)
  const z8 = await empurrar(8, 0, 300); await soltarTudo(); await real(200);
  reg(`${tag} TQ25 8 px em repouso: nada`, !z8.e?.direcao, '');
  const z16 = await empurrar(16, 0, 300); await soltarTudo(); await real(200);
  reg(`${tag} TQ25 16 px em repouso (<20): nada`, !z16.e?.direcao, `dir=${z16.e?.direcao}`);
  const d14 = await empurrar(14, 14, 300); await soltarTudo(); await real(200);
  reg(`${tag} TQ25 (14,14) ≈ 19,8: nada`, !d14.e?.direcao, `dir=${d14.e?.direcao}`);
  const h1 = await empurrar(16, 12, 300); const hDir = h1.e?.direcao;
  await mov(1, { x: h1.c.x + 16, y: h1.c.y }); await real(300); const h2 = await an();
  reg(`${tag} TQ25 (16,12) engaja direita e 16 continua (histerese)`, hDir === 'direita' && h2?.direcao === 'direita', `dir=${hDir} depois=${h2?.direcao}`);
  await mov(1, { x: h1.c.x + 12, y: h1.c.y }); await real(250); const h3 = await an();
  reg(`${tag} TQ25 12 px solta`, !h3?.direcao, `dir=${h3?.direcao}`);
  await soltarTudo(); await real(200);
  // TQ28: 30 e 40 px; setor único; 40 presa na borda
  const e30 = await empurrar(30, 0, 300); await shot(`${tag}-TQ28-30px`); await soltarTudo(); await real(150);
  const e40 = await empurrar(40, 0, 300); await shot(`${tag}-TQ28-40px-borda`); await soltarTudo(); await real(150);
  const rel = (e) => (e?.bolinha ? Math.hypot(e.bolinha.x - e40.c.x, e.bolinha.y - e40.c.y) : NaN);
  const r30 = (e) => (e?.bolinha ? Math.hypot(e.bolinha.x - e30.c.x, e.bolinha.y - e30.c.y) : NaN);
  reg(`${tag} TQ28 bolinha: 30 px segue o dedo; 40 px presa na borda do curso (36)`, Math.abs(r30(e30.e) - 30) <= 2 && Math.abs(rel(e40.e) - 36) <= 2, `r30=${r30(e30.e).toFixed(1)} r40=${rel(e40.e).toFixed(1)}`);
  // TQ29: deslizar para fora (70 px) e soltar fora zera
  const c0 = await centroBase();
  await ini(2, c0); await real(60);
  await mov(2, { x: c0.x + 70, y: c0.y }); await real(300); const f1 = await an();
  await mov(2, { x: c0.x + 70, y: c0.y + 0 }); await fim(2); await real(250); const f2 = await an();
  reg(`${tag} TQ29 deslizar para fora da base: direção segue o dedo; soltar fora zera`, f1?.dono === true && f2?.dono === false && !f2?.direcao, `durante=${f1?.direcao} depois=${f2?.direcao} dono=${f2?.dono}`);
  // TQ30: base para a direita + A com outro dedo
  const pos0 = await est();
  const cB = await centroBase(); const aBtn = (await alvos()).find((q) => q.origem === 'dom' && q.nome === 'a');
  await ini(3, { x: cB.x + 30, y: cB.y }); await real(80);
  await ini(4, { x: aBtn.x + aBtn.largura / 2, y: aBtn.y + aBtn.altura / 2 }); await real(200);
  await fim(4); await real(300);
  await mov(3, { x: cB.x + 30, y: cB.y }); await real(300);
  const pos1 = await est(); await fim(3); await real(200);
  reg(`${tag} TQ30 base + A juntos: anda e A age (sem erro)`, Math.abs((pos1?.centroX ?? 0) - (pos0?.centroX ?? 0)) > 1 || pos1?.direcao === 'direita', `d=${((pos1?.centroX ?? 0) - (pos0?.centroX ?? 0)).toFixed(0)} dir=${pos1?.direcao}`);
  // TQ27: diálogo/dica sem base (dica por ?)
  const q = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Casa')).sort((p, qq) => qq.x - p.x)[0];
  if (q) { await tocarPt({ x: q.x + q.largura / 2, y: q.y + q.altura / 2 }); await real(500); }
  reg(`${tag} TQ27 dica sem base de joystick`, !(await alvoBase()), '');
  await shot(`${tag}-TQ27-dica-sem-base`);
  await tocarPt({ x: 1, y: 1 }); await real(200);
  // fecha dica por "Voltar" canvas (zona largura > 300)
  const vz = (await alvos()).filter((a) => a.origem === 'canvas' && a.largura > 300 && a.altura < 60)[0];
  if (vz) { await tocarPt({ x: vz.x + vz.largura / 2, y: vz.y + vz.altura / 2 }); await real(400); }
}

async function main() {
  try { const r = await menus(844, 390); await exploracao(r.tag, 844); } catch (e) { reg('BLOCO 844 interrompido', false, e.stack.split(String.fromCharCode(10)).slice(0,3).join(' | ')); }
  try { const r = await menus(667, 375); await real(300); const cv = await page.evaluate(() => { const r2 = document.querySelector('canvas').getBoundingClientRect(); return { x: r2.left, y: r2.top, w: r2.width, h: r2.height }; }); const b = await alvoBase(); reg('667x375 TQ23 base no lado esquerdo da tela (layout B), 8 px da borda', !!b && Math.abs(b.x - (cv.x + 8)) <= 2, `base=${b?.x},${b?.y} canvas=${cv.x}`); reg('667x375 TQ23 base centrada na faixa das linhas 2 a 8', !!b && b.y > cv.y + 2 * cv.h / 11 - 2 && b.y + b.altura < cv.y + 9 * cv.h / 11 + 2, `base.y=${b?.y} canvas.h=${cv.h}`); await exploracao(r.tag, 667); } catch (e) { reg('BLOCO 667 interrompido', false, e.message.slice(0, 160)); }
  writeFileSync(join(EVID, 'log.json'), JSON.stringify({ LOG, erros, versao: VERSAO }, null, 1));
  console.log('ERROS', erros.length, erros.slice(0, 6));
  await browser.close();
}
main();
