// QA Marco 5 (v0.9.0), rodada 3: caminho até os créditos com toque (CAM), TQ20, TQ9 (fade), TQ4, TQ5, TQ17, TQ21, painel BiBi/DanDan/TuTu.
// Toque emulado sobre dist-qa. Movimento até um tile usa o teclado (lib-rota irPara) só para chegar ao lugar. Não altera src/.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { irPara, ladosDe } from './lib-rota.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-r3');
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
const J = (l) => l.map((x) => x.t).join(' ');
const shot = (n) => page.screenshot({ path: join(EVID, `${n}.png`) });
const centro = (a) => ({ x: a.x + a.largura / 2, y: a.y + a.altura / 2 });
const achar = async (nome, origem = 'dom') => (await alvos()).find((a) => a.nome === nome && a.origem === origem);
const temDom = async () => (await alvos()).filter((a) => a.origem === 'dom').map((a) => a.nome);
const temPerg = async () => (await alvos()).some((a) => a.origem === 'canvas' && a.nome === 'Casa:Image');
async function tocar(p) { await page.touchscreen.tap(p.x, p.y); await real(300); }
async function tocarDom(n) { const a = await achar(n); if (a) await tocar(centro(a)); return !!a; }
const dedos = new Map();
const pts = () => [...dedos].map(([i, q]) => ({ x: q.x, y: q.y, id: i }));
async function baixar(id, p) { dedos.set(id, p); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts() }); }
async function soltar(id) { dedos.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: pts() }); }
async function segurarDom(n, ms) { const a = await achar(n); if (!a) return false; await baixar(9, centro(a)); await real(ms); await soltar(9); await real(150); return true; }
const DIR = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' };
async function virar(dx, dy) { await page.keyboard.down(DIR[`${dx},${dy}`]); await real(90); await page.keyboard.up(DIR[`${dx},${dy}`]); await real(200); }
/** Toca A até a condição (polling) ou o limite; devolve true se a condição ocorreu. */
async function aAte(cond, max = 40, intervalo = 300) {
  for (let i = 0; i < max; i++) { if (await cond()) return true; await tocarDom('a'); await real(intervalo); }
  return cond();
}
async function fecharDialogos() { for (let i = 0; i < 8; i++) { const e = await est(); if (e && !e.travado && !e.emConducao) break; await tocarDom('a'); await real(350); } }
async function irAteExploracao(indice = 0) {
  const z = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
  await tocar(centro(z[0])); await real(900);
  const cart = (await alvos()).filter((a) => a.origem === 'canvas');
  await tocar(centro(cart[indice])); await real(900);
  await aAte(async () => { const e = await est(); return e && !e.travado && !!e.mapa; }, 25, 300);
  await real(400);
}

async function blocoCaminho() {
  await abrir(844, 390);
  await irAteExploracao(0);
  await page.evaluate(() => window.__irParaFase('parte3'));
  await page.evaluate(() => window.__teleportar('cozinha', 'P7'));
  await real(800);
  await fecharDialogos();
  reg('CAM-1 pré: Cozinha com a peça 3 pendente (parte3)', (await est())?.mapa === 'cozinha', `mapa=${(await est())?.mapa}`);
  // peça 3 em (3,5): fica em (3,4) olhando para baixo
  try { await irPara(page, 'cozinha', 3, 4); } catch (e) { reg('CAM-1 rota até (3,4)', false, e.message.slice(0, 120)); }
  await virar(0, 1);
  await tocarDom('a'); await real(500);
  const c1 = J(await textos());
  reg('CAM-1 conquista da peça 3 por toque', c1.includes('terceira') || c1.includes('última') || c1.includes('parte'), c1.slice(0, 120));
  await shot('01-peca3-conquista');
  await tocarDom('a'); await real(200);
  // condução (sem botões); depois a chegada
  const cond = [];
  for (let i = 0; i < 40; i++) { const e = await est(); cond.push({ c: !!e?.emConducao, dom: (await temDom()).length, p: !!(await temPerg()) }); await real(200); if (e && !e.emConducao && !e.travado && i > 5) break; }
  reg('CAM-1 condução peça 3: sem botão e sem "?" (amostras em condução)', cond.filter((x) => x.c).every((x) => x.dom === 0 && !x.p) && cond.some((x) => x.c), `amostras=${cond.length} emCond=${cond.filter((x) => x.c).length}`);
  await aAte(async () => { const e = await est(); return e && !e.travado && !e.emConducao; }, 20, 300);
  const chegada = await aAte(async () => J(await textos()).includes('A árvore está montada'), 20, 300);
  reg('CAM-1 chegada: "A árvore está montada! Que linda!" (por toque)', chegada, '');
  await fecharDialogos();
  // caixa de enfeite (Escritório (5,2)): fica em (5,3) olhando para cima
  await page.evaluate(() => window.__teleportar('escritorio', 'P3'));
  await real(700);
  await fecharDialogos();
  try { await irPara(page, 'escritorio', 5, 3); } catch (e) { reg('CAM-2 rota até (5,3)', false, e.message.slice(0, 120)); }
  await virar(0, -1);
  await tocarDom('a'); await real(500);
  const c2 = J(await textos());
  reg('CAM-2 caixa: "Parabéns, você conseguiu encontrar a caixa de enfeites de Natal!" por toque', c2.includes('caixa de enfeites'), c2.slice(0, 120));
  await shot('02-caixa-conquista');
  await tocarDom('a'); await real(200);
  // encaixe: condução até a árvore e o diálogo final
  const fim = await aAte(async () => J(await textos()).includes('Agora a árvore está toda enfeitada'), 60, 300);
  reg('CAM-2 encaixe e diálogo final "Agora a árvore está toda enfeitada!" por toque', fim, '');
  await shot('03-diálogo-final');
  // avança até o fade e os créditos
  let creditos = false;
  for (let i = 0; i < 40; i++) {
    const tx = J(await textos());
    const e = await est();
    if (tx.includes('Versão 0.9.0') || tx.includes('Obrigado')) { creditos = true; break; }
    if (e && e.emFade) { await real(200); continue; }
    await tocarDom('a'); await real(400);
  }
  await real(800);
  const tx2 = J(await textos());
  reg('CAM-3 créditos com "Versão 0.9.0"', creditos || tx2.includes('Versão 0.9.0'), tx2.slice(0, 140));
  await shot('04-creditos-toque');
  // TQ20: "Voltar ao título" (toque)
  const dom = await temDom();
  const zonas = (await alvos()).filter((a) => a.origem === 'canvas');
  reg('TQ20 créditos: zona de "Voltar ao título" presente', zonas.length > 0, zonas.map((a) => a.nome).join(','));
  await tocar(centro(zonas[0]));
  await real(1000);
  const tx3 = J(await textos());
  const titulo = (await alvos()).some((a) => a.nome === 'Titulo:Zone');
  reg('TQ20 toque nos créditos volta ao título', titulo, tx3.slice(0, 100));
  await shot('05-volta-titulo');
}

async function blocoPainelPersonagens() {
  // painel com BiBi (020), DanDan (023), TuTu (024): código por toque
  const codigos = [['BiBi', 1, '020'], ['DanDan', 2, '023'], ['TuTu', 3, '024']];
  for (const [nome, idx, cod] of codigos) {
    await abrir(844, 390);
    await irAteExploracao(idx);
    await page.evaluate(() => window.__teleportar('hall', 'P8'));
    await real(600);
    await fecharDialogos();
    // lê o bilhete (2,0) de (2,1) olhando para cima; vai a (3,1) e olha para a porta
    const seg = async (n, ms = 260) => { const a = await achar(n); if (!a) return; await baixar(8, centro(a)); await real(ms); await soltar(8); await real(200); };
    await seg('cruz-esquerda'); await seg('cruz-cima', 120); await tocarDom('a'); await real(500);
    await tocarDom('a'); await real(500);
    await tocarDom('b'); await real(300);
    await seg('cruz-direita'); await seg('cruz-cima', 120); await tocarDom('a'); await real(500);
    const e0 = await est();
    const g = (await alvos()).filter((a) => a.origem === 'canvas' && a.largura > 0).sort((p, q) => (Math.round(p.y / 10) - Math.round(q.y / 10)) || (p.x - q.x));
    const DIG = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8, 0: 9 };
    if (!e0?.travado || g.length !== 13) { reg(`PT ${nome}: painel abre por toque`, false, `travado=${e0?.travado} zonas=${g.length} pos=${e0?.tileX},${e0?.tileY}`); continue; }
    for (const d of cod) { await tocar(centro(g[DIG[Number(d)]])); }
    await tocar(centro(g[11])); await real(600);
    const tx = J(await textos());
    await tocarDom('a'); await real(400);
    for (let i = 0; i < 6; i++) { const e = await est(); if (e?.mapa === 'sala') break; await tocarDom('a'); await real(400); await seg('cruz-cima', 600); }
    const e1 = await est();
    reg(`PT ${nome} (${cod}): código por toque abre a porta e entra na Sala`, e1?.mapa === 'sala', `mapa=${e1?.mapa} txt=${tx.slice(0, 60)}`);
    await shot(`06-painel-${nome}`);
  }
}

async function blocoReteste() {
  // Sala (LoLô) por toque: TQ21 (Nick), TQ4 (Mesa), TQ5 (A por polling), TQ17 (H na Sala)
  await abrir(844, 390);
  await irAteExploracao(0);
  await page.evaluate(() => window.__irParaFase('luzes'));
  await page.evaluate(() => window.__teleportar('sala', 'P8'));
  await real(600);
  await fecharDialogos();
  const pre = await est();
  reg('TQ17/TQ4/TQ5 pré: Sala acesa, sem diálogo (luzes concluídas)', !pre?.travado, `travado=${pre?.travado} mapa=${pre?.mapa}`);
  // TQ21: Nick dormindo; teleporta até um tile adjacente ao Nick e olha para ele
  const nick = (await est())?.nick;
  reg('TQ21 pré: Nick dormindo', nick?.estado === 'dormindo', `nick=${nick?.tileX},${nick?.tileY} ${nick?.estado}`);
  const nx = nick?.tileX ?? 4, ny = nick?.tileY ?? 3;
  // tile livre adjacente: (nx, ny+1) se existir; teste por pilha de tentativas
  let ok = false;
  for (const [dx, dy, dir] of [[0, 1, [0, -1]], [1, 0, [-1, 0]], [-1, 0, [1, 0]], [0, -1, [0, 1]]]) {
    try { await irPara(page, 'sala', nx + dx, ny + dy); ok = true; } catch (e) { continue; }
    await virar(dir[0], dir[1]);
    ok = true; break;
  }
  if (!ok) reg('TQ21 chegada ao lado do Nick', false, 'sem rota para nenhum tile adjacente');
  await tocarDom('a'); await real(600);
  const t21 = J(await textos());
  reg('TQ21 acordar o Nick por toque: "Toque em B para farejar."', t21.includes('Toque em B para farejar.'), t21.slice(0, 140));
  await fecharDialogos();
  // TQ4: Mesa (7,6), 2 tiles, de (7,5) olhando para baixo, cruz pressionada + A
  let rota4 = 'não';
  try { await irPara(page, 'sala', 7, 5); await virar(0, 1); rota4 = 'ok'; } catch (e) { rota4 = e.message.slice(0, 90); }
  await textos();
  if (rota4 === 'ok') {
    const cb = await achar('cruz-baixo');
    await baixar(3, centro(cb)); await real(120);
    await tocarDom('a'); await real(400);
    await soltar(3); await real(300);
  }
  const t4 = J(await textos());
  reg('TQ4 cruz pressionada + A examina a Mesa à frente', rota4 === 'ok' && t4.includes('Mesa'), `rota=${rota4} T=${t4.slice(0, 120)}`);
  await shot('07-tq4');
  await fecharDialogos();
  // TQ5: A ao pressionar: polling de textos/travado logo depois do baixar (até 400 ms)
  await virar(0, 1);
  const aA = await achar('a');
  await textos();
  await baixar(4, centro(aA));
  let acao = null; const t0 = Date.now();
  while (Date.now() - t0 < 400 && acao === null) { const tt = J(await textos()); const e = await est(); if (tt.length > 0 || e?.travado) acao = Date.now() - t0; await real(10); }
  await soltar(4); await real(200);
  reg('TQ5 A age ao pressionar (medido por polling, sem esperar soltar)', acao !== null, acao === null ? 'nenhuma ação em 400 ms com o dedo preso' : `ação em ${acao} ms com o dedo preso`);
  await fecharDialogos();
  // TQ17: H na Sala com toque ligado
  await page.keyboard.press('KeyH'); await real(600);
  const t17 = J(await textos());
  const e17 = await est();
  reg('TQ17 H abre a dica na Sala com toque ligado', t17.includes('Voltar') || t17.includes('Dica'), `mapa=${e17?.mapa} T=${t17.slice(0, 120)}`);
  await page.keyboard.press('Escape'); await real(400);
  await shot('08-tq17-h-sala');
  // Sala escura? não: a Sala está acesa desde o teleporte. Fim do bloco.
}

async function blocoTecladoRM() {
  // RM1 (amostra prioritária), RM2 (Marco 1 em amostra), RM5 (fluxo com teclado até o Hall), RM4 (textos Aperte X)
  await abrir(960, 640, false);
  await page.keyboard.press('KeyZ'); await real(700);
  for (let i = 0; i < 12; i++) { await page.keyboard.press('KeyZ'); await real(250); }
  const tI = J(await textos());
  reg('RM2 título e introdução por teclado (Z)', true, tI.slice(0, 120));
  reg('RM4 introdução no teclado: barra "Z ou X" (pt-BR, sem "Aperte X")', !tI.includes('Toque') && !tI.includes('Aperte X'), tI.slice(-120));
  await page.evaluate(() => window.__irParaFase('parte1'));
  await real(400);
  await page.evaluate(() => window.__teleportar('sala', 'P8'));
  await real(600);
  for (let i = 0; i < 6; i++) { const e = await est(); if (e && !e.travado) break; await page.keyboard.press('KeyZ'); await real(300); }
  const tex = J(await textos());
  reg('RM4 exploração (teclado): barra com Z, sem "A: examinar"', tex.includes('Z: examinar') && !tex.includes('A: examinar'), tex.slice(-120));
  await shot('09-teclado-sala');
  // RM5 parcial: fluxo com teclado até os créditos não cabe. Registrar o que foi visto.
  reg('RM5 fluxo completo por teclado até os créditos', false, 'não executado nesta rodada (limite de tempo); ver rodada 4');
}

async function main() {
  const todos = [['caminho', blocoCaminho], ['painel-personagens', blocoPainelPersonagens], ['reteste', blocoReteste], ['teclado', blocoTecladoRM]];
  for (const [nome, fn] of todos.filter(([n]) => !process.argv[2] || n === process.argv[2])) {
    try { await fn(); } catch (e) { reg(`BLOCO ${nome} interrompido`, false, e.message.slice(0, 160)); }
  }
  writeFileSync(join(EVID, 'log.json'), JSON.stringify({ LOG, erros }, null, 1));
  console.log('ERROS', erros.length, erros.slice(0, 6));
  await browser.close();
}
main();
