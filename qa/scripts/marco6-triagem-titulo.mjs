// Triagem: a imagem do título aparece depois de quanto tempo (captura em 1 s e 4 s) no build de QA? Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync, readFileSync } from 'node:fs';
import { decodificarPng } from '../../tools/png.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'triagem-r1'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await chromium.launch({ channel: 'chrome', headless: true });
const c = await b.newContext({ viewport: { width: 960, height: 640 }, deviceScaleFactor: 1 });
const p = await c.newPage(); const t0 = Date.now(); await p.goto(url); await p.waitForSelector('canvas');
const dist = async () => { const f = join(EVID, `titulo-t${Date.now() - t0}.png`); await p.screenshot({ path: f }); const img = decodificarPng(readFileSync(f)); let n = 0; for (let i = 0; i < img.rgba.length; i += 4) if (img.rgba[i] !== 11 || img.rgba[i + 1] !== 16 || img.rgba[i + 2] !== 48) n++; return n; };
for (const ms of [800, 2500, 5000]) { await p.waitForTimeout(ms - (Date.now() - t0) > 0 ? ms - (Date.now() - t0) : 0); console.log(`t=${Date.now() - t0} ms: pixels fora do fundo = ${await dist()}`); }
await b.close();
