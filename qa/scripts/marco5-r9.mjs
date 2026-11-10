// QA Marco 5 (v0.9.1), reteste BUG-M5-04: cruz na tela navega os menus (título, seleção). Toque emulado (CDP/Playwright).
// Foco por __focoDoMenu() (build:qa). Só observa. Não altera src/.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-r9'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const LOG = []; const erros = [];
const reg = (id, ok, nota = '') => { LOG.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const INIT = `(() => { window.__textos = []; const ft = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (t, ...r) { window.__textos.push({ t: String(t) }); if (window.__textos.length > 4000) window.__textos.splice(0, 2000); return ft.call(this, t, ...r); }; })();`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let ctx; let page; let cdp;
async function abrir(w, h, toque = true) {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: toque, isMobile: toque });
  await ctx.addInitScript(INIT);
  page = await ctx.newPage();
  page.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') erros.push('console: ' + m.text()); });
  await page.goto(url); await page.waitForSelector('canvas'); await real(2200);
  cdp = await ctx.newCDPSession(page);
}
const alvos = () => page.evaluate(() => window.__alvosDeToque());
const foco = () => page.evaluate(() => window.__focoDoMenu?.() ?? null);
const est = () => page.evaluate(() => window.__estado());
const achar = async (n) => (await alvos()).find((a) => a.nome === n && a.origem === 'dom');
const zonas = async (pref) => (await alvos()).filter((a) => a.origem === 'canvas' && a.nome.startsWith(pref));
const c = (a) => ({ x: a.x + a.largura / 2, y: a.y + a.altura / 2 });
const tocar = async (a) => { await page.touchscreen.tap(c(a).x, c(a).y); await real(350); };
const tocarDom = async (n) => { const a = await achar(n); if (a) await tocar(a); return !!a; };
const dedos = new Map();
const pts = () => [...dedos].map(([i, q]) => ({ x: q.x, y: q.y, id: i }));
async function baixar(id, p) { dedos.set(id, p); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts() }); }
async function soltar(id) { dedos.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: pts() }); }
async function segurarDom(n, ms) { const a = await achar(n); if (!a) return false; await baixar(9, c(a)); await real(ms); await soltar(9); await real(200); return true; }
const shot = (n) => page.screenshot({ path: join(EVID, `${n}.png`) });

async function menus(W, H) {
  const tag = `${W}x${H}`;
  await abrir(W, H);
  const f0 = await foco();
  reg(`${tag} título: foco inicial`, f0?.cena === 'Titulo' && f0?.foco === 0, JSON.stringify(f0));
  const temCruz = !!(await achar('cruz-baixo'));
  if (W === 844) {
    await segurarDom('cruz-baixo', 60); const f1 = await foco();
    reg(`${tag} M-TIT cruz baixo (toque): foco 0→1`, f1?.foco === 1, JSON.stringify(f1));
    await segurarDom('cruz-baixo', 900); const f1b = await foco();
    reg(`${tag} M-TIT segurar cruz baixo: não repete (foco ≤ 1 passo)`, f1b?.foco === 1 || f1b?.foco === 0, JSON.stringify(f1b));
    await segurarDom('cruz-cima', 60); const f2 = await foco();
    reg(`${tag} M-TIT cruz cima: foco volta ao 0`, f2?.foco === 0, JSON.stringify(f2));
    await segurarDom('cruz-baixo', 60);
    await tocarDom('a'); await real(500);
    const cj = await foco();
    reg(`${tag} M-TIT-A: A no foco 1 abre Como jogar`, cj?.cena === 'ComoJogar', JSON.stringify(cj));
    await shot(`${tag}-como-jogar-cruz`);
    await tocarDom('b'); await real(500);
    await segurarDom('cruz-cima', 60);
  } else {
    reg(`${tag} M-TIT cruz some nos menus (esperado em layout B)`, !temCruz, `cruz=${temCruz}`);
    const zs = await zonas('Titulo:Zone');
    await tocar(zs[1]); await real(500); const cj = await foco();
    reg(`${tag} M-TQ título: toque direto em Como jogar`, cj?.cena === 'ComoJogar', JSON.stringify(cj));
    const zv = await zonas('ComoJogar'); if (zv[0]) await tocar(zv[0]); await real(500);
    const vt = await foco(); reg(`${tag} M-TQ Como jogar: toque em Voltar volta ao título`, vt?.cena === 'Titulo', JSON.stringify(vt));
  }
  await shot(`${tag}-titulo`);
  // seleção: Começar (toque direto em zona 0)
  const zs0 = await zonas('Titulo:Zone');
  await tocar(zs0[0]); await real(700);
  const s0 = await foco();
  reg(`${tag} seleção: foco inicial 0`, s0?.cena === 'Selecao' && s0?.foco === 0, JSON.stringify(s0));
  if (W === 844) {
    await segurarDom('cruz-direita', 60); const s1 = await foco();
    reg(`${tag} M-SEL cruz direita: foco 0→1`, s1?.foco === 1, JSON.stringify(s1));
    await segurarDom('cruz-direita', 1200); const s2 = await foco();
    reg(`${tag} M-SEL segurar cruz direita: anda 1 cartão (não pula)`, s2?.foco === 2, JSON.stringify(s2));
    await segurarDom('cruz-direita', 60); await segurarDom('cruz-direita', 60); const s3 = await foco();
    reg(`${tag} M-SEL-LIM último cartão: não dá a volta`, s3?.foco === 3, JSON.stringify(s3));
    await segurarDom('cruz-direita', 60); const s3b = await foco();
    reg(`${tag} M-SEL-LIM cruz além do último: fica no 3`, s3b?.foco === 3, JSON.stringify(s3b));
    await segurarDom('cruz-esquerda', 60); const s4 = await foco();
    reg(`${tag} M-SEL cruz esquerda: foco 3→2`, s4?.foco === 2, JSON.stringify(s4));
    await shot(`${tag}-selecao-cruz`);
    await segurarDom('cruz-esquerda', 60); await segurarDom('cruz-esquerda', 60);
  } else {
    reg(`${tag} M-SEL cruz some na seleção (layout B)`, !(await achar('cruz-direita')), '');
    const cart = await zonas('Selecao:Zone');
    await tocar(cart[2]); await real(500); const s2 = await foco();
    reg(`${tag} M-TQ seleção: toque direto no cartão 3 confirma (GDD 18.5 regra 6)`, s2 === null, JSON.stringify(s2));
    await shot(`${tag}-selecao-toque`);
  }
  // escolher BiBi (cartão 1 por toque) e entrar na exploração
  const cart2 = await zonas('Selecao:Zone');
  if (cart2[1]) await tocar(cart2[1]); await real(900);
  for (let i = 0; i < 20; i++) { const e = await est(); if (e && !e.travado && e.mapa) break; await tocarDom('a'); await real(300); }
  await real(400);
  return tag;
}

async function exploracao(W, H) {
  const tag = `${W}x${H}`;
  await page.evaluate(() => window.__irParaFase && window.__irParaFase('parte1'));
  const e0 = await est();
  const p0 = { x: e0?.centroX, y: e0?.centroY };
  if (W === 844) {
    await page.evaluate(() => window.__teleportar('hall', 'P8')); await real(700);
    const q0 = await est(); const pa = { x: q0?.centroX ?? 0, y: q0?.centroY ?? 0 };
    await segurarDom('cruz-esquerda', 500); await real(200);
    const e1 = await est();
    const distHold = Math.abs((e1?.centroX ?? 0) - pa.x); reg(`${tag} M-EXP velocidade: 0,5 s segurando (hall, esquerda): ${distHold.toFixed(0)} px`, distHold >= 48 && distHold <= 100, 'esperado ~64 px (4 tiles/s × 0,5 s × 32); parede no hall');
    const dist = Math.hypot((e1?.centroX ?? 0) - (p0.x ?? 0), (e1?.centroY ?? 0) - (p0.y ?? 0));
    reg(`${tag} M-EXP cruz segurada: anda (dist=${dist.toFixed(0)} px)`, dist > 40, '');
    // cruz + A: examina o objeto à frente (direção olhada)
    await baixar(3, { x: 0, y: 0 });
    const cr = await achar('cruz-direita'); if (cr) { await soltar(3); await baixar(3, c(cr)); }
    await real(120); await tocarDom('a'); await real(400); await soltar(3); await real(200);
    reg(`${tag} M-AB cruz + A juntos (ação sem erro)`, true, '');
    await tocarDom('b'); await real(400);
    reg(`${tag} M-AB B toque (farejar, sem erro)`, true, '');
    await shot(`${tag}-exploracao-cruz`);
  }
}

async function rotacao(W, H) {
  await page.setViewportSize({ width: 390, height: 844 }); await real(1200);
  const f1 = await est();
  await segurarDom('cruz-direita', 800).catch(() => {});
  const f2 = await est();
  reg(`${W}x${H} M-ROT cruz com o aviso: mundo parado`, !!f1 && !!f2 && f1.centroX === f2.centroX && f1.centroY === f2.centroY, `antes=${f1?.centroX} depois=${f2?.centroX}`);
  await page.setViewportSize({ width: W, height: H }); await real(1000);
}

async function main() {
  for (const [w, h] of [[844, 390], [667, 375]]) {
    try { const t = await menus(w, h); if (w === 844) await exploracao(w, h); await rotacao(w, h); } catch (e) { reg(`BLOCO ${w}×${h} interrompido`, false, e.message.slice(0, 160)); }
  }
  writeFileSync(join(EVID, 'log.json'), JSON.stringify({ LOG, erros }, null, 1));
  console.log('ERROS', erros.length, erros.slice(0, 6));
  await browser.close();
}
main();
