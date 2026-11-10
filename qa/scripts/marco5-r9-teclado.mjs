// Regressão rápida dos menus no teclado (960×640): setas e Z/X, foco por __focoDoMenu. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { tecla } from './lib.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 640 } })).newPage();
await p.goto(url); await p.waitForSelector('canvas'); await new Promise((r) => setTimeout(r, 2200));
const f = () => p.evaluate(() => window.__focoDoMenu());
const reg = (id, ok, n = '') => console.log(`${ok ? 'OK   ' : 'FALHA'} ${id} :: ${n}`);
reg('teclado título: foco 0', (await f())?.foco === 0, JSON.stringify(await f()));
await tecla(p, 'ArrowDown', { ms: 90, pausa: 300 }); reg('teclado título: seta baixo → foco 1', (await f())?.foco === 1, JSON.stringify(await f()));
await tecla(p, 'ArrowUp', { ms: 90, pausa: 300 }); reg('teclado título: seta cima → foco 0', (await f())?.foco === 0, JSON.stringify(await f()));
await tecla(p, 'KeyZ', { ms: 90, pausa: 500 }); reg('teclado: Z em Começar → Seleção', (await f())?.cena === 'Selecao', JSON.stringify(await f()));
await tecla(p, 'ArrowRight', { ms: 90, pausa: 300 }); reg('teclado seleção: seta direita → cartão 1', (await f())?.foco === 1, JSON.stringify(await f()));
await tecla(p, 'KeyX', { ms: 90, pausa: 500 }); reg('teclado: X volta ao título', (await f())?.cena === 'Titulo', JSON.stringify(await f()));
await b.close();
