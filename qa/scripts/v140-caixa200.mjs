// QA 1.4.0: semente 200 (caixa no Escritório (4,1)): __irACaixa na hora certa (Casa ativa, fase enfeites) e fora de hora.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href + '?semente=200';
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 704 } })).newPage();
await p.goto(url); await p.waitForSelector('canvas'); await sl(1500);
await p.evaluate(() => { window.__novaPartida('lolo', 200); window.__irPara('Casa', { modo: 'intro' }); }); await sl(1400);
console.log('plano.caixa', JSON.stringify((await p.evaluate(() => window.__plano())).caixa));
await p.evaluate(() => window.__irParaFase('enfeites')); await sl(300);
console.log('estado', JSON.stringify(await p.evaluate(() => window.__estadoDaPartida())));
console.log('irACaixa', JSON.stringify(await p.evaluate(() => window.__irACaixa())));
await p.evaluate(() => window.__irPara('Fim', {})); await sl(800);
console.log('fora de hora (Fim ativa):', JSON.stringify(await p.evaluate(() => [window.__irACaixa(), window.__estadoDaPartida().casaAtiva])));
await b.close();
