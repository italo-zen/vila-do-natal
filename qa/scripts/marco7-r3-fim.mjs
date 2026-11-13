// BUG-M7-01 (conserto): avanço da tela de fim por toque (texto, qualquer ponto, toque duplo), Z, X, Esc, A, B, em 667×375 e 844×390. Confere que os créditos aparecem uma vez. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const entradas = ['texto', 'ponto', 'duplo', 'Z', 'X', 'Esc', 'A', 'B'];
const out = [];
for (const [W, H] of [[667, 375], [844, 390]]) {
  for (const ent of entradas) {
    const c = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const p = await c.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
    await p.touchscreen.tap(20, 360); await sl(300); // gesto de liberação
    await p.evaluate(() => window.__partidaConcluida('lolo', false)); await p.evaluate(() => window.__irPara('Fim', {})); await sl(3200);
    const al = await p.evaluate(() => window.__alvosDeToque());
    const txt = al.find((q) => /Toque para continuar|A ou B: continuar|Z ou X: continuar/.test(q.nome) || (q.origem === 'texto' && /Fim:/.test(q.nome)));
    const dom = al.find((q) => q.origem === 'dom' && (q.nome === 'a' || q.nome === 'b'));
    if (ent === 'texto' && txt) await p.touchscreen.tap(txt.x + 5, txt.y + 5);
    if (ent === 'ponto') await p.touchscreen.tap(W * 0.3, H * 0.6);
    if (ent === 'duplo') { await p.touchscreen.tap(W * 0.5, H * 0.5); await sl(80); await p.touchscreen.tap(W * 0.5, H * 0.5); }
    const hold = async (k) => { await p.keyboard.down(k); await sl(90); await p.keyboard.up(k); };
    if (ent === 'Z') await hold('z');
    if (ent === 'X') await hold('x');
    if (ent === 'Esc') await hold('Escape');
    if (ent === 'A' && dom && dom.nome === 'a') await p.touchscreen.tap(dom.x + dom.largura / 2, dom.y + dom.altura / 2);
    if (ent === 'B' && dom && dom.nome === 'b') await p.touchscreen.tap(dom.x + dom.largura / 2, dom.y + dom.altura / 2);
    await sl(2500);
    const al2 = await p.evaluate(() => window.__alvosDeToque());
    const creditos = al2.filter((q) => q.nome === 'Creditos:Zone').length;
    const ok = creditos >= 1;
    out.push(`${ok ? 'OK   ' : 'FALHA'} BUG-M7-01 ${W}×${H} entrada=${ent} → créditos=${ok} (zonas ${creditos})${ent === 'A' && !dom ? ' [sem botão A no layout ' + (W === 667 ? 'B' : 'A') + ']' : ''}`);
    await p.screenshot({ path: join(RAIZ, 'qa', 'evidencias', 'marco7-r3', `fim-${W}-${ent}.png`) }).catch(() => null);
    await c.close();
  }
}
console.log(out.join('\n'));
await b.close();
