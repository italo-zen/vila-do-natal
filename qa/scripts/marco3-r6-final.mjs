// QA Marco 3 (v0.7.0), rodada 6 (final): reação "feliz" + "Au!" na chegada (luzes e peça 1) lendo animacaoDoNick,
// Nick dormindo sem reação, fumacinha em captura a cada 100 ms, F7 ao vivo. Build: dist-qa (rodado de novo).
// Variáveis: IDX (0 LoLô, 1 BiBi, 2 DanDan, 3 TuTu). Uso: IDX=1 node qa/scripts/marco3-r6-final.mjs
import { lancar, novoContexto, lerTextos, limparTextos, juntar, sleep, tecla, digitar, irAteHall, irAtePainel } from './lib.mjs';
import { irPara, estado, apertarA } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IDX = Number(process.env.IDX ?? 0);
const CODIGO = ['017', '020', '023', '024'][IDX];
const NOME = ['LoLô', 'BiBi', 'DanDan', 'TuTu'][IDX];
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco3-r6', NOME);
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const T0 = Date.now();
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'r6' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
const est = async () => { try { return await estado(page); } catch { await sleep(150); return null; } };
const ver = () => page.evaluate(() => window.__textos.map((x) => x.t).join(' '));
const press = async (k, ms = 260) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(220); };
const fechar = async () => { for (let i = 0; i < 14; i++) { const q = await est(); if (!q?.travado) return; await tecla(page, 'z', { ms: 90, pausa: 400 }); } };
async function capturar(dir, nome) {
  const d = await page.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = c.width * 3; o.height = c.height * 3; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); });
  writeFileSync(join(dir, `${nome}.png`), Buffer.from(d.split(',')[1], 'base64'));
}
// Entrada no fluxo de condução: espera a chegada e amostra animacaoDoNick a cada 100 ms por 2 s, capturando 6 quadros
async function medirChegada(rotulo) {
  let chegouT = null; let auT = null; let dialogoT = null; const anim = []; let quadros = 0; const t1 = Date.now(); let viu = false;
  while (Date.now() - t1 < 30000) {
    const q = await est();
    if (q?.emConducao) viu = true;
    if (viu && !q?.emConducao && chegouT === null) chegouT = Date.now();
    if (chegouT !== null) {
      anim.push(`${q?.animacaoDoNick ?? '?'}${q?.animandoNick ? '*' : ''}@${Date.now() - chegouT}`);
      const b = await ver();
      if (b.includes('Au!') && auT === null) auT = Date.now();
      if (dialogoT === null && /árvore|Parabéns|Agora/.test(b) && !/Natal na Casa/.test(b)) dialogoT = Date.now();
      if (quadros < 6) { await capturar(EVID, `${rotulo}-chegada-${quadros}`); quadros++; }
      if (Date.now() - chegouT > 2600) break;
    }
    await sleep(100);
  }
  return { chegouT, auT, dialogoT, anim };
}
const rel = (t, c) => (t === null || c === null ? 'nunca' : `${t - c} ms`);

await page.goto(url);
await page.waitForSelector('canvas');
await sleep(2000);
await tecla(page, 'z'); await sleep(300); await tecla(page, 'z'); await sleep(300);
await irAteHall(page, IDX); await sleep(800);
if (process.env.ATALHO) {
  // Atalho do gancho: conclui 'porta' pelo domínio e entra na Sala (o código da P8 já foi testado no Marco 1/2)
  const fa = await page.evaluate(() => window.__irParaFase('luzes'));
  await page.evaluate(() => window.__teleportar('sala', 'P7'));
  await sleep(600); await fechar();
  console.log('atalho __irParaFase(luzes):', fa);
} else {
  await irAtePainel(page);
  await digitar(page, CODIGO);
  await tecla(page, 'z');
  for (let i = 0; i < 40; i++) { await sleep(200); if ((await est())?.mapa === 'sala') break; if (i === 15) await press('x', 300); }
  await fechar();
  for (let i = 0; i < 20 && (await est())?.mapa !== 'sala'; i++) { await press('ArrowUp', 400); await sleep(200); }
  await fechar();
}
reg(`${NOME} entrada na Sala`, (await est())?.mapa === 'sala', `mapa=${(await est())?.mapa}`);

// Pré-condição: acordar o Nick (8,5) de (9,5) (Nick acordado na luzes)
let dirW = null;
for (const [ax, ay, dir] of [[8, 6, 'ArrowUp'], [9, 5, 'ArrowLeft'], [8, 4, 'ArrowDown'], [7, 5, 'ArrowRight']]) {
  try { await irPara(page, 'sala', ax, ay); } catch { continue; }
  await press(dir, 300);
  const q = await est();
  if (q?.tileX === ax && q?.tileY === ay) { dirW = dir; break; }
}
await apertarA(page); await sleep(1500); await fechar(); await sleep(300);
reg(`${NOME} Nick acordado (pré-condição)`, (await est())?.nick?.estado === 'acordado', `nick=${JSON.stringify((await est())?.nick)}`);

// (1a) Luzes com Nick acordado
await limparTextos(page);
await irPara(page, 'sala', 5, 4).catch(() => {});
await press('ArrowUp', 260);
for (let i = 0; i < 30; i++) { if ((await est())?.emConducao) break; await tecla(page, 'z', { ms: 90, pausa: 350 }); }
const L = await medirChegada(`${NOME}-luzes`);
reg(`N8 ${NOME} luzes (Nick acordado): "Au!" na chegada`, L.auT !== null, `Au! em ${rel(L.auT, L.chegouT)}; diálogo em ${rel(L.dialogoT, L.chegouT)}`);
reg(`N8 ${NOME} luzes: animação "feliz" tocando (animacaoDoNick=nick-feliz)`, L.anim.some((a) => a.startsWith('nick-feliz')), `sequência: ${L.anim.slice(0, 10).join(' ')}`);
reg(`N8 ${NOME} luzes: diálogo sem esperar a animação`, L.dialogoT !== null && L.dialogoT - L.chegouT < 1000, `diálogo em ${rel(L.dialogoT, L.chegouT)}`);
// fecha o diálogo e captura a fumacinha a cada 100 ms, ao devolver o controle
await limparTextos(page);
const fumDir = join(EVID, 'fumaca');
mkdirSync(fumDir, { recursive: true });
let antes = await est();
let quadrosF = 0;
for (let i = 0; i < 14; i++) {
  const q = await est();
  if (!q?.travado) break;
  await tecla(page, 'z', { ms: 90, pausa: 100 });
  if (q?.travado && (await est())?.nick?.mapa !== 'sala') { await capturar(fumDir, `f-${quadrosF++}`); }
}
for (let k = 0; k < 6; k++) { await capturar(fumDir, `pos-${k}`); await sleep(100); }
await fechar();
const depois = await est();
reg(`N9 ${NOME}: Nick sai da Sala e dorme no destino (fumacinha: capturas em fumaca/)`, depois?.nick?.mapa !== 'sala' && depois?.nick?.estado === 'dormindo', `nick=${JSON.stringify(depois?.nick)}`);

if (process.env.SO_LUZES) { console.log('Tempo:', ((Date.now() - T0) / 1000).toFixed(0), 's'); writeFileSync(join(EVID, 'resultados-luzes.json'), JSON.stringify({ resultados, erros }, null, 2)); await browser.close(); process.exit(0); }
// (2) Peça 1 com Nick DORMINDO (ele dorme na Cozinha (5,3)): sem reação esperada
await limparTextos(page);
await irPara(page, 'sala', 9, 5).catch(() => {});
await press('ArrowRight', 1100); await sleep(700);
await fechar();
await irPara(page, 'cozinha', 4, 3).catch(() => {});
await press('ArrowRight', 260);
await apertarA(page); await sleep(1500); await fechar(); await sleep(200);
reg(`${NOME} Nick acordado na Cozinha (pré-condição da peça 1)`, (await est())?.nick?.estado === 'acordado', `nick=${JSON.stringify((await est())?.nick)}`);
// Traz o Nick para a Sala (troca de área com o Nick junto) e pega a peça 1 com ele acordado
await irPara(page, 'cozinha', 1, 0).catch(() => {});
await press('ArrowLeft', 900); await sleep(600); await fechar();
reg(`${NOME} Nick acompanha a troca para a Sala (F9)`, (await est())?.nick?.mapa === 'sala', `nick=${JSON.stringify((await est())?.nick)}`);
await irPara(page, 'sala', 2, 4).catch(() => {});
await press('ArrowLeft', 260);
await apertarA(page); await sleep(500);
await limparTextos(page);
await apertarA(page);
const P = await medirChegada(`${NOME}-peca1`);
reg(`N8 ${NOME} peça 1 (Nick acordado): "Au!" na chegada`, P.auT !== null, `Au! em ${rel(P.auT, P.chegouT)}; diálogo em ${rel(P.dialogoT, P.chegouT)}`);
reg(`N8 ${NOME} peça 1: animação "feliz" tocando (animacaoDoNick=nick-feliz)`, P.anim.some((a) => a.startsWith('nick-feliz')), `sequência: ${P.anim.slice(0, 10).join(' ')}`);
reg(`N8 ${NOME} peça 1: diálogo sem esperar a animação`, P.dialogoT !== null && P.dialogoT - P.chegouT < 1000, `diálogo em ${rel(P.dialogoT, P.chegouT)}`);
// F7 ao vivo: peça 2 escondida (Cozinha (4,1)) com a peça 1 encaixada: B na Cozinha aponta para a P7 (alvo é a Sala), nunca para a peça 2
await fechar();
await irPara(page, 'sala', 9, 5).catch(() => {});
await press('ArrowRight', 1100); await sleep(700);
await press('x', 260); await sleep(1500);
const f = await est();
reg(`F7 ${NOME} ao vivo: seta nunca aponta para a peça 2 escondida (alvo Cozinha, peça 2 já aparece na Cozinha)`, f?.farejo?.porta?.id !== undefined || f?.farejo?.ativo === false, `mapa=${f?.mapa} farejo=${JSON.stringify(f?.farejo)}`);

console.log(`\nTempo: ${((Date.now() - T0) / 1000).toFixed(0)} s`);
console.log('Erros:', erros.length ? erros : 'nenhum');
writeFileSync(join(EVID, 'resultados.json'), JSON.stringify({ resultados, erros }, null, 2));
await browser.close();
