// QA Marco 3 (v0.7.0), rodada 4: Nick no Quarto (fase 2) e no Escritório (fase 3) com __irParaFase (gancho do Dev).
// Build: dist-qa (rodado de novo). Teclado. Depois de __teleportar, um Z/X fecha o aviso de Sala escura se houver.
// Uso: node qa/scripts/marco3-r4-fases.mjs
import { lancar, novoContexto, lerTextos, limparTextos, juntar, sleep, tecla, irAteHall } from './lib.mjs';
import { irPara, estado, apertarA } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco3-r4');
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const browser = await lancar();
const press = async (page, k, ms = 260) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(220); };
const est = (page) => estado(page);
const textos = async (page) => juntar(await lerTextos(page));
async function capturar(page, nome) {
  const d = await page.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = c.width * 3; o.height = c.height * 3; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); });
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(d.split(',')[1], 'base64'));
}
async function fechar(page) { for (let i = 0; i < 10; i++) { const q = await est(page); if (!q?.travado) return; await press(page, 'x', 300); await sleep(300); } }

async function cenario(nome, fase, area, spawn, alvoEsperado, saidaEsperada, adj) {
  const ctx = await novoContexto(browser, { url, origem: url, rotulo: nome });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  await page.goto(url); await page.waitForSelector('canvas'); await sleep(2000);
  await tecla(page, 'z'); await sleep(300); await tecla(page, 'z'); await sleep(300);
  await irAteHall(page, 0); await sleep(800);
  const fa = await page.evaluate((f) => window.__irParaFase(f), fase);
  reg(`${nome} __irParaFase('${fase}')`, fa !== null && fa !== undefined, `retorno=${fa}`);
  await page.evaluate(([a, b]) => window.__teleportar(a, b), [area, spawn]);
  await sleep(600);
  await fechar(page);
  await sleep(400);
  let e = await est(page);
  reg(`${nome} N1/N10 Nick dorme em ${area} (${adj.x},${adj.y})`, e?.nick?.mapa === area && e?.nick?.tileX === adj.x && e?.nick?.tileY === adj.y && e?.nick?.estado === 'dormindo', `nick=${JSON.stringify(e?.nick)}`);
  await capturar(page, `${nome}-01-dormindo`);
  await press(page, 'x'); await sleep(300);
  e = await est(page);
  reg(`${nome} F5 B com Nick dormindo: sem seta`, e?.farejo?.ativo === false && e?.nick?.estado === 'dormindo', `farejo=${JSON.stringify(e?.farejo)}`);
  await limparTextos(page);
  await press(page, 'h', 300); await sleep(300);
  const td = await textos(page);
  reg(`${nome} D3 dica (dormindo)`, td.includes('O Nick ainda está dormindo.'), `texto: "${td.slice(0, 120)}"`);
  await capturar(page, `${nome}-02-dica`);
  await press(page, 'z', 260);
  let ok = false;
  for (const [ax, ay, dir] of [[adj.x, adj.y + 1, 'ArrowUp'], [adj.x - 1, adj.y, 'ArrowRight'], [adj.x + 1, adj.y, 'ArrowLeft']]) {
    try { await irPara(page, area, ax, ay); } catch (er) { continue; }
    await press(page, dir, 260);
    e = await est(page);
    if (e?.tileX === ax && e?.tileY === ay) { ok = true; break; }
  }
  reg(`${nome} N11 Nick dormindo bloqueia (${adj.x},${adj.y}) a partir de um vizinho`, ok, `jogador=(${e?.tileX},${e?.tileY})`);
  await apertarA(page); await sleep(1500);
  e = await est(page);
  reg(`${nome} N2 A acorda o Nick`, e?.nick?.estado === 'acordado', `nick=${JSON.stringify(e?.nick)}`);
  await capturar(page, `${nome}-03-acordou`);
  await limparTextos(page);
  await apertarA(page); await sleep(300);
  const ab = await textos(page);
  reg(`${nome} N12 A no Nick acordado: abana sem diálogo`, !/Nick acordou/.test(ab), `texto: "${ab.slice(0, 60)}"`);
  await sleep(1600);
  await limparTextos(page);
  await press(page, 'x', 260); await sleep(1400);
  e = await est(page);
  if (!e?.farejo?.ativo) { await press(page, 'x', 260); await sleep(1400); e = await est(page); } // 1a tecla pode cair na animação de abanar
  reg(`${nome} F4 seta (alvo ${alvoEsperado})`, e?.farejo?.porta?.id !== undefined && e?.farejo?.porta?.saida === saidaEsperada, `farejo=${JSON.stringify(e?.farejo)}`);
  await capturar(page, `${nome}-04-seta`);
  const r1 = e?.farejo?.restanteMs ?? 0;
  await sleep(2000);
  e = await est(page);
  reg(`${nome} F1 seta reduz com o tempo`, e?.farejo?.restanteMs < r1, `${r1} -> ${e?.farejo?.restanteMs}`);
  await press(page, 'x', 260); await sleep(900);
  e = await est(page);
  reg(`${nome} F2 B com seta visível reinicia`, e?.farejo?.restanteMs > 3000, `restante=${e?.farejo?.restanteMs}`);
  await sleep(4500);
  e = await est(page);
  reg(`${nome} F1c seta some em 5 s`, e?.farejo?.ativo === false, `farejo=${JSON.stringify(e?.farejo)}`);
  await limparTextos(page);
  await press(page, 'h', 300); await sleep(300);
  const tdA = await textos(page);
  reg(`${nome} D3 dica (acordado)`, tdA.includes('Aperte X e o Nick fareja.'), `texto: "${tdA.slice(0, 120)}"`);
  await press(page, 'z', 260);
  reg(`${nome} erros de página`, erros.length === 0, erros.length ? erros.join(' | ') : 'nenhum');
  await ctx.close();
}

await cenario('Quarto', 'parte2', 'quarto', 'P2', 'Cozinha', 'esquerda', { x: 4, y: 3 });
await cenario('Escritorio', 'parte3', 'escritorio', 'P3', 'Cozinha', 'esquerda', { x: 6, y: 1 });
writeFileSync(join(EVID, 'resultados.json'), JSON.stringify(resultados, null, 2));
await browser.close();
