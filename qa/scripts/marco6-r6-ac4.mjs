// AC4 (critério aceito): pares de inversões de luminância do canvas com variação ≥ 10% por segundo (limite 3/s), nos 5 cômodos. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const c = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
const p = await c.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await real(2000);
const z = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(700);
const cs = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao:Zone') && a.altura > 100);
await p.touchscreen.tap(cs[0].x + 20, cs[0].y + 20); await real(800);
for (let i = 0; i < 25; i++) { const st = await p.evaluate(() => window.__estado()); if (st?.mapa && !st.travado) break; const a = (await p.evaluate(() => window.__alvosDeToque())).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2); await real(250); }
const lum = () => p.evaluate(() => { const cv = document.querySelector('canvas'); const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let s = 0; for (let i = 0; i < d.length; i += 16) s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; return s / (d.length / 16); });
const regiao = () => p.evaluate(() => { const cv = document.querySelector('canvas'); const d = cv.getContext('2d').getImageData(230, 132, 20, 24).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; return s / (d.length / 4); });
const areas = [['hall', 'P8'], ['sala', 'P8'], ['cozinha', 'P7'], ['quarto', 'P2'], ['escritorio', 'P3']];
const pares = []; let outro = [];
for (const [m, s] of areas) {
  if (m === 'quarto') await p.evaluate(() => window.__irParaFase('parte2'));
  if (m === 'escritorio') await p.evaluate(() => window.__irParaFase('parte3'));
  await p.evaluate(([a, sp]) => window.__teleportar(a, sp), [m, s]); await real(900);
  const L = []; for (let i = 0; i < 80; i++) { L.push(await lum()); await real(50); }
  const mean = L.reduce((a, x) => a + x, 0) / L.length;
  const R = []; for (let i = 0; i < 80; i++) { R.push(await regiao()); await real(50); }
  const rmean = R.reduce((a, x) => a + x, 0) / R.length; let rt = 0; let rd = null; let rr = R[0];
  for (let i = 1; i < R.length; i++) { const dd = R[i] - R[i - 1]; if (rd === null) { if (Math.abs(R[i] - rr) >= 0.1 * rmean) { rd = R[i] > rr; rr = R[i]; } continue; } if (rd && dd < 0) { if (rr - R[i - 1] >= 0.1 * rmean) { rt++; rd = false; rr = R[i - 1]; } else if (R[i] > rr) rr = R[i]; } else if (!rd && dd > 0) { if (R[i - 1] - rr >= 0.1 * rmean) { rt++; rd = true; rr = R[i - 1]; } else if (R[i] < rr) rr = R[i]; } }
  pares.push(`${m} região do bilhete (230..249,132..155): inversões=${rt} (${(rt / 2 / 4).toFixed(2)} ciclos/s)`);
  // inversões: extremos locais com amplitude ≥ 10% do valor médio desde o extremo anterior
  let turns = 0; let dirUp = null; let ref = L[0];
  for (let i = 1; i < L.length; i++) {
    const d = L[i] - L[i - 1];
    if (dirUp === null) { if (Math.abs(L[i] - ref) >= 0.1 * mean) { dirUp = L[i] > ref; ref = L[i]; } continue; }
    if (dirUp && d < 0) { if (ref - L[i - 1] >= 0.1 * mean) { turns++; dirUp = false; ref = L[i - 1]; } else if (L[i] > ref) ref = L[i]; }
    else if (!dirUp && d > 0) { if (L[i - 1] - ref >= 0.1 * mean) { turns++; dirUp = true; ref = L[i - 1]; } else if (L[i] < ref) ref = L[i]; }
  }
  const ciclosPorSeg = (turns / 2) / 4;
  pares.push(`${m}: inversões=${turns} (${ciclosPorSeg.toFixed(2)} ciclos/s, média ${mean.toFixed(1)})`);
}
const max = pares.map((x) => parseFloat(x.match(/\(([\d.]+) ciclos/)[1])).reduce((a, x) => Math.max(a, x), 0);
console.log(`${max <= 3 ? 'OK   ' : 'FALHA'} AC4 pisca nos 5 cômodos (limite 3 ciclos/s, variação ≥ 10%): máx ${max.toFixed(2)} ciclos/s :: ${pares.join(' | ')}`);
await c.close(); await b.close();
