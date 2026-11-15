// Fluxo completo por TOQUE (667×375 e 844×390): título → seleção → introdução → exploração (fase por atalho) → fim → créditos → Explorar a casa → pausa → Voltar ao título → Sim → título. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [W, H] of [[667, 375], [844, 390]]) {
  const tag = `${W}x${H}`; const passos = []; const sem = [];
  const c = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await c.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
  const al = () => p.evaluate(() => window.__alvosDeToque());
  const est = () => p.evaluate(() => window.__estado()).catch(() => null);
  const tapA = async (a) => { if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); };
  const ok = (id, cond, n = '') => { passos.push(`${cond ? 'OK  ' : 'FALHA'} ${id} ${n}`); return cond; };
  // título por toque
  let z = (await al()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
  ok('título: Começar por toque', z.length >= 1, `zonas=${z.length}`);
  await tapA(z[0]); await sl(900);
  // seleção por toque
  let cs = (await al()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao:Zone') && a.altura > 100);
  ok('seleção: 4 cartões tocáveis', cs.length === 4, `n=${cs.length}`);
  await tapA(cs[1]); await sl(900);
  // introdução e exploração por toque (A)
  for (let i = 0; i < 25; i++) { const st = await est(); if (st?.mapa && !st.travado) break; const a = (await al()).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await tapA(a); else await p.touchscreen.tap(W / 2, H / 2); await sl(300); }
  const e1 = await est();
  ok('introdução → exploração por toque (A)', e1?.mapa === 'hall', `mapa=${e1?.mapa}`);
  // fase por atalho e fim
  await p.evaluate(() => window.__partidaConcluida('lolo', false)); await p.evaluate(() => window.__irPara('Fim', {})); await sl(3200);
  const alv = await al();
  const fimTexto = alv.some((q) => q.nome === 'Fim:Zone' || /Fim:/.test(q.nome));
  if (!fimTexto) sem.push('fim sem zona de toque');
  await p.touchscreen.tap(W / 2, H / 2); await sl(1500);
  let cr = (await al()).filter((a) => a.nome === 'Creditos:Zone');
  ok('fim → créditos por toque (qualquer ponto)', cr.length >= 1, `zonas=${cr.length}`);
  // créditos: Explorar a casa (zona 2)
  const crz = (await al()).filter((a) => a.origem === 'canvas' && a.nome === 'Creditos:Zone').sort((x, y) => x.y - y.y);
  if (crz[1]) await tapA(crz[1]); await sl(1800);
  const e2 = await est();
  ok('créditos → Explorar a casa por toque', e2?.mapa === 'sala' && e2?.tileX === 3 && e2?.tileY === 7, `mapa=${e2?.mapa} tile=${e2?.tileX},${e2?.tileY}`);
  const alvE = await al();
  const ii = alvE.find((q) => q.nome === 'icone-pausa');
  ok('modo explorar: II (pausa) por toque presente', !!ii, '');
  await tapA(ii); await sl(600);
  const e3 = await est();
  ok('II abre a pausa por toque', e3?.pausa?.aberta === true, JSON.stringify(e3?.pausa));
  const pz = (await al()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Pausa:') && a.largura > 100 && a.altura >= 40 && a.altura < 80).sort((x, y) => x.y - y.y);
  await tapA(pz[3]); await sl(500);
  const e4 = await est();
  ok('"Voltar ao título" (pausa) por toque pede confirmação', e4?.pausa?.visao === 'confirmacao', JSON.stringify(e4?.pausa));
  const sim = (await al()).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Pausa:') && a.largura > 60 && a.altura >= 40 && a.altura < 80).sort((x, y) => x.x - y.x);
  await tapA(sim[0]); await sl(1800);
  const titulo = (await al()).some((a) => a.nome === 'Titulo:Zone');
  ok('"Sim" por toque volta ao título', titulo, '');
  console.log(`--- ${tag} ---`); passos.forEach((x) => console.log(x)); if (sem.length) console.log('sem ação por toque:', sem.join('; '));
  await c.close();
}
await b.close();
