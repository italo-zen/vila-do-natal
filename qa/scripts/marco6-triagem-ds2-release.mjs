// DS2 com compressão (gzip, como um servidor de Pages): mesma rede emulada. Só observa.
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const html = readFileSync(resolve(RAIZ, 'dist-release', 'index.html'));
const gz = gzipSync(html);
const srv = createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html', 'content-encoding': 'gzip', 'content-length': gz.length }); res.end(gz); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${srv.address().port}/`;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const desenhado = (p) => p.evaluate(() => { const c = document.querySelector('canvas'); if (!c) return false; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 0; i < d.length; i += 4) if (d[i] !== 11 || d[i + 1] !== 16 || d[i + 2] !== 48) return true; return false; }).catch(() => false);
const medidas = [];
for (let k = 0; k < 3; k++) {
  const c = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await c.newPage(); const cdp = await c.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  const t0 = Date.now(); p.goto(url).catch(() => null);
  let ms = -1; for (let i = 0; i < 800; i++) { if (await desenhado(p)) { ms = Date.now() - t0; break; } await real(25); }
  medidas.push(ms); await c.close();
}
const max = Math.max(...medidas);
console.log(`${max >= 0 && max <= 4000 ? 'OK   ' : 'FALHA'} DS2 com gzip (HTML ${(gz.length / 1024).toFixed(0)} KB comprimido) em Fast 4G: ≤ 4 s :: ${medidas.join(' / ')} ms`);
await b.close(); srv.close();
