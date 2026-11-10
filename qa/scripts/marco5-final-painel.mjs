// TQ27-PAI: painel de código sem joystick (teclado para chegar, captura e __alvosDeToque). Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { tecla } from './lib.mjs';
import { estado } from './lib-rota.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-final2');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [W, H] of [[844, 390], [667, 375]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await real(2200);
  // Começar (zona 0) e BiBi (cartão 1) por toque, depois A por toque até a exploração
  const z = await p.evaluate(() => window.__alvosDeToque().filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone'));
  await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(700);
  const cs = await p.evaluate(() => window.__alvosDeToque().filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao')));
  await p.touchscreen.tap(cs[1].x + 20, cs[1].y + 20); await real(800);
  for (let i = 0; i < 25; i++) { const st = await estado(p).catch(() => null); if (st && !st.travado && st.mapa) break; const a = (await p.evaluate(() => window.__alvosDeToque())).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); await real(300); }
  await p.evaluate(() => window.__teleportar('hall', 'P8')); await real(700);
  for (let i = 0; i < 4; i++) { const q = await estado(p).catch(() => null); if (!q?.travado) break; await tecla(p, 'z', { ms: 90, pausa: 300 }); }
  // bilhete em (2,0): de (2,1) olhando para cima, Z; depois (3,1) olhando para cima (porta), Z
  await tecla(p, 'ArrowLeft', { ms: 260, pausa: 200 });
  await tecla(p, 'ArrowUp', { ms: 150, pausa: 200 });
  await tecla(p, 'z', { ms: 90, pausa: 500 }); await tecla(p, 'z', { ms: 90, pausa: 500 });
  for (let i = 0; i < 4; i++) { const q = await estado(p).catch(() => null); if (!q?.travado) break; await tecla(p, 'z', { ms: 90, pausa: 300 }); }
  await tecla(p, 'ArrowRight', { ms: 260, pausa: 200 });
  await tecla(p, 'ArrowUp', { ms: 150, pausa: 200 });
  await tecla(p, 'z', { ms: 90, pausa: 500 });
  const st = await estado(p).catch(() => null);
  const alvos = await p.evaluate(() => window.__alvosDeToque());
  const base = alvos.some((a) => a.nome === 'analogico');
  const grade = alvos.filter((a) => a.origem === 'canvas' && a.largura > 0).length;
  await p.screenshot({ path: join(EVID, `${W}x${H}-TQ27-painel.png`) });
  console.log(`${st?.travado && !base ? 'OK   ' : 'FALHA'} ${W}x${H} TQ27-PAI painel: travado=${st?.travado} base=${base} zonas=${grade}`);
  await ctx.close();
}
await b.close();
