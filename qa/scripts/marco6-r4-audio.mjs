// AU3 e AU5 (gancho audio), e AU4 com mudo: eventos de passo, troca de área e limite de 3 efeitos. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { tecla } from './lib.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 960, height: 640 } });
const p = await ctx.newPage(); await p.goto(url); await p.waitForSelector('canvas'); await real(2000);
const est = () => p.evaluate(() => window.__estado());
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 }); await tecla(p, 'KeyZ', { ms: 90, pausa: 400 });
for (let i = 0; i < 14; i++) { const s = await est(); if (s?.mapa && !s.travado) break; await tecla(p, 'KeyZ', { ms: 90, pausa: 350 }); }
await p.evaluate(() => window.__teleportar('hall', 'P8')); await real(700);
for (let i = 0; i < 4; i++) { const s = await est(); if (!s?.travado) break; await tecla(p, 'KeyZ', { ms: 90, pausa: 300 }); }
const a0 = (await est())?.audio?.ultimosEventos ?? [];
await p.keyboard.down('ArrowLeft'); await real(700); await p.keyboard.up('ArrowLeft'); await real(300);
const a1 = (await est())?.audio;
console.log(`AU3 passos: eventos após andar 0,7 s = ${JSON.stringify(a1?.ultimosEventos).slice(0, 200)}`);
const pass = (a1?.ultimosEventos ?? []).filter((e) => /S01|passo/i.test(JSON.stringify(e))).length;
console.log(`${pass > 0 ? 'OK   ' : 'FALHA'} AU3 S01 (passo) registrado ao andar`);
// AU5: 3 efeitos ao mesmo tempo: andar e trocar de área rápido
for (let k = 0; k < 4; k++) { await p.keyboard.down('ArrowRight'); await real(260); await p.keyboard.up('ArrowRight'); }
const a2 = (await est())?.audio;
console.log(`AU5 vozes ativas após andar rápido: vozes=${a2?.vozes} (limite 3)`);
console.log(`${(a2?.vozes ?? 0) <= 3 ? 'OK   ' : 'FALHA'} AU5 no máximo 3 efeitos`);
// AU4: mudo com M -> música para (gancho)
await tecla(p, 'KeyM', { ms: 90, pausa: 400 });
const m = (await est())?.audio;
console.log(`${m?.mudo === true && m?.musica !== 'tocando' ? 'OK   ' : 'FALHA'} AU4 M liga o mudo e a música para (musica=${m?.musica}, mudo=${m?.mudo})`);
await tecla(p, 'KeyM', { ms: 90, pausa: 400 });
await b.close();
