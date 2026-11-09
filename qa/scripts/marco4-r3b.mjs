// QA Marco 4 (v0.8.0), rodada 3b: (a) exame da árvore no estado 3 (GDD 17.5: "Falta a caixa de enfeites.");
// (b) encaixe por polling: tempo de chegada em (3,7) até o diálogo final (aprox. 1,7 s do encaixe + abertura do diálogo).
// Uso: MODO=exame|encaixe node qa/scripts/marco4-r3b.mjs   (TuTu, IDX 3). Build: dist-qa.
import { lancar, novoContexto, sleep, tecla } from './lib.mjs';
import { irPara } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODO = process.env.MODO ?? 'exame';
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm4r3b' });
const page = await ctx.newPage();
const est = async () => { for (let i = 0; i < 4; i++) { try { return await page.evaluate(() => window.__estado()); } catch { await sleep(150); } } return null; };
const ver = async () => page.evaluate(() => window.__textos.map((x) => x.t).join(' ').replace(/\s+/g, ' '));
const limpar = () => page.evaluate(() => { window.__textos.length = 0; });
const fechar = async () => { for (let i = 0; i < 12; i++) { const q = await est(); if (!q?.travado) return; await tecla(page, 'z', { ms: 90, pausa: 400 }); } };
await page.goto(url); await page.waitForSelector('canvas'); await sleep(1500);
await tecla(page, 'z'); await sleep(300);
for (let k = 0; k < 3; k++) await tecla(page, 'ArrowRight');
await tecla(page, 'z'); await sleep(900);
for (let k = 0; k < 4; k++) await tecla(page, 'z'); await sleep(600);
for (let k = 0; k < 4; k++) await tecla(page, 'z'); await sleep(600);
if (MODO === 'exame') {
  await page.evaluate(() => window.__irParaFase('enfeites'));
  await page.evaluate(() => window.__teleportar('sala', 'P3')); await sleep(900); await fechar();
  await irPara(page, 'sala', 3, 7);
  await limpar();
  await tecla(page, 'ArrowDown', { ms: 150, pausa: 200 });
  await tecla(page, 'z', { ms: 90, pausa: 400 }); await sleep(400);
  const t1 = await ver();
  console.log(`EXAME estado 3 (A na árvore, 1ª página): ${t1.slice(0, 160)}`);
  await tecla(page, 'z', { ms: 90, pausa: 400 }); await sleep(300);
  const t2 = await ver();
  console.log(`EXAME estado 3 (2ª página): ${t2.slice(-160)}`);
  console.log(`OK? falta="${t1.includes('Falta a caixa de enfeites.') || t2.includes('Falta a caixa de enfeites.')}" ; "A árvore está montada!"="${t1.includes('A árvore está montada!') || t2.includes('A árvore está montada!')}"`);
} else {
  await page.evaluate(() => window.__irParaFase('enfeites'));
  await page.evaluate(() => window.__teleportar('escritorio', 'P3')); await sleep(900); await fechar();
  await irPara(page, 'escritorio', 5, 3);
  await tecla(page, 'z', { ms: 90, pausa: 500 }); await sleep(300);
  await tecla(page, 'z', { ms: 90, pausa: 300 });
  // condução: polling até (3,7)
  let t0 = null; let t1 = null; const tI = Date.now();
  for (let i = 0; i < 400; i++) {
    const q = await est();
    if (q && q.mapa === 'sala' && q.tileX === 3 && q.tileY === 7 && t0 === null) t0 = Date.now();
    if (t0 !== null && (await ver()).includes('Agora a árvore está toda enfeitada!')) { t1 = Date.now(); break; }
    await sleep(40);
  }
  console.log(`ENCAIXE: chegada (3,7) -> diálogo final = ${t0 && t1 ? (t1 - t0) : 'n/d'} ms (inclui polling de ~40 ms; o encaixe é ~1,7 s). Condução total desde o início: ${t1 ? Date.now() - tI : 'n/d'} ms`);
}
await browser.close();
