// Triagem: título na build de release (servida por HTTP, modo externo) e no playtest (file://): há pixels de imagem após 4 s? Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { servirPasta } from '../../qa/scripts/lib.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const b = await chromium.launch({ channel: 'chrome', headless: true });
const conta = async (url) => {
  const c = await b.newContext({ viewport: { width: 960, height: 640 } }); const p = await c.newPage();
  const erros = []; p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text().slice(0, 120)); });
  await p.goto(url); await p.waitForSelector('canvas'); await p.waitForTimeout(4000);
  const n = await p.evaluate(() => { const cv = document.querySelector('canvas'); const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let k = 0; for (let i = 0; i < d.length; i += 4) if (d[i] !== 11 || d[i + 1] !== 16 || d[i + 2] !== 48) k++; return k; });
  await c.close(); return { n, erros: erros.slice(0, 2) };
};
const { srv, url: http } = await servirPasta(join(RAIZ, 'dist-release'));
console.log('release (HTTP):', JSON.stringify(await conta(http)));
srv.close();
console.log('playtest (file://):', JSON.stringify(await conta(pathToFileURL(resolve(RAIZ, 'dist-playtest', 'index.html')).href)));
await b.close();
