// QA Marco 5 (v0.9.0), rodada 4. Toque (CDP/Playwright) em 844×390 e 667×375; teclado com tecla() de lib.mjs.
// Uso: node qa/scripts/marco5-r4.mjs [cam|tq|rm] [largura altura]. Só observa (dist-qa). Não altera src/.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { irPara } from './lib-rota.mjs';
import { tecla } from './lib.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VERSAO = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8')).version;
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-r7');
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const MODO = process.argv[2] ?? 'tudo';
const W = Number(process.argv[3] ?? 844); const H = Number(process.argv[4] ?? 390);
const LOG = []; const erros = [];
const reg = (id, ok, nota = '') => { LOG.push({ id, ok, nota }); console.log(`${ok === true ? 'OK   ' : ok === false ? 'FALHA' : 'INFO '} ${id} ${nota}`); };
const INIT = `(() => { window.__textos = [];
  const ft = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (t, ...r) { window.__textos.push({ t: String(t) }); if (window.__textos.length > 4000) window.__textos.splice(0, 2000); return ft.call(this, t, ...r); };
})();`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let ctx; let page; let cdp;
async function abrir(w, h, toque = true) {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: toque, isMobile: toque });
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
const J = (l) => l.map((x) => x.t).join(' ').replace(/\s+/g, ' ');
const shot = (n) => page.screenshot({ path: join(EVID, `${W}x${H}-${n}.png`) });
const centro = (a) => ({ x: a.x + a.largura / 2, y: a.y + a.altura / 2 });
const achar = async (nome, origem = 'dom') => (await alvos()).find((a) => a.nome === nome && a.origem === origem);
const temDom = async () => (await alvos()).filter((a) => a.origem === 'dom').map((a) => a.nome);
const temPerg = async () => (await alvos()).some((a) => a.origem === 'canvas' && a.nome === 'Casa:Image');
async function tocar(p) { await page.touchscreen.tap(p.x, p.y); await real(300); }
async function tocarDom(n) { const a = await achar(n); if (a) await tocar(centro(a)); return !!a; }
async function tocarA() { const a = await achar('a'); if (a) { await tocar(centro(a)); return true; } const z = (await alvos()).find((q) => q.origem === 'canvas' && /Conquista:Zone/.test(q.nome)); if (z) { await tocar(centro(z)); return true; } return false; }
const dedos = new Map();
const pts = () => [...dedos].map(([i, q]) => ({ x: q.x, y: q.y, id: i }));
async function baixar(id, p) { dedos.set(id, p); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts() }); }
async function soltar(id) { dedos.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: pts() }); }
async function segurarDom(n, ms) { const a = await achar(n); if (!a) return false; await baixar(9, centro(a)); await real(ms); await soltar(9); await real(120); return true; }
const DIR = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' };
async function virarK(dx, dy) { await tecla(page, DIR[`${dx},${dy}`], { ms: 90, pausa: 200 }); }
async function aAte(cond, max = 40, intervalo = 300) { for (let i = 0; i < max; i++) { if (await cond()) return true; await tocarA(); await real(intervalo); } return cond(); }
async function fecharDialogos() { for (let i = 0; i < 8; i++) { const e = await est(); if (e && !e.travado && !e.emConducao) break; await tocarA(); await real(350); } }
async function irAteExploracao(indice = 0) {
  const z = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
  await tocar(centro(z[0])); await real(900);
  const cart = (await alvos()).filter((a) => a.origem === 'canvas');
  await tocar(centro(cart[indice])); await real(900);
  await aAte(async () => { const e = await est(); return e && !e.travado && !!e.mapa; }, 25, 300);
  await real(400);
}
const amostraCond = async (ms, passo = 150) => { const out = []; for (let t = 0; t < ms; t += passo) { const e = await est(); out.push({ cond: !!e?.emConducao, fade: !!e?.emFade, dom: (await temDom()).length, perg: await temPerg(), travado: !!e?.travado, pos: e && `${e.tileX},${e.tileY}` }); await real(passo); } return out; };

// ===== CAM: caminho completo com toque até os créditos =====
async function blocoCam() {
  await abrir(W, H);
  await irAteExploracao(0);
  await page.evaluate(() => window.__irParaFase('parte3'));
  await page.evaluate(() => window.__teleportar('cozinha', 'P7'));
  await real(800); await fecharDialogos();
  try { await irPara(page, 'cozinha', 3, 4); } catch (e) { reg('CAM-1 rota até (3,4)', false, e.message.slice(0, 100)); }
  await virarK(0, 1);
  await tocarA(); await real(500);
  reg('CAM-1 conquista da peça 3 (toque)', J(await textos()).includes('Parabéns'), '');
  await shot('01-peca3-conquista');
  await tocarA(); await real(150);
  const cA = await amostraCond(3500);
  reg('CAM-1 condução da peça 3 iniciou e não mostra botões/"?"', cA.some((c) => c.cond) && cA.filter((c) => c.cond).every((c) => c.dom === 0 && !c.perg), `cond=${cA.filter((c) => c.cond).length} dom=${cA.map((c) => c.dom).join('')}`);
  const cheg = await aAte(async () => J(await textos()).includes('A árvore está montada'), 40, 300);
  reg('CAM-1 chegada "A árvore está montada! Que linda!" (toque)', cheg, '');
  await shot('02-peca3-chegada');
  await fecharDialogos();
  // CAM-2: caixa
  await page.evaluate(() => window.__teleportar('escritorio', 'P3')); await real(700); await fecharDialogos();
  try { await irPara(page, 'escritorio', 5, 3); } catch (e) { reg('CAM-2 rota até (5,3)', false, e.message.slice(0, 100)); }
  await virarK(0, -1);
  // cruz presa (CDP) para dar a direção, depois A na caixa
  await segurarDom('cruz-cima', 120);
  const eC = await est();
  await textos();
  await tocarA(); await real(500);
  const tc = J(await textos());
  reg('CAM-2 diagnóstico: posição antes do A na caixa', true, `pos=(${eC?.tileX},${eC?.tileY}) dir=${eC?.direcao} travado=${eC?.travado} fase=${eC?.fase}`);
  reg('CAM-2 caixa: "Parabéns, você conseguiu encontrar a caixa de enfeites de Natal!" (toque)', tc.includes('caixa de enfeites'), tc.slice(0, 160));
  await shot('03-caixa-conquista');
  await tocarA(); await real(120);
  const cB = await amostraCond(3500);
  reg('CAM-2 condução até a Sala iniciou (sem botão e sem "?")', cB.some((c) => c.cond) && cB.filter((c) => c.cond).every((c) => c.dom === 0 && !c.perg), `cond=${cB.filter((c) => c.cond).length}`);
  await shot('04-caixa-conducao');
  const fim = await aAte(async () => J(await textos()).includes('Agora a árvore está toda enfeitada'), 60, 300);
  reg('CAM-2 encaixe e "Agora a árvore está toda enfeitada!" (toque)', fim, '');
  await shot('05-diálogo-final');
  // TQ9 no fade + CAM-3
  let fadeAmostras = []; let creditos = false;
  for (let i = 0; i < 80 && !creditos; i++) {
    const e = await est(); const tx = J(await textos());
    if (tx.includes(`Versão ${VERSAO}`)) { creditos = true; break; }
    if (e?.emFade) { fadeAmostras.push(await temPerg()); await real(60); continue; }
    await tocarA(); await real(120);
    if (!e?.emFade) { const f = await est(); if (f?.emFade) { fadeAmostras.push(await temPerg()); } }
  }
  reg('TQ9 fade: "?" ausente durante o fade', fadeAmostras.length > 0 && fadeAmostras.every((p) => !p), `amostras=${fadeAmostras.length} com "?"=${fadeAmostras.filter(Boolean).length}`);
  await real(700);
  const txC = J(await textos());
  reg('CAM-3 créditos com `Versão ${VERSAO}` (toque)', creditos || txC.includes(`Versão ${VERSAO}`), txC.slice(0, 80));
  await shot('06-creditos');
  // TQ20: tocar em "Voltar ao título"
  const zs = (await alvos()).filter((a) => a.origem === 'canvas' && !/Casa:Image/.test(a.nome));
  if (zs.length) await tocar(centro(zs[0])); await real(1000);
  const titulo = (await alvos()).some((a) => a.nome === 'Titulo:Zone');
  reg('TQ20 toque em "Voltar ao título" nos créditos volta ao título', titulo, `zonas=${zs.map((a) => a.nome).join(',')}`);
  await shot('07-volta-titulo');
}

// ===== TQ4, TQ5, TQ17 (Cozinha, fogão) e TQ21 (Nick) =====
async function blocoTq() {
  await abrir(W, H);
  await irAteExploracao(0);
  await page.evaluate(() => window.__irParaFase('luzes'));
  await page.evaluate(() => window.__teleportar('cozinha', 'P7')); await real(700); await fecharDialogos();
  try { await irPara(page, 'cozinha', 3, 1); } catch (e) { reg('TQ4 pré: rota até (3,1)', false, e.message.slice(0, 100)); }
  await virarK(0, -1);
  const e0 = await est();
  reg('TQ4 pré: sobrinho em (3,1) olhando para cima (fogão em (3,0))', e0?.tileX === 3 && e0?.tileY === 1 && e0?.direcao === 'cima', `pos=(${e0?.tileX},${e0?.tileY}) dir=${e0?.direcao}`);
  await textos();
  // TQ4: cruz presa para cima + A
  await baixar(3, centro(await achar('cruz-cima'))); await real(120);
  await tocarA(); await real(500);
  await soltar(3); await real(200);
  const t4 = J(await textos());
  reg('TQ4 cruz presa + A examina o fogão', /ogão/.test(t4), t4.slice(0, 100));
  await shot('08-tq4-fogao');
  await fecharDialogos();
  // TQ5: A ao pressionar, polling de textos (até 400 ms), dedo preso
  await textos();
  const aA = await achar('a');
  await baixar(4, centro(aA));
  const t0 = Date.now(); let acao = null;
  while (Date.now() - t0 < 400 && acao === null) { const tt = J(await textos()); const ee = await est(); if (tt.length > 0 || ee?.travado) acao = Date.now() - t0; await real(8); }
  await soltar(4); await real(200);
  reg('TQ5 A age ao pressionar (dedo preso, polling)', acao !== null, acao === null ? 'nenhuma ação em 400 ms' : `ação em ${acao} ms com o dedo ainda pressionado`);
  await shot('09-tq5-pressionado');
  await fecharDialogos();
  // TQ17: H com tecla() (down 90 ms), Sala/Cozinha, toque ligado
  await textos();
  await tecla(page, 'h', { ms: 90, pausa: 400 });
  const tH = J(await textos());
  reg('TQ17 H abre a dica com toque ligado (tecla())', /Dica|Voltar/.test(tH), tH.slice(0, 100));
  await shot('10-tq17-h');
  await tecla(page, 'Escape', { ms: 90, pausa: 300 });
  // TQ21: Nick acordado por toque (Sala, luzes concluídas); P7 spawn (9,5) olha para o Nick em (8,5)
  await page.evaluate(() => window.__teleportar('sala', 'P7')); await real(700); await fecharDialogos();
  const eN = await est();
  reg('TQ21 pré: Nick dormindo, sobrinho em (9,5) olhando para a esquerda', eN?.nick?.estado === 'dormindo' && eN?.tileX === 9 && eN?.direcao === 'esquerda', `nick=${eN?.nick?.tileX},${eN?.nick?.tileY} ${eN?.nick?.estado} pos=(${eN?.tileX},${eN?.tileY}) dir=${eN?.direcao}`);
  await textos();
  await tocarA(); await real(500);
  let t21 = '';
  for (let k = 0; k < 6; k++) { t21 += ' ' + J(await textos()); if (t21.includes('Toque em B para farejar')) break; await tocarA(); await real(400); }
  reg('TQ21 acordar o Nick por toque: "Toque em B para farejar."', t21.includes('Toque em B para farejar.'), t21.slice(0, 160));
  await shot('11-tq21-nick');
}

// ===== Teclado: RM1 (amostra), RM2 (Marco 1 em amostra), RM4 (textos), RM5 (parte 3 até os créditos) =====
async function blocoRm() {
  await abrir(960, 640, false);
  await tecla(page, 'KeyZ', { ms: 90, pausa: 500 });
  let t = J(await textos());
  reg('RM2 título por teclado: "Setas: escolher  Z: confirmar" (sem toque)', t.includes('Z: confirmar') && !t.includes('A: confirmar'), t.slice(-80));
  await shot('20-rm-titulo');
  await tecla(page, 'KeyZ', { ms: 90, pausa: 500 });
  await tecla(page, 'KeyZ', { ms: 90, pausa: 500 });
  for (let i = 0; i < 12; i++) { await tecla(page, 'KeyZ', { ms: 90, pausa: 280 }); const e = await est(); if (e && !e.travado && e.mapa) break; }
  await real(400);
  const e1 = await est();
  reg('RM2 introdução e exploração por teclado (LoLô)', !!e1 && !!e1.mapa && !e1.travado, `mapa=${e1?.mapa}`);
  const tx = J(await textos());
  reg('RM4 introdução por teclado: sem "A: avançar" nem texto de toque', !tx.includes('A: avançar') && !tx.includes('Toque'), tx.slice(-100));
  await page.evaluate(() => window.__irParaFase('parte3')); await page.evaluate(() => window.__teleportar('cozinha', 'P7')); await real(700);
  for (let i = 0; i < 4; i++) { const e = await est(); if (e && !e.travado) break; await tecla(page, 'KeyZ', { ms: 90, pausa: 300 }); }
  try { await irPara(page, 'cozinha', 3, 4); } catch (e) { reg('RM5 rota teclado até (3,4)', false, e.message.slice(0, 100)); }
  await tecla(page, 'ArrowDown', { ms: 90, pausa: 200 });
  await textos();
  await tecla(page, 'KeyZ', { ms: 90, pausa: 400 });
  reg('RM5 conquista da peça 3 por teclado', J(await textos()).includes('Parabéns'), '');
  await tecla(page, 'KeyZ', { ms: 90, pausa: 400 });
  const ok3 = await aAte(async () => J(await textos()).includes('A árvore está montada'), 40, 300);
  reg('RM5 chegada da peça 3 por teclado', ok3, '');
  for (let i = 0; i < 8; i++) { const e = await est(); if (e && !e.travado) break; await tecla(page, 'KeyZ', { ms: 90, pausa: 350 }); }
  reg('RM5 diálogo da chegada fechado por teclado (Z, sem travado)', !(await est())?.travado, `travado=${(await est())?.travado}`);
  await shot('21-rm-peca3');
  await page.evaluate(() => window.__teleportar('escritorio', 'P3')); await real(700);
  for (let i = 0; i < 4; i++) { const e = await est(); if (e && !e.travado) break; await tecla(page, 'KeyZ', { ms: 90, pausa: 300 }); }
  try { await irPara(page, 'escritorio', 5, 3); } catch (e) { reg('RM5 rota teclado até (5,3)', false, e.message.slice(0, 100)); }
  for (let i = 0; i < 6; i++) { const e = await est(); if (e && !e.travado) break; await tecla(page, 'KeyZ', { ms: 90, pausa: 350 }); }
  await tecla(page, 'ArrowUp', { ms: 250, pausa: 250 });
  // (a caixa só existe com a chegada da parte 3 fechada; ver RM5 acima)
  const eK = await est();
  reg('RM5 diagnóstico: posição antes do Z na caixa (teclado)', true, `pos=(${eK?.tileX},${eK?.tileY}) dir=${eK?.direcao} travado=${eK?.travado} fase=${eK?.fase}`);
  await textos();
  await tecla(page, 'KeyZ', { ms: 90, pausa: 400 });
  let cx = J(await textos());
  if (!cx.includes('caixa de enfeites')) { await tecla(page, 'KeyZ', { ms: 120, pausa: 400 }); cx += ' ' + J(await textos()); }
  reg('RM5 conquista da caixa por teclado', cx.includes('caixa de enfeites'), cx.slice(0, 100));
  await tecla(page, 'KeyZ', { ms: 90, pausa: 400 });
  const fim = await aAte(async () => J(await textos()).includes('Agora a árvore está toda enfeitada'), 60, 300);
  reg('RM5 encaixe e diálogo final por teclado', fim, '');
  let cred = false;
  for (let i = 0; i < 40 && !cred; i++) { const tx2 = J(await textos()); if (tx2.includes(`Versão ${VERSAO}`)) { cred = true; break; } await tecla(page, 'KeyZ', { ms: 90, pausa: 350 }); }
  reg('RM5 créditos com `Versão ${VERSAO}` por teclado', cred, '');
  await shot('22-rm-creditos');
  await real(1200);
  let voltou = false;
  for (let i = 0; i < 4 && !voltou; i++) { await tecla(page, 'KeyZ', { ms: 90, pausa: 500 }); voltou = (await alvos()).some((a) => a.nome === 'Titulo:Zone'); }
  reg('RM5 Z nos créditos volta ao título (teclado)', voltou, `zonas=${(await alvos()).filter((a) => a.origem === 'canvas').map((a) => a.nome).join(',')}`);
}

async function main() {
  const todos = [['cam', blocoCam], ['tq', blocoTq], ['rm', blocoRm]];
  for (const [nome, fn] of todos.filter(([n]) => MODO === 'tudo' || MODO === n)) {
    try { await fn(); } catch (e) { reg(`BLOCO ${nome} interrompido`, false, e.message.slice(0, 160)); }
  }
  writeFileSync(join(EVID, `log7-${MODO}-${W}x${H}.json`), JSON.stringify({ LOG, erros }, null, 1));
  console.log('ERROS', erros.length, erros.slice(0, 6));
  await browser.close();
}
main();
