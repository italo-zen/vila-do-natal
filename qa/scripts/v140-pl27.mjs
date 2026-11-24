// PL27: partidas completas pelo gancho de QA, sem coordenadas à mão (`__irAPeca`, `__coletarPeca`, `__passosDaConducao`).
// Uso: node qa/scripts/v130-pl27.mjs [partidas=3] (precisa de dist-qa). Sai com código 1 se alguma falhar.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const N = Number(process.argv[2] ?? 3); const BASE = Number(process.argv[3] ?? 1000);
const url = pathToFileURL(resolve('dist-qa/index.html')).href;
const sl = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: true });
let falhas = 0;
for (let i = 0; i < N; i++) {
  const semente = BASE + i * 37; const pers = ['lolo', 'bibi', 'dandan', 'tutu'][(i + BASE) % 4];
  const p = await (await b.newContext({ viewport: { width: 960, height: 704 } })).newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(String(e)));
  await p.goto(url + `?semente=${semente}`); await p.waitForSelector('canvas'); await sl(1500);
  await p.evaluate(([pers, s]) => { window.__novaPartida(pers, s); window.__irPara('Casa', { modo: 'intro' }); }, [pers, semente]); await sl(1400);
  const plano = await p.evaluate(() => window.__plano());
  const passos = [];
  for (const n of [1, 2, 3]) {
    await p.evaluate((f) => window.__irParaFase(f), `parte${n}`); await sl(300);
    // Fecha qualquer diálogo ainda aberto (chegada anterior) antes de ir à peça.
    for (let t = 0; t < 10; t++) { const e = await p.evaluate(() => window.__estado()); if (e && !e.travado && !e.emFade) break; await p.keyboard.press('z'); await sl(500); }
    const ir = await p.evaluate((k) => window.__irAPeca(k), n);
    await sl(300);
    await p.evaluate(() => window.__coletarPeca()); await sl(1500);
    let cond = null;
    for (let t = 0; t < 40 && !cond; t++) { await p.keyboard.press('z'); await sl(400); cond = await p.evaluate((f) => { const c = window.__passosDaConducao(); return c && c.fase === f ? c : null; }, `parte${n}`); } // Continuar da conquista
    passos.push(cond);
    // Segue a condução e os diálogos de chegada (Z) até a fase seguir.
    const alvo = n === 3 ? 'enfeites' : `parte${n + 1}`;
    for (let t = 0; t < 60; t++) {
      const e = await p.evaluate(() => window.__estado());
      if (e && e.fase === alvo && !e.travado && !e.emConducao) break;
      await p.keyboard.press('z'); await sl(700);
    }
    if (!ir || !cond) { const e = await p.evaluate(() => window.__estado()); console.log('estado', JSON.stringify({ mapa: e?.mapa, t: [e?.tileX, e?.tileY], dir: e?.direcao, fase: e?.fase, travado: e?.travado, nick: e?.nick })); falhas++; console.log(`FALHA semente ${semente} peça ${n}: ir=${JSON.stringify(ir)} conducao=${JSON.stringify(cond)}`); }
  }
  // fase enfeites: ir à caixa, A, condução, conclusão e créditos
  await p.evaluate(() => window.__irParaFase('enfeites')); await sl(300);
  for (let t = 0; t < 10; t++) { const e = await p.evaluate(() => window.__estado()); if (e && !e.travado && !e.emFade) break; await p.keyboard.press('z'); await sl(500); }
  const irc = await p.evaluate(() => window.__irACaixa()); await sl(300);
  await p.evaluate(() => window.__coletarPeca()); await sl(1500);
  let condc = null, fim = false, cred = false;
  for (let t = 0; t < 80; t++) {
    await p.keyboard.press('z'); await sl(450);
    const c = await p.evaluate(() => window.__passosDaConducao()); if (c && c.fase === 'enfeites') condc = c;
    const cenas = await p.evaluate(() => window.__estado()?.mapa ?? null).catch(() => null);
    const al = await p.evaluate(() => window.__alvosDeToque().map((a) => a.nome).join(',')).catch(() => '');
    if (/Creditos/.test(al)) { cred = true; break; }
  }
  passos.push(condc);
  if (!irc || !cred) { falhas++; console.log(`FALHA semente ${semente} caixa: ir=${JSON.stringify(irc)} conducao=${JSON.stringify(condc)} creditos=${cred}`); }
  console.log(`semente ${semente} ${pers}: caixa ${plano.caixa.mapa}(${plano.caixa.x},${plano.caixa.y}) peças ${plano.pecas.map((x) => `${x.mapa}(${x.x},${x.y})`).join(' ')}; condução ${passos.map((c) => c && `${c.passos}${c.dobro ? '×2' : ''}`).join(' / ')}; erros ${erros.length}`);
  falhas += erros.length;
  await p.close();
}
await b.close();
process.exitCode = falhas ? 1 : 0;
