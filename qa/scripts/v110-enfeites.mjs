// QA 1.1.0 r2: PL16 (A em enfeites sobre móveis), cacto, paredes ao vivo, móveis bloqueiam. Teclado.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 704 } })).newPage();
const erros = []; p.on('pageerror', (e) => erros.push(String(e)));
p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) erros.push(m.text()); });
await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
await p.evaluate(() => { window.__partidaConcluida('lolo', false); window.__irPara('Fim', {}); }); await sl(3200);
await p.mouse.click(480, 352); await sl(1500);
const crz = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.nome === 'Creditos:Zone').sort((x, y) => x.y - y.y);
await p.mouse.click(crz[1].x + crz[1].largura / 2, crz[1].y + crz[1].altura / 2); await sl(1800);
const est = () => p.evaluate(() => window.__estado());
const K = { cima: 'ArrowUp', baixo: 'ArrowDown', esquerda: 'ArrowLeft', direita: 'ArrowRight' };
const tap = async (d, ms = 130) => { await p.keyboard.down(K[d]); await sl(ms); await p.keyboard.up(K[d]); await sl(120); };
const tele = async (m, s) => { await p.evaluate(([a, c]) => window.__teleportar(a, c), [m, s]); await sl(600); };
const log = (s) => console.log(s);
const textos = async () => (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.origem === 'texto' && /Casa:/.test(a.nome) && !/Z:|\?|II/.test(a.nome)).map((a) => a.nome).join('|');
async function ir(tx, ty) {
  for (let i = 0; i < 40; i++) {
    const e = await est(); if (e.tileX === tx && e.tileY === ty) return true;
    const d = e.tileY !== ty && (e.tileX === tx || i % 2) ? (ty > e.tileY ? 'baixo' : 'cima') : (tx > e.tileX ? 'direita' : 'esquerda');
    if (e.tileX === tx) await tap(ty > e.tileY ? 'baixo' : 'cima'); else await tap(d === 'baixo' || d === 'cima' ? (tx > e.tileX ? 'direita' : 'esquerda') : d);
  }
  return false;
}
async function exame(nome, mapa, spawn, tx, ty, dir, rota) {
  await tele(mapa, spawn);
  for (const [x, y] of rota) await ir(x, y);
  const ok = await ir(tx, ty);
  await tap(dir, 250); // vira contra o móvel
  await p.keyboard.down('z'); await sl(80); await p.keyboard.up('z'); await sl(500);
  const t = await textos(); const e = await est();
  await p.screenshot({ path: `qa/evidencias/v110/exame-${nome}.png` });
  log(`${t && /enfeite|Que|vela|Uma|Tem|Meias|árvore/i.test(t) ? 'OK  ' : 'VER '} ${nome} chegou=${ok} tile=${e.tileX},${e.tileY} texto=${t.replace(/\n/g, ' ').slice(0, 120)}`);
  await p.keyboard.press('x'); await sl(300); await p.keyboard.press('x'); await sl(300);
}
await exame('rack-guirlanda', 'sala', 'cozinha-sala', 2, 2, 'cima', [[9, 4], [9, 2]]);
await exame('rack-luz', 'sala', 'cozinha-sala', 4, 2, 'cima', [[9, 4], [9, 2]]);
await exame('rack-meias', 'sala', 'cozinha-sala', 5, 2, 'cima', [[9, 4], [9, 2]]);
await exame('comoda-vela', 'sala', 'cozinha-sala', 9, 6, 'direita', [[9, 4]]);
await exame('comoda-arvore', 'sala', 'cozinha-sala', 9, 7, 'direita', [[9, 4]]);
await exame('esc-luz', 'escritorio', 'escritorio-sala', 4, 1, 'cima', [[3, 4], [3, 1]]);
await exame('esc-meias', 'escritorio', 'escritorio-sala', 6, 4, 'cima', []);
await exame('quarto-presente', 'quarto', 'quarto-sala', 0, 0, 'direita', [[0, 2]]);
await exame('esc-nao-examinavel(arvore_p 6,1)', 'escritorio', 'escritorio-sala', 6, 1, 'direita', [[3, 4], [3, 1]]);
// cacto
await tele('sala', 'cozinha-sala'); await ir(9, 3); await ir(1, 3);
let e = await est(); log(`cacto: antes ${e.tileX},${e.tileY}`);
for (let i = 0; i < 3; i++) { await tap('esquerda', 450); e = await est(); log(`cacto empurrão ${i + 1}: tile ${e.tileX},${e.tileY} px ${Math.round(e.centroX)},${Math.round(e.centroY)} texto=${await textos()}`); if (i === 0) await p.screenshot({ path: 'qa/evidencias/v110/cacto-empurrao.png' }); await ir(1, 3); }
// A de frente
await tap('esquerda', 60); await p.keyboard.down('z'); await sl(80); await p.keyboard.up('z'); await sl(400); e = await est(); log(`cacto A: travado=${e.travado} texto=${await textos()} tile ${e.tileX},${e.tileY}`);
// empurrão contra parede/móvel: cacto encostado em (0,3); empurra para a direita (1,3)->(2,3); tentar com sofá: (3,3) é sofá
await tele('sala', 'cozinha-sala'); await ir(1, 3); await tap('esquerda', 450); e = await est(); log(`cacto com ${e.tileX},${e.tileY} depois`);
// vindo de baixo contra cacto (0,4)->cima: empurra para baixo; do canto
await ir(0, 4); await tap('cima', 450); e = await est(); log(`cacto de baixo: ${e.tileX},${e.tileY}`);
await ir(0, 2); await tap('baixo', 450); e = await est(); log(`cacto de cima: ${e.tileX},${e.tileY}`);
// paredes: andar forte nas bordas da Sala
for (const [spawn, dirs] of [['cozinha-sala', ['direita', 'cima', 'baixo']], ['hall-sala', ['esquerda', 'baixo']], ['quarto-sala', ['cima', 'direita']]]) {
  await tele('sala', spawn);
  for (const d of dirs) { await p.keyboard.down(K[d]); await sl(1800); await p.keyboard.up(K[d]); e = await est(); log(`sala parede de ${spawn} ${d}: mapa=${e.mapa} tile ${e.tileX},${e.tileY}`); if (e.mapa !== 'sala') break; }
}
// muro interno da Cozinha: linha entre 2 e 3; passagem coluna 4
await tele('cozinha', 'cozinha-sala');
for (const x of [1, 2, 3, 5]) { await ir(x, 2); await tap('baixo', 600); e = await est(); log(`cozinha muro coluna ${x}: tile ${e.tileX},${e.tileY} ${e.tileY >= 3 ? 'ATRAVESSOU' : 'bloqueado'}`); }
await ir(4, 2); await tap('baixo', 700); e = await est(); log(`cozinha passagem coluna 4: tile ${e.tileX},${e.tileY} ${e.tileY >= 3 ? 'passou' : 'BLOQUEADO'}`);
// móveis bloqueiam: sofá
await tele('sala', 'cozinha-sala'); await ir(5, 3); await tap('esquerda', 600); e = await est(); log(`sofá: tile ${e.tileX},${e.tileY} (esperado 5,3)`);
await ir(7, 4); await tap('baixo', 600); e = await est(); log(`mesa: tile ${e.tileX},${e.tileY} (esperado 7,4)`);
log(`erros de console: ${erros.length} ${erros.slice(0, 3).join(';')}`);
await b.close();
