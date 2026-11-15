// Modo explorar por toque (844×390 e 667×375): créditos → Explorar a casa; joystick, A, B; ícones pausa e som sem colisão; pausa → Voltar ao título com confirmação; novo começo sem herdar o modo. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { sleep } from './lib.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco7-r2', 'toque'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const log = (id, ok, n = '') => console.log(`${ok ? 'OK   ' : 'FALHA'} ${id} :: ${n}`);
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [W, H] of [[844, 390], [667, 375]]) {
  const tag = `${W}x${H}`;
  const c = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await c.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await sleep(2000);
  const al = () => p.evaluate(() => window.__alvosDeToque());
  const est = () => p.evaluate(() => window.__estado()).catch(() => null);
  const tap = async (a) => { if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); };
  await p.touchscreen.tap(20, 360); await sleep(400);
  await p.evaluate(() => window.__partidaConcluida('lolo', false));
  await p.evaluate(() => window.__irPara('Fim', {})); await sleep(3500);
  const fimEv = (await est())?.audio?.ultimosEventos?.filter((e) => e.evento === 'JC').length ?? 0;
  log(`${tag} fim por toque: JC uma vez`, fimEv === 1, `JC=${fimEv}`);
  const adv = (await al()).find((q) => q.origem === 'dom' && q.nome === 'a'); if (adv) await tap(adv); else await p.keyboard.press('z'); await sleep(900);
  if (!adv) { await p.keyboard.press('z'); await sleep(900); }
  const cr = (await al()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Creditos:Zone'));
  log(`${tag} créditos: zonas do menu (2 itens)`, cr.length >= 2, `zonas=${cr.length}`);
  if (cr[1]) await tap(cr[1]); await sleep(1800);
  const e1 = await est();
  log(`${tag} "Explorar a casa" por toque leva à Sala (3,7), Nick acordado`, e1?.mapa === 'sala' && e1?.tileX === 3 && e1?.tileY === 7, `mapa=${e1?.mapa} tile=${e1?.tileX},${e1?.tileY} nick=${e1?.nick?.estado}`);
  const alv = await al();
  const nomes = alv.map((a) => a.nome);
  log(`${tag} modo explorar: sem "?" e sem dica (Casa:Image ausente)`, !nomes.includes('Casa:Image'), nomes.filter((n) => /icone|Casa|analogico/.test(n)).join(','));
  const pausa = alv.find((a) => a.nome === 'icone-pausa'); const som = alv.find((a) => a.nome === 'icone-som');
  const an = alv.find((a) => a.nome === 'analogico'); const aa = alv.find((a) => a.nome === 'a' && a.origem === 'dom'); const bb = alv.find((a) => a.nome === 'b' && a.origem === 'dom');
  const cols = [];
  const rect = (x) => x && { x0: x.x, x1: x.x + x.largura, y0: x.y, y1: x.y + x.altura };
  const sobrepoe = (q, r) => q && r && q.x0 < r.x1 && q.x1 > r.x0 && q.y0 < r.y1 && q.y1 > r.y0;
  for (const [n, a] of [['II', pausa], ['som', som], ['joy', an], ['A', aa], ['B', bb]]) if (a) for (const [m, o] of [['II', pausa], ['som', som], ['joy', an], ['A', aa], ['B', bb]]) if (n < m && a && o && sobrepoe(rect(a), rect(o))) cols.push(`${n}×${m}`);
  log(`${tag} ícones, joystick, A e B sem colisão entre si`, cols.length === 0, `colisões=${cols.join(',') || 'nenhuma'}`);
  await p.screenshot({ path: join(EVID, `${tag}-explorar-toque.png`) });
  // joystick: empurrão para a esquerda com a base e A/B tocando
  if (an) { const cx = an.x + an.largura / 2, cy = an.y + an.altura / 2; await p.evaluate(() => 0); await p.touchscreen.tap(cx, cy).catch(() => null); }
  const xs0 = (await est())?.centroX;
  const cdp = await c.newCDPSession(p);
  if (an) { const cx = an.x + an.largura / 2, cy = an.y + an.altura / 2; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 9 }] }); await sleep(60); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - 30, y: cy, id: 9 }] }); await sleep(500); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(200); }
  const xs1 = (await est())?.centroX;
  log(`${tag} joystick anda na exploração livre (esquerda)`, xs0 !== undefined && xs1 !== undefined && xs1 < xs0 - 10, `x ${xs0} → ${xs1}`);
  // pausa pelo II por toque e saída "Voltar ao título" com confirmação
  const ii = (await al()).find((a) => a.nome === 'icone-pausa');
  if (ii) await tap(ii); await sleep(500);
  const pz = (await al()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Pausa:'));
  const e2 = await est();
  log(`${tag} II por toque abre a pausa`, e2?.pausa?.aberta === true, JSON.stringify(e2?.pausa));
  const vt = pz.find((a) => /Voltar ao título|Voltar/.test(a.nome)) ?? pz[pz.length - 1];
  // Voltar ao título: 4º item (índice 3), por toque
  const itens = pz.filter((a) => a.largura > 100 && a.altura >= 40 && a.altura < 80).sort((x, y) => x.y - y.y);
  if (itens[3]) await tap(itens[3]); await sleep(500);
  const e3 = await est();
  log(`${tag} "Voltar ao título" pede confirmação`, e3?.pausa?.visao === 'confirmacao' && e3?.pausa?.foco === 1, JSON.stringify(e3?.pausa));
  const sim = (await al()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Pausa:') && a.largura > 60 && a.altura >= 40 && a.altura < 80).sort((x, y) => x.x - y.x);
  if (sim[0]) await tap(sim[0]); await sleep(1800);
  const e4 = await est();
  const titulo = (await al()).some((a) => a.nome === 'Titulo:Zone');
  log(`${tag} "Sim" leva ao título`, titulo, `titulo=${titulo}`);
  // novo começo: Começar → seleção → intro → exploração e checar que não herda o modo (dica/?) e o estado
  const z = (await al()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
  await tap(z[0]); await sleep(800);
  const cs = (await al()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao:Zone') && a.altura > 100);
  if (cs[1]) await tap(cs[1]); await sleep(900);
  for (let i = 0; i < 25; i++) { const st = await est(); if (st?.mapa && !st.travado) break; const a = (await al()).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await tap(a); await sleep(300); }
  await sleep(500);
  const e5 = await est();
  const nomes2 = (await al()).map((a) => a.nome);
  log(`${tag} novo começo não herda o modo explorar (modo normal: "?" presente e Hall)`, e5?.mapa === 'hall' && nomes2.includes('Casa:Image'), `mapa=${e5?.mapa} modo=${JSON.stringify(e5?.modo)} ?=${nomes2.includes('Casa:Image')}`);
  await c.close();
}
await b.close();
