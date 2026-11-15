// QA rodada 14, item 038: foco do painel da P8 com setas e WASD, a partir do meio e das bordas.
// Build de QA: dist-qa/index.html. Cada experimento abre o painel de novo (foco em OK, GDD 14.1).
// Uso: node qa/scripts/marco1-r14-painel-wasd.mjs
import { lancar, novoContexto, capturar, EVID } from './lib.mjs';
import { irPara, ladosDe, estado, apertarA, objeto } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(AQUI, '..', '..', 'dist-qa', 'index.html')).href;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'r14' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });

const pressionar = async (k, ms = 120) => { await page.keyboard.down(k); await dormir(ms); await page.keyboard.up(k); await dormir(160); };
async function fecharTudo() { for (let i = 0; i < 8; i++) { const e = await estado(page); if (!e?.travado) return; await apertarA(page); } }
const focoUma = async () => (await page.evaluate(() => {
  const c = document.querySelector('canvas');
  const s = c.width / 240;
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let mnx = 999, mny = 999, mxx = -1, mxy = -1;
  for (let y = Math.round(60 * s); y < Math.round(132 * s); y++) for (let x = Math.round(30 * s); x < Math.round(215 * s); x++) {
    const i = (y * c.width + x) * 4;
    if (d[i] > 200 && d[i + 1] > 160 && d[i + 2] < 140) { mnx = Math.min(mnx, x); mny = Math.min(mny, y); mxx = Math.max(mxx, x); mxy = Math.max(mxy, y); }
  }
  return mxx < 0 ? null : { x0: Math.round(mnx / s), y0: Math.round(mny / s) };
}));
// Lê o foco como célula da grade (linhas: 1-3 dígitos, 4 = Apagar/0/OK).
const ROT = { 36: 1, 92: 2, 148: 3 };
const LIN = { 66: 1, 82: 2, 98: 3, 114: 4 };
const ROTULO = [[null], ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['Apagar', '0', 'OK']];
async function celula() {
  for (let i = 0; i < 6; i++) {
    const f = await focoUma();
    if (f) { const c = ROT[f.x0], l = LIN[f.y0]; return c && l ? ROTULO[l][c - 1] : `?(${f.x0},${f.y0})`; }
    await dormir(120);
  }
  return 'sem foco';
}

// Setup: título -> seleção -> introdução -> hall, depois P8.
await page.goto(url); await dormir(2000);
await apertarA(page); await apertarA(page); await dormir(300);
for (let i = 0; i < 6; i++) await apertarA(page);
await dormir(400);
await fecharTudo();
const p8 = objeto('hall', 'porta', 'P8');
const lado = ladosDe('hall', 'porta', 'P8').find((l) => l.y === p8.y + 1) ?? ladosDe('hall', 'porta', 'P8')[0];
await irPara(page, 'hall', lado.x, lado.y);
const e0 = await estado(page);
const k = (dx, dy) => ({ '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' })[`${Math.sign(dx)},${Math.sign(dy)}`];
await pressionar(k(p8.x - e0.tileX, p8.y - e0.tileY), 60); // vira para a P8
await apertarA(page); await dormir(300); // abre o painel

const resultados = [];
const log = (linha) => { resultados.push(linha); console.log(linha); };
// Experimento: a partir de um ponto de partida (teclas de ida), aplica uma tecla e lê o foco.
async function exp(nome, ida, tecla, esperado) {
  await pressionar('Escape', 150); await dormir(150);
  await apertarA(page); await dormir(300); // painel reaberto, foco em OK
  for (const t of ida) await pressionar(t, 120);
  const antes = await celula();
  await pressionar(tecla, 120);
  const depois = await celula();
  const cond = esperado === null ? '' : (depois === esperado ? ' [OK]' : ` [DIFERE do esperado ${esperado}]`);
  log(`${nome.padEnd(26)} antes=${antes.padEnd(6)} tecla=${tecla.padEnd(10)} depois=${depois}${cond}`);
  return { antes, depois };
}

// Ponto de partida OK (inicio do painel)
const ini = await celula();
log(`foco inicial ao abrir o painel: ${ini} (GDD 14.1 manda OK)`);

// Do meio (5): ida = [ArrowUp, ArrowUp, ArrowLeft] a partir de OK
const IDA_5 = ['ArrowUp', 'ArrowUp', 'ArrowLeft'];
await exp('meio: ArrowRight', IDA_5, 'ArrowRight', '6');
await exp('meio: d', IDA_5, 'd', '6');
await exp('meio: ArrowDown', IDA_5, 'ArrowDown', '8');
await exp('meio: s', IDA_5, 's', '8');
await exp('meio: ArrowLeft', IDA_5, 'ArrowLeft', '4');
await exp('meio: a', IDA_5, 'a', '4');
await exp('meio: ArrowUp', IDA_5, 'ArrowUp', '2');
await exp('meio: w', IDA_5, 'w', '2');
// Bordas a partir de OK (canto inferior direito)
await exp('OK: ArrowDown', [], 'ArrowDown', null);
await exp('OK: s', [], 's', null);
await exp('OK: ArrowRight', [], 'ArrowRight', null);
await exp('OK: d', [], 'd', null);
// Bordas a partir de 1 (canto superior esquerdo): ida = ArrowUp x3 e ArrowLeft x2 a partir de OK
const IDA_1 = ['ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowLeft', 'ArrowLeft'];
await exp('1: ArrowUp', IDA_1, 'ArrowUp', null);
await exp('1: w', IDA_1, 'w', null);
await exp('1: ArrowLeft', IDA_1, 'ArrowLeft', null);
await exp('1: a', IDA_1, 'a', null);
// Bordas a partir de Apagar (canto inferior esquerdo): ida = ArrowLeft x2 a partir de OK
const IDA_AP = ['ArrowLeft', 'ArrowLeft'];
await exp('Apagar: ArrowDown', IDA_AP, 'ArrowDown', null);
await exp('Apagar: s', IDA_AP, 's', null);
await exp('Apagar: ArrowLeft', IDA_AP, 'ArrowLeft', null);
await exp('Apagar: a', IDA_AP, 'a', null);
// Captura do painel a partir do meio, com o foco em 5 (evidencia)
await pressionar('Escape', 150); await dormir(150); await apertarA(page); await dormir(300);
for (const t of IDA_5) await pressionar(t, 120);
await capturar(page, 'r14-a-painel-foco-meio', 3);

const falhas = erros.length;
console.log(`\nerros de console/página: ${falhas}`);
if (falhas) console.log(erros.slice(0, 5).join('\n'));
await browser.close();
