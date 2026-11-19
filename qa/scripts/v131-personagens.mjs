// 1.3.1: caminhada em 4 quadros a 8 fps, parado nas 4 direções, sombra e Nick (capturas em tools-arte/preview/personagens-1-3-1).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href + '?plano=referencia';
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 704 } })).newPage();
const erros = []; p.on('pageerror', (e) => erros.push(String(e)));
await p.goto(url); await p.waitForSelector('canvas'); await sl(1500);
const out = 'tools-arte/preview/personagens-1-3-1';
await p.evaluate(() => { window.__partidaConcluida('lolo', true); window.__irPara('Casa', { modo: 'explorar' }); }); await sl(1500);
await p.evaluate(() => window.__teleportar('sala', 'hall-sala')); await sl(500);
for (const d of ['baixo', 'cima', 'esquerda', 'direita']) { await p.evaluate((x) => window.__posicionar(5, 4, x), d); await sl(300); await p.screenshot({ path: `${out}/parado-${d}.png`, clip: { x: 200, y: 200, width: 400, height: 300 } }); }
await p.evaluate(() => window.__posicionar(1, 4, 'direita'));
await p.keyboard.down('ArrowRight');
const vistos = []; const t0 = Date.now();
while (Date.now() - t0 < 1000) { const im = await p.evaluate(() => window.__imagens('_walk_')); if (im[0]) vistos.push([Date.now() - t0, String(im[0].quadro)]); await sl(15); }
await p.screenshot({ path: `${out}/andando.png`, clip: { x: 200, y: 200, width: 400, height: 300 } });
await p.keyboard.up('ArrowRight');
const quadros = [...new Set(vistos.map((v) => v[1]))];
const trocas = vistos.filter((v, i) => i && v[1] !== vistos[i - 1][1]).length;
console.log(JSON.stringify({ erros: erros.length, quadrosVistos: quadros, trocasEm1s: trocas }));
await b.close();
