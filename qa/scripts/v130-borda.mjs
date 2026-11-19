import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import fs from 'node:fs';
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 960, height: 704 } })).newPage();
await p.goto(url); await p.waitForSelector('canvas'); await sl(1800);
await p.evaluate(() => { window.__partidaConcluida('lolo', false); window.__irPara('Fim', {}); }); await sl(3200);
await p.mouse.click(480, 352); await sl(1500);
const crz = (await p.evaluate(() => window.__alvosDeToque())).filter((a) => a.nome === 'Creditos:Zone').sort((x, y) => x.y - y.y);
await p.mouse.click(crz[1].x + crz[1].largura / 2, crz[1].y + crz[1].altura / 2); await sl(1800);
const M = {}; for (const f of fs.readdirSync('content/maps/casa-real')) { const m = JSON.parse(fs.readFileSync('content/maps/casa-real/' + f)); M[m.id] = m; }
const piso = (m, x, y) => x >= 0 && y >= 0 && x < m.largura && y < m.altura && m.chao[y * m.largura + x] !== 0;
const mov = (m, x, y) => m.objetos.some((o) => o.tipo == 'movel' && x >= o.x && x < o.x + (o.w || 1) && y >= o.y && y < o.y + (o.h || 1));
const sp = { sala: 'cozinha-sala', cozinha: 'cozinha-sala', escritorio: 'escritorio-sala', quarto: 'quarto-sala', quarto_casal: 'quarto_casal-sala', banheiro1: 'banheiro1-quarto', banheiro_escritorio: 'banheiro_escritorio-escritorio', hall: 'elevador' };
const K = { cima: 'ArrowUp', baixo: 'ArrowDown', esquerda: 'ArrowLeft', direita: 'ArrowRight' };
const arestas = (process.argv[2] ?? 'sala,cozinha,escritorio,quarto,quarto_casal,banheiro1,banheiro_escritorio,hall').split(',');
for (const id of arestas) {
  const m = M[id]; let n = 0, ruim = [], saiu = 0, presos = [];
  await p.evaluate(([a, c]) => window.__teleportar(a, c), [id, sp[id]]); await sl(700);
  for (let y = 0; y < m.altura; y++) for (let x = 0; x < m.largura; x++) {
    if (!piso(m, x, y) || mov(m, x, y)) continue;
    let livres = 0;
    for (const [d, [dx, dy]] of Object.entries({ cima: [0, -1], baixo: [0, 1], esquerda: [-1, 0], direita: [1, 0] })) {
      await p.evaluate(([a, c]) => window.__posicionar(a, c, 'baixo'), [x, y]); await sl(60);
      await p.keyboard.down(K[d]); await sl(260); await p.keyboard.up(K[d]); await sl(120);
      const e = await p.evaluate(() => window.__estado());
      if (e.mapa !== id || e.emFade) { saiu++; await sl(900); await p.evaluate(([a, c]) => window.__teleportar(a, c), [id, sp[id]]); await sl(700); continue; }
      n++;
      const tx = e.tileX, ty = e.tileY;
      if (!piso(m, tx, ty) || mov(m, tx, ty)) ruim.push(`${x},${y} ${d} -> ${tx},${ty}`);
      if (tx !== x || ty !== y) livres++;
    }
    if (livres === 0) presos.push(`${x},${y}`);
  }
  console.log(`${id}: testes ${n}, saidas por porta ${saiu}, em piso invalido/movel ${ruim.length} ${ruim.slice(0, 5).join(' ; ')}; tiles sem saida ${presos.length} ${presos.join(' ')}`);
}
await b.close();
