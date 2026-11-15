// Diagnóstico do A no Nick dormindo (Marco 3, rodada 1): amostra o estado a cada 150 ms depois do A.
import { lancar, novoContexto, lerTextos, limparTextos, juntar, sleep, tecla, irAteHall } from './lib.mjs';
import { estado } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'diag' });
const page = await ctx.newPage();
await page.goto(url); await page.waitForSelector('canvas'); await sleep(2000);
await irAteHall(page, 0); await sleep(1200);
await page.evaluate(() => window.__teleportar('sala', 'P7'));
for (let i = 0; i < 120; i++) { if (!(await estado(page)).travado) break; await sleep(100); }
console.log('apos espera travado=', (await estado(page)).travado);
await page.keyboard.down('x'); await sleep(300); await page.keyboard.up('x'); await sleep(400);
console.log('apos X travado=', (await estado(page)).travado, 'dicaAberta', (await estado(page)).dicaAberta);
await page.keyboard.down('ArrowLeft'); await sleep(700); await page.keyboard.up('ArrowLeft'); await sleep(200);
let e = await estado(page);
console.log('antes A', e.tileX, e.tileY, e.direcao, e.travado, JSON.stringify(e.nick));
await limparTextos(page);
await page.keyboard.down('z'); await sleep(90); await page.keyboard.up('z');
for (let i = 0; i < 14; i++) {
  await sleep(150);
  e = await estado(page);
  const t = juntar(await lerTextos(page));
  console.log(i, `jog=${e.mapa}(${e.tileX},${e.tileY}) dir=${e.direcao} trav=${e.travado} nick=${e.nick.estado}/${e.nick.mapa}(${e.nick.tileX},${e.nick.tileY}) txt="${t.slice(0, 70)}"`);
}
await browser.close();
