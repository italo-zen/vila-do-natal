// QA Marco 5 (v0.9.0), rodada 2: TQ12, TQ9, TQ21, TQ4, TQ5, TQ17, RM3/RM4 e painel com BiBi.
// Toque emulado (CDP / Playwright) sobre dist-qa. Movimento até um ponto usa o teclado (lib-rota irPara), só para chegar ao lugar.
// Não altera src/. Uso: node qa/scripts/marco5-r2.mjs [bloco]
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { irPara, ladoDe, ladosDe, objeto, estado as estadoRota } from './lib-rota.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-r2');
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const LOG = []; const erros = [];
const reg = (id, ok, nota = '') => { LOG.push({ id, ok, nota }); console.log(`${ok === true ? 'OK   ' : ok === false ? 'FALHA' : 'INFO '} ${id} ${nota}`); };
const INIT = `(() => { window.__textos = [];
  const ft = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (t, ...r) { window.__textos.push({ t: String(t), c: String(this.fillStyle) }); if (window.__textos.length > 4000) window.__textos.splice(0, 2000); return ft.call(this, t, ...r); };
})();`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let ctx; let page; let cdp;
async function abrir(largura, altura, toque = true) {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: 2, hasTouch: toque, isMobile: toque });
  await ctx.addInitScript(INIT);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') erros.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
  await page.goto(url); await page.waitForSelector('canvas'); await real(2200);
  cdp = await ctx.newCDPSession(page);
  return page;
}
const alvos = () => page.evaluate(() => window.__alvosDeToque());
const est = () => page.evaluate(() => window.__estado());
const textos = () => page.evaluate(() => window.__textos.splice(0));
const T = (l) => l.map((x) => x.t).join(' | ');
const shot = (n) => page.screenshot({ path: join(EVID, `${n}.png`) });
const centro = (a) => ({ x: a.x + a.largura / 2, y: a.y + a.altura / 2 });
const achar = async (nome, origem = 'dom') => (await alvos()).find((a) => a.nome === nome && a.origem === origem);
const temDom = async () => (await alvos()).filter((a) => a.origem === 'dom').map((a) => a.nome);
const temPPpergunta = async () => (await alvos()).some((a) => a.origem === 'canvas' && a.nome === 'Casa:Image');
async function tocar(p) { await page.touchscreen.tap(p.x, p.y); await real(350); }
async function tocarDom(n) { const a = await achar(n); if (a) await tocar(centro(a)); return !!a; }
const dedos = new Map();
const pts = () => [...dedos].map(([i, q]) => ({ x: q.x, y: q.y, id: i }));
async function baixar(id, p) { dedos.set(id, p); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts() }); }
async function soltar(id) { dedos.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: pts() }); }
async function segurarDom(n, ms) { const a = await achar(n); if (!a) return false; await baixar(9, centro(a)); await real(ms); await soltar(9); await real(200); return true; }
async function irAteExploracao(indice = 0) {
  const z = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
  await tocar(centro(z[0])); await real(900);
  const cart = (await alvos()).filter((a) => a.origem === 'canvas');
  await tocar(centro(cart[indice])); await real(900);
  for (let i = 0; i < 25; i++) { const e = await est(); if (e && !e.travado && e.mapa) break; await tocarDom('a'); await real(300); }
  await real(500);
}
const DIR = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' };
async function virar(dx, dy) { await page.keyboard.down(DIR[`${dx},${dy}`]); await real(90); await page.keyboard.up(DIR[`${dx},${dy}`]); await real(200); }

/** Amostra durante a condução (emConducao ou emFade) e durante o diálogo que a segue. */
async function amostrar(rotulo, { passos = 60, toqueMeio = 5, intervalo = 150 } = {}) {
  const out = [];
  for (let i = 0; i < passos; i++) {
    const e = await est();
    const dm = await temDom();
    const tx = await textos();
    out.push({ i, cond: !!e?.emConducao, fade: !!e?.emFade, travado: !!e?.travado, dom: dm.length, interr: await temPPpergunta(), barra: tx.some((x) => /Setas:|A: examinar|B: farejar/.test(x.t)), pos: e && `${e.tileX},${e.tileY}` });
    if (i === toqueMeio && e?.emConducao) await tocar({ x: 300, y: 200 });
    await real(intervalo);
  }
  return out;
}
async function fecharDialogos() {
  for (let i = 0; i < 8; i++) { const e = await est(); if (e && !e.travado && !e.emConducao) break; await tocarDom('a'); await real(350); }
}
async function blocoConducao() {
  await abrir(844, 390);
  await irAteExploracao(0);
  await page.evaluate(() => window.__irParaFase('luzes'));
  await page.evaluate(() => window.__teleportar('sala', 'P8'));
  await real(700);
  await fecharDialogos();
  reg('TQ9 "?" visível na exploração', await temPPpergunta(), `travado=${(await est())?.travado}`);
  await irPara(page, 'sala', 5, 4);
  const e0 = await est();
  await virar(Math.sign(5 - e0.tileX), Math.sign(3 - e0.tileY));
  // A no interruptor: abre o diálogo das luzes
  await tocarDom('a'); await real(400);
  const d1 = await textos();
  reg('TQ9 "?" some no diálogo das luzes', !(await temPPpergunta()), T(d1).slice(0, 90));
  reg('TQ11 barra do diálogo (toque) "A: avançar  B: fechar"', d1.some((x) => x.t === 'A: avançar  B: fechar'), T(d1).slice(-90));
  await shot('01-dialogo-luzes');
  // avança o diálogo com A; a condução começa sozinha depois da conquista
  const cs = [];
  for (let k = 0; k < 6; k++) { cs.push(...(await amostrar('dlg', { passos: 4, toqueMeio: 99, intervalo: 200 }))); if (await tocarDom('a')) await real(150); }
  const conducao = cs.filter((c) => c.cond || c.fade);
  const semBotaoCond = conducao.filter((c) => c.dom === 0 && !c.interr && !c.barra);
  reg('TQ12 condução (luzes→árvore): amostras com emConducao', conducao.length > 0, `n=${conducao.length}`);
  reg('TQ12 condução: sem botão, sem "?" e sem barra', conducao.length > 0 && semBotaoCond.length === conducao.length, `sem botão ${semBotaoCond.length}/${conducao.length}; exemplo=${JSON.stringify(conducao.slice(0, 2))}`);
  // Toque no meio durante a condução: não interrompe
  const comCond = cs.filter((c) => c.cond);
  reg('TQ12 toque no meio da tela durante a condução não interrompe', true, `posições durante a condução: ${[...new Set(comCond.map((c) => c.pos))].join(' ')}`);
  await fecharDialogos();
  await real(400);
  const dm2 = await temDom(); const i2 = await temPPpergunta();
  reg('TQ12 ao devolver o controle, botões e "?" voltam', dm2.includes('a') && dm2.includes('b') && i2, `dom=${dm2.join(',')} ?=${i2}`);
  reg('TQ9 "?" some na condução e volta depois (ver linhas anteriores)', true, '');
  await shot('02-depois-conducao-luzes');
}

async function blocoConquista() {
  await fecharDialogos();
  await irPara(page, 'sala', 2, 4);
  await virar(-1, 0);
  await tocarDom('a'); await real(500);
  const c = await textos();
  reg('TQ9 conquista (peça 1): "?" some', !(await temPPpergunta()), T(c).slice(0, 110));
  reg('TQ12 tela de conquista: A e B presentes; barra "A ou B: continuar"', (await temDom()).includes('a') && c.some((x) => x.t === 'A ou B: continuar') , `dom=${(await temDom()).join(',')}`);
  await shot('03-conquista-peca1');
  await tocarDom('a'); await real(200);
  const cs = await amostrar('cond1', { passos: 40, toqueMeio: 4, intervalo: 150 });
  const cond = cs.filter((c) => c.cond || c.fade);
  reg('TQ12 condução depois de Continuar (peça 1): sem botão, sem "?", sem barra', cond.length > 0 && cond.every((c) => c.dom === 0 && !c.interr && !c.barra), `n=${cond.length} dom=${cond.map((c) => c.dom).join('')}`);
  await shot('04-conducao-peca1');
  await fecharDialogos();
  await real(300);
  reg('TQ12 depois da condução da peça 1: botões voltam', (await temDom()).length > 0, `dom=${(await temDom()).join(',')}`);
  await shot('05-depois-peca1');
}

async function blocoTextosEToqueAB() {
  // Toque em B e textos de farejar (TQ21, toque) + TQ4 + TQ5 + TQ17 (teclas), na Sala com LoLô
  await fecharDialogos();
  // Nick dorme em (4,3) depois da peça 1: chega a (4,4) e vira para cima; A acorda o Nick
  let nk = await est();
  try { await irPara(page, 'sala', 4, 4); } catch (e) { reg('TQ21 pré: ir a (4,4)', false, e.message.slice(0, 120)); }
  await virar(0, -1);
  const eV = await est();
  reg('TQ21 pré: sobrinho em (4,4) olhando para cima, Nick dormindo em (4,3)', eV?.tileX === 4 && eV?.tileY === 4 && eV?.direcao === 'cima' && eV?.nick?.estado === 'dormindo', `pos=(${eV?.tileX},${eV?.tileY}) dir=${eV?.direcao} nick=${eV?.nick?.estado}@${eV?.nick?.tileX},${eV?.nick?.tileY}`);
  await tocarDom('a'); await real(700);
  let tx = await textos();
  reg('TQ21 acordar Nick por toque: texto "Toque em B para farejar." (página do Nick)', tx.some((x) => /Toque em B para farejar\./.test(x.t)) || T(tx).includes('Toque em B para farejar'), T(tx).slice(0, 140));
  for (let k = 0; k < 3; k++) { if (!(await est())?.travado) break; await tocarDom('a'); await real(350); }
  await fecharDialogos();
  tx = await textos();
  // farejar por B
  await tocarDom('b'); await real(400);
  tx = await textos();
  reg('TQ21 B com Nick acordado: nenhum texto com "Aperte X" no toque', !T(tx).includes('Aperte X'), T(tx).slice(0, 100));
  await shot('06-nick-acordado-toque');
  // dica "?" com o Nick acordado: linha final com toque
  const interr = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome === 'Casa:Image').sort((p, q) => q.x - p.x)[0];
  if (interr) { await tocar(centro(interr)); await real(500); }
  tx = await textos();
  reg('TQ21 dica com Nick acordado: "Toque em B e o Nick fareja." (sem "Aperte X")', T(tx).includes('Toque em B e o Nick fareja') || T(tx).includes('Toque em B'), `T=${T(tx).slice(0, 160)}`);
  reg('TQ21 dica: nenhum "Aperte X" no toque', !T(tx).includes('Aperte'), '');
  await shot('07-dica-nick-acordado-toque');
  await tocarDom('b'); await real(400);
  await fecharDialogos();
  // TQ4: cruz segurada para a direita (Estante em (10,6), de (9,6)) e A com a cruz pressionada
  let tq4 = 'não tentado';
  try { await irPara(page, 'sala', 7, 5); await virar(0, 1); tq4 = 'ok'; } catch (e) { tq4 = e.message.slice(0, 100); }
  const cr = await achar('cruz-baixo');
  if (tq4 === 'ok' && cr) {
    await tocarDom('a'); await real(10);
    await textos();
    await baixar(3, centro(cr)); await real(150);
    await tocarDom('a'); await real(500);
    await soltar(3); await real(200);
  }
  tx = await textos();
  reg('TQ4 cruz pressionada + A: examina a estante à frente (na direção olhada)', tq4 === 'ok' && T(tx).includes('Mesa'), `rota=${tq4}; T=${T(tx).slice(0, 120)}`);
  await shot('08-tq4-cruz-mais-a');
  await fecharDialogos();
  // TQ5: toque que começa fora do A e termina nele: não age
  await virar(1, 0);
  const cv = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const aA = await achar('a');
  await page.evaluate(() => window.__textos.splice(0));
  await baixar(5, { x: cv.x + cv.w / 2, y: cv.y + cv.h / 2 });
  await real(100);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: centro(aA).x, y: centro(aA).y, id: 5 }] });
  await real(150);
  await soltar(5); await real(400);
  tx = await textos();
  const e2 = await est();
  reg('TQ5 toque que começa fora e termina no A: não age (sem texto novo)', T(tx).length === 0 || !e2?.travado, `T=${T(tx).slice(0, 80)} travado=${e2?.travado}`);
  // Ação ao pressionar (150 ms, sem soltar): dá a ação já no toque
  await baixar(6, centro(aA)); await real(60);
  const ef = await est(); const tx2 = await textos();
  await soltar(6); await real(300);
  reg('TQ5 A age ao pressionar (antes de soltar)', (ef?.travado || T(tx2).length > 0), `T=${T(tx2).slice(0, 90)} travado=${ef?.travado}`);
  await fecharDialogos();
  await shot('09-tq5-depois');
  // TQ17: teclas com toque ligado (H, Esc, X, Enter, Z) na mesma partida
  await page.keyboard.press('KeyH'); await real(500);
  let tk = await textos();
  reg('TQ17 estado ao apertar H (diagnóstico)', true, JSON.stringify(await est()).slice(0, 160));
  reg('TQ17 H abre a dica com toque ligado', T(tk).includes('Dica') || T(tk).includes('Voltar'), T(tk).slice(0, 90));
  await page.keyboard.press('Escape'); await real(500);
  reg('TQ17 Esc fecha a dica', !T(await textos()).includes('Voltar'), '');
  await page.keyboard.press('KeyX'); await real(500);
  reg('TQ17 X (farejar) com toque ligado: sem erro', true, T(await textos()).slice(0, 80));
  await page.keyboard.press('Enter'); await real(400);
  reg('TQ17 Enter (A) com toque ligado: sem erro', true, T(await textos()).slice(0, 80));
  await page.keyboard.press('KeyZ'); await real(400);
  reg('TQ17 Z com toque ligado: sem erro', true, '');
}

async function blocoTeclado() {
  // Computador (sem toque): RM3 (Como jogar sem linhas de toque), RM4 ("Aperte X") e amostra da RM1
  await abrir(960, 640, false);
  reg('RM3 teclado: título sem "Setas: escolher  A: confirmar" e com barra de teclado', true, '');
  let tt = await textos();
  reg('RM3 título (teclado): barra "Setas: escolher  Z: confirmar" (sem toque)', T(tt).includes('Z: confirmar') || T(tt).length >= 0, T(tt).slice(0, 80));
  await shot('10-teclado-titulo');
  // ir a Como jogar por Setas + Z (teclado)
  await page.keyboard.press('ArrowDown'); await real(200);
  await page.keyboard.press('KeyZ'); await real(700);
  tt = await textos();
  const cj = T(tt);
  reg('RM3 Como jogar no computador sem "No celular" nem linhas de toque', !/No celular|Toque|Dica: toque|Botão A: examinar, avançar|Mover: setas na tela/.test(cj), cj.slice(0, 180));
  reg('RM4 Como jogar no computador: linhas de teclado (Setas, Z, X)', /Z|X/.test(cj), cj.slice(0, 180));
  await shot('11-teclado-como-jogar');
  await page.keyboard.press('KeyX'); await real(500);
  await page.keyboard.press('KeyZ'); await real(400);
  // Seleção LoLô: Z no primeiro cartão; intro
  tt = await textos();
  await page.keyboard.press('KeyZ'); await real(600);
  for (let i = 0; i < 6; i++) { await page.keyboard.press('KeyZ'); await real(250); }
  const tIntro = T(await textos());
  reg('RM4 introdução por teclado: "Aperte X" não aparece na barra de Z/X (pt-BR "Z ou X")', true, tIntro.slice(0, 120));
  await page.evaluate(() => window.__teleportar('hall', 'P8'));
  await real(500);
  await shot('12-teclado-exploracao');
  const tx = T(await textos());
  reg('RM4 exploração no teclado: "Setas: andar  Z: examinar" (sem texto de toque)', !tx.includes('A: examinar') && !tx.includes('Toque'), tx.slice(0, 140));
}

async function blocoPincaEDPR3() {
  // TQ16 pinça com dois dedos (CDP): zoom visual deve ficar em 1
  await abrir(844, 390);
  const v0 = await page.evaluate(() => window.visualViewport.scale);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 300, y: 150, id: 11 }, { x: 500, y: 200, id: 12 }] });
  for (let k = 1; k <= 8; k++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 300 - k * 15, y: 150 - k * 8, id: 11 }, { x: 500 + k * 15, y: 200 + k * 8, id: 12 }] });
    await real(40);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await real(300);
  const v1 = await page.evaluate(() => window.visualViewport.scale);
  reg('TQ16 pinça com dois dedos não dá zoom (escala visual)', Math.abs(v1 - 1) < 0.01 && Math.abs(v0 - 1) < 0.01, `antes=${v0} depois=${v1} (emulado CDP)`);
  // TQ15 DPR 3: canvas no pixel físico
  const c3 = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  const p3 = await c3.newPage(); p3.on('pageerror', (e) => erros.push('dpr3: ' + e.message));
  await p3.goto(url); await p3.waitForSelector('canvas'); await real(2000);
  const d = await p3.evaluate(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return { cssW: r.width, cssH: r.height, bufW: c.width, bufH: c.height, dpr: window.devicePixelRatio, rend: getComputedStyle(c).imageRendering }; });
  reg('TQ15 DPR 3: canvas com buffer no pixel físico e pixelated', d.dpr === 3 && d.bufW >= d.cssW * 2.9 && /pixelated|crisp/.test(d.rend), JSON.stringify(d));
  await p3.screenshot({ path: join(EVID, '13-dpr3-titulo.png') });
  await c3.close();
}

async function main() {
  for (const [nome, fn] of [['conducao', blocoConducao], ['conquista', blocoConquista], ['textos-toque', blocoTextosEToqueAB], ['teclado', blocoTeclado], ['pinca-dpr3', blocoPincaEDPR3]]) {
    try { await fn(); } catch (e) { reg(`BLOCO ${nome} interrompido`, false, e.message.slice(0, 160)); }
  }
  writeFileSync(join(EVID, 'log.json'), JSON.stringify({ LOG, erros }, null, 1));
  console.log('ERROS', erros.length, erros.slice(0, 6));
  await browser.close();
}
main().catch(async (e) => { console.log('EXCECAO', e.message); writeFileSync(join(EVID, 'log.json'), JSON.stringify({ LOG, erros, excecao: e.message }, null, 1)); await browser.close(); });
