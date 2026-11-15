// QA rodada 14, item 5 (acentos): captura do Sofá na Sala. Build de QA: dist-qa/index.html.
import { lancar, novoContexto, capturar } from './lib.mjs';
import { irPara, ladosDe, estado, esperarFade, apertarA, objeto } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const AQUI = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(AQUI, '..', '..', 'dist-qa', 'index.html')).href;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'r14sofa' });
const page = await ctx.newPage();
const pressionar = async (k, ms = 90) => { await page.keyboard.down(k); await dormir(ms); await page.keyboard.up(k); await dormir(160); };
async function fecharTudo() { for (let i = 0; i < 8; i++) { const e = await estado(page); if (!e?.travado) return; await apertarA(page); } }
await page.goto(url); await dormir(2000);
await apertarA(page); await apertarA(page); await dormir(300);
for (let i = 0; i < 6; i++) await apertarA(page);
await dormir(400); await fecharTudo();
const p8 = objeto('hall', 'porta', 'P8');
const lado = ladosDe('hall', 'porta', 'P8').find((l) => l.y === p8.y + 1) ?? ladosDe('hall', 'porta', 'P8')[0];
await irPara(page, 'hall', lado.x, lado.y);
const e1 = await estado(page);
await pressionar(e1.tileX < p8.x ? 'ArrowRight' : e1.tileX > p8.x ? 'ArrowLeft' : e1.tileY < p8.y ? 'ArrowDown' : 'ArrowUp', 60);
await apertarA(page); await dormir(300);
for (const ch of ['0', '1', '7']) await pressionar(ch, 80);
await pressionar('Enter', 80); await dormir(500); await fecharTudo();
await esperarFade(page).catch(() => null); await dormir(400);
const s = await estado(page);
console.log('mapa', s?.mapa, s?.tileX, s?.tileY);
await irPara(page, 'sala', 2, 3);
await pressionar('ArrowRight', 120); // vira para o sofá em (3,3)
await dormir(200);
await capturar(page, 'r14-sofa-acento', 3);
const f = await estado(page);
console.log('sofá: pos', f?.tileX, f?.tileY, 'dir', f?.direcao);
await browser.close();
