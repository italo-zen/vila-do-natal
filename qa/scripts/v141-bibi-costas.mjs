// 1.4.1: BiBi de costas (parada e andando) sem furos, no jogo. Saída: tools-arte/preview/personagens-1-3-1/bibi-costas*.png
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href + '?plano=referencia';
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 704 }, deviceScaleFactor: 2 })).newPage();
await p.goto(url); await p.waitForSelector('canvas'); await sl(1500);
await p.evaluate(() => { window.__partidaConcluida('bibi', true); window.__irPara('Casa', { modo: 'explorar' }); }); await sl(1500);
await p.evaluate(() => window.__teleportar('sala', 'hall-sala')); await sl(500);
const e = await p.evaluate(() => window.__estado());
await p.evaluate(() => window.__posicionar(5, 4, 'cima')); await sl(300);
const out = 'tools-arte/preview/personagens-1-3-1';
const clip = { x: 320, y: 230, width: 240, height: 200 };
await p.screenshot({ path: `${out}/bibi-costas-parada.png`, clip });
await p.keyboard.down('ArrowUp'); await sl(160); await p.screenshot({ path: `${out}/bibi-costas-andando.png`, clip }); await p.keyboard.up('ArrowUp');
console.log('ok', e.mapa);
await b.close();
