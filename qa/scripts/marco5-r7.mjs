// QA Marco 5 (v0.9.0), rodada 7: menus por toque (layout A 844×390 e layout B 667×375), aviso de rotação,
// e teclado (107): F3 (quadro a quadro, 200 ms), F5 (zzz por captura), RM2-c (luzes). Só observa. Não altera src/.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { irPara, estado } from './lib-rota.mjs';
import { tecla, irAteHall, irAtePainel, digitar, lancar, novoContexto, abrirJogo, lerTextos, sleep } from './lib.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-r7');
mkdirSync(EVID, { recursive: true });
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
const txt = async () => (await page.evaluate(() => window.__textos.splice(0))).map((x) => x.t).join(' ').replace(/\s+/g, ' ');
const tocar = async (a) => { await page.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); await real(350); };
const shot = (n) => page.screenshot({ path: join(EVID, `${n}.png`) });
const dom = async () => (await alvos()).filter((a) => a.origem === 'dom');
const zonas = async () => (await alvos()).filter((a) => a.origem === 'canvas');
const solapa = (a, b) => a.x < b.x + b.largura && a.x + a.largura > b.x && a.y < b.y + b.altura && a.y + a.altura > b.y;
async function checarTela(rotulo, esperadoTexto, { cruz = false, ab = false } = {}) {
  const t = await txt(); const d = await dom(); const zs = await zonas();
  const temCruz = d.some((a) => a.nome.startsWith('cruz')); const temAB = d.some((a) => a.nome === 'a' || a.nome === 'b');
  reg(`${rotulo}: barra "${esperadoTexto}"`, t.includes(esperadoTexto), t.slice(-110));
  reg(`${rotulo}: controles ${cruz || ab ? 'como previsto' : 'ausentes (sem cruz, A nem B)'}`, cruz || ab ? (temCruz === cruz && temAB === ab) : !temCruz && !temAB, `cruz=${temCruz} ab=${temAB}`);
  const sob = d.flatMap((c) => zs.filter((z) => solapa(c, z)).map((z) => `${c.nome}×${z.nome}`));
  reg(`${rotulo}: sem sobreposição controle × zona de texto/botão`, sob.length === 0, sob.join(',') || 'nenhuma');
  await shot(rotulo.replace(/[^\w-]/g, '_'));
  return { t, d, zs };
}

async function menus(W, H) {
  const tag = `${W}x${H}`;
  await abrir(W, H);
  const r1 = await checarTela(`${tag} título`, 'Toque num item do menu');
  const zT = r1.zs.filter((z) => z.nome === 'Titulo:Zone');
  reg(`${tag} título: zonas Começar e Como jogar tocáveis (≥ 48 px de altura)`, zT.length >= 2 && zT.every((z) => z.altura >= 47.5), zT.map((z) => `${z.largura.toFixed(0)}×${z.altura.toFixed(0)}`).join(' '));
  // Como jogar
  await tocar(zT[1]); await real(500);
  const r2 = await checarTela(`${tag} como-jogar`, 'Toque em Voltar');
  reg(`${tag} como jogar: linhas de toque presentes`, /Botão A: examinar, avançar\./.test(r2.t) && /Dica: toque no ícone \?/.test(r2.t), r2.t.slice(0, 80));
  const zV = (await zonas()).filter((z) => z.nome.includes('Zone'));
  await tocar(zV[0]); await real(500);
  // seleção: toque no cartão
  const zT2 = (await zonas()).filter((z) => z.nome === 'Titulo:Zone');
  await tocar(zT2[0]); await real(600);
  const r3 = await checarTela(`${tag} selecao`, 'Toque no cartão para começar');
  const cart = r3.zs.filter((z) => z.nome.startsWith('Selecao'));
  reg(`${tag} seleção: zonas (nomes e tamanhos)`, true, r3.zs.map((z) => `${z.nome}:${z.largura.toFixed(0)}x${z.altura.toFixed(0)}@${z.x.toFixed(0)},${z.y.toFixed(0)}`).join(' ') + ' | dom: ' + r3.d.map((d) => d.nome).join(','));
  const voltar = W === 667 ? r3.zs.find((z) => z.largura > 300 && z.altura < 60) : undefined;
  if (W === 667) { if (voltar) { await tocar(voltar); await real(700); const tv = await txt(); const ok = (await zonas()).some((z) => z.nome === 'Titulo:Zone'); reg(`${tag} seleção: toque em "Voltar ao título" leva ao título`, ok, tv.slice(-60)); if (!ok) await tocar(cart[0]); } else reg(`${tag} seleção: botão Voltar ao título em layout B`, false, 'não encontrado nas zonas/DOM'); }
  else reg(`${tag} seleção: sem botão Voltar ao título em layout A (esperado)`, !voltar, voltar ? voltar.nome : 'ausente');
  reg(`${tag} seleção: 4 cartões ≥ 48 px de altura`, cart.length >= 4 && cart.slice(0, 4).every((z) => z.altura >= 47.5), `n=${cart.length}`);
  if (!(await zonas()).some((z) => z.nome === 'Selecao:Zone' || z.nome.startsWith('Selecao'))) await tocar(zT2[0]);
  const cartAgora = (await zonas()).filter((z) => z.nome.startsWith('Selecao'));
  await tocar(cartAgora[1] ?? cart[1]); await real(900);
  const r4 = await checarTela(`${tag} introducao`, 'A: avançar  B: voltar', { ab: true });
  reg(`${tag} introdução com nome do sobrinho (BiBi)`, r4.t.includes('BiBi'), r4.t.slice(0, 60));
  // avança a introdução até a exploração
  for (let i = 0; i < 25; i++) { const e = await page.evaluate(() => window.__estado()); if (e && !e.travado && e.mapa) break; const a = (await dom()).find((d) => d.nome === 'a'); if (a) await tocar(a); await real(300); }
  await real(500);
  const r5 = await checarTela(`${tag} exploracao`, 'Setas: andar  A: examinar', { cruz: true, ab: true });
  reg(`${tag} exploração: barra segunda linha "B: farejar  ?: dica"`, r5.t.includes('B: farejar  ?: dica'), r5.t.slice(-60));
  // ? abre a dica
  const q = r5.zs.filter((z) => z.nome.startsWith('Casa')).sort((p, q2) => q2.x - p.x)[0];
  if (q) { await tocar(q); await real(500); }
  const r6 = await checarTela(`${tag} dica`, 'A ou B: voltar');
  reg(`${tag} dica por toque: "?" abre; Voltar tocável`, /Dica/.test(r6.t), r6.t.slice(0, 60));
  const zVoltar = r6.zs.filter((z) => z.nome.includes('Zone')).sort((p, q2) => p.y - q2.y).pop();
  if (zVoltar) await tocar(zVoltar); await real(500);
  // rotação: aviso
  await page.setViewportSize({ width: 390, height: 844 }); await real(1200);
  const av = await page.evaluate(() => { const el = document.getElementById('aviso-de-rotacao'); return el ? getComputedStyle(el).display : 'ausente'; });
  const tAv = await page.evaluate(() => (document.getElementById('aviso-de-rotacao')?.innerText ?? ''));
  reg(`${tag} aviso de rotação em 390×844: duas linhas exatas, sem controles`, av !== 'none' && av !== 'ausente' && tAv.includes('Gire o celular para o lado.') && tAv.includes('O jogo fica na horizontal.') && !(await dom()).length, `display=${av}`);
  await shot(`${tag}-aviso-rotacao`);
  await page.setViewportSize({ width: W, height: H }); await real(1200);
  const av2 = await page.evaluate(() => { const el = document.getElementById('aviso-de-rotacao'); return el ? getComputedStyle(el).display : 'ausente'; });
  reg(`${tag} volta à paisagem: aviso some`, av2 === 'none' || av2 === 'ausente', `display=${av2}`);
}

async function rotacaoSemToqueComputador() {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: false });
  const p = await c.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await real(1500);
  const av = await p.evaluate(() => { const el = document.getElementById('aviso-de-rotacao'); return el ? getComputedStyle(el).display : 'ausente'; });
  reg('TQ14 computador (sem toque) 390×844: sem aviso', av === 'ausente' || av === 'none', `display=${av}`);
  await c.close();
}

async function teclado() {
  // 107: 2 sobrinhos, F3 quadro a quadro, F5 captura, RM2-c (luzes)
  for (const s of [{ nome: 'LoLô', idx: 0, codigo: '017' }, { nome: 'BiBi', idx: 1, codigo: '020' }]) {
    const b = await lancar();
    const c = await novoContexto(b, { url, origem: url, rotulo: s.nome });
    const p = await abrirJogo(c, url);
    const est = async () => { try { return await estado(p); } catch { await sleep(150); return null; } };
    const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
    await irAteHall(p, s.idx); await irAtePainel(p); await digitar(p, s.codigo); await z();
    for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
    for (let i = 0; i < 14; i++) { const q = await est(); if (!q?.travado) break; await z(); }
    const e0 = await est();
    reg(`RM2-b ${s.nome}: porta P8 pelo código e Sala`, e0?.mapa === 'sala', `mapa=${e0?.mapa}`);
    // F5: Nick dormindo, X: captura quadro a quadro
    await lerTextos(p);
    await tecla(p, 'x', { ms: 90, pausa: 0 });
    for (let k = 0; k < 4; k++) { await p.screenshot({ path: join(EVID, `${s.nome}-F5-zzz-${k}.png`) }); await sleep(150); }
    const e5 = await est();
    reg(`F5 ${s.nome}: X com Nick dormindo: sem seta, sem ocupado (captura F5-zzz-*)`, !e5?.farejo?.ativo && !e5?.ocupadoNick, `ativo=${e5?.farejo?.ativo} ocupado=${e5?.ocupadoNick}`);
    // acordar o Nick: (7,4) -> (9,4) -> (9,5), olha para a esquerda
    try { await irPara(p, 'sala', 7, 4); } catch (e) { reg(`N2 ${s.nome}: rota (7,4)`, false, e.message.slice(0, 80)); }
    for (const k of ['ArrowRight', 'ArrowRight', 'ArrowDown']) await tecla(p, k, { ms: 280, pausa: 150 });
    await tecla(p, 'ArrowLeft', { ms: 90, pausa: 200 });
    await z(90, 600); for (let i = 0; i < 4; i++) { const t = await lerTextos(p); if (t.map((x) => x.t).join(' ').includes('Aperte X')) break; await z(); }
    for (let i = 0; i < 14; i++) { const q = await est(); if (!q?.travado) break; await z(); }
    const eN = await est();
    reg(`N2 ${s.nome}: Nick acordado, sobrinho em (9,5)`, eN?.nick?.estado === 'acordado' && eN?.tileX === 9 && eN?.tileY === 5, `nick=${eN?.nick?.estado} pos=${eN?.tileX},${eN?.tileY}`);
    // F3: mesmo cômodo, X, quadro a quadro 200 ms por 2 s, com captura do balão
    const seq = [];
    await tecla(p, 'x', { ms: 90, pausa: 0 });
    for (let t = 0; t <= 2000; t += 200) { const q = await est(); seq.push(`${t}:oc=${q?.ocupadoNick ? 1 : 0},at=${q?.farejo?.ativo ? 1 : 0},nick=${q?.nick?.estado?.slice(0, 4)}`); await p.screenshot({ path: join(EVID, `${s.nome}-F3-${String(t).padStart(4, '0')}ms.png`) }); await sleep(200); }
    const ocup = seq.some((x) => x.includes('oc=1'));
    reg(`F3 ${s.nome}: mesmo cômodo, X: ocupadoNick por ~1,2 s (captura F3-*ms)`, ocup, seq.join(' | ').slice(0, 300));
    // RM2-c: luzes (interruptor (5,3), de (5,4) olhando para cima)
    try { await irPara(p, 'sala', 5, 4); } catch (e) { reg(`RM2-c ${s.nome}: rota (5,4)`, false, e.message.slice(0, 80)); }
    await tecla(p, 'ArrowUp', { ms: 90, pausa: 200 });
    await tecla(p, 'z', { ms: 90, pausa: 300 });
    let tl = ''; for (let i = 0; i < 6; i++) { tl += ' ' + (await lerTextos(p)).map((x) => x.t).join(' '); if (/acender as luzes/.test(tl)) break; await z(); }
    reg(`RM2-c ${s.nome}: "Parabéns, você conseguiu acender as luzes."`, /acender as luzes/.test(tl), tl.replace(/\s+/g, ' ').slice(0, 120));
    await c.close(); await b.close();
  }
}

async function main() {
  for (const [w, h] of [[844, 390], [667, 375]]) {
    try { await menus(w, h); } catch (e) { reg(`BLOCO menus ${w}×${h} interrompido`, false, e.message.slice(0, 160)); }
  }
  await rotacaoSemToqueComputador();
  try { await teclado(); } catch (e) { reg('BLOCO teclado interrompido', false, e.message.slice(0, 160)); }
  writeFileSync(join(EVID, 'log.json'), JSON.stringify({ LOG, erros }, null, 1));
  console.log('ERROS', erros.length, erros.slice(0, 6));
  await browser.close();
}
main();
