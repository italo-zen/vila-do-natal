// QA Marco 4 (v0.8.0), rodada 2b: CR2 com Enter, Esc e clique (tela de créditos), e CR3 (nova partida até a seleção).
// Caminho curto: __irParaFase('enfeites') + caixa + encaixe + diálogo final + créditos. Uso: SAIDA=enter|esc|clique node ...
import { lancar, novoContexto, sleep, tecla } from './lib.mjs';
import { irPara } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SAIDA = process.env.SAIDA ?? 'enter';
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco4-r2', `cr2-${SAIDA}`);
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm4r2b' });
const page = await ctx.newPage();
const est = async () => { for (let i = 0; i < 4; i++) { try { return await page.evaluate(() => window.__estado()); } catch { await sleep(150); } } return null; };
const ver = async () => page.evaluate(() => window.__textos.map((x) => x.t).join(' ').replace(/\s+/g, ' '));
const capt = async (nome) => {
  const d = await page.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = c.width * 3; o.height = c.height * 3; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); });
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(d.split(',')[1], 'base64'));
};
const esperar = async (f, lim = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < lim) { if ((await ver()).includes(f)) return true; await sleep(100); } return false; };
const fechar = async () => { for (let i = 0; i < 12; i++) { const q = await est(); if (!q?.travado) return; await tecla(page, 'z', { ms: 90, pausa: 400 }); } };
const log = (id, ok, nota) => console.log(`${ok ? 'OK   ' : 'FALHA'} CR2-${SAIDA} ${id} :: ${nota}`);
await page.goto(url); await page.waitForSelector('canvas'); await sleep(1500);
// Pula o título e a seleção pelo Z, rápido: vai ao gancho de fase e joga a caixa.
await tecla(page, 'z'); await sleep(300);
// Seleção: TuTu (índice 3)
for (let k = 0; k < 3; k++) await tecla(page, 'ArrowRight');
await tecla(page, 'z'); await sleep(900);
for (let k = 0; k < 4; k++) await tecla(page, 'z');
await sleep(600);
for (let k = 0; k < 4; k++) await tecla(page, 'z');
await sleep(600);
await page.evaluate(() => window.__irParaFase('enfeites'));
await page.evaluate(() => window.__teleportar('escritorio', 'P3')); await sleep(900); await fechar();
await irPara(page, 'escritorio', 5, 3);
await tecla(page, 'z', { ms: 90, pausa: 500 }); await sleep(300);
await tecla(page, 'z', { ms: 90, pausa: 300 });
await esperar('Agora a árvore está toda enfeitada!', 15000);
await sleep(1500);
await tecla(page, 'z', { ms: 90, pausa: 400 });
await esperar('Feliz Natal', 4000); await sleep(1500);
await tecla(page, 'z', { ms: 90, pausa: 300 });
const cr = await esperar('Voltar ao título', 8000);
await sleep(600);
log('créditos alcançados', cr, (await ver()).slice(0, 80));
await capt('creditos-antes');
await page.evaluate(() => { window.__textos.length = 0; });
if (SAIDA === 'enter') await tecla(page, 'Enter', { ms: 90, pausa: 500 });
else if (SAIDA === 'esc') await tecla(page, 'Escape', { ms: 90, pausa: 500 });
else {
  const box = await page.locator('canvas').boundingBox();
  await page.mouse.click(box.x + box.width * (240 / 480), box.y + box.height * (287 / 352));
  await sleep(500);
}
const titulo = await esperar('Começar', 5000);
await capt('titulo-depois');
log(`${SAIDA} volta ao título com "Começar"`, titulo, (await ver()).slice(-90));
// CR3: nova partida: Começar leva à seleção
await page.evaluate(() => { window.__textos.length = 0; });
await tecla(page, 'z', { ms: 90, pausa: 500 });
await sleep(400);
log('CR3 Começar leva à seleção de sobrinhos', (await ver()).includes('Quem vai jogar?'), (await ver()).slice(0, 90));
await capt('cr3-selecao');
await browser.close();
