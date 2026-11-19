import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 704 } })).newPage();
await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
await p.evaluate(() => { window.__partidaConcluida('lolo', false); window.__irPara('Fim', {}); }); await sl(3200);
await p.mouse.click(480, 352); await sl(1500);
const crz = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.nome === 'Creditos:Zone').sort((x, y) => x.y - y.y);
await p.mouse.click(crz[1].x + crz[1].largura / 2, crz[1].y + crz[1].altura / 2); await sl(1800);
await p.evaluate(() => window.__abrirTodasAsAreas());
const shot = async (nome, m, sp, x, y, d = 'baixo') => { await p.evaluate(([a, c]) => window.__teleportar(a, c), [m, sp]); await sl(700); await p.evaluate(([a, c, e]) => window.__posicionar(a, c, e), [x, y, d]); await sl(300); await p.screenshot({ path: `qa/evidencias/v130/transp-${nome}.png` }); };
await shot('forno-0', 'cozinha', 'cozinha-sala', 4, 0); await shot('armario-0', 'cozinha', 'cozinha-sala', 5, 0); await shot('armario-1', 'cozinha', 'cozinha-sala', 5, 1); await shot('armario-2', 'cozinha', 'cozinha-sala', 5, 2);
await shot('lavaroupas-3', 'cozinha', 'cozinha-sala', 4, 3);
for (const [n, x, y] of [[ 'cacto-quina-oeste', 0, 3], ['cacto-norte', 0, 2], ['cacto-quina-1-3', 1, 3]]) await shot(n, 'sala', 'cozinha-sala', x, y);
for (const [m, s] of [['banheiro1', 'banheiro1-quarto'], ['banheiro_escritorio', 'banheiro_escritorio-escritorio'], ['quarto_casal', 'quarto_casal-sala'], ['hall', 'elevador'], ['escritorio', 'escritorio-sala'], ['quarto', 'quarto-sala'], ['sala', 'cozinha-sala'], ['cozinha', 'cozinha-sala']]) { await p.evaluate(([a, c]) => window.__teleportar(a, c), [m, s]); await sl(700); await p.screenshot({ path: `qa/evidencias/v130/explorar-${m}.png` }); }
await b.close();
