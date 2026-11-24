// Capturas do build de QA com o sorteio (ADR-013, adendo): a caixa de enfeite em cada tile candidato (24). Arte, 2026-11-19.
// Uso: npm run build:qa && node tools-arte/captura_pecas_nick.mjs [dist-qa/index.html] [saida]
// Procura sementes (`__semente`/`__novaPartida`) cujo plano põe a peça N (ou o Nick) em cada tile, leva a partida até a fase e fotografa.
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const [, , arquivoArg, saidaArg] = process.argv;
const arquivo = arquivoArg ?? 'dist-qa/index.html';
const saida = saidaArg ?? 'tools-arte/preview/caixa-candidatos';
mkdirSync(saida, { recursive: true });
const fonte = readFileSync('tools/captura-areas.mjs', 'utf-8');
const RELOGIO = fonte.slice(fonte.indexOf('const RELOGIO_VIRTUAL = `') + 'const RELOGIO_VIRTUAL = `'.length, fonte.indexOf('})();`;') + 5);
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await (await browser.newContext({ viewport: { width: 960, height: 704 }, deviceScaleFactor: 1 })).newPage();
await page.addInitScript(RELOGIO);
const erros = [];
page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
page.on('pageerror', (e) => erros.push(e.message));
const esperar = (ms) => page.evaluate((n) => window.__avancar(n), ms);
await page.goto(pathToFileURL(resolve(arquivo)).href);
for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!document.querySelector('canvas'))) break; await real(15); }
for (let i = 0; i < 300; i++) { await esperar(16); await real(15); }
await esperar(2500);

const SPAWN = { cozinha: 'cozinha-sala', quarto: 'quarto-sala', escritorio: 'escritorio-sala', quarto_casal: 'quarto_casal-sala', sala: 'hall-sala' };
// 1) procura sementes
const plano0 = await page.evaluate(() => { window.__novaPartida('lolo', 1); return window.__plano(); });
console.log('formato do plano:', JSON.stringify(plano0).slice(0, 700));
const caixas = new Map(); // "mapa:x,y" -> {seed}
for (let seed = 1; seed <= 3000; seed++) {
  const p = await page.evaluate((s) => { window.__novaPartida('lolo', s); return window.__plano(); }, seed);
  const c = p.caixa;
  if (c) { const k = `${c.mapa}:${c.x},${c.y}`; if (!caixas.has(k)) caixas.set(k, { seed }); }
  if (caixas.size >= 24 && seed > 600) break;
}
console.log('tiles de caixa achados:', caixas.size);
writeFileSync(`${saida}/sementes.json`, JSON.stringify([...caixas], null, 1));

async function ir(seed, fase, mapa, fecharTexto = false) {
  await page.evaluate((s) => { window.__novaPartida('lolo', s); window.__irPara('Casa', { modo: 'intro' }); }, seed);
  await esperar(1500);
  await page.evaluate((f) => window.__irParaFase(f), fase);
  await page.evaluate(() => window.__abrirTodasAsAreas());
  await page.evaluate(([m, sp]) => window.__teleportar(m, sp), [mapa, SPAWN[mapa]]);
  await esperar(2600);
  if (fecharTexto) for (let i = 0; i < 14; i++) { await page.keyboard.down('z'); await esperar(80); await page.keyboard.up("z"); await esperar(700); }   // fecha textos de chegada
}
function vizinhoLivre(mapa, x, y) {
  const d = JSON.parse(readFileSync(`content/maps/casa-real/${mapa}.json`, 'utf-8'));
  for (const [dx, dy, dir] of [[0, 1, 'cima'], [1, 0, 'esquerda'], [-1, 0, 'direita'], [0, -1, 'baixo']]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= d.largura || ny >= d.altura) continue;
    const i = ny * d.largura + nx;
    if (d.chao[i] > 0 && d.colisao[i] === 0 && !d.objetos.some((o) => (o.tipo === 'spawn' || o.tipo === 'porta') && o.x === nx && o.y === ny)) return [nx, ny, dir];
  }
  return [x, y, 'baixo'];
}
const relatorio = [];
for (const [k, { seed }] of caixas) {
  const [mapa, xy] = k.split(':'); const [x, y] = xy.split(',').map(Number);
  await ir(seed, 'enfeites', mapa);
  await page.evaluate((v) => window.__posicionar(v[0], v[1], v[2]), vizinhoLivre(mapa, x, y));
  await esperar(2200);
  const imgs = await page.evaluate(() => window.__imagens('spr_enfeite_caixa'));
  await page.screenshot({ path: `${saida}/caixa-${mapa}-${x}-${y}.png` });
  relatorio.push({ k, seed, imagens: imgs });
}
writeFileSync(`${saida}/relatorio-caixa.json`, JSON.stringify(relatorio, null, 1));
console.log('sem imagem:', relatorio.filter((r) => !r.imagens.length).map((r) => r.k));
console.log('erros de console:', erros.length ? erros.slice(0, 5) : 'nenhum');
await browser.close();
