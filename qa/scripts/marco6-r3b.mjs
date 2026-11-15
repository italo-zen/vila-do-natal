// DS2 (Fast 4G real, servidor HTTP local com CDP) e AU7 (aviso de rotação em toque, sem som). Só observa.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { servirPasta, tecla } from './lib.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco6-r3'); mkdirSync(EVID, { recursive: true });
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const { srv, url } = await servirPasta(resolve(RAIZ, 'dist-qa'));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const desenhado = (p) => p.evaluate(() => { const c = document.querySelector('canvas'); if (!c) return false; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 0; i < d.length; i += 4) if (d[i] !== 11 || d[i + 1] !== 16 || d[i + 2] !== 48) return true; return false; }).catch(() => false);
const medidas = [];
for (let k = 1; k <= 3; k++) {
  const c = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await c.newPage(); const cdp = await c.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  const t0 = Date.now(); p.goto(url).catch(() => null);
  let ms = -1; for (let i = 0; i < 800; i++) { if (await desenhado(p)) { ms = Date.now() - t0; break; } await real(25); }
  medidas.push(ms); await c.close();
}
const max = Math.max(...medidas);
console.log(`${max >= 0 && max <= 4000 ? 'OK   ' : 'FALHA'} DS2 título desenhado com Fast 4G (servidor HTTP, 1,6 Mbps, 150 ms) em ≤ 4 s :: ${medidas.join(' / ')} ms`);
// AU7: aviso de rotação em toque: sem som
const c = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await c.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await real(2000);
const ev = async () => (await p.evaluate(() => window.__estado()))?.audio?.ultimosEventos?.length ?? 0;
await p.touchscreen.tap(20, 360); await real(500);
await p.setViewportSize({ width: 390, height: 844 }); await real(1500);
const aviso = await p.evaluate(() => { const el = document.getElementById('aviso-de-rotacao'); return el ? getComputedStyle(el).display : 'ausente'; });
const e0 = await ev(); await real(1500); const e1 = await ev();
await p.screenshot({ path: join(EVID, 'au7-aviso-rotacao.png') });
console.log(`${aviso !== 'none' && aviso !== 'ausente' && e0 === e1 ? 'OK   ' : 'FALHA'} AU7 aviso de rotação sem som (aviso=${aviso}; eventos ${e0}→${e1} em 1,5 s)`);
await c.close(); await b.close(); srv.close();
